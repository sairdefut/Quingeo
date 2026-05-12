package ec.gob.salud.hce.backend.service;

import ec.gob.salud.hce.backend.dto.SyncDownResponseDTO;
import ec.gob.salud.hce.backend.mapper.PacienteMapper;
import ec.gob.salud.hce.backend.mapper.AntecedenteFamiliarMapper;
import ec.gob.salud.hce.backend.repository.PacienteRepository;
import ec.gob.salud.hce.backend.repository.AntecedenteFamiliarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;
import java.util.List;

@Service
public class SyncService {

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private AntecedenteFamiliarRepository antecedenteFamiliarRepository;

    @Autowired
    private ec.gob.salud.hce.backend.repository.ProvinciaRepository provinciaRepository;

    @Autowired
    private ec.gob.salud.hce.backend.repository.CantonRepository cantonRepository;

    @Autowired
    private ec.gob.salud.hce.backend.repository.ParroquiaRepository parroquiaRepository;

    @Autowired
    private ec.gob.salud.hce.backend.repository.GrupoEtnicoRepository grupoEtnicoRepository;

    @Autowired
    private PacienteMapper pacienteMapper;

    @Autowired
    private AntecedenteFamiliarMapper anteMapper;

    @Autowired
    private ec.gob.salud.hce.backend.repository.ConsultaRepository consultaRepository;

    @Autowired
    private ec.gob.salud.hce.backend.mapper.PlanTerapeuticoMapper planMapper;

    @Autowired
    private ec.gob.salud.hce.backend.mapper.EstudioLaboratorioMapper estudioMapper;

    @Autowired
    private PacienteService pacienteService;

    @Autowired
    private ConsultaService consultaService;

    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public SyncDownResponseDTO obtenerDatosParaDescargaInicial() {
        System.out.println("DEBUG: Iniciando obtenerDatosParaDescargaInicial");
        try {
            SyncDownResponseDTO response = new SyncDownResponseDTO();

            // Cargar Pacientes con sus tutores y deduplicar por cédula
            System.out.println("DEBUG: Cargando Pacientes...");
            java.util.List<ec.gob.salud.hce.backend.dto.PacienteResponseDTO> todosPacientes = pacienteRepository.findAllWithTutores().stream()
                    .map(pacienteMapper::toDTO)
                    .collect(java.util.stream.Collectors.toList());
            
            // Quedarnos con el registro más reciente o simplemente el primero por cada cédula
            java.util.Map<String, ec.gob.salud.hce.backend.dto.PacienteResponseDTO> pacientesUnicos = new java.util.LinkedHashMap<>();
            for (ec.gob.salud.hce.backend.dto.PacienteResponseDTO p : todosPacientes) {
                if (p.getCedula() != null && !pacientesUnicos.containsKey(p.getCedula())) {
                    pacientesUnicos.put(p.getCedula(), p);
                }
            }
            
            response.setPacientes(new java.util.ArrayList<>(pacientesUnicos.values()));
            System.out.println("DEBUG: Pacientes cargados y deduplicados: "
                    + (response.getPacientes() != null ? response.getPacientes().size() : 0));

            // Cargar Antecedentes
            System.out.println("DEBUG: Cargando Antecedentes...");
            response.setAntecedentesFamiliares(antecedenteFamiliarRepository.findAll().stream()
                    .map(anteMapper::toDTO)
                    .collect(Collectors.toList()));
            System.out.println("DEBUG: Antecedentes cargados: "
                    + (response.getAntecedentesFamiliares() != null ? response.getAntecedentesFamiliares().size() : 0));

            // Cargar Consultas completas (con planes y estudios)
            System.out.println("DEBUG: Cargando Consultas...");
            try {
                List<ec.gob.salud.hce.backend.entity.Consulta> consultas = consultaRepository.findAllWithDetails();
                System.out.println("DEBUG: Consultas encontradas en DB: " + (consultas != null ? consultas.size() : 0));

                if (consultas != null) {
                    List<ec.gob.salud.hce.backend.dto.ConsultaDTO> consultasDTO = consultas.stream()
                            .map(c -> {
                                try {
                                    return ec.gob.salud.hce.backend.mapper.ConsultaMapper.toDto(c, planMapper,
                                            estudioMapper);
                                } catch (Exception e) {
                                    System.err.println(
                                            "ERROR mapeando consulta ID " + c.getIdConsulta() + ": " + e.getMessage());
                                    e.printStackTrace();
                                    return null;
                                }
                            })
                            .filter(java.util.Objects::nonNull)
                            .collect(Collectors.toList());
                    response.setConsultas(consultasDTO);
                    System.out.println("DEBUG: Consultas mapeadas: " + consultasDTO.size());
                }
            } catch (Exception e) {
                System.err
                        .println("ERROR CRÍTICO recuperando consultas (Continuando con Pacientes): " + e.getMessage());
                e.printStackTrace();
                // Continuar sin consultas
                response.setConsultas(new java.util.ArrayList<>());
            }

            // CARGAR CATÁLOGOS
            System.out.println("DEBUG: Cargando Catálogos...");
            List<ec.gob.salud.hce.backend.dto.CatalogoDTO> catalogos = new java.util.ArrayList<>();
            
            // Provincias
            provinciaRepository.findAll().forEach(p -> {
                catalogos.add(new ec.gob.salud.hce.backend.dto.CatalogoDTO("provincia", p.getId().toString(), p.getNombre(), null));
            });
            // Cantones
            cantonRepository.findAll().forEach(c -> {
                catalogos.add(new ec.gob.salud.hce.backend.dto.CatalogoDTO("canton", c.getId().toString(), c.getNombre(), c.getProvincia().getId()));
            });
            // Parroquias
            parroquiaRepository.findAll().forEach(p -> {
                catalogos.add(new ec.gob.salud.hce.backend.dto.CatalogoDTO("parroquia", p.getId().toString(), p.getNombre(), p.getCanton().getId()));
            });
            // Etnia
            grupoEtnicoRepository.findAll().forEach(e -> {
                catalogos.add(new ec.gob.salud.hce.backend.dto.CatalogoDTO("etnia", e.getIdGrupoEtnico().toString(), e.getDescripcion(), null));
            });
            
            // Catálogos estáticos
            String[] sexos = {"Masculino", "Femenino"};
            for(String s : sexos) catalogos.add(new ec.gob.salud.hce.backend.dto.CatalogoDTO("sexo", s, s, null));
            
            String[] tiposSangre = {"O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"};
            for(String t : tiposSangre) catalogos.add(new ec.gob.salud.hce.backend.dto.CatalogoDTO("tipoSangre", t, t, null));
            
            String[] parentescos = {"Madre", "Padre", "Abuelo/a", "Tío/a", "Hermano/a", "Otro/Tutor"};
            for(String p : parentescos) catalogos.add(new ec.gob.salud.hce.backend.dto.CatalogoDTO("parentesco", p, p, null));
            
            String[] niveles = {"Ninguno", "Primaria", "Secundaria", "Superior / Universitario", "Postgrado"};
            for(String n : niveles) catalogos.add(new ec.gob.salud.hce.backend.dto.CatalogoDTO("nivelEducativo", n, n, null));
            
            response.setCatalogos(catalogos);
            System.out.println("DEBUG: Catálogos cargados: " + catalogos.size());

            return response;
        } catch (Exception e) {
            System.err.println("CRITICAL ERROR in obtenerDatosParaDescargaInicial: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public List<ec.gob.salud.hce.backend.dto.IdMappingDTO> procesarSubida(
            ec.gob.salud.hce.backend.dto.SyncUpRequestDTO request) {
        List<ec.gob.salud.hce.backend.dto.IdMappingDTO> mappings = new java.util.ArrayList<>();
        try {
            if ("paciente".equalsIgnoreCase(request.getEntity())) {
                if ("CREATE".equalsIgnoreCase(request.getType())) {
                    // Convertir el Map 'data' a PacienteRequestDTO
                    ec.gob.salud.hce.backend.dto.PacienteRequestDTO dto = objectMapper.convertValue(request.getData(),
                            ec.gob.salud.hce.backend.dto.PacienteRequestDTO.class);

                    // VERIFICAR SI YA EXISTE UN PACIENTE CON ESA CÉDULA
                    java.util.List<ec.gob.salud.hce.backend.entity.Paciente> existentes = pacienteRepository
                            .findByCedula(dto.getCedula());

                    if (existentes.isEmpty()) {
                        // Solo crear si no existe
                        ec.gob.salud.hce.backend.entity.Paciente nuevoPaciente = pacienteService.crearPaciente(dto);

                        // Agregar mapeo a la lista de respuesta
                        if (nuevoPaciente != null && nuevoPaciente.getUuidOffline() != null) {
                            mappings.add(new ec.gob.salud.hce.backend.dto.IdMappingDTO(
                                    nuevoPaciente.getUuidOffline(),
                                    nuevoPaciente.getIdPaciente(),
                                    "paciente"));
                            System.out.println("DEBUG: Mapeo creado UUID: " + nuevoPaciente.getUuidOffline()
                                    + " -> ID: " + nuevoPaciente.getIdPaciente());
                        }

                    } else {
                        // Paciente ya existe, devolver el mapeo del existente para que el frontend se
                        // actualice
                        ec.gob.salud.hce.backend.entity.Paciente existente = existentes.get(0);
                        if (dto.getUuidOffline() != null) {
                            mappings.add(new ec.gob.salud.hce.backend.dto.IdMappingDTO(
                                    dto.getUuidOffline(),
                                    existente.getIdPaciente(),
                                    "paciente"));
                        }
                        System.out.println(
                                "Paciente con cédula " + dto.getCedula() + " ya existe. Devolviendo ID existente: "
                                        + existente.getIdPaciente());
                    }
                }
            } else if ("consulta".equalsIgnoreCase(request.getEntity())) {
                if ("CREATE".equalsIgnoreCase(request.getType())) {
                    System.out.println("DEBUG: Procesando sincronización de CONSULTA...");
                    // Convertir el Map 'data' a ConsultaDTO
                    ec.gob.salud.hce.backend.dto.ConsultaDTO dto = objectMapper.convertValue(request.getData(),
                            ec.gob.salud.hce.backend.dto.ConsultaDTO.class);

                    // Guardar usando el servicio existente
                    ec.gob.salud.hce.backend.dto.ConsultaDTO guardado = consultaService.guardarConsultaCompleta(dto);

                    if (guardado != null) {
                        System.out.println("DEBUG: Consulta sincronizada exitosamente. ID: " + guardado.getIdConsulta());
                        // Si el frontend envía un UUID temporal, podríamos mapearlo aquí
                        // mappings.add(new IdMappingDTO(...));
                    }
                }
            }
            return mappings;
        } catch (Exception e) {
            System.err.println("❌ ERROR en procesarSubida:");
            System.err.println("Entity: " + request.getEntity());
            System.err.println("Type: " + request.getType());
            System.err.println("Data: " + request.getData());
            System.err.println("Exception: " + e.getClass().getName());
            System.err.println("Message: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al procesar sincronización: " + e.getMessage(), e);
        }
    }
}