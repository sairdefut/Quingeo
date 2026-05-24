package ec.gob.salud.hce.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "examenes_fisicos")
@Getter
@Setter
public class ExamenFisico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_examen_fisico")
    private Integer idExamenFisico;

    //TODO PONER LA RELACION CON LA CONSULTA
    @Column(name = "id_consulta", nullable = false)
    private Integer idConsulta;

    //TODO No esta en el diagrama
    // --- RELACIONES EXISTENTES ---
    //@OneToOne
    //@JoinColumn(name = "id_signo_vital", referencedColumnName = "id_signo_vital")
    //private SignoVital signoVital;
    
    @OneToOne
    @JoinColumn(name = "id_examen_fisico_segmentario", referencedColumnName = "id_examen_fisico_segmentario")
    private ExamenFisicoSegmentario examenFisicoSegmentario;

    // NOTA: Se eliminó el campo Integer idExamenFisicoSegmentario porque ya está 
    // definido arriba en la relación @OneToOne.

    // --- AUDITORÍA ---
    @Column(name = "uuid_offline")
    private String uuidOffline;
    
    @Column(name = "sync_status")
    private String syncStatus;
    
    @Column(name = "last_modified")
    private LocalDateTime lastModified;
    
    @Column(name = "origin")
    private String origin;

    @PrePersist
    protected void onCreate() {
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
}