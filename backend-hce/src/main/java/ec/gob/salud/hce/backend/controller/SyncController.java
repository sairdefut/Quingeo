package ec.gob.salud.hce.backend.controller;

import ec.gob.salud.hce.backend.dto.SyncDownResponseDTO;
import ec.gob.salud.hce.backend.dto.SyncBatchRequestDTO;
import ec.gob.salud.hce.backend.dto.SyncBatchResponseDTO;
import ec.gob.salud.hce.backend.service.SyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sync")
@RequiredArgsConstructor
public class SyncController {

    private final SyncService syncService;

    @GetMapping("/ping")
    public ResponseEntity<Void> ping() {
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/down")
    public ResponseEntity<SyncDownResponseDTO> descargarDatos(@RequestParam(required = false) Long since) {
        return ResponseEntity.ok(syncService.obtenerDatosParaDescargaInicial(since));
    }

    @org.springframework.web.bind.annotation.PostMapping("/up")
    public ResponseEntity<SyncBatchResponseDTO> subirDatos(
            @org.springframework.web.bind.annotation.RequestBody SyncBatchRequestDTO request) {
        return ResponseEntity.ok(syncService.procesarSubida(request));
    }
}
