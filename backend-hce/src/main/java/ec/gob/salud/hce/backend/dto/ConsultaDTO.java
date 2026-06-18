package ec.gob.salud.hce.backend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Data
public class ConsultaDTO {
    private Long idConsulta;
    private Integer idPaciente;
    private Integer idHistoriaClinica;
    private String uuidOffline;
    private String syncStatus;
    private LocalDateTime lastModified;
    
    private LocalDate fecha;
    private LocalTime hora;
    private String motivo;
    private String enfermedadActual;
    
    // Vitales
    private Double peso;
    private Double talla;
    private Double temperatura;
    private Integer fc;
    private Integer fr;
    private Integer spo2;
    private Double perimetroCefalico;
    
    private String diagnosticoTexto;
    private String tipoDiagnostico;
    
    // JSON Completo (Backup visual)
    private Map<String, Object> jsonCompleto; 
    
    private String usuario;

    // --- Datos normalizados de la consulta completa ---
    private AntecedentePerinatalDTO antecedentesPerinatales;
    private List<DatoGestacionalDTO> datosGestacionales;
    private List<ComplicacionPerinatalDTO> complicacionesPerinatales;
    private List<AntecedenteInmunizacionDTO> antecedentesInmunizacion;
    private AntecedentePatologicoPersonalDTO antecedentesPatologicosPersonales;
    private List<EnfermedadDiagnosticadaDTO> enfermedadesDiagnosticadas;
    private List<AlergiaPacienteDTO> alergiasPaciente;
    private List<HospitalizacionPreviaDTO> hospitalizacionesPrevias;
    private List<CirugiaPreviaDTO> cirugiasPrevias;
    private List<AntecedenteFamiliarDTO> antecedentesFamiliares;
    private DesarrolloPsicomotorDTO desarrolloPsicomotor;
    private List<HitoDesarrolloDTO> hitosDesarrollo;
    private List<AlimentacionDTO> alimentacion;
    private ExamenFisicoDTO examenFisico;
    private List<SignoVitalDTO> signosVitales;
    private ExamenFisicoSegmentarioDTO examenFisicoSegmentario;
    private List<PielFaneraDTO> pielFaneras;
    private List<CabezaCuelloDTO> cabezaCuello;
    private List<CardioPulmonarDTO> cardioPulmonar;
    private List<AbdomenDTO> abdomen;
    private List<NeurologicoDTO> neurologico;
    private DiagnosticoPlanManejoDTO diagnosticoPlanManejo;
    private List<PlanTerapeuticoDTO> planesTerapeuticos;
    private List<EstudioLaboratorioDTO> estudiosLaboratorios;

    // --- Listas historicas usadas por el frontend actual ---
    private List<PlanTerapeuticoDTO> listaPlan;
    private List<EstudioLaboratorioDTO> listaEstudios;

    // D-5: Referencia médica
    private Boolean referenciaHospital;
    private String motivoReferencia;
}
