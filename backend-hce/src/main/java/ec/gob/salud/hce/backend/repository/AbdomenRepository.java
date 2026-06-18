package ec.gob.salud.hce.backend.repository;

import ec.gob.salud.hce.backend.entity.Abdomen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AbdomenRepository extends JpaRepository<Abdomen, Integer> {
    List<Abdomen> findByExamenFisicoSegmentario_IdExamenFisicoSegmentario(Integer idExamenFisicoSegmentario);
    void deleteByExamenFisicoSegmentario_IdExamenFisicoSegmentario(Integer idExamenFisicoSegmentario);
}
