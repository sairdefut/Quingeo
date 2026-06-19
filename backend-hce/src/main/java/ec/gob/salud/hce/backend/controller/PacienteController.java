package ec.gob.salud.hce.backend.controller;

import ec.gob.salud.hce.backend.dto.PacienteRequestDTO;
import ec.gob.salud.hce.backend.dto.PacienteResponseDTO;
import ec.gob.salud.hce.backend.dto.TutorDTO;
import ec.gob.salud.hce.backend.entity.Paciente;
import ec.gob.salud.hce.backend.entity.PacienteTutor;
import ec.gob.salud.hce.backend.entity.Tutor;
import ec.gob.salud.hce.backend.repository.PacienteRepository;
import ec.gob.salud.hce.backend.service.PacienteService;
import ec.gob.salud.hce.backend.mapper.PacienteMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pacientes")
@RequiredArgsConstructor
public class PacienteController {

    private final PacienteService pacienteService;
    private final PacienteRepository pacienteRepository;
    private final PacienteMapper pacienteMapper;

    // --- 1. CREAR PACIENTE ---
    @PostMapping
    public ResponseEntity<PacienteResponseDTO> crear(@Valid @RequestBody PacienteRequestDTO request) {
        Paciente pacienteGuardado = pacienteService.crearPaciente(request);
        PacienteResponseDTO response = pacienteMapper.toDTO(pacienteGuardado);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // --- 2. OBTENER CON FUSIÓN (SOLUCIÓN A LOS 24 DUPLICADOS) ---
    @GetMapping("/{valor}")
    public ResponseEntity<PacienteResponseDTO> obtenerPaciente(@PathVariable String valor) {
        
        // A. Buscamos TODOS los registros por cédula (recibimos los 24)
        List<Paciente> pacientesEncontrados = pacienteRepository.findByCedula(valor);
        
        // Si no encontró nada por cédula, intentamos buscar por ID numérico
        if (pacientesEncontrados.isEmpty()) {
            try {
                Integer id = Integer.parseInt(valor);
                return pacienteRepository.findById(id)
                        .map(pacienteMapper::toDTO)
                        .map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
            } catch (NumberFormatException e) {
                return ResponseEntity.notFound().build();
            }
        }

        // B. LÓGICA DE UNIFICACIÓN (FUSIÓN DE LOS 24 REGISTROS)
        
        // 1. Ordenamos: El paciente con ID más alto (el más nuevo) va primero
        pacientesEncontrados.sort((p1, p2) -> p2.getIdPaciente().compareTo(p1.getIdPaciente()));

        // 2. Tomamos el más reciente como el "Paciente Principal"
        Paciente pacienteUnificado = pacientesEncontrados.get(0);

        // 3. Recorremos los otros (los antiguos) para recuperar datos perdidos
        for (int i = 1; i < pacientesEncontrados.size(); i++) {
            Paciente duplicado = pacientesEncontrados.get(i);

            // FUSIONAR HISTORIA CLÍNICA: Si el duplicado tiene historial, se lo sumamos al principal
            if (duplicado.getHistoriaClinica() != null && !duplicado.getHistoriaClinica().isEmpty()) {
                if (pacienteUnificado.getHistoriaClinica() == null) {
                    pacienteUnificado.setHistoriaClinica(duplicado.getHistoriaClinica());
                } else {
                    pacienteUnificado.getHistoriaClinica().addAll(duplicado.getHistoriaClinica());
                }
            }

            // RELLENAR DATOS VACÍOS: Si al principal le falta algo (ej. Tipo de Sangre), lo tomamos del duplicado
            if (pacienteUnificado.getTipoSangre() == null) pacienteUnificado.setTipoSangre(duplicado.getTipoSangre());
            if (pacienteUnificado.getSexo() == null) pacienteUnificado.setSexo(duplicado.getSexo());
            if (pacienteUnificado.getFechaNacimiento() == null) pacienteUnificado.setFechaNacimiento(duplicado.getFechaNacimiento());
            
        }

        // 4. Devolvemos el paciente unificado como si fuera uno solo
        return ResponseEntity.ok(pacienteMapper.toDTO(pacienteUnificado));
    }

    // --- 3. LISTAR TODOS ---
    @GetMapping
    public ResponseEntity<List<PacienteResponseDTO>> listar() {
        List<PacienteResponseDTO> lista = pacienteService.listarTodos()
                .stream()
                .map(pacienteMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(lista);
    }

    // --- 4. BUSCAR POR CRITERIO ---
    @GetMapping("/buscar")
    public ResponseEntity<List<PacienteResponseDTO>> buscar(@RequestParam("q") String criterio) {
        List<PacienteResponseDTO> lista = pacienteService.buscarPorCriterio(criterio)
                .stream()
                .map(pacienteMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(lista);
    }
}
