package ec.gob.salud.hce.backend.service;

import ec.gob.salud.hce.backend.dto.ConsultaDTO;
import ec.gob.salud.hce.backend.entity.*;
import ec.gob.salud.hce.backend.mapper.ConsultaMapper;
import ec.gob.salud.hce.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
    private static final int HISTORIA_GRUPO_INICIAL = 1;
    private static final int HISTORIA_GRUPO_MAXIMO = 999;

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
                .orElseGet(() -> crearPrimeraHistoriaClinica(paciente, dto.getUsuario()));

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

    @Transactional
    public ConsultaDTO actualizarConsultaCompleta(Long idConsulta, ConsultaDTO dto) {
        Consulta consulta = consultaRepository.findById(idConsulta)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Consulta no encontrada"));

        Paciente paciente = consulta.getHistoriaClinica() != null
                ? consulta.getHistoriaClinica().getPaciente()
                : null;

        if (paciente != null && dto.getPerimetroCefalico() != null) {
            int edadMeses = calcularEdadMeses(paciente.getFechaNacimiento());
            if (edadMeses < 24 || edadMeses > 36) {
                dto.setPerimetroCefalico(null);
            }
        }

        actualizarCamposConsulta(consulta, dto);
        Consulta consultaGuardada = consultaRepository.save(consulta);
        return mapConsultaCompleta(consultaGuardada);
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

    private void actualizarCamposConsulta(Consulta consulta, ConsultaDTO dto) {
        consulta.setFechaConsulta(dto.getFecha());
        consulta.setHoraConsulta(dto.getHora());
        consulta.setMotivoConsulta(dto.getMotivo());
        consulta.setEnfermedadActual(dto.getEnfermedadActual());

        consulta.setPeso(dto.getPeso());
        consulta.setTalla(dto.getTalla());
        consulta.setTemperatura(dto.getTemperatura());
        consulta.setFrecuenciaCardiaca(dto.getFc());
        consulta.setFrecuenciaRespiratoria(dto.getFr());
        consulta.setSaturacion(dto.getSpo2());

        consulta.setDiagnosticoPrincipal(dto.getDiagnosticoTexto());
        consulta.setTipoDiagnostico(dto.getTipoDiagnostico());
        consulta.setReferenciaHospital(dto.getReferenciaHospital());
        consulta.setMotivoReferencia(dto.getMotivoReferencia());
        if (dto.getUsuario() != null) {
            consulta.setUsuarioMedico(dto.getUsuario());
        }

        if (dto.getJsonCompleto() != null) {
            try {
                consulta.setDatosCompletosJson(objectMapper.writeValueAsString(dto.getJsonCompleto()));
            } catch (JsonProcessingException e) {
                throw new RuntimeException("No se pudo serializar el detalle completo de la consulta", e);
            }
        } else {
            consulta.setDatosCompletosJson(null);
        }

        consulta.getPlanes().clear();
        if (dto.getListaPlan() != null) {
            dto.getListaPlan().forEach(planDTO -> {
                PlanTerapeutico plan = planMapper.toEntity(planDTO);
                plan.setId(null);
                plan.setConsulta(consulta);
                consulta.getPlanes().add(plan);
            });
        }

        consulta.getEstudios().clear();
        if (dto.getListaEstudios() != null) {
            dto.getListaEstudios().forEach(estudioDTO -> {
                EstudioLaboratorio estudio = estudioMapper.toEntity(estudioDTO);
                estudio.setId(null);
                estudio.setConsulta(consulta);
                consulta.getEstudios().add(estudio);
            });
        }
    }

    private HistoriaClinica crearPrimeraHistoriaClinica(Paciente paciente, String usuario) {
        HistoriaClinica nueva = new HistoriaClinica();
        nueva.setNumeroHistoriaClinica(resolveNumeroNuevaHistoria(paciente));
        nueva.setPaciente(paciente);
        nueva.setUsuario(usuario);
        return historiaRepository.save(nueva);
    }

    private String resolveNumeroNuevaHistoria(Paciente paciente) {
        if (paciente.getNumeroHistoriaClinica() != null && !paciente.getNumeroHistoriaClinica().isBlank()) {
            return paciente.getNumeroHistoriaClinica();
        }
        return generarSiguienteNumeroHistoriaClinica();
    }

    private String generarSiguienteNumeroHistoriaClinica() {
        return historiaRepository.findTopByNumeroHistoriaClinicaIsNotNullOrderByNumeroHistoriaClinicaDesc()
                .map(HistoriaClinica::getNumeroHistoriaClinica)
                .map(this::incrementarNumeroHistoriaClinica)
                .orElse("HC-001-001-001");
    }

    private String incrementarNumeroHistoriaClinica(String numeroActual) {
        int[] grupos = parsearGruposHistoriaClinica(numeroActual);

        grupos[2]++;
        if (grupos[2] > HISTORIA_GRUPO_MAXIMO) {
            grupos[2] = HISTORIA_GRUPO_INICIAL;
            grupos[1]++;
        }
        if (grupos[1] > HISTORIA_GRUPO_MAXIMO) {
            grupos[1] = HISTORIA_GRUPO_INICIAL;
            grupos[0]++;
        }
        if (grupos[0] > HISTORIA_GRUPO_MAXIMO) {
            throw new IllegalStateException("Se alcanzo el limite de numeros de historia clinica");
        }

        return String.format("HC-%03d-%03d-%03d", grupos[0], grupos[1], grupos[2]);
    }

    private int[] parsearGruposHistoriaClinica(String numeroHistoriaClinica) {
        if (numeroHistoriaClinica == null || !numeroHistoriaClinica.matches("^HC-\\d{3}-\\d{3}-\\d{3}$")) {
            return new int[] { HISTORIA_GRUPO_INICIAL, HISTORIA_GRUPO_INICIAL, 0 };
        }

        return new int[] {
                Integer.parseInt(numeroHistoriaClinica.substring(3, 6)),
                Integer.parseInt(numeroHistoriaClinica.substring(7, 10)),
                Integer.parseInt(numeroHistoriaClinica.substring(11, 14))
        };
    }

    // D-3: Calcular edad en meses
    private int calcularEdadMeses(LocalDate fechaNacimiento) {
        if (fechaNacimiento == null) return 0;
        return Period.between(fechaNacimiento, LocalDate.now()).getYears() * 12 
               + Period.between(fechaNacimiento, LocalDate.now()).getMonths();
    }
}
