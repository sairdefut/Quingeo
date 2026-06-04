package ec.gob.salud.hce.backend.controller;

import ec.gob.salud.hce.backend.dto.ActividadClinicaDTO;
import ec.gob.salud.hce.backend.service.ActividadClinicaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/actividad")
@RequiredArgsConstructor
public class ActividadClinicaController {

    private final ActividadClinicaService actividadService;

    @GetMapping
    public ResponseEntity<List<ActividadClinicaDTO>> listarRecientes() {
        return ResponseEntity.ok(actividadService.listarRecientes());
    }
}
