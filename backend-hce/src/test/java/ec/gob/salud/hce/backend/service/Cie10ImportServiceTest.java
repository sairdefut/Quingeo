package ec.gob.salud.hce.backend.service;

import ec.gob.salud.hce.backend.dto.Cie10ImportResultDTO;
import ec.gob.salud.hce.backend.entity.Enfermedad;
import ec.gob.salud.hce.backend.exception.Cie10ImportException;
import ec.gob.salud.hce.backend.repository.EnfermedadRepository;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class Cie10ImportServiceTest {

    @Mock
    private EnfermedadRepository enfermedadRepository;

    private Cie10ImportService service;

    @BeforeEach
    void setUp() {
        service = new Cie10ImportService(enfermedadRepository);
    }

    @Test
    void previewsRepositoryCie10FileWithoutWriting() throws IOException {
        Path cie10File = Path.of("..", "CIE10.xls");
        assertThat(cie10File).exists();
        when(enfermedadRepository.findAll()).thenReturn(List.of());

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "CIE10.xls",
                "application/vnd.ms-excel",
                Files.readAllBytes(cie10File)
        );

        Cie10ImportResultDTO result = service.preview(file);

        assertThat(result.totalRows()).isEqualTo(10_968);
        assertThat(result.newRecords()).isEqualTo(10_968);
        assertThat(result.warningCount()).isEqualTo(5);
        assertThat(result.executed()).isFalse();
        assertThat(result.warnings()).extracting(warning -> warning.code())
                .startsWith("E79..9", "K71,7", "P02..1", "PRE")
                .hasSize(5);
        verify(enfermedadRepository, never()).saveAll(org.mockito.ArgumentMatchers.anyList());
    }

    @Test
    void importsNewAndExistingCodesWithoutChangingExistingId() throws IOException {
        Enfermedad existing = new Enfermedad();
        existing.setIdEnfermedad(42);
        existing.setCodigo("a00");
        existing.setNombre("Nombre anterior");
        existing.setEstado("INACTIVO");
        when(enfermedadRepository.findAll()).thenReturn(List.of(existing));

        MockMultipartFile file = workbookFile(List.of(
                new String[]{"A00", "CÓLERA"},
                new String[]{"B00", "INFECCIONES POR VIRUS DEL HERPES"},
                new String[]{"PRE", "EN ESTUDIO"}
        ));

        Cie10ImportResultDTO result = service.importFile(file);

        assertThat(result.newRecords()).isEqualTo(2);
        assertThat(result.updatedRecords()).isEqualTo(1);
        assertThat(result.warningCount()).isEqualTo(1);
        assertThat(result.executed()).isTrue();
        assertThat(existing.getIdEnfermedad()).isEqualTo(42);
        assertThat(existing.getNombre()).isEqualTo("CÓLERA");
        assertThat(existing.getEstado()).isEqualTo("ACTIVO");

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<Enfermedad>> captor = ArgumentCaptor.forClass(List.class);
        verify(enfermedadRepository).saveAll(captor.capture());
        assertThat(captor.getValue()).hasSize(3);
        assertThat(captor.getValue()).filteredOn(item -> item.getIdEnfermedad() == null)
                .extracting(Enfermedad::getCodigo)
                .containsExactly("B00", "PRE");
        verify(enfermedadRepository).flush();
    }

    @Test
    void reportsUnchangedRecordsOnRepeatedImport() throws IOException {
        Enfermedad existing = new Enfermedad();
        existing.setIdEnfermedad(7);
        existing.setCodigo("A00");
        existing.setNombre("CÓLERA");
        existing.setEstado("ACTIVO");
        when(enfermedadRepository.findAll()).thenReturn(List.of(existing));

        Cie10ImportResultDTO result = service.importFile(workbookFile(List.<String[]>of(
                new String[]{" A00 ", "CÓLERA"}
        )));

        assertThat(result.unchangedRecords()).isEqualTo(1);
        assertThat(result.newRecords()).isZero();
        assertThat(result.updatedRecords()).isZero();
        verify(enfermedadRepository, never()).saveAll(org.mockito.ArgumentMatchers.anyList());
    }

    @Test
    void rejectsDuplicateCodeBeforeWriting() throws IOException {
        MockMultipartFile file = workbookFile(List.of(
                new String[]{"A00", "CÓLERA"},
                new String[]{"a00", "OTRO NOMBRE"}
        ));

        assertThatThrownBy(() -> service.importFile(file))
                .isInstanceOf(Cie10ImportException.class)
                .hasMessageContaining("duplicado");
        verify(enfermedadRepository, never()).saveAll(org.mockito.ArgumentMatchers.anyList());
    }

    @Test
    void rejectsWorkbookWithoutRequiredHeaders() throws IOException {
        try (Workbook workbook = new HSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("SQL Results");
            sheet.createRow(0).createCell(0).setCellValue("OTRA_COLUMNA");
            workbook.write(output);
            MockMultipartFile file = new MockMultipartFile(
                    "file", "CIE10.xls", "application/vnd.ms-excel", output.toByteArray());

            assertThatThrownBy(() -> service.preview(file))
                    .isInstanceOf(Cie10ImportException.class)
                    .hasMessageContaining("CODIGO y ENFERMEDAD");
        }
    }

    @Test
    void rejectsNonXlsFile() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "CIE10.xlsx", "application/octet-stream", new byte[]{1, 2, 3});

        assertThatThrownBy(() -> service.preview(file))
                .isInstanceOf(Cie10ImportException.class)
                .hasMessageContaining("extensión .xls");
    }

    private MockMultipartFile workbookFile(List<String[]> values) throws IOException {
        try (Workbook workbook = new HSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("SQL Results");
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("ID");
            header.createCell(1).setCellValue("CODIGO");
            header.createCell(2).setCellValue("ENFERMEDAD");
            for (int index = 0; index < values.size(); index++) {
                Row row = sheet.createRow(index + 1);
                row.createCell(0).setCellValue(index + 1);
                row.createCell(1).setCellValue(values.get(index)[0]);
                row.createCell(2).setCellValue(values.get(index)[1]);
            }
            workbook.write(output);
            return new MockMultipartFile(
                    "file", "CIE10.xls", "application/vnd.ms-excel", output.toByteArray());
        }
    }
}
