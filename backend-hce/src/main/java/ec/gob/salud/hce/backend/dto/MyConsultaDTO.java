package ec.gob.salud.hce.backend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class MyConsultaDTO {
    private Long idConsulta;
    private Integer idPaciente;
    private String numeroHistoriaClinica;
    private String cedulaPaciente;
    private String pacienteNombre;
    private LocalDate fecha;
    private LocalTime hora;
    private String motivo;
    private String diagnostico;
    private String tipoDiagnostico;
    private String syncStatus;
    private LocalDateTime lastModified;
}
