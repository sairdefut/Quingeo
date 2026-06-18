package ec.gob.salud.hce.backend.repository;

import ec.gob.salud.hce.backend.entity.Neurologico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NeurologicoRepository extends JpaRepository<Neurologico, Integer> {
    List<Neurologico> findByExamenFisicoSegmentario_IdExamenFisicoSegmentario(Integer idExamenFisicoSegmentario);
    void deleteByExamenFisicoSegmentario_IdExamenFisicoSegmentario(Integer idExamenFisicoSegmentario);
}
