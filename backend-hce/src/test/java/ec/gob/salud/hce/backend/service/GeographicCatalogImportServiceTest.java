package ec.gob.salud.hce.backend.service;

import ec.gob.salud.hce.backend.dto.GeographicCatalogImportResultDTO;
import ec.gob.salud.hce.backend.repository.CantonRepository;
import ec.gob.salud.hce.backend.repository.ParroquiaRepository;
import ec.gob.salud.hce.backend.repository.ProvinciaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class GeographicCatalogImportServiceTest {

    @Autowired private GeographicCatalogImportService service;
    @Autowired private ProvinciaRepository provinciaRepository;
    @Autowired private CantonRepository cantonRepository;
    @Autowired private ParroquiaRepository parroquiaRepository;

    @Test
    void previewsAndImportsTheRealEcuadorWorkbookIdempotently() throws Exception {
        MockMultipartFile file = realWorkbook();

        GeographicCatalogImportResultDTO preview = service.preview(file);
        assertThat(preview.countriesValidated()).isEqualTo(1);
        assertThat(preview.provinces()).isEqualTo(24);
        assertThat(preview.cantons()).isEqualTo(222);
        assertThat(preview.parishes()).isEqualTo(1452);
        assertThat(preview.exactDuplicatesOmitted()).isEqualTo(53);
        assertThat(preview.warningCount()).isEqualTo(12);
        assertThat(provinciaRepository.count()).isZero();

        GeographicCatalogImportResultDTO imported = service.importFile(realWorkbook());
        assertThat(imported.executed()).isTrue();
        assertThat(provinciaRepository.count()).isEqualTo(24);
        assertThat(cantonRepository.count()).isEqualTo(222);
        assertThat(parroquiaRepository.count()).isEqualTo(1452);
        assertThat(parroquiaRepository.findAll()).anyMatch(p -> p.getNombre().length() == 212);

        GeographicCatalogImportResultDTO second = service.importFile(realWorkbook());
        assertThat(second.newProvinces()).isZero();
        assertThat(second.newCantons()).isZero();
        assertThat(second.newParishes()).isZero();
        assertThat(second.updatedProvinces()).isZero();
        assertThat(second.updatedCantons()).isZero();
        assertThat(second.updatedParishes()).isZero();
        assertThat(parroquiaRepository.count()).isEqualTo(1452);
    }

    private MockMultipartFile realWorkbook() throws Exception {
        Path path = Path.of("..", "p_c_p_Ecuador.xlsx");
        return new MockMultipartFile(
                "file", "p_c_p_Ecuador.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                Files.readAllBytes(path)
        );
    }
}
