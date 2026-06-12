package ec.gob.salud.hce.backend.repository;

import ec.gob.salud.hce.backend.entity.Consulta;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ConsultaRepository extends JpaRepository<Consulta, Long> {
    Optional<Consulta> findByUuidOffline(String uuidOffline);

    List<Consulta> findByHistoriaClinica_Paciente_IdPaciente(Integer idPaciente);

    List<Consulta> findByHistoriaClinica_Paciente_IdPacienteOrderByFechaConsultaDesc(Integer idPaciente);

    // Cargar consultas con planes y estudios para sync down/listados completos
    @EntityGraph(attributePaths = { "planes", "estudios" })
    @Query("SELECT c FROM Consulta c WHERE c.historiaClinica.paciente.idPaciente = :idPaciente ORDER BY c.fechaConsulta DESC")
    List<Consulta> findByIdPacienteWithDetails(@Param("idPaciente") Integer idPaciente);

    @EntityGraph(attributePaths = { "historiaClinica", "historiaClinica.paciente", "planes", "estudios" })
    @Query("""
            SELECT DISTINCT c
            FROM Consulta c
            JOIN c.historiaClinica h
            JOIN h.paciente p
            LEFT JOIN c.planes pl
            LEFT JOIN c.estudios es
            """)
    List<Consulta> findAllWithDetails();
}
