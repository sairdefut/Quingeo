package ec.gob.salud.hce.backend.service;

import ec.gob.salud.hce.backend.dto.SyncDownResponseDTO;
import ec.gob.salud.hce.backend.mapper.PacienteMapper;
import ec.gob.salud.hce.backend.mapper.AntecedenteFamiliarMapper;
import ec.gob.salud.hce.backend.repository.PacienteRepository;
import ec.gob.salud.hce.backend.repository.AntecedenteFamiliarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.List;

@Service
public class SyncService {

    private record CantonCatalogEntry(Long id, Long provinciaId, String nombre, long parroquias) {
    }

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
    private ec.gob.salud.hce.backend.repository.EnfermedadRepository enfermedadRepository;

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
                                    ec.gob.salud.hce.backend.dto.ConsultaDTO dto = ec.gob.salud.hce.backend.mapper.ConsultaMapper
                                            .toDto(c, planMapper, estudioMapper);
                                    if (c.getDatosCompletosJson() != null && !c.getDatosCompletosJson().isBlank()) {
                                        dto.setJsonCompleto(objectMapper.readValue(c.getDatosCompletosJson(), java.util.Map.class));
                                    }
                                    return dto;
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
            List<ec.gob.salud.hce.backend.entity.Canton> cantones = cantonRepository.findAll();
            List<ec.gob.salud.hce.backend.entity.Parroquia> parroquias = parroquiaRepository.findAll();
            Map<Long, Long> parroquiasPorCanton = parroquias.stream().collect(Collectors.groupingBy(
                    p -> p.getCanton().getId(),
                    Collectors.counting()));
            Map<String, CantonCatalogEntry> cantonesCanonicos = new LinkedHashMap<>();
            Map<Long, Long> canonicosPorCantonId = new HashMap<>();
            
            // Provincias
            provinciaRepository.findAll().forEach(p -> {
                catalogos.add(new ec.gob.salud.hce.backend.dto.CatalogoDTO("provincia", p.getId().toString(), p.getNombre(), null));
            });

            // Cantones: deduplicar por provincia + nombre, prefiriendo el que sí tenga parroquias.
            cantones.forEach(c -> {
                String key = c.getProvincia().getId() + ":" + normalizeCatalogName(c.getNombre());
                CantonCatalogEntry candidato = new CantonCatalogEntry(
                        c.getId(),
                        c.getProvincia().getId(),
                        c.getNombre(),
                        parroquiasPorCanton.getOrDefault(c.getId(), 0L));

                CantonCatalogEntry actual = cantonesCanonicos.get(key);
                if (actual == null || isBetterCatalogCandidate(candidato, actual)) {
                    cantonesCanonicos.put(key, candidato);
                }
            });

            cantones.forEach(c -> {
                String key = c.getProvincia().getId() + ":" + normalizeCatalogName(c.getNombre());
                canonicosPorCantonId.put(c.getId(), cantonesCanonicos.get(key).id());
            });

            cantonesCanonicos.values().stream()
                    .sorted(Comparator.comparing(CantonCatalogEntry::provinciaId)
                            .thenComparing(CantonCatalogEntry::nombre))
                    .forEach(c -> catalogos.add(new ec.gob.salud.hce.backend.dto.CatalogoDTO(
                            "canton",
                            c.id().toString(),
                            c.nombre(),
                            c.provinciaId())));

            // Parroquias: re-mapear al cantón canónico y deduplicar por nombre.
            Map<String, ec.gob.salud.hce.backend.entity.Parroquia> parroquiasCanonicas = new LinkedHashMap<>();
            parroquias.forEach(p -> {
                Long cantonCanonicoId = canonicosPorCantonId.getOrDefault(p.getCanton().getId(), p.getCanton().getId());
                String key = cantonCanonicoId + ":" + normalizeCatalogName(p.getNombre());
                ec.gob.salud.hce.backend.entity.Parroquia actual = parroquiasCanonicas.get(key);
                if (actual == null || p.getId() < actual.getId()) {
                    parroquiasCanonicas.put(key, p);
                }
            });

            parroquiasCanonicas.values().stream()
                    .sorted(Comparator.comparing((ec.gob.salud.hce.backend.entity.Parroquia p) -> canonicosPorCantonId
                            .getOrDefault(p.getCanton().getId(), p.getCanton().getId()))
                            .thenComparing(ec.gob.salud.hce.backend.entity.Parroquia::getNombre))
                    .forEach(p -> catalogos.add(new ec.gob.salud.hce.backend.dto.CatalogoDTO(
                            "parroquia",
                            p.getId().toString(),
                            p.getNombre(),
                            canonicosPorCantonId.getOrDefault(p.getCanton().getId(), p.getCanton().getId()))));

            // Etnia
            grupoEtnicoRepository.findAll().forEach(e -> {
                catalogos.add(new ec.gob.salud.hce.backend.dto.CatalogoDTO("etnia", e.getIdGrupoEtnico().toString(), e.getDescripcion(), null));
            });

            enfermedadRepository.findAll().forEach(e -> {
                catalogos.add(new ec.gob.salud.hce.backend.dto.CatalogoDTO("enfermedad", e.getCodigo(), e.getNombre(), null));
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

    private boolean isBetterCatalogCandidate(CantonCatalogEntry candidato, CantonCatalogEntry actual) {
        if (candidato.parroquias() != actual.parroquias()) {
            return candidato.parroquias() > actual.parroquias();
        }
        return candidato.id() < actual.id();
    }

    private String normalizeCatalogName(String value) {
        if (value == null) {
            return "";
        }

        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replaceAll("[^\\p{Alnum}]+", " ")
                .trim()
                .toLowerCase();
    }
}
