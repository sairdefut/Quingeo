package ec.gob.salud.hce.backend.service;

import ec.gob.salud.hce.backend.dto.IdMappingDTO;
import ec.gob.salud.hce.backend.dto.SyncAcceptedDTO;
import ec.gob.salud.hce.backend.dto.SyncBatchRequestDTO;
import ec.gob.salud.hce.backend.dto.SyncBatchResponseDTO;
import ec.gob.salud.hce.backend.dto.SyncConflictDTO;
import ec.gob.salud.hce.backend.dto.SyncDownResponseDTO;
import ec.gob.salud.hce.backend.dto.SyncItemDTO;
import ec.gob.salud.hce.backend.dto.SyncRejectedDTO;
import ec.gob.salud.hce.backend.mapper.PacienteMapper;
import ec.gob.salud.hce.backend.mapper.AntecedenteFamiliarMapper;
import ec.gob.salud.hce.backend.entity.SyncMutation;
import ec.gob.salud.hce.backend.repository.PacienteRepository;
import ec.gob.salud.hce.backend.repository.AntecedenteFamiliarRepository;
import ec.gob.salud.hce.backend.repository.SyncMutationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.List;
import java.util.UUID;

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
    private SyncMutationRepository syncMutationRepository;

    @Autowired
    private ec.gob.salud.hce.backend.mapper.PlanTerapeuticoMapper planMapper;

    @Autowired
    private ec.gob.salud.hce.backend.mapper.EstudioLaboratorioMapper estudioMapper;

    @Autowired
    private PacienteService pacienteService;

    @Autowired
    private ec.gob.salud.hce.backend.repository.TutorRepository tutorRepository;

    @Autowired
    private ec.gob.salud.hce.backend.repository.PacienteTutorRepository pacienteTutorRepository;

    @Autowired
    private ConsultaService consultaService;

    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public SyncDownResponseDTO obtenerDatosParaDescargaInicial() {
        return obtenerDatosParaDescargaInicial(null);
    }

    @Transactional(readOnly = true)
    public SyncDownResponseDTO obtenerDatosParaDescargaInicial(Long since) {
        System.out.println("DEBUG: Iniciando obtenerDatosParaDescargaInicial");
        try {
            SyncDownResponseDTO response = new SyncDownResponseDTO();
            response.setServerTime(LocalDateTime.now());

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

            // Cargar Consultas completas desde el servicio normalizado
            System.out.println("DEBUG: Cargando Consultas...");
            try {
                List<ec.gob.salud.hce.backend.dto.ConsultaDTO> consultasDTO = consultaService.listarTodas();
                response.setConsultas(consultasDTO);
                System.out.println("DEBUG: Consultas mapeadas: " + consultasDTO.size());
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

            aplicarFiltroIncremental(response, since);
            return response;
        } catch (Exception e) {
            System.err.println("CRITICAL ERROR in obtenerDatosParaDescargaInicial: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public SyncBatchResponseDTO procesarSubida(SyncBatchRequestDTO request) {
        SyncBatchResponseDTO response = new SyncBatchResponseDTO();
        List<SyncItemDTO> items = normalizarItems(request);
        String deviceId = normalizarDeviceId(request.getDeviceId());
        String userId = request.getUserId();

        for (SyncItemDTO item : items) {
            asegurarClientMutationId(item);

            if (reproducirMutacionProcesada(deviceId, item, response)) {
                continue;
            }

            try {
                procesarItemSubida(item, response);
                registrarResultadoMutacion(deviceId, userId, item, response);
            } catch (Exception e) {
                response.getRejected().add(new SyncRejectedDTO(
                        item.getClientMutationId(),
                        item.getUuidOffline(),
                        item.getEntity(),
                        e.getMessage()));
                registrarRechazoMutacion(deviceId, userId, item, e.getMessage());
            }
        }

        response.setServerTime(LocalDateTime.now());
        return response;
    }

    private List<SyncItemDTO> normalizarItems(SyncBatchRequestDTO request) {
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            return request.getItems();
        }

        SyncItemDTO legacy = new SyncItemDTO();
        legacy.setClientMutationId(request.getClientMutationId());
        legacy.setEntity(request.getEntity());
        legacy.setOperation(request.getOperation());
        legacy.setType(request.getType());
        legacy.setUuidOffline(request.getUuidOffline());
        legacy.setPayload(request.getPayload());
        legacy.setData(request.getData());
        return List.of(legacy);
    }

    private String normalizarDeviceId(String deviceId) {
        return deviceId == null || deviceId.isBlank() ? "legacy-device" : deviceId.trim();
    }

    private void asegurarClientMutationId(SyncItemDTO item) {
        if (item.getClientMutationId() == null || item.getClientMutationId().isBlank()) {
            item.setClientMutationId("legacy-" + UUID.randomUUID());
        }
    }

    private boolean reproducirMutacionProcesada(String deviceId, SyncItemDTO item, SyncBatchResponseDTO response) {
        return syncMutationRepository
                .findByDeviceIdAndClientMutationId(deviceId, item.getClientMutationId())
                .map(mutation -> {
                    reproducirResultado(mutation, item, response);
                    return true;
                })
                .orElse(false);
    }

    private void reproducirResultado(SyncMutation mutation, SyncItemDTO item, SyncBatchResponseDTO response) {
        String status = mutation.getStatus() == null ? "" : mutation.getStatus().toUpperCase();
        String entity = mutation.getEntity() != null ? mutation.getEntity() : item.getEntity();
        String uuidOffline = mutation.getUuidOffline() != null ? mutation.getUuidOffline() : item.getUuidOffline();

        if ("ACCEPTED".equals(status)) {
            response.getAccepted().add(new SyncAcceptedDTO(mutation.getClientMutationId(), uuidOffline, entity));
            if (mutation.getServerId() != null) {
                IdMappingDTO mapping = new IdMappingDTO(
                        uuidOffline,
                        mutation.getServerId(),
                        entity,
                        mutation.getNumeroHistoriaClinica());
                mapping.setClientMutationId(mutation.getClientMutationId());
                mapping.setServerId(mutation.getServerId());
                mapping.setServerLastModified(mutation.getServerLastModified());
                response.getMappings().add(mapping);
            }
            return;
        }

        if ("CONFLICT".equals(status)) {
            SyncConflictDTO conflict = leerResultadoGuardado(mutation.getResponseJson(), SyncConflictDTO.class);
            if (conflict == null) {
                conflict = new SyncConflictDTO(
                        mutation.getClientMutationId(),
                        uuidOffline,
                        entity,
                        mutation.getReason(),
                        item.effectivePayload(),
                        null);
            }
            response.getConflicts().add(conflict);
            return;
        }

        response.getRejected().add(new SyncRejectedDTO(
                mutation.getClientMutationId(),
                uuidOffline,
                entity,
                mutation.getReason() != null ? mutation.getReason() : "Mutacion rechazada previamente"));
    }

    private <T> T leerResultadoGuardado(String json, Class<T> clazz) {
        if (json == null || json.isBlank()) {
            return null;
        }

        try {
            return objectMapper.readValue(json, clazz);
        } catch (Exception ignored) {
            return null;
        }
    }

    private void registrarResultadoMutacion(String deviceId, String userId, SyncItemDTO item,
            SyncBatchResponseDTO response) {
        SyncAcceptedDTO accepted = response.getAccepted().stream()
                .filter(a -> item.getClientMutationId().equals(a.getClientMutationId()))
                .reduce((first, second) -> second)
                .orElse(null);
        if (accepted != null) {
            IdMappingDTO mapping = response.getMappings().stream()
                    .filter(m -> item.getClientMutationId().equals(m.getClientMutationId()))
                    .reduce((first, second) -> second)
                    .orElse(null);
            guardarMutacion(deviceId, userId, item, "ACCEPTED", null, accepted,
                    mapping != null ? mapping.getServerId() : null,
                    mapping != null ? mapping.getNumeroHistoriaClinica() : null,
                    mapping != null ? mapping.getServerLastModified() : null);
            return;
        }

        SyncConflictDTO conflict = response.getConflicts().stream()
                .filter(c -> item.getClientMutationId().equals(c.getClientMutationId()))
                .reduce((first, second) -> second)
                .orElse(null);
        if (conflict != null) {
            guardarMutacion(deviceId, userId, item, "CONFLICT", conflict.getReason(), conflict,
                    null, null, null);
            return;
        }

        SyncRejectedDTO rejected = response.getRejected().stream()
                .filter(r -> item.getClientMutationId().equals(r.getClientMutationId()))
                .reduce((first, second) -> second)
                .orElse(null);
        if (rejected != null) {
            guardarMutacion(deviceId, userId, item, "REJECTED", rejected.getReason(), rejected,
                    null, null, null);
        }
    }

    private void registrarRechazoMutacion(String deviceId, String userId, SyncItemDTO item, String reason) {
        guardarMutacion(deviceId, userId, item, "REJECTED", reason,
                new SyncRejectedDTO(item.getClientMutationId(), item.getUuidOffline(), item.getEntity(), reason),
                null, null, null);
    }

    private void guardarMutacion(String deviceId, String userId, SyncItemDTO item, String status, String reason,
            Object resultado, Integer serverId, String numeroHistoriaClinica, LocalDateTime serverLastModified) {
        if (syncMutationRepository.findByDeviceIdAndClientMutationId(deviceId, item.getClientMutationId()).isPresent()) {
            return;
        }

        SyncMutation mutation = new SyncMutation();
        mutation.setDeviceId(deviceId);
        mutation.setUserId(userId);
        mutation.setClientMutationId(item.getClientMutationId());
        mutation.setEntity(item.getEntity());
        mutation.setUuidOffline(item.getUuidOffline());
        mutation.setStatus(status);
        mutation.setServerId(serverId);
        mutation.setNumeroHistoriaClinica(numeroHistoriaClinica);
        mutation.setServerLastModified(serverLastModified);
        mutation.setReason(reason);
        mutation.setResponseJson(serializarResultado(resultado));

        try {
            syncMutationRepository.save(mutation);
        } catch (Exception ignored) {
            // Otro reintento concurrente pudo registrar la misma mutacion primero.
        }
    }

    private String serializarResultado(Object resultado) {
        if (resultado == null) {
            return null;
        }

        try {
            return objectMapper.writeValueAsString(resultado);
        } catch (Exception ignored) {
            return null;
        }
    }

    private void procesarItemSubida(SyncItemDTO item, SyncBatchResponseDTO response) {
        if (item.getEntity() == null) {
            throw new IllegalArgumentException("Entidad de sincronizacion requerida");
        }

        if ("paciente".equalsIgnoreCase(item.getEntity())) {
            procesarPaciente(item, response);
            return;
        }

        if ("consulta".equalsIgnoreCase(item.getEntity())) {
            procesarConsulta(item, response);
            return;
        }

        response.getRejected().add(new SyncRejectedDTO(
                item.getClientMutationId(),
                item.getUuidOffline(),
                item.getEntity(),
                "Entidad no soportada para sincronizacion"));
    }

    private void procesarPaciente(SyncItemDTO item, SyncBatchResponseDTO response) {
        ec.gob.salud.hce.backend.dto.PacienteRequestDTO dto = objectMapper.convertValue(
                item.effectivePayload(),
                ec.gob.salud.hce.backend.dto.PacienteRequestDTO.class);

        if (dto.getUuidOffline() == null) {
            dto.setUuidOffline(item.getUuidOffline());
        }

        java.util.Optional<ec.gob.salud.hce.backend.entity.Paciente> porUuid = dto.getUuidOffline() == null
                ? java.util.Optional.empty()
                : pacienteRepository.findByUuidOffline(dto.getUuidOffline());

        if (porUuid.isPresent()) {
            ec.gob.salud.hce.backend.entity.Paciente existente = porUuid.get();
            if (hayConflicto(item.getBaseLastModified(), existente.getLastModified())) {
                response.getConflicts().add(new SyncConflictDTO(
                        item.getClientMutationId(),
                        dto.getUuidOffline(),
                        "paciente",
                        "El paciente fue modificado en el servidor antes de sincronizar",
                        item.effectivePayload(),
                        pacienteMapper.toDTO(existente)));
                return;
            }

            if ("UPDATE".equalsIgnoreCase(item.effectiveOperation())) {
                actualizarPacienteExistente(existente, dto);
                existente = pacienteRepository.save(existente);
            }
            agregarMapping(response, item, dto.getUuidOffline(), existente.getIdPaciente(), "paciente",
                    existente.getNumeroHistoriaClinica(), existente.getLastModified());
            return;
        }

        java.util.List<ec.gob.salud.hce.backend.entity.Paciente> existentesPorCedula = pacienteRepository
                .findByCedula(dto.getCedula());

        if (!existentesPorCedula.isEmpty()) {
            ec.gob.salud.hce.backend.entity.Paciente existente = existentesPorCedula.get(0);
            if (existente.getUuidOffline() == null && dto.getUuidOffline() != null) {
                existente.setUuidOffline(dto.getUuidOffline());
                existente.setSyncStatus("SYNCED");
                existente = pacienteRepository.save(existente);
            }
            agregarMapping(response, item, dto.getUuidOffline(), existente.getIdPaciente(), "paciente",
                    existente.getNumeroHistoriaClinica(), existente.getLastModified());
            return;
        }

        ec.gob.salud.hce.backend.entity.Paciente nuevoPaciente = pacienteService.crearPaciente(dto);
        agregarMapping(response, item, nuevoPaciente.getUuidOffline(), nuevoPaciente.getIdPaciente(), "paciente",
                nuevoPaciente.getNumeroHistoriaClinica(), nuevoPaciente.getLastModified());
    }

    private void procesarConsulta(SyncItemDTO item, SyncBatchResponseDTO response) {
        ec.gob.salud.hce.backend.dto.ConsultaDTO dto = objectMapper.convertValue(
                item.effectivePayload(),
                ec.gob.salud.hce.backend.dto.ConsultaDTO.class);

        if (dto == null) {
            response.getRejected().add(new SyncRejectedDTO(
                    item.getClientMutationId(),
                    item.getUuidOffline(),
                    item.getEntity(),
                    "Payload de consulta requerido"));
            return;
        }

        if (dto.getUuidOffline() == null) {
            dto.setUuidOffline(item.getUuidOffline());
        }

        if (dto.getIdPaciente() == null) {
            response.getRejected().add(new SyncRejectedDTO(
                    item.getClientMutationId(),
                    dto.getUuidOffline(),
                    "consulta",
                    "La consulta no tiene idPaciente. Sincronice primero el paciente asociado."));
            return;
        }

        if (!pacienteRepository.existsById(dto.getIdPaciente())) {
            response.getRejected().add(new SyncRejectedDTO(
                    item.getClientMutationId(),
                    dto.getUuidOffline(),
                    "consulta",
                    "No existe el paciente asociado a la consulta: " + dto.getIdPaciente()));
            return;
        }

        java.util.Optional<ec.gob.salud.hce.backend.entity.Consulta> porUuid = dto.getUuidOffline() == null
                ? java.util.Optional.empty()
                : consultaRepository.findByUuidOffline(dto.getUuidOffline());

        if (porUuid.isPresent()) {
            ec.gob.salud.hce.backend.entity.Consulta existente = porUuid.get();
            if (hayConflicto(item.getBaseLastModified(), existente.getLastModified())) {
                response.getConflicts().add(new SyncConflictDTO(
                        item.getClientMutationId(),
                        dto.getUuidOffline(),
                        "consulta",
                        "La consulta fue modificada en el servidor antes de sincronizar",
                        item.effectivePayload(),
                        ec.gob.salud.hce.backend.mapper.ConsultaMapper.toDto(existente, planMapper, estudioMapper)));
                return;
            }

            ec.gob.salud.hce.backend.dto.ConsultaDTO guardado = consultaService.actualizarConsultaCompleta(
                    existente.getIdConsulta(),
                    dto);
            agregarMapping(response, item, dto.getUuidOffline(), guardado.getIdConsulta().intValue(), "consulta",
                    null, guardado.getLastModified());
            return;
        }

        ec.gob.salud.hce.backend.dto.ConsultaDTO guardado = consultaService.guardarConsultaCompleta(dto);
        agregarMapping(response, item, dto.getUuidOffline(), guardado.getIdConsulta().intValue(), "consulta",
                null, guardado.getLastModified());
    }

    private void actualizarPacienteExistente(ec.gob.salud.hce.backend.entity.Paciente paciente,
            ec.gob.salud.hce.backend.dto.PacienteRequestDTO dto) {
        paciente.setPrimerNombre(dto.getPrimerNombre());
        paciente.setSegundoNombre(dto.getSegundoNombre());
        paciente.setApellidoPaterno(dto.getApellidoPaterno());
        paciente.setApellidoMaterno(dto.getApellidoMaterno());
        paciente.setFechaNacimiento(dto.getFechaNacimiento());
        paciente.setSexo(dto.getSexo());
        paciente.setTipoSangre(dto.getTipoSangre());
        paciente.setTipoIdentificacion(dto.getTipoIdentificacion());
        paciente.setAnioEscolar(dto.getAnioEscolar());
        paciente.setIdGrupoEtnico(dto.getIdGrupoEtnico());
        paciente.setIdParroquia(dto.getIdParroquia());
        paciente.setIdPrqCanton(dto.getIdPrqCanton());
        paciente.setIdPrqCntProvincia(dto.getIdPrqCntProvincia());
        paciente.setUsuario(dto.getUsuario());
        paciente.setOrigin(dto.getOrigin());
        paciente.setSyncStatus("SYNCED");

        if (dto.getTutor() != null) {
            ec.gob.salud.hce.backend.dto.TutorDTO tutorDto = dto.getTutor();

            java.util.List<ec.gob.salud.hce.backend.entity.Tutor> existentes = tutorRepository.findByPrimerNombreAndPrimerApellidoAndSegundoNombreAndSegundoApellido(
                tutorDto.getPrimerNombre(), tutorDto.getPrimerApellido(), tutorDto.getSegundoNombre(), tutorDto.getSegundoApellido()
            );

            ec.gob.salud.hce.backend.entity.Tutor tutor;
            if (!existentes.isEmpty()) {
                tutor = existentes.get(0);
            } else {
                tutor = new ec.gob.salud.hce.backend.entity.Tutor();
            }

            tutor.setPrimerNombre(tutorDto.getPrimerNombre());
            tutor.setSegundoNombre(tutorDto.getSegundoNombre());
            tutor.setPrimerApellido(tutorDto.getPrimerApellido());
            tutor.setSegundoApellido(tutorDto.getSegundoApellido());
            tutor.setTelefono(tutorDto.getTelefono());
            tutor.setNivelEducativo(tutorDto.getNivelEducativo());
            tutor.setDireccion(tutorDto.getDireccion());
            tutor.setIdParroquia(tutorDto.getIdParroquia());
            tutor.setIdPrqCanton(tutorDto.getCanton());
            tutor.setIdPrqCntProvincia(tutorDto.getProvincia());

            tutor = tutorRepository.save(tutor);

            // Relacionar si no existe
            boolean existeRelacion = pacienteTutorRepository.findByPacienteAndTutor(paciente, tutor).isPresent();
            if (!existeRelacion) {
                ec.gob.salud.hce.backend.entity.PacienteTutor relacion = new ec.gob.salud.hce.backend.entity.PacienteTutor();
                relacion.setPaciente(paciente);
                relacion.setTutor(tutor);
                relacion.setParentesco(tutorDto.getParentesco());
                pacienteTutorRepository.save(relacion);
            }
        }
    }

    private void agregarMapping(SyncBatchResponseDTO response, SyncItemDTO item, String uuidOffline, Integer serverId,
            String entityType, String numeroHistoriaClinica, LocalDateTime serverLastModified) {
        response.getAccepted().add(new SyncAcceptedDTO(item.getClientMutationId(), uuidOffline, entityType));
        IdMappingDTO mapping = new IdMappingDTO(uuidOffline, serverId, entityType, numeroHistoriaClinica);
        mapping.setClientMutationId(item.getClientMutationId());
        mapping.setServerId(serverId);
        mapping.setServerLastModified(serverLastModified);
        response.getMappings().add(mapping);
    }

    private boolean hayConflicto(LocalDateTime baseLastModified, LocalDateTime serverLastModified) {
        return baseLastModified != null
                && serverLastModified != null
                && serverLastModified.isAfter(baseLastModified);
    }

    private void aplicarFiltroIncremental(SyncDownResponseDTO response, Long since) {
        if (since == null || since <= 0) {
            return;
        }

        LocalDateTime sinceDate = LocalDateTime.ofInstant(Instant.ofEpochMilli(since), ZoneId.systemDefault());

        if (response.getPacientes() != null) {
            response.setPacientes(response.getPacientes().stream()
                    .filter(p -> p.getLastModified() == null || p.getLastModified().isAfter(sinceDate))
                    .collect(Collectors.toList()));
        }

        if (response.getConsultas() != null) {
            response.setConsultas(response.getConsultas().stream()
                    .filter(c -> c.getLastModified() == null || c.getLastModified().isAfter(sinceDate))
                    .collect(Collectors.toList()));
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
