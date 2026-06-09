package ec.gob.salud.hce.backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "consultas")
@Data
public class Consulta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_consulta")
    private Long idConsulta;

    @Column(name = "motivo_consulta")
    private String motivoConsulta;

    @Column(name = "enfermedad_actual", columnDefinition = "TEXT")
    private String enfermedadActual;

    @Column(name = "fecha_atencion")
    private LocalDate fechaConsulta;

    @Column(name = "fecha_proxima_consulta")
    private LocalDate fechaProximaConsulta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_historia_clinica", nullable = false)
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private HistoriaClinica historiaClinica;

    @Column(name = "hora_consulta")
    private LocalTime horaConsulta;

    private Double peso;

    private Double talla;

    private Double temperatura;

    @Column(name = "frecuencia_cardiaca")
    private Integer frecuenciaCardiaca;

    @Column(name = "frecuencia_respiratoria")
    private Integer frecuenciaRespiratoria;

    private Integer saturacion;

    @Column(name = "diagnostico_principal")
    private String diagnosticoPrincipal;

    @Column(name = "tipo_diagnostico")
    private String tipoDiagnostico;

    @Column(name = "datos_completos_json", columnDefinition = "LONGTEXT")
    private String datosCompletosJson;

    @Column(name = "usuario_medico")
    private String usuarioMedico;

    @Column(name = "usuario")
    private String usuario;

    @Column(name = "id_personal")
    private Integer idPersonal;

    @Column(name = "uuid_offline")
    private String uuidOffline;

    @Column(name = "sync_status")
    private String syncStatus;

    @Column(name = "last_modified")
    private LocalDateTime lastModified;

    @Column(name = "origin")
    private String origin;

    @OneToMany(mappedBy = "consulta", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private Set<PlanTerapeutico> planes = new HashSet<>();

    @OneToMany(mappedBy = "consulta", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private Set<EstudioLaboratorio> estudios = new HashSet<>();

    //AGREGADO POR NUEVO REQUERIMIENTOS
    // D-5: Referencia médica
    @Column(name = "referencia_hospital")
    private Boolean referenciaHospital;

    @Column(name = "motivo_referencia", length = 500)
    private String motivoReferencia;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    public Integer getIdHistoriaClinica() {
        if (historiaClinica == null || historiaClinica.getIdHistoriaClinica() == null) {
            return null;
        }
        return historiaClinica.getIdHistoriaClinica().intValue();
    }

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
        this.lastModified = LocalDateTime.now();
        if (this.uuidOffline == null) {
            this.uuidOffline = java.util.UUID.randomUUID().toString();
        }
        if (this.syncStatus == null) {
            this.syncStatus = "PENDING";
        }
        if (this.origin == null) {
            this.origin = "WEB";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.lastModified = LocalDateTime.now();
    }
}
