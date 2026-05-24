package ec.gob.salud.hce.backend.mapper;

import ec.gob.salud.hce.backend.dto.AntecedentePerinatalDTO;
import ec.gob.salud.hce.backend.entity.AntecedentePerinatal;
import ec.gob.salud.hce.backend.entity.HistoriaClinica;
import java.util.List;
import java.util.stream.Collectors;

public class AntecedentePerinatalMapper {

    public static AntecedentePerinatalDTO toDto(AntecedentePerinatal entity) {
        if (entity == null) {
            return null;
        }

        AntecedentePerinatalDTO dto = new AntecedentePerinatalDTO();
        dto.setIdAntecedentePerinatal(entity.getIdAntecedentePerinatal());

        if (entity.getHistoriaClinica() != null && entity.getHistoriaClinica().getIdHistoriaClinica() != null) {
            dto.setIdHistoriaClinica(entity.getHistoriaClinica().getIdHistoriaClinica().intValue());
            if (entity.getHistoriaClinica().getPaciente() != null) {
                dto.setIdPaciente(entity.getHistoriaClinica().getPaciente().getIdPaciente());
            }
        }

        dto.setUsuario(entity.getUsuario());
        dto.setUuidOffline(entity.getUuidOffline());
        dto.setSyncStatus(entity.getSyncStatus());
        dto.setLastModified(entity.getLastModified());
        dto.setOrigin(entity.getOrigin());
        return dto;
    }

    public static AntecedentePerinatal toEntity(AntecedentePerinatalDTO dto) {
        if (dto == null) {
            return null;
        }

        AntecedentePerinatal entity = new AntecedentePerinatal();
        if (dto.getIdHistoriaClinica() != null) {
            HistoriaClinica hc = new HistoriaClinica();
            hc.setIdHistoriaClinica(Long.valueOf(dto.getIdHistoriaClinica()));
            entity.setHistoriaClinica(hc);
        }

        entity.setUsuario(dto.getUsuario());
        entity.setOrigin(dto.getOrigin());
        return entity;
    }

    public static List<AntecedentePerinatalDTO> toDtoList(List<AntecedentePerinatal> entities) {
        if (entities == null) {
            return java.util.Collections.emptyList();
        }
        return entities.stream()
                .map(AntecedentePerinatalMapper::toDto)
                .collect(Collectors.toList());
    }
}
