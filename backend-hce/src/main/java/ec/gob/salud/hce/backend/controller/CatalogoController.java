package ec.gob.salud.hce.backend.controller;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ec.gob.salud.hce.backend.entity.GrupoEtnico;
import ec.gob.salud.hce.backend.repository.GrupoEtnicoRepository;

@RestController
@RequestMapping("/api/catalogos")
public class CatalogoController {

    @Autowired
    private GrupoEtnicoRepository grupoEtnicoRepository;

    @GetMapping("/etnias")
    public List<GrupoEtnico> listarEtnias() {
        return grupoEtnicoRepository.findAll();
    }

    // D-2: Lógica Glasgow → Aspecto General
    @GetMapping("/glasgow/{valor}")
    public ResponseEntity<Map<String, String>> getAspectoGlasgow(@PathVariable Integer valor) {
        String aspecto = calcularAspectoGlasgow(valor);
        return ResponseEntity.ok(Map.of(
            "puntaje", valor.toString(),
            "aspecto", aspecto
        ));
    }

    @GetMapping("/glasgow/opciones")
    public ResponseEntity<List<String>> getOpcionesAspecto() {
        return ResponseEntity.ok(List.of("Sobrealerta", "Normal", "Activo"));
    }

    // Conversión de puntaje Glasgow a Aspecto General
    private String calcularAspectoGlasgow(Integer valor) {
        if (valor == null || valor < 3 || valor > 15) {
            return "Desconocido";
        }
        // Distribución clínica:
        // - Sobrealerta: 13-15 (mejor estado)
        // - Normal: 9-12 (estado intermedio)
        // - Activo: 3-8 (menor estado)
        if (valor >= 13) {
            return "Sobrealerta";
        } else if (valor >= 9) {
            return "Normal";
        } else {
            return "Activo";
        }
    }
}