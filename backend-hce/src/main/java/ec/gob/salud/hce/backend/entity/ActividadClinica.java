package ec.gob.salud.hce.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "actividad_clinica")
@Getter
@Setter
public class ActividadClinica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_actividad")
    private Long id;

    @Column(name = "usuario", length = 100)
    private String usuario;

    @Column(name = "accion", nullable = false, length = 80)
    private String accion;

    @Column(name = "paciente", length = 180)
    private String paciente;

    @Column(name = "id_paciente")
    private Integer idPaciente;

    @Column(name = "cedula_paciente", length = 20)
    private String cedulaPaciente;

    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;

    @Column(name = "detalle", length = 500)
    private String detalle;

    @PrePersist
    protected void onCreate() {
        if (fechaHora == null) {
            fechaHora = LocalDateTime.now();
        }
    }
}
