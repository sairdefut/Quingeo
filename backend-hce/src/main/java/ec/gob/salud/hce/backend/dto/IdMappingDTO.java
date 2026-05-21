package ec.gob.salud.hce.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class IdMappingDTO {
    private String uuidOffline;
    private Integer newId;
    private String entityType; // "paciente", "consulta", etc.
    private String numeroHistoriaClinica;

    public IdMappingDTO(String uuidOffline, Integer newId, String entityType) {
        this.uuidOffline = uuidOffline;
        this.newId = newId;
        this.entityType = entityType;
    }

    public IdMappingDTO(String uuidOffline, Integer newId, String entityType, String numeroHistoriaClinica) {
        this(uuidOffline, newId, entityType);
        this.numeroHistoriaClinica = numeroHistoriaClinica;
    }
}
