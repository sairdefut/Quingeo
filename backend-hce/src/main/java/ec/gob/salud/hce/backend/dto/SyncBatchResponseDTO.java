package ec.gob.salud.hce.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class SyncBatchResponseDTO {
    private List<SyncAcceptedDTO> accepted = new ArrayList<>();
    private List<SyncRejectedDTO> rejected = new ArrayList<>();
    private List<SyncConflictDTO> conflicts = new ArrayList<>();
    private List<IdMappingDTO> mappings = new ArrayList<>();
    private LocalDateTime serverTime = LocalDateTime.now();
}
