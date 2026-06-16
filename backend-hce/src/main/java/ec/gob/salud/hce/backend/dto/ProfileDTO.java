package ec.gob.salud.hce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileDTO {
    private Integer idPersonal;
    private String username;
    private String nombres;
    private String apellidos;
    private String cargo;
}
