package ec.gob.salud.hce.backend.repository;

import ec.gob.salud.hce.backend.entity.AntecedentePatologicoPersonal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AntecedentePatologicoPersonalRepository extends JpaRepository<AntecedentePatologicoPersonal, Integer> {
    Optional<AntecedentePatologicoPersonal> findFirstByIdAntecedentePerinatalOrderByIdAntecedentePatologicoPersonalDesc(Integer idAntecedentePerinatal);
}
