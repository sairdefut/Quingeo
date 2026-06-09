package ec.gob.salud.hce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SyncRejectedDTO {
    private String clientMutationId;
    private String uuidOffline;
    private String entityType;
    private String reason;
}
