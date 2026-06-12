package ec.gob.salud.hce.backend.repository;

import ec.gob.salud.hce.backend.entity.CabezaCuello;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CabezaCuelloRepository extends JpaRepository<CabezaCuello, Integer> {
    List<CabezaCuello> findByIdExamenFisicoSegmentario(Integer idExamenFisicoSegmentario);
    void deleteByIdExamenFisicoSegmentario(Integer idExamenFisicoSegmentario);
}
