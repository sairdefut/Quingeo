package ec.gob.salud.hce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SyncConflictDTO {
    private String clientMutationId;
    private String uuidOffline;
    private String entityType;
    private String reason;
    private Map<String, Object> localPayload;
    private Object serverPayload;
}
