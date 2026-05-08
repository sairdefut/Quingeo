package ec.gob.salud.hce.backend.dto;

import lombok.Data;

@Data
public class UsuarioDTO {
    private String username;
    private String password;
    private String nombres;
    private String apellidos;
    private String cargo;
}
