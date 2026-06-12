package ec.gob.salud.hce.backend.repository;

import ec.gob.salud.hce.backend.entity.CardioPulmonar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardioPulmonarRepository extends JpaRepository<CardioPulmonar, Integer> {
    List<CardioPulmonar> findByIdExamenFisicoSegmentario(Integer idExamenFisicoSegmentario);
    void deleteByIdExamenFisicoSegmentario(Integer idExamenFisicoSegmentario);
}
