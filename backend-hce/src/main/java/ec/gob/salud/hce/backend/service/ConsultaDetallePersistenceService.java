package ec.gob.salud.hce.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import ec.gob.salud.hce.backend.dto.*;
import ec.gob.salud.hce.backend.entity.*;
import ec.gob.salud.hce.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConsultaDetallePersistenceService {

    private final ObjectMapper objectMapper;
    private final AntecedentePerinatalRepository antecedentePerinatalRepository;
    private final DatoGestacionalRepository datoGestacionalRepository;
    private final ComplicacionPerinatalRepository complicacionPerinatalRepository;
    private final AntecedenteInmunizacionRepository antecedenteInmunizacionRepository;
    private final AntecedentePatologicoPersonalRepository antecedentePatologicoPersonalRepository;
    private final EnfermedadDiagnosticadaRepository enfermedadDiagnosticadaRepository;
    private final AlergiaRepository alergiaRepository;
    private final AlergiaPacienteRepository alergiaPacienteRepository;
    private final HospitalizacionPreviaRepository hospitalizacionPreviaRepository;
    private final CirugiaPreviaRepository cirugiaPreviaRepository;
    private final AntecedenteFamiliarRepository antecedenteFamiliarRepository;
    private final DesarrolloPsicomotorRepository desarrolloPsicomotorRepository;
    private final HitoDesarrolloRepository hitoDesarrolloRepository;
    private final AlimentacionRepository alimentacionRepository;
    private final ExamenFisicoRepository examenFisicoRepository;
    private final SignoVitalRepository signoVitalRepository;
    private final ExamenFisicoSegmentarioRepository examenFisicoSegmentarioRepository;
    private final PielFaneraRepository pielFaneraRepository;
    private final CabezaCuelloRepository cabezaCuelloRepository;
    private final CardioPulmonarRepository cardioPulmonarRepository;
    private final AbdomenRepository abdomenRepository;
    private final NeurologicoRepository neurologicoRepository;
    private final DiagnosticoPlanManejoRepository diagnosticoPlanManejoRepository;

    @Transactional
    public void guardarDetalle(Consulta consulta, ConsultaDTO dto, Paciente paciente, HistoriaClinica historia) {
        if (consulta == null || dto == null || paciente == null || historia == null) {
            return;
        }

        AntecedentePerinatal antecedente = guardarAntecedentesPerinatales(dto, historia);
        guardarInmunizaciones(dto, historia, antecedente);
        AntecedentePatologicoPersonal patologico = guardarAntecedentesPersonales(dto, paciente, antecedente);
        guardarAntecedentesFamiliares(dto, antecedente);
        guardarDesarrollo(dto, historia);
        guardarExamenFisico(consulta, dto);
        guardarDiagnosticoPlan(dto, historia);

        consulta.setSyncStatus("SYNCED");
    }

    @Transactional(readOnly = true)
    public void completarDtoDesdeTablas(Consulta consulta, ConsultaDTO dto) {
        if (consulta == null || dto == null || consulta.getHistoriaClinica() == null) {
            return;
        }

        HistoriaClinica historia = consulta.getHistoriaClinica();
        Long idHistoria = historia.getIdHistoriaClinica();
        Integer idPaciente = historia.getPaciente() != null ? historia.getPaciente().getIdPaciente() : null;

        antecedentePerinatalRepository
                .findFirstByHistoriaClinica_IdHistoriaClinicaOrderByIdAntecedentePerinatalDesc(idHistoria)
                .ifPresent(antecedente -> {
                    dto.setAntecedentesPerinatales(toDto(antecedente));
                    List<DatoGestacional> datos = datoGestacionalRepository
                            .findByAntecedentePerinatal_IdAntecedentePerinatal(antecedente.getIdAntecedentePerinatal());
                    dto.setDatosGestacionales(datos.stream().map(this::toDto).collect(Collectors.toList()));
                    List<ComplicacionPerinatalDTO> complicaciones = new ArrayList<>();
                    datos.forEach(dato -> complicaciones.addAll(complicacionPerinatalRepository
                            .findByIdDatoGestacional(dato.getIdDatoGestacional())
                            .stream()
                            .map(this::toDto)
                            .toList()));
                    dto.setComplicacionesPerinatales(complicaciones);
                    dto.setAntecedentesFamiliares(antecedenteFamiliarRepository
                            .findByIdAntecedentePerinatal(antecedente.getIdAntecedentePerinatal())
                            .stream()
                            .map(this::toDto)
                            .collect(Collectors.toList()));
                    antecedentePatologicoPersonalRepository
                            .findFirstByIdAntecedentePerinatalOrderByIdAntecedentePatologicoPersonalDesc(
                                    antecedente.getIdAntecedentePerinatal())
                            .ifPresent(patologico -> completarPatologico(dto, patologico));
                });

        dto.setAntecedentesInmunizacion(antecedenteInmunizacionRepository
                .findByHistoriaClinica_IdHistoriaClinica(idHistoria)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList()));

        desarrolloPsicomotorRepository
                .findFirstByHistoriaClinicaIdHistoriaClinicaOrderByIdDesarrolloPsicomotorDesc(idHistoria)
                .ifPresent(desarrollo -> {
                    dto.setDesarrolloPsicomotor(toDto(desarrollo));
                    dto.setHitosDesarrollo(hitoDesarrolloRepository
                            .findByDesarrolloPsicomotor_IdDesarrolloPsicomotor(desarrollo.getIdDesarrolloPsicomotor())
                            .stream()
                            .map(this::toDto)
                            .collect(Collectors.toList()));
                    dto.setAlimentacion(alimentacionRepository
                            .findByDesarrolloPsicomotor_IdDesarrolloPsicomotor(desarrollo.getIdDesarrolloPsicomotor())
                            .stream()
                            .map(this::toDto)
                            .collect(Collectors.toList()));
                });

        examenFisicoRepository.findByIdConsulta(consulta.getIdConsulta().intValue()).ifPresent(examen -> {
            dto.setExamenFisico(toDto(examen, idPaciente, idHistoria));
            dto.setSignosVitales(signoVitalRepository
                    .findByExamenFisico_IdExamenFisico(examen.getIdExamenFisico())
                    .stream()
                    .map(this::toDto)
                    .collect(Collectors.toList()));

            ExamenFisicoSegmentario segmentario = examen.getExamenFisicoSegmentario();
            if (segmentario == null) {
                segmentario = examenFisicoSegmentarioRepository
                        .findByIdExamenFisico(examen.getIdExamenFisico())
                        .orElse(null);
            }
            if (segmentario != null) {
                completarSegmentario(dto, segmentario);
            }
        });

        diagnosticoPlanManejoRepository
                .findFirstByIdHistoriaClinicaOrderByIdDiagnosticoPlanManejoDesc(idHistoria.intValue())
                .ifPresent(d -> dto.setDiagnosticoPlanManejo(toDto(d)));
    }

    private AntecedentePerinatal guardarAntecedentesPerinatales(ConsultaDTO dto, HistoriaClinica historia) {
        AntecedentePerinatal antecedente = antecedentePerinatalRepository
                .findFirstByHistoriaClinica_IdHistoriaClinicaOrderByIdAntecedentePerinatalDesc(historia.getIdHistoriaClinica())
                .orElseGet(AntecedentePerinatal::new);
        antecedente.setHistoriaClinica(historia);
        antecedente.setUsuario(dto.getUsuario());
        antecedente.setSyncStatus("SYNCED");
        antecedente = antecedentePerinatalRepository.save(antecedente);

        Integer idAntecedente = antecedente.getIdAntecedentePerinatal();
        datoGestacionalRepository.findByAntecedentePerinatal_IdAntecedentePerinatal(idAntecedente)
                .forEach(dato -> {
                    complicacionPerinatalRepository.deleteByIdDatoGestacional(dato.getIdDatoGestacional());
                    datoGestacionalRepository.delete(dato);
                });

        List<DatoGestacionalDTO> datos = datosGestacionales(dto);
        for (DatoGestacionalDTO datoDTO : datos) {
            DatoGestacional dato = new DatoGestacional();
            dato.setAntecedentePerinatal(antecedente);
            dato.setProductoGestacion(datoDTO.getProductoGestacion());
            dato.setEdadGestacional(datoDTO.getEdadGestacional());
            dato.setViaParto(datoDTO.getViaParto());
            dato.setPesoNacer(datoDTO.getPesoNacer());
            dato.setTallaNacer(datoDTO.getTallaNacer());
            dato.setApgarMinuto(datoDTO.getApgarMinuto());
            dato.setApgarCincoMinutos(datoDTO.getApgarCincoMinutos());
            dato.setComplicacionesPerinatales(datoDTO.getComplicacionesPerinatales());
            dato.setUsuario(dto.getUsuario());
            dato.setSyncStatus("SYNCED");
            dato = datoGestacionalRepository.save(dato);
            for (ComplicacionPerinatalDTO compDTO : complicaciones(dto, dato)) {
                ComplicacionPerinatal comp = new ComplicacionPerinatal();
                comp.setIdDatoGestacional(dato.getIdDatoGestacional());
                comp.setDescripcion(limit(compDTO.getDescripcion(), 150));
                comp.setFecha(compDTO.getFecha() != null ? compDTO.getFecha() : dto.getFecha());
                comp.setIdEnfermedad(compDTO.getIdEnfermedad());
                comp.setUsuario(dto.getUsuario());
                comp.setSyncStatus("SYNCED");
                complicacionPerinatalRepository.save(comp);
            }
        }
        return antecedente;
    }

    private void guardarInmunizaciones(ConsultaDTO dto, HistoriaClinica historia, AntecedentePerinatal antecedente) {
        antecedenteInmunizacionRepository.deleteByHistoriaClinica_IdHistoriaClinica(historia.getIdHistoriaClinica());
        for (AntecedenteInmunizacionDTO item : inmunizaciones(dto)) {
            AntecedenteInmunizacion entity = new AntecedenteInmunizacion();
            entity.setHistoriaClinica(historia);
            entity.setIdAntecedentePerinatal(antecedente.getIdAntecedentePerinatal());
            entity.setEstadoVacunacion(item.getEstadoVacunacion());
            entity.setFechaVacunacion(item.getFechaVacunacion());
            entity.setDescripcion(limit(item.getDescripcion(), 150));
            entity.setUsuario(dto.getUsuario());
            entity.setSyncStatus("SYNCED");
            antecedenteInmunizacionRepository.save(entity);
        }
    }

    private AntecedentePatologicoPersonal guardarAntecedentesPersonales(
            ConsultaDTO dto,
            Paciente paciente,
            AntecedentePerinatal antecedente) {
        AntecedentePatologicoPersonal patologico = antecedentePatologicoPersonalRepository
                .findFirstByIdAntecedentePerinatalOrderByIdAntecedentePatologicoPersonalDesc(
                        antecedente.getIdAntecedentePerinatal())
                .orElseGet(AntecedentePatologicoPersonal::new);
        patologico.setIdAntecedentePerinatal(antecedente.getIdAntecedentePerinatal());
        patologico.setObservaciones(limit(observacionesPersonales(dto), 20));
        patologico.setUsuario(dto.getUsuario());
        patologico.setSyncStatus("SYNCED");
        patologico = antecedentePatologicoPersonalRepository.save(patologico);

        Integer idPatologico = patologico.getIdAntecedentePatologicoPersonal();
        enfermedadDiagnosticadaRepository.deleteByAntecedentePatologicoPersonal_IdAntecedentePatologicoPersonal(idPatologico);
        alergiaPacienteRepository.deleteByIdAntecedentePatologicoPersonal(idPatologico);
        hospitalizacionPreviaRepository.deleteByAntecedentePatologicoPersonal_IdAntecedentePatologicoPersonal(idPatologico);
        cirugiaPreviaRepository.deleteByIdAntecedentePatologicoPersonal(idPatologico);

        for (String descripcion : enfermedadesPersonales(dto)) {
            EnfermedadDiagnosticada enfermedad = new EnfermedadDiagnosticada();
            enfermedad.setAntecedentePatologicoPersonal(patologico);
            enfermedad.setDescripcion(limit(descripcion, 255));
            enfermedad.setFecha(new Date());
            enfermedad.setUsuario(dto.getUsuario());
            enfermedad.setSyncStatus("SYNCED");
            enfermedadDiagnosticadaRepository.save(enfermedad);
        }

        for (AlergiaPacienteDTO item : alergias(dto)) {
            String descripcion = Optional.ofNullable(item.getNombreAlergia()).orElse(item.getObservaciones());
            if (descripcion == null || descripcion.isBlank()) {
                descripcion = "Alergia no especificada";
            }
            String estado = Optional.ofNullable(item.getEstadoAlergia()).orElse("ACTIVA");
            final String descripcionAlergia = descripcion;
            final String estadoAlergia = estado;
            Alergia alergia = alergiaRepository.findFirstByTipoAlergiaIgnoreCase(descripcionAlergia)
                    .orElseGet(() -> {
                        Alergia nueva = new Alergia();
                        nueva.setTipoAlergia(limit(descripcionAlergia, 150));
                        nueva.setEstado(limit(estadoAlergia, 50));
                        nueva.setUsuario(dto.getUsuario());
                        nueva.setSyncStatus("SYNCED");
                        return alergiaRepository.save(nueva);
                    });
            alergia.setEstado(limit(estadoAlergia, 50));
            alergiaRepository.save(alergia);

            AlergiaPaciente alergiaPaciente = new AlergiaPaciente();
            alergiaPaciente.setPaciente(paciente);
            alergiaPaciente.setAlergia(alergia);
            alergiaPaciente.setIdAntecedentePatologicoPersonal(idPatologico);
            alergiaPaciente.setObservaciones(limit(descripcionAlergia, 255));
            alergiaPaciente.setReaccion(limit(item.getReaccion(), 255));
            alergiaPaciente.setUsuario(dto.getUsuario());
            alergiaPaciente.setSyncStatus("SYNCED");
            alergiaPacienteRepository.save(alergiaPaciente);
        }

        for (HospitalizacionPreviaDTO item : hospitalizaciones(dto)) {
            HospitalizacionPrevia entity = new HospitalizacionPrevia();
            entity.setPaciente(paciente);
            entity.setAntecedentePatologicoPersonal(patologico);
            entity.setCausa(limit(item.getCausa(), 255));
            entity.setFecha(item.getFecha());
            entity.setUsuario(dto.getUsuario());
            entity.setSyncStatus("SYNCED");
            hospitalizacionPreviaRepository.save(entity);
        }

        for (CirugiaPreviaDTO item : cirugias(dto)) {
            CirugiaPrevia entity = new CirugiaPrevia();
            entity.setPaciente(paciente);
            entity.setIdAntecedentePatologicoPersonal(idPatologico);
            entity.setTipo(limit(item.getTipo(), 200));
            entity.setFecha(item.getFecha());
            entity.setUsuario(dto.getUsuario());
            entity.setSyncStatus("SYNCED");
            cirugiaPreviaRepository.save(entity);
        }

        return patologico;
    }

    private void guardarAntecedentesFamiliares(ConsultaDTO dto, AntecedentePerinatal antecedente) {
        antecedenteFamiliarRepository.deleteByIdAntecedentePerinatal(antecedente.getIdAntecedentePerinatal());
        for (AntecedenteFamiliarDTO item : familiares(dto)) {
            AntecedenteFamiliar entity = new AntecedenteFamiliar();
            entity.setIdAntecedentePerinatal(antecedente.getIdAntecedentePerinatal());
            entity.setEnfermedadHereditaria(limit(item.getEnfermedadHereditaria(), 150));
            entity.setDescripcion(item.getDescripcion());
            entity.setFecha(item.getFecha() != null ? item.getFecha() : LocalDate.now());
            entity.setIdEnfermedad(item.getIdEnfermedad());
            entity.setSyncStatus("SYNCED");
            antecedenteFamiliarRepository.save(entity);
        }
    }

    private void guardarDesarrollo(ConsultaDTO dto, HistoriaClinica historia) {
        DesarrolloPsicomotor desarrollo = desarrolloPsicomotorRepository
                .findFirstByHistoriaClinicaIdHistoriaClinicaOrderByIdDesarrolloPsicomotorDesc(historia.getIdHistoriaClinica())
                .orElseGet(DesarrolloPsicomotor::new);
        DesarrolloPsicomotorDTO desarrolloDTO = desarrollo(dto);
        desarrollo.setHistoriaClinica(historia);
        desarrollo.setObservacion(desarrolloDTO != null ? desarrolloDTO.getObservacion() : null);
        desarrollo.setFechaEvaluacion(desarrolloDTO != null ? desarrolloDTO.getFechaEvaluacion() : LocalDate.now());
        desarrollo.setUsuario(dto.getUsuario());
        desarrollo.setSyncStatus("SYNCED");
        desarrollo = desarrolloPsicomotorRepository.save(desarrollo);

        Integer idDesarrollo = desarrollo.getIdDesarrolloPsicomotor();
        hitoDesarrolloRepository.deleteByDesarrolloPsicomotor_IdDesarrolloPsicomotor(idDesarrollo);
        alimentacionRepository.deleteByDesarrolloPsicomotor_IdDesarrolloPsicomotor(idDesarrollo);

        for (HitoDesarrolloDTO item : hitos(dto)) {
            HitoDesarrollo entity = new HitoDesarrollo();
            entity.setDesarrolloPsicomotor(desarrollo);
            entity.setSostenCefalio(item.getSostenCefalio());
            entity.setSedestacion(item.getSedestacion());
            entity.setDeambulacion(item.getDeambulacion());
            entity.setLenguaje(item.getLenguaje());
            entity.setObservacion(item.getObservacion());
            entity.setUsuario(dto.getUsuario());
            entity.setSyncStatus("SYNCED");
            hitoDesarrolloRepository.save(entity);
        }

        for (AlimentacionDTO item : alimentaciones(dto)) {
            Alimentacion entity = new Alimentacion();
            entity.setDesarrolloPsicomotor(desarrollo);
            entity.setDescripcion(limit(item.getDescripcion(), 50));
            entity.setTipoLactancia(limit(item.getTipoLactancia(), 150));
            entity.setEdadLactancia(limit(item.getEdadLactancia(), 50));
            entity.setTipo(limit(item.getTipo(), 100));
            entity.setEdadAblactacion(limit(item.getEdadAblactacion(), 50));
            entity.setSyncStatus("SYNCED");
            alimentacionRepository.save(entity);
        }
    }

    private void guardarExamenFisico(Consulta consulta, ConsultaDTO dto) {
        examenFisicoRepository.findByIdConsulta(consulta.getIdConsulta().intValue()).ifPresent(examen -> {
            Integer idExamen = examen.getIdExamenFisico();
            ExamenFisicoSegmentario segmentario = examen.getExamenFisicoSegmentario();
            signoVitalRepository.deleteByExamenFisico_IdExamenFisico(idExamen);
            if (segmentario != null) {
                eliminarSegmentario(segmentario.getIdExamenFisicoSegmentario());
            }
            examenFisicoRepository.delete(examen);
            if (segmentario != null) {
                examenFisicoSegmentarioRepository.delete(segmentario);
            }
        });

        ExamenFisicoSegmentario segmentario = construirSegmentario(dto);
        segmentario = examenFisicoSegmentarioRepository.save(segmentario);

        ExamenFisico examen = new ExamenFisico();
        examen.setIdConsulta(consulta.getIdConsulta().intValue());
        examen.setExamenFisicoSegmentario(segmentario);
        examen.setSyncStatus("SYNCED");
        examen = examenFisicoRepository.save(examen);

        segmentario.setIdExamenFisico(examen.getIdExamenFisico());
        examenFisicoSegmentarioRepository.save(segmentario);

        for (SignoVitalDTO item : signos(dto)) {
            SignoVital signo = new SignoVital();
            signo.setExamenFisico(examen);
            signo.setPeso(item.getPeso());
            signo.setTallaLongitud(item.getTallaLongitud());
            signo.setPerimetroCefalico(item.getPerimetroCefalico());
            signo.setTemperatura(item.getTemperatura());
            signo.setFrecuenciaCardiaca(item.getFrecuenciaCardiaca());
            signo.setFrecuenciaRespiratoria(item.getFrecuenciaRespiratoria());
            signo.setPresionArterialSistolica(item.getPresionArterialSistolica());
            signo.setPresionArterialDiastolica(item.getPresionArterialDiastolica());
            signo.setSaturacionOxigeno(item.getSaturacionOxigeno());
            signo.setImc(item.getImc());
            signo.setPuntuacion(item.getPuntuacion());
            signo.setObservacion(item.getObservacion());
            signo.setSyncStatus("SYNCED");
            signoVitalRepository.save(signo);
        }

        guardarDetalleSegmentario(dto, segmentario);
    }

    private void guardarDiagnosticoPlan(ConsultaDTO dto, HistoriaClinica historia) {
        DiagnosticoPlanManejo entity = diagnosticoPlanManejoRepository
                .findFirstByIdHistoriaClinicaOrderByIdDiagnosticoPlanManejoDesc(historia.getIdHistoriaClinica().intValue())
                .orElseGet(DiagnosticoPlanManejo::new);
        DiagnosticoPlanManejoDTO diag = diagnostico(dto);
        entity.setIdHistoriaClinica(historia.getIdHistoriaClinica().intValue());
        entity.setFecha(diag != null && diag.getFecha() != null ? diag.getFecha() : new Date());
        entity.setObservacion(diag != null && diag.getObservacion() != null
                ? diag.getObservacion()
                : dto.getDiagnosticoTexto());
        entity.setSyncStatus("SYNCED");
        entity.setLastModified(new Date());
        diagnosticoPlanManejoRepository.save(entity);
    }

    private void eliminarSegmentario(Integer idSegmentario) {
        pielFaneraRepository.deleteByExamenFisicoSegmentario_IdExamenFisicoSegmentario(idSegmentario);
        abdomenRepository.deleteByExamenFisicoSegmentario_IdExamenFisicoSegmentario(idSegmentario);
        neurologicoRepository.deleteByExamenFisicoSegmentario_IdExamenFisicoSegmentario(idSegmentario);
        cabezaCuelloRepository.deleteByIdExamenFisicoSegmentario(idSegmentario);
        cardioPulmonarRepository.deleteByIdExamenFisicoSegmentario(idSegmentario);
    }

    private void guardarDetalleSegmentario(ConsultaDTO dto, ExamenFisicoSegmentario segmentario) {
        for (PielFaneraDTO item : pielFaneras(dto)) {
            PielFanera entity = new PielFanera();
            entity.setExamenFisicoSegmentario(segmentario);
            entity.setIcterisia(item.getIcterisia());
            entity.setPsianosis(item.getPsianosis());
            entity.setRash(item.getRash());
            entity.setOtros(item.getOtros());
            entity.setUsuario(dto.getUsuario());
            entity.setSyncStatus("SYNCED");
            pielFaneraRepository.save(entity);
        }
        for (CabezaCuelloDTO item : cabezaCuello(dto)) {
            CabezaCuello entity = new CabezaCuello();
            entity.setIdExamenFisicoSegmentario(segmentario.getIdExamenFisicoSegmentario());
            entity.setFontaneloAnterior(item.getFontaneloAnterior());
            entity.setAdenopatia(item.getAdenopatia());
            entity.setOtros(item.getOtros());
            entity.setUsuario(dto.getUsuario());
            entity.setSyncStatus("SYNCED");
            cabezaCuelloRepository.save(entity);
        }
        for (CardioPulmonarDTO item : cardio(dto)) {
            CardioPulmonar entity = new CardioPulmonar();
            entity.setIdExamenFisicoSegmentario(segmentario.getIdExamenFisicoSegmentario());
            entity.setRuidoCardiaco(item.getRuidoCardiaco());
            entity.setMurmulloVesicular(item.getMurmulloVesicular());
            entity.setSoplos(item.getSoplos());
            entity.setCrepitante(item.getCrepitante());
            entity.setOtros(item.getOtros());
            entity.setUsuario(dto.getUsuario());
            entity.setSyncStatus("SYNCED");
            cardioPulmonarRepository.save(entity);
        }
        for (AbdomenDTO item : abdomen(dto)) {
            Abdomen entity = new Abdomen();
            entity.setExamenFisicoSegmentario(segmentario);
            entity.setBlando(item.getBlando());
            entity.setDepresible(item.getDepresible());
            entity.setDolorPalpacion(item.getDolorPalpacion());
            entity.setHepatomegalia(item.getHepatomegalia());
            entity.setEsplenomegalia(item.getEsplenomegalia());
            entity.setOtros(item.getOtros());
            entity.setUsuario(dto.getUsuario());
            entity.setSyncStatus("SYNCED");
            abdomenRepository.save(entity);
        }
        for (NeurologicoDTO item : neurologico(dto)) {
            Neurologico entity = new Neurologico();
            entity.setExamenFisicoSegmentario(segmentario);
            entity.setReflejoOsteotendinoso(item.getReflejoOsteotendinoso());
            entity.setEstadoMental(item.getEstadoMental());
            entity.setTonoMuscular(item.getTonoMuscular());
            entity.setOtros(item.getOtros());
            entity.setUsuario(dto.getUsuario());
            entity.setSyncStatus("SYNCED");
            neurologicoRepository.save(entity);
        }
    }

    private void completarPatologico(ConsultaDTO dto, AntecedentePatologicoPersonal patologico) {
        dto.setAntecedentesPatologicosPersonales(toDto(patologico));
        Integer id = patologico.getIdAntecedentePatologicoPersonal();
        dto.setEnfermedadesDiagnosticadas(enfermedadDiagnosticadaRepository
                .findByAntecedentePatologicoPersonal_IdAntecedentePatologicoPersonal(id)
                .stream().map(this::toDto).collect(Collectors.toList()));
        dto.setAlergiasPaciente(alergiaPacienteRepository
                .findByIdAntecedentePatologicoPersonal(id)
                .stream().map(this::toDto).collect(Collectors.toList()));
        dto.setHospitalizacionesPrevias(hospitalizacionPreviaRepository
                .findByAntecedentePatologicoPersonal_IdAntecedentePatologicoPersonal(id)
                .stream().map(this::toDto).collect(Collectors.toList()));
        dto.setCirugiasPrevias(cirugiaPreviaRepository
                .findByIdAntecedentePatologicoPersonal(id)
                .stream().map(this::toDto).collect(Collectors.toList()));
    }

    private void completarSegmentario(ConsultaDTO dto, ExamenFisicoSegmentario segmentario) {
        Integer id = segmentario.getIdExamenFisicoSegmentario();
        dto.setExamenFisicoSegmentario(toDto(segmentario));
        dto.setPielFaneras(pielFaneraRepository
                .findByExamenFisicoSegmentario_IdExamenFisicoSegmentario(id)
                .stream().map(this::toDto).collect(Collectors.toList()));
        dto.setCabezaCuello(cabezaCuelloRepository
                .findByIdExamenFisicoSegmentario(id)
                .stream().map(this::toDto).collect(Collectors.toList()));
        dto.setCardioPulmonar(cardioPulmonarRepository
                .findByIdExamenFisicoSegmentario(id)
                .stream().map(this::toDto).collect(Collectors.toList()));
        dto.setAbdomen(abdomenRepository
                .findByExamenFisicoSegmentario_IdExamenFisicoSegmentario(id)
                .stream().map(this::toDto).collect(Collectors.toList()));
        dto.setNeurologico(neurologicoRepository
                .findByExamenFisicoSegmentario_IdExamenFisicoSegmentario(id)
                .stream().map(this::toDto).collect(Collectors.toList()));
    }

    private List<DatoGestacionalDTO> datosGestacionales(ConsultaDTO dto) {
        if (hasItems(dto.getDatosGestacionales())) return dto.getDatosGestacionales();
        Map<String, Object> p = mapAt(dto, "antecedentes", "perinatales");
        if (p == null) return List.of();
        DatoGestacionalDTO item = new DatoGestacionalDTO();
        item.setProductoGestacion(text(p.get("productoGestacion")));
        item.setEdadGestacional(text(p.get("edadGestacional")));
        item.setViaParto(text(p.get("viaParto")));
        item.setPesoNacer(number(p.get("pesoNacimiento")));
        item.setTallaNacer(number(p.get("tallaNacimiento")));
        item.setApgarMinuto(apgarTotal(p.get("apgar")));
        item.setApgarCincoMinutos(apgarTotal(p.get("apgar")));
        item.setComplicacionesPerinatales(text(p.get("descripcionComplicaciones")));
        return hasDato(item) ? List.of(item) : List.of();
    }

    private List<ComplicacionPerinatalDTO> complicaciones(ConsultaDTO dto, DatoGestacional dato) {
        if (hasItems(dto.getComplicacionesPerinatales())) return dto.getComplicacionesPerinatales();
        List<String> valores = selectedMapLabels(mapAt(dto, "antecedentes", "perinatales", "checksComplicaciones"));
        String descripcion = stringAt(dto, "antecedentes", "perinatales", "descripcionComplicaciones");
        if (descripcion != null && !descripcion.isBlank()) valores.add(descripcion);
        return valores.stream().map(v -> {
            ComplicacionPerinatalDTO item = new ComplicacionPerinatalDTO();
            item.setDescripcion(v);
            item.setIdDatoGestacional(dato.getIdDatoGestacional());
            return item;
        }).collect(Collectors.toList());
    }

    private List<AntecedenteInmunizacionDTO> inmunizaciones(ConsultaDTO dto) {
        if (hasItems(dto.getAntecedentesInmunizacion())) return dto.getAntecedentesInmunizacion();
        Map<String, Object> vacunacion = mapAt(dto, "antecedentes", "vacunacion");
        if (vacunacion == null) return List.of();
        AntecedenteInmunizacionDTO item = new AntecedenteInmunizacionDTO();
        item.setEstadoVacunacion(text(vacunacion.get("estado")));
        item.setDescripcion(toJsonOrText(vacunacion.get("vacunas")));
        return item.getEstadoVacunacion() != null || item.getDescripcion() != null ? List.of(item) : List.of();
    }

    private String observacionesPersonales(ConsultaDTO dto) {
        if (dto.getAntecedentesPatologicosPersonales() != null) {
            return dto.getAntecedentesPatologicosPersonales().getObservaciones();
        }
        List<String> partes = new ArrayList<>();
        addIfText(partes, stringAt(dto, "antecedentes", "personales", "descripcionCronicas"));
        addIfText(partes, stringAt(dto, "antecedentes", "personales", "descripcionOtrasCronicas"));
        return partes.isEmpty() ? null : String.join(" | ", partes);
    }

    private List<String> enfermedadesPersonales(ConsultaDTO dto) {
        if (hasItems(dto.getEnfermedadesDiagnosticadas())) {
            return dto.getEnfermedadesDiagnosticadas().stream()
                    .map(EnfermedadDiagnosticadaDTO::getDescripcion)
                    .filter(Objects::nonNull)
                    .toList();
        }
        List<String> valores = selectedMapLabels(mapAt(dto, "antecedentes", "personales", "enfermedadesCronicas"));
        addIfText(valores, stringAt(dto, "antecedentes", "personales", "descripcionCronicas"));
        addIfText(valores, stringAt(dto, "antecedentes", "personales", "descripcionOtrasCronicas"));
        return valores;
    }

    private List<AlergiaPacienteDTO> alergias(ConsultaDTO dto) {
        if (hasItems(dto.getAlergiasPaciente())) {
            return dto.getAlergiasPaciente();
        }
        Map<String, Object> a = mapAt(dto, "antecedentes", "personales", "alergias");
        if (a == null || !Boolean.TRUE.equals(a.get("tiene"))) return List.of();
        Object items = a.get("items");
        if (items instanceof List<?> list && !list.isEmpty()) {
            return list.stream()
                    .filter(Map.class::isInstance)
                    .map(Map.class::cast)
                    .map(item -> {
                        AlergiaPacienteDTO dtoItem = new AlergiaPacienteDTO();
                        dtoItem.setNombreAlergia(text(item.get("descripcion")));
                        dtoItem.setObservaciones(text(item.get("descripcion")));
                        dtoItem.setEstadoAlergia(Optional.ofNullable(text(item.get("estado"))).orElse("ACTIVA"));
                        return dtoItem;
                    })
                    .toList();
        }
        String descripcion = text(a.get("descripcion"));
        AlergiaPacienteDTO item = new AlergiaPacienteDTO();
        item.setNombreAlergia(descripcion == null || descripcion.isBlank() ? "Alergia no especificada" : descripcion);
        item.setObservaciones(item.getNombreAlergia());
        item.setEstadoAlergia(Optional.ofNullable(text(a.get("estado"))).orElse("ACTIVA"));
        return List.of(item);
    }

    private List<HospitalizacionPreviaDTO> hospitalizaciones(ConsultaDTO dto) {
        if (hasItems(dto.getHospitalizacionesPrevias())) return dto.getHospitalizacionesPrevias();
        Map<String, Object> h = mapAt(dto, "antecedentes", "personales", "hospitalizaciones");
        if (h == null || !Boolean.TRUE.equals(h.get("tiene"))) return List.of();
        HospitalizacionPreviaDTO item = new HospitalizacionPreviaDTO();
        item.setCausa(text(h.get("descripcion")));
        item.setFecha(localDate(h.get("fecha")));
        return List.of(item);
    }

    private List<CirugiaPreviaDTO> cirugias(ConsultaDTO dto) {
        if (hasItems(dto.getCirugiasPrevias())) return dto.getCirugiasPrevias();
        Map<String, Object> c = mapAt(dto, "antecedentes", "personales", "cirugias");
        if (c == null || !Boolean.TRUE.equals(c.get("tiene"))) return List.of();
        CirugiaPreviaDTO item = new CirugiaPreviaDTO();
        item.setTipo(text(c.get("descripcion")));
        item.setFecha(localDate(c.get("fecha")));
        return List.of(item);
    }

    private List<AntecedenteFamiliarDTO> familiares(ConsultaDTO dto) {
        if (hasItems(dto.getAntecedentesFamiliares())) return dto.getAntecedentesFamiliares();
        return selectedMapLabels(mapAt(dto, "antecedentes", "personales", "familiares")).stream()
                .map(label -> {
                    AntecedenteFamiliarDTO item = new AntecedenteFamiliarDTO();
                    item.setEnfermedadHereditaria(label);
                    item.setDescripcion(label);
                    item.setFecha(LocalDate.now());
                    return item;
                })
                .collect(Collectors.toList());
    }

    private DesarrolloPsicomotorDTO desarrollo(ConsultaDTO dto) {
        if (dto.getDesarrolloPsicomotor() != null) return dto.getDesarrolloPsicomotor();
        if (mapAt(dto, "antecedentes", "desarrollo") == null) return null;
        DesarrolloPsicomotorDTO item = new DesarrolloPsicomotorDTO();
        item.setFechaEvaluacion(dto.getFecha());
        item.setObservacion("Evaluacion registrada desde consulta");
        return item;
    }

    private List<HitoDesarrolloDTO> hitos(ConsultaDTO dto) {
        if (hasItems(dto.getHitosDesarrollo())) return dto.getHitosDesarrollo();
        Map<String, Object> h = mapAt(dto, "antecedentes", "desarrollo", "hitos");
        if (h == null) return List.of();
        HitoDesarrolloDTO item = new HitoDesarrolloDTO();
        item.setSostenCefalio(text(first(h, "sostenCefalico", "sostenCefalio")));
        item.setSedestacion(text(h.get("sedestacion")));
        item.setDeambulacion(text(h.get("deambulacion")));
        item.setLenguaje(text(h.get("lenguaje")));
        item.setObservacion(Boolean.TRUE.equals(h.get("desconoce")) ? "Desconoce" : null);
        return List.of(item);
    }

    private List<AlimentacionDTO> alimentaciones(ConsultaDTO dto) {
        if (hasItems(dto.getAlimentacion())) return dto.getAlimentacion();
        Map<String, Object> a = mapAt(dto, "antecedentes", "desarrollo", "alimentacion");
        if (a == null) return List.of();
        AlimentacionDTO item = new AlimentacionDTO();
        item.setDescripcion("Alimentacion registrada");
        Map<String, Object> lactancia = nestedMap(a, "lactancia");
        Map<String, Object> formula = nestedMap(a, "formula");
        Map<String, Object> ablactacion = nestedMap(a, "ablactacion");
        item.setTipoLactancia(Boolean.TRUE.equals(value(lactancia, "checked")) ? "Lactancia" : null);
        item.setEdadLactancia(text(value(lactancia, "duracion")));
        item.setTipo(text(value(formula, "tipo")));
        item.setEdadAblactacion(text(value(ablactacion, "edadInicio")));
        return List.of(item);
    }

    private List<SignoVitalDTO> signos(ConsultaDTO dto) {
        if (hasItems(dto.getSignosVitales())) return dto.getSignosVitales();
        Map<String, Object> v = mapAt(dto, "signosVitales");
        if (v == null) v = mapAt(dto, "examenFisico", "vitales");
        SignoVitalDTO item = new SignoVitalDTO();
        item.setPeso(v != null ? number(v.get("peso")) : dto.getPeso());
        item.setTallaLongitud(v != null ? number(v.get("talla")) : dto.getTalla());
        item.setTemperatura(v != null ? number(v.get("temperatura")) : dto.getTemperatura());
        item.setFrecuenciaCardiaca(v != null ? integer(v.get("fc")) : dto.getFc());
        item.setFrecuenciaRespiratoria(v != null ? integer(v.get("fr")) : dto.getFr());
        item.setSaturacionOxigeno(v != null ? integer(v.get("spo2")) : dto.getSpo2());
        item.setPerimetroCefalico(v != null ? number(v.get("perimetroCefalico")) : dto.getPerimetroCefalico());
        item.setPresionArterialSistolica(v != null ? integer(v.get("paSistolica")) : null);
        item.setPresionArterialDiastolica(v != null ? integer(v.get("paDiastolica")) : null);
        item.setPuntuacion(v != null ? text(v.get("glasgow")) : null);
        item.setObservacion(v != null ? text(v.get("aspectoGeneral")) : null);
        return List.of(item);
    }

    private ExamenFisicoSegmentario construirSegmentario(ConsultaDTO dto) {
        ExamenFisicoSegmentarioDTO typed = dto.getExamenFisicoSegmentario();
        Map<String, Object> s = mapAt(dto, "examenFisico", "segmentario");
        ExamenFisicoSegmentario entity = new ExamenFisicoSegmentario();
        entity.setAspectoGeneral(typed != null ? typed.getAspectoGeneral() : labelsOrText(s, "aspecto"));
        entity.setPielFaneras(typed != null ? typed.getPielFaneras() : labelsOrText(s, "piel"));
        entity.setCabezaCuello(typed != null ? typed.getCabezaCuello() : labelsOrText(s, "cabeza"));
        entity.setCardioPulmonar(typed != null ? typed.getCardioPulmonar() : labelsOrText(s, "cardio"));
        entity.setAbdomen(typed != null ? typed.getAbdomen() : labelsOrText(s, "abdomen"));
        entity.setNeurologico(typed != null ? typed.getNeurologico() : labelsOrText(s, "neuro"));
        entity.setEvolucionClinica(typed != null ? typed.getEvolucionClinica() : stringAt(dto, "examenFisico", "evolucion"));
        entity.setSyncStatus("SYNCED");
        return entity;
    }

    private List<PielFaneraDTO> pielFaneras(ConsultaDTO dto) {
        if (hasItems(dto.getPielFaneras())) return dto.getPielFaneras();
        Map<String, Object> p = mapAt(dto, "examenFisico", "segmentario", "piel");
        if (p == null) return List.of();
        PielFaneraDTO item = new PielFaneraDTO();
        item.setIcterisia(byteBool(p.get("Ictericia")));
        item.setPsianosis(byteBool(p.get("Cianosis")));
        item.setRash(byteBool(p.get("Rash")));
        item.setOtros(labelsOrText(mapAt(dto, "examenFisico", "segmentario"), "piel"));
        return List.of(item);
    }

    private List<CabezaCuelloDTO> cabezaCuello(ConsultaDTO dto) {
        if (hasItems(dto.getCabezaCuello())) return dto.getCabezaCuello();
        Map<String, Object> s = mapAt(dto, "examenFisico", "segmentario");
        Map<String, Object> c = nestedMap(s, "cabeza");
        if (c == null) return List.of();
        CabezaCuelloDTO item = new CabezaCuelloDTO();
        item.setFontaneloAnterior(Boolean.TRUE.equals(c.get("Fontanela Anterior")) ? "Alterada/registrada" : null);
        item.setAdenopatia(Boolean.TRUE.equals(first(c, "Adenopatias", "Adenopatias", "Adenopatías")) ? "Si" : null);
        item.setOtros(text(first(s, "cabezaOtros", "otros")));
        return List.of(item);
    }

    private List<CardioPulmonarDTO> cardio(ConsultaDTO dto) {
        if (hasItems(dto.getCardioPulmonar())) return dto.getCardioPulmonar();
        Map<String, Object> c = mapAt(dto, "examenFisico", "segmentario", "cardio");
        if (c == null) return List.of();
        CardioPulmonarDTO item = new CardioPulmonarDTO();
        item.setRuidoCardiaco(Boolean.TRUE.equals(c.get("Ruidos cardiacos")) ? "Presente" : null);
        item.setMurmulloVesicular(Boolean.TRUE.equals(c.get("Murmullo vesicular")) ? "Presente" : null);
        item.setSoplos(Boolean.TRUE.equals(c.get("Soplos")) ? "Si" : null);
        item.setCrepitante(Boolean.TRUE.equals(c.get("Crepitantes")) ? "Si" : null);
        item.setOtros(labelsOrText(mapAt(dto, "examenFisico", "segmentario"), "cardio"));
        return List.of(item);
    }

    private List<AbdomenDTO> abdomen(ConsultaDTO dto) {
        if (hasItems(dto.getAbdomen())) return dto.getAbdomen();
        Map<String, Object> a = mapAt(dto, "examenFisico", "segmentario", "abdomen");
        if (a == null) return List.of();
        AbdomenDTO item = new AbdomenDTO();
        item.setBlando(bool(a.get("Blando")));
        item.setDepresible(bool(a.get("Depresible")));
        item.setHepatomegalia(bool(a.get("Hepatomegalia")));
        item.setEsplenomegalia(bool(a.get("Esplenomegalia")));
        item.setDolorPalpacion(false);
        item.setOtros(labelsOrText(mapAt(dto, "examenFisico", "segmentario"), "abdomen"));
        return List.of(item);
    }

    private List<NeurologicoDTO> neurologico(ConsultaDTO dto) {
        if (hasItems(dto.getNeurologico())) return dto.getNeurologico();
        Map<String, Object> n = mapAt(dto, "examenFisico", "segmentario", "neuro");
        if (n == null) return List.of();
        NeurologicoDTO item = new NeurologicoDTO();
        item.setReflejoOsteotendinoso(Boolean.TRUE.equals(n.get("Reflejos")) ? "Presente" : null);
        item.setTonoMuscular(Boolean.TRUE.equals(n.get("Tono")) ? "Presente" : null);
        item.setOtros(labelsOrText(mapAt(dto, "examenFisico", "segmentario"), "neuro"));
        return List.of(item);
    }

    private DiagnosticoPlanManejoDTO diagnostico(ConsultaDTO dto) {
        if (dto.getDiagnosticoPlanManejo() != null) return dto.getDiagnosticoPlanManejo();
        Map<String, Object> d = mapAt(dto, "diagnostico");
        if (d == null) return null;
        DiagnosticoPlanManejoDTO item = new DiagnosticoPlanManejoDTO();
        item.setFecha(new Date());
        item.setObservacion(toJsonOrText(d));
        return item;
    }

    private Map<String, Object> mapAt(ConsultaDTO dto, String... path) {
        Map<String, Object> current = dto.getJsonCompleto();
        if (current == null) return null;
        for (String key : path) {
            current = nestedMap(current, key);
            if (current == null) return null;
        }
        return current;
    }

    private String stringAt(ConsultaDTO dto, String... path) {
        if (path.length == 0 || dto.getJsonCompleto() == null) return null;
        Map<String, Object> parent = dto.getJsonCompleto();
        for (int i = 0; i < path.length - 1; i++) {
            parent = nestedMap(parent, path[i]);
            if (parent == null) return null;
        }
        return text(parent.get(path[path.length - 1]));
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> nestedMap(Map<String, Object> map, String key) {
        if (map == null) return null;
        Object value = map.get(key);
        if (value instanceof Map<?, ?>) return (Map<String, Object>) value;
        return null;
    }

    private Object first(Map<String, Object> map, String... keys) {
        if (map == null) return null;
        for (String key : keys) {
            if (map.containsKey(key)) return map.get(key);
        }
        return null;
    }

    private Object value(Map<String, Object> map, String key) {
        return map == null ? null : map.get(key);
    }

    private List<String> selectedMapLabels(Map<String, Object> map) {
        if (map == null) return new ArrayList<>();
        return map.entrySet().stream()
                .filter(e -> Boolean.TRUE.equals(e.getValue()))
                .map(Map.Entry::getKey)
                .filter(k -> !"ninguna".equalsIgnoreCase(k) && !"Ninguna".equals(k))
                .collect(Collectors.toCollection(ArrayList::new));
    }

    private String labelsOrText(Map<String, Object> map, String key) {
        if (map == null) return null;
        Object value = map.get(key);
        if (value instanceof Map<?, ?> nested) {
            return selectedMapLabels((Map<String, Object>) nested).stream().collect(Collectors.joining(", "));
        }
        return text(value);
    }

    private void addIfText(List<String> list, String value) {
        if (value != null && !value.isBlank()) list.add(value);
    }

    private String text(Object value) {
        if (value == null) return null;
        String text = String.valueOf(value).trim();
        return text.isBlank() ? null : text;
    }

    private String limit(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) return value;
        return value.substring(0, maxLength);
    }

    private String toJsonOrText(Object value) {
        if (value == null) return null;
        if (value instanceof String s) return s;
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            return String.valueOf(value);
        }
    }

    private Double number(Object value) {
        if (value instanceof Number n) return n.doubleValue();
        try {
            String text = text(value);
            return text == null ? null : Double.parseDouble(text);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Integer integer(Object value) {
        Double number = number(value);
        return number == null ? null : number.intValue();
    }

    private Boolean bool(Object value) {
        return Boolean.TRUE.equals(value);
    }

    private Byte byteBool(Object value) {
        return Boolean.TRUE.equals(value) ? (byte) 1 : (byte) 0;
    }

    private LocalDate localDate(Object value) {
        if (value == null) return null;
        try {
            String text = text(value);
            return text == null ? null : LocalDate.parse(text);
        } catch (Exception e) {
            return null;
        }
    }

    private Integer apgarTotal(Object value) {
        if (!(value instanceof Map<?, ?> raw)) return integer(value);
        Map<String, Object> map = (Map<String, Object>) raw;
        return map.values().stream().map(this::integer).filter(Objects::nonNull).mapToInt(Integer::intValue).sum();
    }

    private boolean hasDato(DatoGestacionalDTO item) {
        return item.getProductoGestacion() != null
                || item.getEdadGestacional() != null
                || item.getViaParto() != null
                || item.getPesoNacer() != null
                || item.getTallaNacer() != null
                || item.getApgarMinuto() != null
                || item.getComplicacionesPerinatales() != null;
    }

    private boolean hasItems(List<?> items) {
        return items != null && !items.isEmpty();
    }

    private AntecedentePerinatalDTO toDto(AntecedentePerinatal entity) {
        AntecedentePerinatalDTO dto = new AntecedentePerinatalDTO();
        dto.setIdAntecedentePerinatal(entity.getIdAntecedentePerinatal());
        dto.setIdHistoriaClinica(entity.getHistoriaClinica() != null ? entity.getHistoriaClinica().getIdHistoriaClinica().intValue() : null);
        dto.setUsuario(entity.getUsuario());
        dto.setUuidOffline(entity.getUuidOffline());
        dto.setSyncStatus(entity.getSyncStatus());
        dto.setLastModified(entity.getLastModified());
        dto.setOrigin(entity.getOrigin());
        return dto;
    }

    private DatoGestacionalDTO toDto(DatoGestacional entity) {
        DatoGestacionalDTO dto = new DatoGestacionalDTO();
        dto.setIdDatoGestacional(entity.getIdDatoGestacional());
        dto.setProductoGestacion(entity.getProductoGestacion());
        dto.setEdadGestacional(entity.getEdadGestacional());
        dto.setViaParto(entity.getViaParto());
        dto.setPesoNacer(entity.getPesoNacer());
        dto.setTallaNacer(entity.getTallaNacer());
        dto.setApgarMinuto(entity.getApgarMinuto());
        dto.setApgarCincoMinutos(entity.getApgarCincoMinutos());
        dto.setComplicacionesPerinatales(entity.getComplicacionesPerinatales());
        dto.setIdAntecedentePerinatal(entity.getAntecedentePerinatal() != null ? entity.getAntecedentePerinatal().getIdAntecedentePerinatal() : null);
        return dto;
    }

    private ComplicacionPerinatalDTO toDto(ComplicacionPerinatal entity) {
        ComplicacionPerinatalDTO dto = new ComplicacionPerinatalDTO();
        dto.setIdComplicacionPerinatal(entity.getIdComplicacionPerinatal());
        dto.setDescripcion(entity.getDescripcion());
        dto.setFecha(entity.getFecha());
        dto.setIdDatoGestacional(entity.getIdDatoGestacional());
        dto.setIdEnfermedad(entity.getIdEnfermedad());
        return dto;
    }

    private AntecedenteInmunizacionDTO toDto(AntecedenteInmunizacion entity) {
        AntecedenteInmunizacionDTO dto = new AntecedenteInmunizacionDTO();
        dto.setIdAntecedenteInmunizacion(entity.getIdAntecedenteInmunizacion());
        dto.setEstadoVacunacion(entity.getEstadoVacunacion());
        dto.setFechaVacunacion(entity.getFechaVacunacion());
        dto.setDescripcion(entity.getDescripcion());
        dto.setIdAntecedentePerinatal(entity.getIdAntecedentePerinatal());
        return dto;
    }

    private AntecedentePatologicoPersonalDTO toDto(AntecedentePatologicoPersonal entity) {
        AntecedentePatologicoPersonalDTO dto = new AntecedentePatologicoPersonalDTO();
        dto.setIdAntecedentePatologicoPersonal(entity.getIdAntecedentePatologicoPersonal());
        dto.setIdAntecedentePerinatal(entity.getIdAntecedentePerinatal());
        dto.setObservaciones(entity.getObservaciones());
        return dto;
    }

    private EnfermedadDiagnosticadaDTO toDto(EnfermedadDiagnosticada entity) {
        EnfermedadDiagnosticadaDTO dto = new EnfermedadDiagnosticadaDTO();
        dto.setIdEnfermedadDiagnosticada(entity.getIdEnfermedadDiagnosticada());
        dto.setDescripcion(entity.getDescripcion());
        dto.setFecha(entity.getFecha());
        dto.setIdAntecedentePatologicoPersonal(entity.getAntecedentePatologicoPersonal() != null
                ? entity.getAntecedentePatologicoPersonal().getIdAntecedentePatologicoPersonal()
                : null);
        return dto;
    }

    private AlergiaPacienteDTO toDto(AlergiaPaciente entity) {
        AlergiaPacienteDTO dto = new AlergiaPacienteDTO();
        dto.setIdAlergiaPaciente(entity.getIdAlergiaPaciente());
        dto.setIdPaciente(entity.getPaciente() != null ? entity.getPaciente().getIdPaciente() : null);
        dto.setIdAlergia(entity.getAlergia() != null ? entity.getAlergia().getIdAlergia().intValue() : null);
        dto.setNombreAlergia(entity.getAlergia() != null ? entity.getAlergia().getTipoAlergia() : null);
        dto.setEstadoAlergia(entity.getAlergia() != null ? entity.getAlergia().getEstado() : null);
        dto.setObservaciones(entity.getObservaciones());
        dto.setReaccion(entity.getReaccion());
        dto.setIdAntecedentePatologicoPersonal(entity.getIdAntecedentePatologicoPersonal());
        dto.setFechaCreacion(entity.getFechaCreacion());
        return dto;
    }

    private HospitalizacionPreviaDTO toDto(HospitalizacionPrevia entity) {
        HospitalizacionPreviaDTO dto = new HospitalizacionPreviaDTO();
        dto.setIdHospitalizacionPrevia(entity.getIdHospitalizacionPrevia());
        dto.setIdPaciente(entity.getPaciente() != null ? entity.getPaciente().getIdPaciente() : null);
        dto.setCausa(entity.getCausa());
        dto.setFecha(entity.getFecha());
        dto.setIdAntecedentePatologicoPersonal(entity.getAntecedentePatologicoPersonal() != null
                ? entity.getAntecedentePatologicoPersonal().getIdAntecedentePatologicoPersonal()
                : null);
        return dto;
    }

    private CirugiaPreviaDTO toDto(CirugiaPrevia entity) {
        CirugiaPreviaDTO dto = new CirugiaPreviaDTO();
        dto.setIdCirugiaPrevia(entity.getIdCirugiaPrevia());
        dto.setIdPaciente(entity.getPaciente() != null ? entity.getPaciente().getIdPaciente() : null);
        dto.setTipo(entity.getTipo());
        dto.setFecha(entity.getFecha());
        dto.setIdAntecedentePatologicoPersonal(entity.getIdAntecedentePatologicoPersonal());
        return dto;
    }

    private AntecedenteFamiliarDTO toDto(AntecedenteFamiliar entity) {
        AntecedenteFamiliarDTO dto = new AntecedenteFamiliarDTO();
        dto.setIdAntecedenteFamiliar(entity.getIdAntecedenteFamiliar());
        dto.setEnfermedadHereditaria(entity.getEnfermedadHereditaria());
        dto.setDescripcion(entity.getDescripcion());
        dto.setFecha(entity.getFecha());
        dto.setIdEnfermedad(entity.getIdEnfermedad());
        return dto;
    }

    private DesarrolloPsicomotorDTO toDto(DesarrolloPsicomotor entity) {
        DesarrolloPsicomotorDTO dto = new DesarrolloPsicomotorDTO();
        dto.setIdDesarrolloPsicomotor(entity.getIdDesarrolloPsicomotor());
        dto.setIdHistoriaClinica(entity.getHistoriaClinica() != null ? entity.getHistoriaClinica().getIdHistoriaClinica().intValue() : null);
        dto.setFechaEvaluacion(entity.getFechaEvaluacion());
        dto.setObservacion(entity.getObservacion());
        return dto;
    }

    private HitoDesarrolloDTO toDto(HitoDesarrollo entity) {
        HitoDesarrolloDTO dto = new HitoDesarrolloDTO();
        dto.setIdHitoDesarrollo(entity.getIdHitoDesarrollo());
        dto.setSostenCefalio(entity.getSostenCefalio());
        dto.setSedestacion(entity.getSedestacion());
        dto.setDeambulacion(entity.getDeambulacion());
        dto.setLenguaje(entity.getLenguaje());
        dto.setObservacion(entity.getObservacion());
        dto.setIdDesarrolloPsicomotor(entity.getDesarrolloPsicomotor() != null ? entity.getDesarrolloPsicomotor().getIdDesarrolloPsicomotor() : null);
        return dto;
    }

    private AlimentacionDTO toDto(Alimentacion entity) {
        AlimentacionDTO dto = new AlimentacionDTO();
        dto.setIdAlimentacion(entity.getIdAlimentacion());
        dto.setDescripcion(entity.getDescripcion());
        dto.setTipoLactancia(entity.getTipoLactancia());
        dto.setEdadLactancia(entity.getEdadLactancia());
        dto.setTipo(entity.getTipo());
        dto.setEdadAblactacion(entity.getEdadAblactacion());
        dto.setIdDesarrolloPsicomotor(entity.getDesarrolloPsicomotor() != null ? entity.getDesarrolloPsicomotor().getIdDesarrolloPsicomotor() : null);
        return dto;
    }

    private ExamenFisicoDTO toDto(ExamenFisico entity, Integer idPaciente, Long idHistoria) {
        ExamenFisicoDTO dto = new ExamenFisicoDTO();
        dto.setIdExamenFisico(entity.getIdExamenFisico());
        dto.setIdConsulta(entity.getIdConsulta());
        dto.setIdPaciente(idPaciente);
        dto.setIdHistoriaClinica(idHistoria != null ? idHistoria.intValue() : null);
        dto.setIdExamenFisicoSegmentario(entity.getExamenFisicoSegmentario() != null
                ? entity.getExamenFisicoSegmentario().getIdExamenFisicoSegmentario()
                : null);
        return dto;
    }

    private SignoVitalDTO toDto(SignoVital entity) {
        SignoVitalDTO dto = new SignoVitalDTO();
        dto.setIdSignoVital(entity.getIdSignoVital());
        dto.setPeso(entity.getPeso());
        dto.setTallaLongitud(entity.getTallaLongitud());
        dto.setPerimetroCefalico(entity.getPerimetroCefalico());
        dto.setTemperatura(entity.getTemperatura());
        dto.setFrecuenciaCardiaca(entity.getFrecuenciaCardiaca());
        dto.setFrecuenciaRespiratoria(entity.getFrecuenciaRespiratoria());
        dto.setPresionArterialSistolica(entity.getPresionArterialSistolica());
        dto.setPresionArterialDiastolica(entity.getPresionArterialDiastolica());
        dto.setSaturacionOxigeno(entity.getSaturacionOxigeno());
        dto.setImc(entity.getImc());
        dto.setPuntuacion(entity.getPuntuacion());
        dto.setObservacion(entity.getObservacion());
        return dto;
    }

    private ExamenFisicoSegmentarioDTO toDto(ExamenFisicoSegmentario entity) {
        ExamenFisicoSegmentarioDTO dto = new ExamenFisicoSegmentarioDTO();
        dto.setIdExamenFisicoSegmentario(entity.getIdExamenFisicoSegmentario());
        dto.setAspectoGeneral(entity.getAspectoGeneral());
        dto.setPielFaneras(entity.getPielFaneras());
        dto.setCabezaCuello(entity.getCabezaCuello());
        dto.setCardioPulmonar(entity.getCardioPulmonar());
        dto.setAbdomen(entity.getAbdomen());
        dto.setNeurologico(entity.getNeurologico());
        dto.setEvolucionClinica(entity.getEvolucionClinica());
        dto.setIdExamenFisico(entity.getIdExamenFisico());
        return dto;
    }

    private PielFaneraDTO toDto(PielFanera entity) {
        PielFaneraDTO dto = new PielFaneraDTO();
        dto.setIdPielFanera(entity.getIdPielFanera());
        dto.setIcterisia(entity.getIcterisia());
        dto.setPsianosis(entity.getPsianosis());
        dto.setRash(entity.getRash());
        dto.setOtros(entity.getOtros());
        return dto;
    }

    private CabezaCuelloDTO toDto(CabezaCuello entity) {
        CabezaCuelloDTO dto = new CabezaCuelloDTO();
        dto.setIdCabezaCuello(entity.getIdCabezaCuello());
        dto.setIdExamenFisicoSegmentario(entity.getIdExamenFisicoSegmentario());
        dto.setFontaneloAnterior(entity.getFontaneloAnterior());
        dto.setAdenopatia(entity.getAdenopatia());
        dto.setOtros(entity.getOtros());
        return dto;
    }

    private CardioPulmonarDTO toDto(CardioPulmonar entity) {
        CardioPulmonarDTO dto = new CardioPulmonarDTO();
        dto.setIdCardioPulmonar(entity.getIdCardioPulmonar());
        dto.setIdExamenFisicoSegmentario(entity.getIdExamenFisicoSegmentario());
        dto.setRuidoCardiaco(entity.getRuidoCardiaco());
        dto.setMurmulloVesicular(entity.getMurmulloVesicular());
        dto.setSoplos(entity.getSoplos());
        dto.setCrepitante(entity.getCrepitante());
        dto.setOtros(entity.getOtros());
        return dto;
    }

    private AbdomenDTO toDto(Abdomen entity) {
        AbdomenDTO dto = new AbdomenDTO();
        dto.setIdAbdomen(entity.getIdAbdomen());
        dto.setIdExamenFisicoSegmentario(entity.getExamenFisicoSegmentario() != null
                ? entity.getExamenFisicoSegmentario().getIdExamenFisicoSegmentario()
                : null);
        dto.setBlando(entity.getBlando());
        dto.setDepresible(entity.getDepresible());
        dto.setDolorPalpacion(entity.getDolorPalpacion());
        dto.setHepatomegalia(entity.getHepatomegalia());
        dto.setEsplenomegalia(entity.getEsplenomegalia());
        dto.setOtros(entity.getOtros());
        return dto;
    }

    private NeurologicoDTO toDto(Neurologico entity) {
        NeurologicoDTO dto = new NeurologicoDTO();
        dto.setIdNeurologico(entity.getIdNeurologico());
        dto.setReflejoOsteotendinoso(entity.getReflejoOsteotendinoso());
        dto.setEstadoMental(entity.getEstadoMental());
        dto.setTonoMuscular(entity.getTonoMuscular());
        dto.setOtros(entity.getOtros());
        return dto;
    }

    private DiagnosticoPlanManejoDTO toDto(DiagnosticoPlanManejo entity) {
        DiagnosticoPlanManejoDTO dto = new DiagnosticoPlanManejoDTO();
        dto.setIdDiagnosticoPlanManejo(entity.getIdDiagnosticoPlanManejo());
        dto.setIdHistoriaClinica(entity.getIdHistoriaClinica());
        dto.setObservacion(entity.getObservacion());
        dto.setFecha(entity.getFecha());
        dto.setLastModified(entity.getLastModified());
        return dto;
    }
}
