package ec.gob.salud.hce.backend.repository;

import ec.gob.salud.hce.backend.entity.ExamenFisicoSegmentario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ExamenFisicoSegmentarioRepository extends JpaRepository<ExamenFisicoSegmentario, Integer> {
    Optional<ExamenFisicoSegmentario> findByIdExamenFisico(Integer idExamenFisico);
}
