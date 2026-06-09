package ec.gob.salud.hce.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class IdMappingDTO {
    private String clientMutationId;
    private String uuidOffline;
    private Integer newId;
    private Integer serverId;
    private String entityType; // "paciente", "consulta", etc.
    private String numeroHistoriaClinica;
    private LocalDateTime serverLastModified;

    public IdMappingDTO(String uuidOffline, Integer newId, String entityType) {
        this.uuidOffline = uuidOffline;
        this.newId = newId;
        this.serverId = newId;
        this.entityType = entityType;
    }

    public IdMappingDTO(String uuidOffline, Integer newId, String entityType, String numeroHistoriaClinica) {
        this(uuidOffline, newId, entityType);
        this.numeroHistoriaClinica = numeroHistoriaClinica;
    }
}
