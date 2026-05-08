package ec.gob.salud.hce.backend.controller;

import ec.gob.salud.hce.backend.dto.UsuarioDTO;
import ec.gob.salud.hce.backend.entity.Usuario;
import ec.gob.salud.hce.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/test")
    public String admin() {
        return "Acceso ADMIN correcto";
    }

    @GetMapping("/usuarios")
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        return ResponseEntity.ok(usuarioRepository.findAll());
    }

    @PostMapping("/usuarios")
    public ResponseEntity<?> crearUsuario(@RequestBody UsuarioDTO dto) {
        if (usuarioRepository.findByUsername(dto.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El usuario ya existe"));
        }

        Usuario nuevo = new Usuario();
        nuevo.setUsername(dto.getUsername());
        nuevo.setPassword(passwordEncoder.encode(dto.getPassword()));
        nuevo.setNombres(dto.getNombres());
        nuevo.setApellidos(dto.getApellidos());
        nuevo.setCargo(dto.getCargo());

        usuarioRepository.save(nuevo);
        return ResponseEntity.ok(Map.of("success", true, "mensaje", "Usuario creado con éxito"));
    }
}
