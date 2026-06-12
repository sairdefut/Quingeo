package ec.gob.salud.hce.backend.repository;

import ec.gob.salud.hce.backend.entity.Alergia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AlergiaRepository extends JpaRepository<Alergia, Long> {
    Optional<Alergia> findFirstByTipoAlergiaIgnoreCase(String tipoAlergia);
}
