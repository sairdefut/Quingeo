package ec.gob.salud.hce.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "historias_clinicas")
@Data
public class HistoriaClinica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historia_clinica")
    private Long idHistoriaClinica;

    @Column(name = "numero_historia_clinica", length = 14, unique = true)
    private String numeroHistoriaClinica;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_paciente", nullable = false)
    @JsonIgnore
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private Paciente paciente;

    @OneToMany(mappedBy = "historiaClinica", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private List<Consulta> consultas = new ArrayList<>();

    @Column(name = "fecha_creacion")
    private LocalDate fechaCreacion;

    @Column(name = "usuario", length = 50)
    private String usuario;

    @Column(name = "id_personal")
    private Integer idPersonal;

    @Column(name = "uuid_offline", length = 36)
    private String uuidOffline;

    @Column(name = "sync_status", length = 20)
    private String syncStatus;

    @Column(name = "last_modified")
    private LocalDateTime lastModified;

    @Column(name = "origin", length = 20)
    private String origin;

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDate.now();
        this.lastModified = LocalDateTime.now();
        if (this.uuidOffline == null) {
            this.uuidOffline = java.util.UUID.randomUUID().toString();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.lastModified = LocalDateTime.now();
    }
}
