package ec.gob.salud.hce.backend.dto;

import java.util.List;

public record Cie10ImportResultDTO(
        int totalRows,
        int newRecords,
        int updatedRecords,
        int unchangedRecords,
        int warningCount,
        List<Cie10WarningDTO> warnings,
        boolean executed
) {
}
