package ec.gob.salud.hce.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Data
public class SyncBatchResponseDTO {
    private static final ZoneId APP_ZONE = ZoneId.of("America/Guayaquil");

    private List<SyncAcceptedDTO> accepted = new ArrayList<>();
    private List<SyncRejectedDTO> rejected = new ArrayList<>();
    private List<SyncConflictDTO> conflicts = new ArrayList<>();
    private List<IdMappingDTO> mappings = new ArrayList<>();
    private LocalDateTime serverTime = LocalDateTime.now(APP_ZONE);
}
