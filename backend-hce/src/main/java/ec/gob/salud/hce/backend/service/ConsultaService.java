package ec.gob.salud.hce.backend.service;

import ec.gob.salud.hce.backend.dto.ConsultaDTO;
import ec.gob.salud.hce.backend.entity.*;
import ec.gob.salud.hce.backend.mapper.ConsultaMapper;
import ec.gob.salud.hce.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConsultaService {

    private final ConsultaRepository consultaRepository;
    private final PacienteRepository pacienteRepository;
    private final HistoriaClinicaRepository historiaRepository;
    private final ec.gob.salud.hce.backend.mapper.PlanTerapeuticoMapper planMapper;
    private final ec.gob.salud.hce.backend.mapper.EstudioLaboratorioMapper estudioMapper;
    private final ObjectMapper objectMapper;

    @Transactional
    public ConsultaDTO guardarConsultaCompleta(ConsultaDTO dto) {
        Paciente paciente = pacienteRepository.findById(dto.getIdPaciente())
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));

        // D-3: Validar perímetro cefálico (solo para 2-3 años = 24-36 meses)
        if (dto.getPerimetroCefalico() != null) {
            int edadMeses = calcularEdadMeses(paciente.getFechaNacimiento());
            if (edadMeses < 24 || edadMeses > 36) {
                dto.setPerimetroCefalico(null); // Ignorar el valor
            }
        }

        HistoriaClinica historia = historiaRepository.findByPaciente_IdPaciente(paciente.getIdPaciente())
                .orElseGet(() -> {
                    HistoriaClinica nueva = new HistoriaClinica();
                    nueva.setPaciente(paciente);
                    nueva.setUsuario(dto.getUsuario());
                    return historiaRepository.save(nueva);
                });

        // Crear consulta con mapper (ahora incluye planes y estudios con cascade)
        Consulta consulta = ConsultaMapper.toEntity(dto, paciente, planMapper, estudioMapper);
        consulta.setHistoriaClinica(historia);
        if (dto.getUsuario() != null)
            consulta.setUsuarioMedico(dto.getUsuario());

        if (dto.getJsonCompleto() != null) {
            try {
                consulta.setDatosCompletosJson(objectMapper.writeValueAsString(dto.getJsonCompleto()));
            } catch (JsonProcessingException e) {
                throw new RuntimeException("No se pudo serializar el detalle completo de la consulta", e);
            }
        }

        // UN SOLO SAVE - cascade automático guarda planes y estudios
        Consulta consultaGuardada = consultaRepository.save(consulta);

        return ConsultaMapper.toDto(consultaGuardada, planMapper, estudioMapper);
    }

    @Transactional(readOnly = true)
    public List<ConsultaDTO> listarPorPaciente(Integer idPaciente) {
        return consultaRepository.findByIdPacienteWithDetails(idPaciente)
                .stream()
                .map(this::mapConsultaCompleta)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConsultaDTO> listarTodas() {
        return consultaRepository.findAll().stream().map(c -> {
            ConsultaDTO dto = mapConsultaCompleta(c);
            dto.setUsuario(c.getUsuarioMedico());
            return dto;
        }).collect(Collectors.toList());
    }

    private ConsultaDTO mapConsultaCompleta(Consulta consulta) {
        ConsultaDTO dto = ConsultaMapper.toDto(consulta, planMapper, estudioMapper);
        if (consulta.getDatosCompletosJson() != null && !consulta.getDatosCompletosJson().isBlank()) {
            try {
                dto.setJsonCompleto(objectMapper.readValue(consulta.getDatosCompletosJson(), java.util.Map.class));
            } catch (JsonProcessingException e) {
                throw new RuntimeException("No se pudo leer el detalle completo de la consulta", e);
            }
        }
        return dto;
    }

    // D-3: Calcular edad en meses
    private int calcularEdadMeses(LocalDate fechaNacimiento) {
        if (fechaNacimiento == null) return 0;
        return Period.between(fechaNacimiento, LocalDate.now()).getYears() * 12 
               + Period.between(fechaNacimiento, LocalDate.now()).getMonths();
    }
}
