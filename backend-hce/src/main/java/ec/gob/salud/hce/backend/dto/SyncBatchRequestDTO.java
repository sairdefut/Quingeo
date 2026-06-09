package ec.gob.salud.hce.backend.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class SyncBatchRequestDTO {
    private String deviceId;
    private String userId;
    private List<SyncItemDTO> items;

    // Legacy single-item shape kept for Postman collections and older clients.
    private String type;
    private String operation;
    private String entity;
    private String uuidOffline;
    private String clientMutationId;
    private Map<String, Object> data;
    private Map<String, Object> payload;
}
