package ec.gob.salud.hce.backend.controller;

import ec.gob.salud.hce.backend.dto.ChangePasswordDTO;
import ec.gob.salud.hce.backend.dto.MyConsultaDTO;
import ec.gob.salud.hce.backend.dto.ProfileDTO;
import ec.gob.salud.hce.backend.dto.UpdateProfileDTO;
import ec.gob.salud.hce.backend.entity.Consulta;
import ec.gob.salud.hce.backend.entity.Paciente;
import ec.gob.salud.hce.backend.entity.Usuario;
import ec.gob.salud.hce.backend.repository.ConsultaRepository;
import ec.gob.salud.hce.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UsuarioRepository usuarioRepository;
    private final ConsultaRepository consultaRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    public ProfileDTO me() {
        return toProfileDTO(currentUser());
    }

    @PutMapping("/me")
    public ProfileDTO updateProfile(@RequestBody UpdateProfileDTO dto) {
        Usuario usuario = currentUser();
        if (dto.getNombres() == null || dto.getNombres().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Los nombres son requeridos");
        }
        if (dto.getApellidos() == null || dto.getApellidos().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Los apellidos son requeridos");
        }

        usuario.setNombres(dto.getNombres().trim());
        usuario.setApellidos(dto.getApellidos().trim());
        return toProfileDTO(usuarioRepository.save(usuario));
    }

    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordDTO dto) {
        Usuario usuario = currentUser();
        if (dto.getCurrentPassword() == null || dto.getCurrentPassword().isBlank()
                || dto.getNewPassword() == null || dto.getNewPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debe ingresar la contraseña actual y la nueva");
        }
        if (dto.getNewPassword().length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La nueva contraseña debe tener al menos 6 caracteres");
        }
        if (!passwordEncoder.matches(dto.getCurrentPassword(), usuario.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña actual no es correcta");
        }

        usuario.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        usuarioRepository.save(usuario);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/me/consultas")
    public List<MyConsultaDTO> myConsultas() {
        Usuario usuario = currentUser();
        String nombreCompleto = fullName(usuario);
        return consultaRepository
                .findMineWithPaciente(usuario.getIdPersonal(), usuario.getUsername(), nombreCompleto)
                .stream()
                .map(this::toMyConsultaDTO)
                .toList();
    }

    private Usuario currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sesion no valida");
        }
        return usuarioRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));
    }

    private ProfileDTO toProfileDTO(Usuario usuario) {
        return new ProfileDTO(
                usuario.getIdPersonal(),
                usuario.getUsername(),
                usuario.getNombres(),
                usuario.getApellidos(),
                usuario.getCargo());
    }

    private MyConsultaDTO toMyConsultaDTO(Consulta consulta) {
        MyConsultaDTO dto = new MyConsultaDTO();
        dto.setIdConsulta(consulta.getIdConsulta());
        dto.setFecha(consulta.getFechaConsulta());
        dto.setHora(consulta.getHoraConsulta());
        dto.setMotivo(consulta.getMotivoConsulta());
        dto.setDiagnostico(consulta.getDiagnosticoPrincipal());
        dto.setTipoDiagnostico(consulta.getTipoDiagnostico());
        dto.setSyncStatus(consulta.getSyncStatus());
        dto.setLastModified(consulta.getLastModified());

        if (consulta.getHistoriaClinica() != null) {
            dto.setNumeroHistoriaClinica(consulta.getHistoriaClinica().getNumeroHistoriaClinica());
            Paciente paciente = consulta.getHistoriaClinica().getPaciente();
            if (paciente != null) {
                dto.setIdPaciente(paciente.getIdPaciente());
                dto.setCedulaPaciente(paciente.getCedula());
                dto.setPacienteNombre(fullPacienteName(paciente));
            }
        }
        return dto;
    }

    private String fullName(Usuario usuario) {
        return ((usuario.getNombres() == null ? "" : usuario.getNombres()) + " "
                + (usuario.getApellidos() == null ? "" : usuario.getApellidos())).trim();
    }

    private String fullPacienteName(Paciente paciente) {
        return String.join(" ",
                paciente.getPrimerNombre() == null ? "" : paciente.getPrimerNombre(),
                paciente.getSegundoNombre() == null ? "" : paciente.getSegundoNombre(),
                paciente.getApellidoPaterno() == null ? "" : paciente.getApellidoPaterno(),
                paciente.getApellidoMaterno() == null ? "" : paciente.getApellidoMaterno()).trim();
    }
}
