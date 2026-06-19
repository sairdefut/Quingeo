package ec.gob.salud.hce.backend.service;

import ec.gob.salud.hce.backend.dto.Cie10ImportResultDTO;
import ec.gob.salud.hce.backend.dto.Cie10WarningDTO;
import ec.gob.salud.hce.backend.entity.Enfermedad;
import ec.gob.salud.hce.backend.exception.Cie10ImportException;
import ec.gob.salud.hce.backend.repository.EnfermedadRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class Cie10ImportService {

    private static final String SHEET_NAME = "SQL Results";
    private static final String CODE_HEADER = "CODIGO";
    private static final String NAME_HEADER = "ENFERMEDAD";
    private static final long MAX_FILE_SIZE = 5L * 1024L * 1024L;
    private static final int MAX_WARNINGS_IN_RESPONSE = 100;
    private static final Pattern STANDARD_CIE10_CODE =
            Pattern.compile("^[A-Z][0-9]{2}(?:\\.[0-9A-Z]{1,4})?[+*]?$");

    private final EnfermedadRepository enfermedadRepository;

    @Transactional(readOnly = true)
    public Cie10ImportResultDTO preview(MultipartFile file) {
        ParsedWorkbook workbook = parse(file);
        return analyze(workbook, false, false);
    }

    @Transactional
    public Cie10ImportResultDTO importFile(MultipartFile file) {
        ParsedWorkbook workbook = parse(file);
        return analyze(workbook, true, true);
    }

    private Cie10ImportResultDTO analyze(ParsedWorkbook workbook, boolean persist, boolean executed) {
        Map<String, Enfermedad> existingByCode = loadExistingByCode();
        List<Enfermedad> changed = new ArrayList<>();
        int newRecords = 0;
        int updatedRecords = 0;
        int unchangedRecords = 0;

        for (Cie10Row row : workbook.rows().values()) {
            Enfermedad existing = existingByCode.get(row.code());
            if (existing == null) {
                newRecords++;
                if (persist) {
                    Enfermedad created = new Enfermedad();
                    created.setCodigo(row.code());
                    created.setNombre(row.name());
                    created.setEstado("ACTIVO");
                    changed.add(created);
                }
            } else if (!row.name().equals(existing.getNombre()) || !"ACTIVO".equals(existing.getEstado())) {
                updatedRecords++;
                if (persist) {
                    existing.setNombre(row.name());
                    existing.setEstado("ACTIVO");
                    changed.add(existing);
                }
            } else {
                unchangedRecords++;
            }
        }

        if (persist && !changed.isEmpty()) {
            enfermedadRepository.saveAll(changed);
            enfermedadRepository.flush();
        }

        return new Cie10ImportResultDTO(
                workbook.rows().size(),
                newRecords,
                updatedRecords,
                unchangedRecords,
                workbook.warningCount(),
                workbook.warnings(),
                executed
        );
    }

    private Map<String, Enfermedad> loadExistingByCode() {
        Map<String, Enfermedad> byCode = new HashMap<>();
        for (Enfermedad enfermedad : enfermedadRepository.findAll()) {
            String code = normalizeCode(enfermedad.getCodigo());
            if (code.isEmpty()) {
                continue;
            }
            Enfermedad duplicate = byCode.putIfAbsent(code, enfermedad);
            if (duplicate != null) {
                throw new Cie10ImportException(
                        "La base de datos contiene más de un registro con el código " + code
                                + ". Corrija los duplicados antes de importar."
                );
            }
        }
        return byCode;
    }

    private ParsedWorkbook parse(MultipartFile file) {
        validateFile(file);
        try (InputStream input = file.getInputStream(); Workbook workbook = new HSSFWorkbook(input)) {
            Sheet sheet = workbook.getSheet(SHEET_NAME);
            if (sheet == null) {
                throw new Cie10ImportException("El archivo debe contener la hoja '" + SHEET_NAME + "'.");
            }
            return parseSheet(sheet);
        } catch (Cie10ImportException ex) {
            throw ex;
        } catch (IOException | RuntimeException ex) {
            throw new Cie10ImportException("El archivo no es un Excel .xls válido o está dañado.", ex);
        }
    }

    private ParsedWorkbook parseSheet(Sheet sheet) {
        Row header = sheet.getRow(sheet.getFirstRowNum());
        if (header == null) {
            throw new Cie10ImportException("La hoja '" + SHEET_NAME + "' está vacía.");
        }

        DataFormatter formatter = new DataFormatter(Locale.ROOT);
        Map<String, Integer> columns = new HashMap<>();
        for (Cell cell : header) {
            String value = formatter.formatCellValue(cell).trim().toUpperCase(Locale.ROOT);
            if (!value.isEmpty()) {
                columns.put(value, cell.getColumnIndex());
            }
        }

        Integer codeColumn = columns.get(CODE_HEADER);
        Integer nameColumn = columns.get(NAME_HEADER);
        if (codeColumn == null || nameColumn == null) {
            throw new Cie10ImportException("La hoja debe incluir las columnas CODIGO y ENFERMEDAD.");
        }

        LinkedHashMap<String, Cie10Row> rows = new LinkedHashMap<>();
        List<Cie10WarningDTO> warnings = new ArrayList<>();
        int warningCount = 0;
        for (int rowIndex = header.getRowNum() + 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
            Row excelRow = sheet.getRow(rowIndex);
            if (excelRow == null) {
                continue;
            }
            String code = normalizeCode(formatter.formatCellValue(excelRow.getCell(codeColumn)));
            String name = formatter.formatCellValue(excelRow.getCell(nameColumn)).trim();
            if (code.isEmpty() && name.isEmpty()) {
                continue;
            }

            int displayRow = rowIndex + 1;
            if (code.isEmpty() || name.isEmpty()) {
                throw new Cie10ImportException("La fila " + displayRow + " tiene CODIGO o ENFERMEDAD vacío.");
            }
            if (code.length() > 20) {
                throw new Cie10ImportException("El CODIGO de la fila " + displayRow + " supera 20 caracteres.");
            }
            if (name.length() > 200) {
                throw new Cie10ImportException("La ENFERMEDAD de la fila " + displayRow + " supera 200 caracteres.");
            }
            if (rows.containsKey(code)) {
                throw new Cie10ImportException("El código " + code + " está duplicado en la fila " + displayRow + ".");
            }

            if (!STANDARD_CIE10_CODE.matcher(code).matches()) {
                warningCount++;
                if (warnings.size() < MAX_WARNINGS_IN_RESPONSE) {
                    warnings.add(new Cie10WarningDTO(
                            displayRow,
                            code,
                            "El código no coincide con el formato CIE-10 habitual; se importará tal como está."
                    ));
                }
            }
            rows.put(code, new Cie10Row(displayRow, code, name));
        }

        if (rows.isEmpty()) {
            throw new Cie10ImportException("El archivo no contiene registros CIE-10 para importar.");
        }
        return new ParsedWorkbook(rows, warnings, warningCount);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new Cie10ImportException("Seleccione un archivo .xls.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new Cie10ImportException("El archivo supera el límite de 5 MB.");
        }
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase(Locale.ROOT).endsWith(".xls")) {
            throw new Cie10ImportException("Solo se permiten archivos Excel con extensión .xls.");
        }
    }

    private String normalizeCode(String code) {
        return code == null ? "" : code.trim().toUpperCase(Locale.ROOT);
    }

    private record Cie10Row(int row, String code, String name) {
    }

    private record ParsedWorkbook(
            LinkedHashMap<String, Cie10Row> rows,
            List<Cie10WarningDTO> warnings,
            int warningCount
    ) {
    }
}
