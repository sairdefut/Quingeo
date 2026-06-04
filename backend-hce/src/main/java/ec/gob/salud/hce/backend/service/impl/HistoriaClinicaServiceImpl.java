package ec.gob.salud.hce.backend.service.impl;

import ec.gob.salud.hce.backend.dto.HistoriaClinicaRequestDTO;
import ec.gob.salud.hce.backend.dto.HistoriaClinicaResponseDTO;
import ec.gob.salud.hce.backend.entity.HistoriaClinica;
import ec.gob.salud.hce.backend.mapper.HistoriaClinicaMapper;
import ec.gob.salud.hce.backend.repository.HistoriaClinicaRepository;
import ec.gob.salud.hce.backend.repository.PacienteRepository;
import ec.gob.salud.hce.backend.service.HistoriaClinicaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HistoriaClinicaServiceImpl implements HistoriaClinicaService {

    private final HistoriaClinicaRepository historiaRepository;
    private final PacienteRepository pacienteRepository;
    private static final int HISTORIA_GRUPO_INICIAL = 1;
    private static final int HISTORIA_GRUPO_MAXIMO = 999;

    @Override
    public HistoriaClinica obtenerOcrearHistoria(Integer idPaciente, String usuario) {
        return historiaRepository.findByPaciente_IdPaciente(idPaciente)
            .orElseGet(() -> {
                return pacienteRepository.findById(idPaciente).map(paciente -> {
                    HistoriaClinica nueva = new HistoriaClinica();
                    nueva.setNumeroHistoriaClinica(
                            paciente.getNumeroHistoriaClinica() != null && !paciente.getNumeroHistoriaClinica().isBlank()
                                    ? paciente.getNumeroHistoriaClinica()
                                    : generarSiguienteNumeroHistoriaClinica());
                    nueva.setPaciente(paciente);
                    nueva.setUsuario(usuario);
                    return historiaRepository.save(nueva);
                }).orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
            });
    }

    @Override
    public Optional<HistoriaClinica> buscarPorIdPaciente(Integer idPaciente) {
        return historiaRepository.findByPaciente_IdPaciente(idPaciente);
    }

    @Override
    public List<HistoriaClinicaResponseDTO> obtenerPorPaciente(Long idPaciente) {
        // Convertimos Long a Integer para el repositorio si es necesario
        return historiaRepository.findByPaciente_IdPaciente(idPaciente.intValue())
                .stream()
                .map(HistoriaClinicaMapper::toDto)
                .collect(Collectors.toList());
    }

    // Implementaciones básicas para que no de error de compilación
    @Override 
    public HistoriaClinicaResponseDTO crearHistoriaClinica(HistoriaClinicaRequestDTO dto) {
        return null; // Implementar lógica de guardado si es necesario
    }

    @Override 
    public List<HistoriaClinicaResponseDTO> listarTodas() {
        return historiaRepository.findAll().stream()
                .map(HistoriaClinicaMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override 
    public HistoriaClinicaResponseDTO obtenerPorId(Long id) {
        return historiaRepository.findById(id)
                .map(HistoriaClinicaMapper::toDto)
                .orElse(null);
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
}
