package ec.gob.salud.hce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ActividadClinicaDTO {
    private Long id;
    private String usuario;
    private String accion;
    private String paciente;
    private Integer idPaciente;
    private String cedulaPaciente;
    private LocalDateTime fechaHora;
    private String detalle;
}
