package ec.gob.salud.hce.backend.controller;

import ec.gob.salud.hce.backend.dto.ExamenFisicoDTO;
import ec.gob.salud.hce.backend.entity.ExamenFisico;
import ec.gob.salud.hce.backend.entity.ExamenFisicoSegmentario;
import ec.gob.salud.hce.backend.mapper.ExamenFisicoMapper;
import ec.gob.salud.hce.backend.repository.ExamenFisicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List; // <--- ESTA ES LA LÍNEA QUE FALTABA

@RestController
@RequestMapping("/api/examen-fisico")
public class ExamenFisicoController {

    @Autowired
    private ExamenFisicoRepository examenFisicoRepository;

    @GetMapping
    public List<ExamenFisicoDTO> getAll() {
        return ExamenFisicoMapper.toDtoList(examenFisicoRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<ExamenFisicoDTO> create(@RequestBody ExamenFisicoDTO dto) {
        ExamenFisico entity = new ExamenFisico();
        entity.setIdConsulta(dto.getIdConsulta());

        if (dto.getIdExamenFisicoSegmentario() != null) {
            ExamenFisicoSegmentario segmentario = new ExamenFisicoSegmentario();
            segmentario.setIdExamenFisicoSegmentario(dto.getIdExamenFisicoSegmentario());
            entity.setExamenFisicoSegmentario(segmentario);
        }
        
        ExamenFisico guardado = examenFisicoRepository.save(entity);
        return ResponseEntity.ok(ExamenFisicoMapper.toDto(guardado));
    }
}
