package ec.gob.salud.hce.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
public class SyncItemDTO {
    private String clientMutationId;
    private String entity;
    private String operation;
    private String type;
    private String uuidOffline;
    private LocalDateTime baseLastModified;
    private Map<String, Object> payload;
    private Map<String, Object> data;

    public String effectiveOperation() {
        return operation != null ? operation : type;
    }

    public Map<String, Object> effectivePayload() {
        return payload != null ? payload : data;
    }
}
