package ec.gob.salud.hce.backend.repository;

import ec.gob.salud.hce.backend.entity.Provincia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProvinciaRepository extends JpaRepository<Provincia, Long> {
    Optional<Provincia> findByCodigo(String codigo);
    // Al extender JpaRepository, ya tienes métodos como findAll() y findById()
}
