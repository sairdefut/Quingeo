package ec.gob.salud.hce.backend.service;

import ec.gob.salud.hce.backend.dto.ActividadClinicaDTO;
import ec.gob.salud.hce.backend.entity.ActividadClinica;
import ec.gob.salud.hce.backend.entity.Paciente;
import ec.gob.salud.hce.backend.repository.ActividadClinicaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ActividadClinicaService {

    private final ActividadClinicaRepository actividadRepository;

    @Transactional(readOnly = true)
    public List<ActividadClinicaDTO> listarRecientes() {
        return actividadRepository.findTop100ByOrderByFechaHoraDesc()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrar(String accion, Paciente paciente, String usuario, String detalle) {
        ActividadClinica actividad = new ActividadClinica();
        actividad.setAccion(accion);
        actividad.setUsuario(resolveUsuario(usuario));
        actividad.setPaciente(resolvePaciente(paciente));
        actividad.setIdPaciente(paciente != null ? paciente.getIdPaciente() : null);
        actividad.setCedulaPaciente(paciente != null ? paciente.getCedula() : null);
        actividad.setFechaHora(LocalDateTime.now());
        actividad.setDetalle(detalle);
        actividadRepository.save(actividad);
    }

    private ActividadClinicaDTO toDTO(ActividadClinica actividad) {
        return new ActividadClinicaDTO(
                actividad.getId(),
                actividad.getUsuario(),
                actividad.getAccion(),
                actividad.getPaciente(),
                actividad.getIdPaciente(),
                actividad.getCedulaPaciente(),
                actividad.getFechaHora(),
                actividad.getDetalle()
        );
    }

    private String resolveUsuario(String usuario) {
        if (usuario != null && !usuario.isBlank()) {
            return usuario;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && authentication.getName() != null && !"anonymousUser".equals(authentication.getName())) {
            return authentication.getName();
        }

        return "Sistema";
    }

    private String resolvePaciente(Paciente paciente) {
        if (paciente == null) {
            return null;
        }
        String nombre = paciente.getNombreCompleto();
        if (nombre != null && !nombre.isBlank()) {
            return nombre;
        }
        return paciente.getCedula();
    }
}
