package ec.gob.salud.hce.backend.dto;

import java.util.List;

public record GeographicCatalogImportResultDTO(
        int countriesValidated, int provinces, int cantons, int parishes,
        int exactDuplicatesOmitted,
        int newProvinces, int updatedProvinces,
        int newCantons, int updatedCantons,
        int newParishes, int updatedParishes,
        int consolidatedCantons, int consolidatedParishes,
        int warningCount, List<GeographicCatalogWarningDTO> warnings,
        boolean executed
) {
}
