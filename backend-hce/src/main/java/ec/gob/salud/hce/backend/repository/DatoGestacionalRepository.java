package ec.gob.salud.hce.backend.repository;

import ec.gob.salud.hce.backend.entity.DatoGestacional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DatoGestacionalRepository extends JpaRepository<DatoGestacional, Integer> {
    List<DatoGestacional> findByAntecedentePerinatal_IdAntecedentePerinatal(Integer idAntecedentePerinatal);
    void deleteByAntecedentePerinatal_IdAntecedentePerinatal(Integer idAntecedentePerinatal);
}
