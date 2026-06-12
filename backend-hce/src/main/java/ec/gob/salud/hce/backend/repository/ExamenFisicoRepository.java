package ec.gob.salud.hce.backend.repository;

import ec.gob.salud.hce.backend.entity.ExamenFisico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExamenFisicoRepository extends JpaRepository<ExamenFisico, Integer> {
    Optional<ExamenFisico> findByIdConsulta(Integer idConsulta);
}
