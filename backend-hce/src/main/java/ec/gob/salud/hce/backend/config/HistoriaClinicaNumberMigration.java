package ec.gob.salud.hce.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(20)
@RequiredArgsConstructor
public class HistoriaClinicaNumberMigration implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        jdbcTemplate.update("""
                UPDATE historias_clinicas hc
                JOIN pacientes p ON p.id_paciente = hc.id_paciente
                SET hc.numero_historia_clinica = p.numero_historia_clinica
                WHERE (hc.numero_historia_clinica IS NULL OR hc.numero_historia_clinica = '')
                  AND p.numero_historia_clinica IS NOT NULL
                  AND p.numero_historia_clinica <> ''
                """);
    }
}
