package ec.gob.salud.hce.backend.controller;

import ec.gob.salud.hce.backend.dto.GeographicCatalogImportResultDTO;
import ec.gob.salud.hce.backend.service.GeographicCatalogImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/catalogos/ubicaciones")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class GeographicCatalogAdminController {
    private final GeographicCatalogImportService service;

    @PostMapping(value = "/preview", consumes = "multipart/form-data")
    public GeographicCatalogImportResultDTO preview(@RequestPart("file") MultipartFile file) {
        return service.preview(file);
    }

    @PostMapping(value = "/import", consumes = "multipart/form-data")
    public GeographicCatalogImportResultDTO importFile(@RequestPart("file") MultipartFile file) {
        return service.importFile(file);
    }
}
