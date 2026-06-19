package ec.gob.salud.hce.backend.controller;

import ec.gob.salud.hce.backend.dto.Cie10ImportResultDTO;
import ec.gob.salud.hce.backend.service.Cie10ImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/cie10")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class Cie10AdminController {

    private final Cie10ImportService cie10ImportService;

    @PostMapping(value = "/preview", consumes = "multipart/form-data")
    public Cie10ImportResultDTO preview(@RequestPart("file") MultipartFile file) {
        return cie10ImportService.preview(file);
    }

    @PostMapping(value = "/import", consumes = "multipart/form-data")
    public Cie10ImportResultDTO importFile(@RequestPart("file") MultipartFile file) {
        return cie10ImportService.importFile(file);
    }
}
