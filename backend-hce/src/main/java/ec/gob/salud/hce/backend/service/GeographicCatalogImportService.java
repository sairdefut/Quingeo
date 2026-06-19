package ec.gob.salud.hce.backend.service;

import ec.gob.salud.hce.backend.dto.GeographicCatalogImportResultDTO;
import ec.gob.salud.hce.backend.dto.GeographicCatalogWarningDTO;
import ec.gob.salud.hce.backend.entity.Canton;
import ec.gob.salud.hce.backend.entity.Parroquia;
import ec.gob.salud.hce.backend.entity.Provincia;
import ec.gob.salud.hce.backend.exception.GeographicCatalogImportException;
import ec.gob.salud.hce.backend.repository.CantonRepository;
import ec.gob.salud.hce.backend.repository.ParroquiaRepository;
import ec.gob.salud.hce.backend.repository.ProvinciaRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GeographicCatalogImportService {

    private static final long MAX_FILE_SIZE = 5L * 1024L * 1024L;
    private static final int MAX_WARNINGS = 100;
    private static final List<String> HEADERS = List.of(
            "PAIS", "CODIGO_PROVINCIA", "PROVINCIA", "CODIGO_CANTON", "CANTON",
            "CODIGO_PARROQUIA", "PARROQUIA"
    );

    private final ProvinciaRepository provinciaRepository;
    private final CantonRepository cantonRepository;
    private final ParroquiaRepository parroquiaRepository;
    private final JdbcTemplate jdbcTemplate;
    private final EntityManager entityManager;

    @Transactional(readOnly = true)
    public GeographicCatalogImportResultDTO preview(MultipartFile file) {
        ParsedCatalog parsed = parse(file);
        return analyze(parsed, false, duplicateCantonCount(), duplicateParishCount());
    }

    @Transactional
    public GeographicCatalogImportResultDTO importFile(MultipartFile file) {
        ParsedCatalog parsed = parse(file);
        int consolidatedCantons = consolidateCantons();
        int consolidatedParishes = consolidateParishes();
        return analyze(parsed, true, consolidatedCantons, consolidatedParishes);
    }

    private GeographicCatalogImportResultDTO analyze(
            ParsedCatalog parsed, boolean persist, int consolidatedCantons, int consolidatedParishes) {
        Map<String, Provincia> provincesByCode = provinciaRepository.findAll().stream()
                .filter(p -> hasText(p.getCodigo()))
                .collect(Collectors.toMap(p -> code(p.getCodigo()), Function.identity(), this::preferLowestId));
        Map<String, Provincia> provincesByName = provinciaRepository.findAll().stream()
                .collect(Collectors.toMap(p -> nameKey(p.getNombre()), Function.identity(), this::preferLowestId));

        Map<String, ProvinceRow> excelProvinces = new LinkedHashMap<>();
        Map<String, CantonRow> excelCantons = new LinkedHashMap<>();
        for (LocationRow row : parsed.rows()) {
            excelProvinces.putIfAbsent(row.provinceCode(), new ProvinceRow(row.provinceCode(), row.provinceName()));
            excelCantons.putIfAbsent(row.provinceCode() + "|" + row.cantonCode(),
                    new CantonRow(row.provinceCode(), row.cantonCode(), row.cantonName()));
        }

        int newProvinces = 0;
        int updatedProvinces = 0;
        Map<String, Provincia> resolvedProvinces = new HashMap<>();
        for (ProvinceRow row : excelProvinces.values()) {
            Provincia province = provincesByCode.get(row.code());
            if (province == null) province = provincesByName.get(nameKey(row.name()));
            if (province == null) {
                newProvinces++;
                province = new Provincia();
                province.setCodigo(row.code());
                province.setNombre(row.name());
                if (persist) province = provinciaRepository.saveAndFlush(province);
            } else if (!row.code().equals(code(province.getCodigo())) || !row.name().equals(province.getNombre())) {
                updatedProvinces++;
                if (persist) {
                    province.setCodigo(row.code());
                    province.setNombre(row.name());
                    province = provinciaRepository.saveAndFlush(province);
                }
            }
            resolvedProvinces.put(row.code(), province);
        }

        List<Canton> existingCantons = cantonRepository.findAll();
        Map<String, Canton> cantonsByCode = new HashMap<>();
        Map<String, Canton> cantonsByName = new HashMap<>();
        for (Canton canton : existingCantons) {
            String provinceKey = entityKey(canton.getProvincia().getId(), provinceLogicalKey(canton.getProvincia()));
            if (hasText(canton.getCodigo())) cantonsByCode.putIfAbsent(provinceKey + "|" + code(canton.getCodigo()), canton);
            cantonsByName.putIfAbsent(provinceKey + "|" + nameKey(canton.getNombre()), canton);
        }

        int newCantons = 0;
        int updatedCantons = 0;
        Map<String, Canton> resolvedCantons = new HashMap<>();
        for (CantonRow row : excelCantons.values()) {
            Provincia province = resolvedProvinces.get(row.provinceCode());
            String provinceKey = entityKey(province.getId(), "C:" + row.provinceCode());
            Canton canton = cantonsByCode.get(provinceKey + "|" + row.code());
            if (canton == null) canton = cantonsByName.get(provinceKey + "|" + nameKey(row.name()));
            if (canton == null) {
                newCantons++;
                canton = new Canton();
                canton.setCodigo(row.code());
                canton.setNombre(row.name());
                canton.setProvincia(province);
                if (persist) canton = cantonRepository.saveAndFlush(canton);
            } else if (!row.code().equals(code(canton.getCodigo())) || !row.name().equals(canton.getNombre())) {
                updatedCantons++;
                if (persist) {
                    canton.setCodigo(row.code());
                    canton.setNombre(row.name());
                    canton.setProvincia(province);
                    canton = cantonRepository.saveAndFlush(canton);
                }
            }
            resolvedCantons.put(row.provinceCode() + "|" + row.code(), canton);
        }

        List<Parroquia> existingParishes = parroquiaRepository.findAll();
        Map<String, Parroquia> parishesByCodeAndName = new HashMap<>();
        Map<String, Parroquia> parishesByName = new HashMap<>();
        for (Parroquia parish : existingParishes) {
            Canton canton = parish.getCanton();
            if (canton == null || canton.getProvincia() == null) continue;
            String cantonKey = entityKey(canton.getId(), provinceLogicalKey(canton.getProvincia()) + "|" + cantonLogicalKey(canton));
            String normalizedName = nameKey(parish.getNombre());
            if (hasText(parish.getCodigo())) {
                parishesByCodeAndName.putIfAbsent(cantonKey + "|" + code(parish.getCodigo()) + "|" + exactNameKey(parish.getNombre()), parish);
            }
            parishesByName.putIfAbsent(cantonKey + "|" + normalizedName, parish);
        }

        int newParishes = 0;
        int updatedParishes = 0;
        for (LocationRow row : parsed.rows()) {
            Canton canton = resolvedCantons.get(row.provinceCode() + "|" + row.cantonCode());
            String cantonKey = entityKey(canton.getId(), "C:" + row.provinceCode() + "|C:" + row.cantonCode());
            String normalizedName = nameKey(row.parishName());
            Parroquia parish = parishesByCodeAndName.get(
                    cantonKey + "|" + row.parishCode() + "|" + exactNameKey(row.parishName()));
            if (parish == null) parish = parishesByName.get(cantonKey + "|" + normalizedName);
            if (parish == null) {
                newParishes++;
                if (persist) {
                    parish = new Parroquia();
                    parish.setCodigo(row.parishCode());
                    parish.setNombre(row.parishName());
                    parish.setCanton(canton);
                    parish.setProvinciaId(canton.getProvincia().getId());
                    parroquiaRepository.save(parish);
                }
            } else if (!row.parishCode().equals(code(parish.getCodigo()))
                    || !row.parishName().equals(parish.getNombre())
                    || !canton.getProvincia().getId().equals(parish.getProvinciaId())) {
                updatedParishes++;
                if (persist) {
                    parish.setCodigo(row.parishCode());
                    parish.setNombre(row.parishName());
                    parish.setCanton(canton);
                    parish.setProvinciaId(canton.getProvincia().getId());
                    parroquiaRepository.save(parish);
                }
            }
        }
        if (persist) {
            parroquiaRepository.flush();
            syncProvinceReferences();
        }

        return new GeographicCatalogImportResultDTO(
                1, excelProvinces.size(), excelCantons.size(), parsed.rows().size(), parsed.exactDuplicates(),
                newProvinces, updatedProvinces, newCantons, updatedCantons, newParishes, updatedParishes,
                consolidatedCantons, consolidatedParishes,
                parsed.warningCount(), parsed.warnings(), persist
        );
    }

    private int consolidateCantons() {
        Map<String, List<Canton>> groups = cantonRepository.findAll().stream()
                .filter(c -> c.getProvincia() != null)
                .collect(Collectors.groupingBy(c -> c.getProvincia().getId() + "|" + nameKey(c.getNombre())));
        int removed = 0;
        for (List<Canton> group : groups.values()) {
            if (group.size() < 2) continue;
            Canton canonical = group.stream().min(Comparator
                    .comparing((Canton c) -> !hasText(c.getCodigo()))
                    .thenComparing(Canton::getId)).orElseThrow();
            for (Canton duplicate : group) {
                if (duplicate.getId().equals(canonical.getId())) continue;
                jdbcTemplate.update("UPDATE parroquias SET id_canton = ?, id_cnt_provincia = ? WHERE id_canton = ?",
                        canonical.getId(), canonical.getProvincia().getId(), duplicate.getId());
                jdbcTemplate.update("UPDATE pacientes SET id_prq_canton = ?, id_prq_cnt_provincia = ? WHERE id_prq_canton = ?",
                        canonical.getId(), canonical.getProvincia().getId(), duplicate.getId());
                jdbcTemplate.update("UPDATE tutores SET id_prq_canton = ?, id_prq_cnt_provincia = ? WHERE id_prq_canton = ?",
                        canonical.getId(), canonical.getProvincia().getId(), duplicate.getId());
                cantonRepository.delete(duplicate);
                removed++;
            }
        }
        cantonRepository.flush();
        entityManager.clear();
        return removed;
    }

    private int consolidateParishes() {
        Map<String, List<Parroquia>> groups = parroquiaRepository.findAll().stream()
                .filter(p -> p.getCanton() != null)
                .collect(Collectors.groupingBy(p -> p.getCanton().getId() + "|" + exactNameKey(p.getNombre())));
        int removed = 0;
        for (List<Parroquia> group : groups.values()) {
            if (group.size() < 2) continue;
            Map<String, List<Parroquia>> codedGroups = group.stream().filter(p -> hasText(p.getCodigo()))
                    .collect(Collectors.groupingBy(p -> code(p.getCodigo())));
            List<Parroquia> codedCanonicals = new ArrayList<>();
            for (List<Parroquia> sameCode : codedGroups.values()) {
                Parroquia canonical = sameCode.stream().min(Comparator.comparing(Parroquia::getId)).orElseThrow();
                codedCanonicals.add(canonical);
                for (Parroquia duplicate : sameCode) {
                    if (!duplicate.getId().equals(canonical.getId())) removed += mergeParish(canonical, duplicate);
                }
            }
            List<Parroquia> uncoded = group.stream().filter(p -> !hasText(p.getCodigo())).toList();
            if (!uncoded.isEmpty()) {
                Parroquia canonical = codedCanonicals.stream().min(Comparator.comparing(Parroquia::getId))
                        .orElseGet(() -> uncoded.stream().min(Comparator.comparing(Parroquia::getId)).orElseThrow());
                for (Parroquia duplicate : uncoded) {
                    if (!duplicate.getId().equals(canonical.getId())) removed += mergeParish(canonical, duplicate);
                }
            }
        }
        parroquiaRepository.flush();
        entityManager.clear();
        return removed;
    }

    private int mergeParish(Parroquia canonical, Parroquia duplicate) {
        jdbcTemplate.update("UPDATE pacientes SET id_parroquia = ? WHERE id_parroquia = ?", canonical.getId(), duplicate.getId());
        jdbcTemplate.update("UPDATE tutores SET id_parroquia = ? WHERE id_parroquia = ?", canonical.getId(), duplicate.getId());
        parroquiaRepository.delete(duplicate);
        return 1;
    }

    private void syncProvinceReferences() {
        jdbcTemplate.update("""
                UPDATE parroquias SET id_cnt_provincia =
                    (SELECT c.id_provincia FROM cantones c WHERE c.id_canton = parroquias.id_canton)
                WHERE id_canton IS NOT NULL AND EXISTS
                    (SELECT 1 FROM cantones c WHERE c.id_canton = parroquias.id_canton)
                """);
        jdbcTemplate.update("""
                UPDATE pacientes SET id_prq_cnt_provincia =
                    (SELECT c.id_provincia FROM cantones c WHERE c.id_canton = pacientes.id_prq_canton)
                WHERE id_prq_canton IS NOT NULL AND EXISTS
                    (SELECT 1 FROM cantones c WHERE c.id_canton = pacientes.id_prq_canton)
                """);
        jdbcTemplate.update("""
                UPDATE tutores SET id_prq_cnt_provincia =
                    (SELECT c.id_provincia FROM cantones c WHERE c.id_canton = tutores.id_prq_canton)
                WHERE id_prq_canton IS NOT NULL AND EXISTS
                    (SELECT 1 FROM cantones c WHERE c.id_canton = tutores.id_prq_canton)
                """);
    }

    private int duplicateCantonCount() {
        return duplicateCount(cantonRepository.findAll(), c -> c.getProvincia() == null ? "" : c.getProvincia().getId() + "|" + nameKey(c.getNombre()));
    }

    private int duplicateParishCount() {
        Map<String, List<Parroquia>> groups = parroquiaRepository.findAll().stream()
                .filter(p -> p.getCanton() != null)
                .collect(Collectors.groupingBy(p -> p.getCanton().getId() + "|" + exactNameKey(p.getNombre())));
        int duplicates = 0;
        for (List<Parroquia> group : groups.values()) {
            Map<String, Long> coded = group.stream().filter(p -> hasText(p.getCodigo()))
                    .collect(Collectors.groupingBy(p -> code(p.getCodigo()), Collectors.counting()));
            duplicates += coded.values().stream().mapToInt(count -> Math.max(0, count.intValue() - 1)).sum();
            long uncoded = group.stream().filter(p -> !hasText(p.getCodigo())).count();
            duplicates += coded.isEmpty() ? Math.max(0, (int) uncoded - 1) : (int) uncoded;
        }
        return duplicates;
    }

    private <T> int duplicateCount(List<T> values, Function<T, String> key) {
        return values.stream().collect(Collectors.groupingBy(key, Collectors.counting())).values().stream()
                .mapToInt(count -> Math.max(0, count.intValue() - 1)).sum();
    }

    private ParsedCatalog parse(MultipartFile file) {
        validateFile(file);
        try (InputStream input = file.getInputStream(); Workbook workbook = new XSSFWorkbook(input)) {
            if (workbook.getNumberOfSheets() == 0) throw new GeographicCatalogImportException("El archivo no contiene hojas.");
            Sheet sheet = workbook.getSheetAt(0);
            Row header = sheet.getRow(sheet.getFirstRowNum());
            if (header == null) throw new GeographicCatalogImportException("La primera hoja está vacía.");
            DataFormatter formatter = new DataFormatter(Locale.ROOT);
            Map<String, Integer> columns = new HashMap<>();
            for (Cell cell : header) columns.put(code(formatter.formatCellValue(cell)), cell.getColumnIndex());
            List<String> missing = HEADERS.stream().filter(h -> !columns.containsKey(h)).toList();
            if (!missing.isEmpty()) throw new GeographicCatalogImportException("Faltan columnas requeridas: " + String.join(", ", missing) + ".");

            List<LocationRow> rows = new ArrayList<>();
            Set<String> exactRows = new LinkedHashSet<>();
            Map<String, Set<String>> namesByParishCode = new LinkedHashMap<>();
            int duplicates = 0;
            for (int index = header.getRowNum() + 1; index <= sheet.getLastRowNum(); index++) {
                Row excelRow = sheet.getRow(index);
                if (excelRow == null) continue;
                int displayRow = index + 1;
                String country = text(formatter, excelRow, columns.get("PAIS"));
                String provinceCode = code(text(formatter, excelRow, columns.get("CODIGO_PROVINCIA")));
                String provinceName = text(formatter, excelRow, columns.get("PROVINCIA"));
                String cantonCode = code(text(formatter, excelRow, columns.get("CODIGO_CANTON")));
                String cantonName = text(formatter, excelRow, columns.get("CANTON"));
                String parishCode = code(text(formatter, excelRow, columns.get("CODIGO_PARROQUIA")));
                String parishName = text(formatter, excelRow, columns.get("PARROQUIA"));
                if (List.of(country, provinceCode, provinceName, cantonCode, cantonName, parishCode, parishName).stream().allMatch(String::isEmpty)) continue;
                if (List.of(country, provinceCode, provinceName, cantonCode, cantonName, parishCode, parishName).stream().anyMatch(String::isEmpty)) {
                    throw new GeographicCatalogImportException("La fila " + displayRow + " tiene campos obligatorios vacíos.");
                }
                if (!"ECUADOR".equals(asciiKey(country))) {
                    throw new GeographicCatalogImportException("La fila " + displayRow + " pertenece a '" + country + "'. Solo se admite Ecuador.");
                }
                if (provinceCode.length() > 20 || cantonCode.length() > 20 || parishCode.length() > 20) {
                    throw new GeographicCatalogImportException("La fila " + displayRow + " contiene un código de más de 20 caracteres.");
                }
                if (provinceName.length() > 150 || cantonName.length() > 150 || parishName.length() > 255) {
                    throw new GeographicCatalogImportException("La fila " + displayRow + " contiene un nombre más largo que la base de datos.");
                }
                String exactKey = String.join("|", asciiKey(country), provinceCode, exactNameKey(provinceName), cantonCode,
                        exactNameKey(cantonName), parishCode, exactNameKey(parishName));
                if (!exactRows.add(exactKey)) { duplicates++; continue; }
                rows.add(new LocationRow(displayRow, provinceCode, provinceName, cantonCode, cantonName, parishCode, parishName));
                namesByParishCode.computeIfAbsent(provinceCode + "|" + cantonCode + "|" + parishCode, ignored -> new LinkedHashSet<>())
                        .add(parishName);
            }
            if (rows.isEmpty()) throw new GeographicCatalogImportException("El archivo no contiene ubicaciones para importar.");
            List<GeographicCatalogWarningDTO> warnings = new ArrayList<>();
            int warningCount = 0;
            for (Map.Entry<String, Set<String>> entry : namesByParishCode.entrySet()) {
                if (entry.getValue().size() < 2) continue;
                warningCount++;
                if (warnings.size() < MAX_WARNINGS) warnings.add(new GeographicCatalogWarningDTO(
                        0, entry.getKey(), "El código de parroquia tiene nombres distintos; se conservarán como registros separados: " + String.join(" / ", entry.getValue())));
            }
            return new ParsedCatalog(rows, duplicates, warnings, warningCount);
        } catch (GeographicCatalogImportException ex) {
            throw ex;
        } catch (IOException | RuntimeException ex) {
            throw new GeographicCatalogImportException("El archivo no es un Excel .xlsx válido o está dañado.", ex);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new GeographicCatalogImportException("Seleccione un archivo .xlsx.");
        if (file.getSize() > MAX_FILE_SIZE) throw new GeographicCatalogImportException("El archivo supera el límite de 5 MB.");
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase(Locale.ROOT).endsWith(".xlsx")) {
            throw new GeographicCatalogImportException("Solo se permiten archivos Excel con extensión .xlsx.");
        }
    }

    private String text(DataFormatter formatter, Row row, int column) {
        return row.getCell(column) == null ? "" : formatter.formatCellValue(row.getCell(column)).trim().replaceAll("\\s+", " ");
    }

    private String code(String value) { return value == null ? "" : value.trim().toUpperCase(Locale.ROOT); }
    private boolean hasText(String value) { return value != null && !value.isBlank(); }
    private String nameKey(String value) { return asciiKey(value == null ? "" : value.replaceAll("\\s+", " ").trim()); }
    private String exactNameKey(String value) {
        return value == null ? "" : value.replaceAll("\\s+", " ").trim().toUpperCase(Locale.ROOT);
    }
    private String asciiKey(String value) {
        return Normalizer.normalize(value, Normalizer.Form.NFD).replaceAll("\\p{M}", "").toUpperCase(Locale.ROOT).trim();
    }
    private String provinceLogicalKey(Provincia province) {
        return hasText(province.getCodigo()) ? "C:" + code(province.getCodigo()) : "N:" + nameKey(province.getNombre());
    }
    private String cantonLogicalKey(Canton canton) {
        return hasText(canton.getCodigo()) ? "C:" + code(canton.getCodigo()) : "N:" + nameKey(canton.getNombre());
    }
    private String entityKey(Long id, String fallback) { return id == null ? "X:" + fallback : "ID:" + id; }
    private Provincia preferLowestId(Provincia left, Provincia right) { return left.getId() <= right.getId() ? left : right; }

    private record ProvinceRow(String code, String name) {}
    private record CantonRow(String provinceCode, String code, String name) {}
    private record LocationRow(int row, String provinceCode, String provinceName, String cantonCode,
                               String cantonName, String parishCode, String parishName) {}
    private record ParsedCatalog(List<LocationRow> rows, int exactDuplicates,
                                 List<GeographicCatalogWarningDTO> warnings, int warningCount) {}
}
