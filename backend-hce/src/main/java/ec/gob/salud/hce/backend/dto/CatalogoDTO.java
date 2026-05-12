package ec.gob.salud.hce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CatalogoDTO {
    private String tipo;
    private String codigo;
    private String nombre;
    private Long parentId;
}
