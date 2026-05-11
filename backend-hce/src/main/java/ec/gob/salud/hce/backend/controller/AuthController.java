package ec.gob.salud.hce.backend.controller;

import ec.gob.salud.hce.backend.dto.LoginRequest;
import ec.gob.salud.hce.backend.entity.Usuario;
import ec.gob.salud.hce.backend.repository.ConsultaRepository;
import ec.gob.salud.hce.backend.repository.UsuarioRepository;
import ec.gob.salud.hce.backend.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
// Nota: El CORS se maneja globalmente en tu WebConfig para evitar conflictos con allowCredentials
public class AuthController {

    private static final String AUTH_COOKIE_NAME = "HCE_AUTH_TOKEN";

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final ConsultaRepository consultaRepository;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            Usuario usuarioReal = usuarioRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            String token = jwtService.generateToken(usuarioReal.getUsername());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("mensaje", "Login exitoso");
            response.put("username", usuarioReal.getUsername());
            response.put("nombres", usuarioReal.getNombres());
            response.put("apellidos", usuarioReal.getApellidos());
            response.put("cargo", usuarioReal.getCargo());

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, buildAuthCookie(token, httpRequest.isSecure()).toString())
                    .body(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Credenciales incorrectas");
            return ResponseEntity.status(401).body(errorResponse);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletRequest httpRequest) {
        SecurityContextHolder.clearContext();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("mensaje", "Logout exitoso");

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearAuthCookie(httpRequest.isSecure()).toString())
                .body(response);
    }

    private ResponseCookie buildAuthCookie(String token, boolean secure) {
        return ResponseCookie.from(AUTH_COOKIE_NAME, token)
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .sameSite("Lax")
                .maxAge(jwtService.getExpirationSeconds())
                .build();
    }

    private ResponseCookie clearAuthCookie(boolean secure) {
        return ResponseCookie.from(AUTH_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .sameSite("Lax")
                .maxAge(0)
                .build();
    }

    /**
     * Endpoint para el historial de actividad.
     * Mapea las consultas registradas en la base de datos MySQL.
     */
    @GetMapping("/historial")
    public ResponseEntity<?> getHistorial() {
        try {
            List<Map<String, Object>> historial = consultaRepository.findAll().stream().map(c -> {
                Map<String, Object> actividad = new HashMap<>();
                
                // Usamos idConsulta definido en la entidad
                actividad.put("id", c.getIdConsulta());
                
                // Extraemos el médico directamente del String 'usuarioMedico'
                actividad.put("usuarioNombre", c.getUsuarioMedico() != null ? c.getUsuarioMedico() : "Médico no asignado");
                
                actividad.put("accion", "CONSULTA REGISTRADA"); 
                
                // Validación del paciente para evitar el error 500 si los datos son nulos
                if (c.getPaciente() != null) {
                    // Se asume que Paciente tiene getNombres() y getApellidos() basados en errores previos
                    String nombrePac = c.getPaciente().getPrimerNombre() + " " + c.getPaciente().getApellidoPaterno();
                    actividad.put("pacienteNombre", nombrePac);
                } else {
                    actividad.put("pacienteNombre", "Paciente no identificado");
                }
                
                // Fecha capturada por @PrePersist en la entidad
                actividad.put("fechaHora", c.getFechaCreacion());
                
                return actividad;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(historial);
        } catch (Exception e) {
            // Imprime el error en la consola de Spring Boot para depuración
            e.printStackTrace(); 
            Map<String, String> errorMap = new HashMap<>();
            errorMap.put("error", "Error interno al procesar el historial");
            errorMap.put("details", e.getMessage());
            return ResponseEntity.status(500).body(errorMap);
        }
    }

}
