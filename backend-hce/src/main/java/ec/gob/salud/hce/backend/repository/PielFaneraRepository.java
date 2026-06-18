package ec.gob.salud.hce.backend.repository;

import ec.gob.salud.hce.backend.entity.PielFanera;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PielFaneraRepository extends JpaRepository<PielFanera, Integer> {
    List<PielFanera> findByExamenFisicoSegmentario_IdExamenFisicoSegmentario(Integer idExamenFisicoSegmentario);
    void deleteByExamenFisicoSegmentario_IdExamenFisicoSegmentario(Integer idExamenFisicoSegmentario);
}
