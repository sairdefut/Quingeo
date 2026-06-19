package ec.gob.salud.hce.backend.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import ec.gob.salud.hce.backend.entity.Tutor;

import java.util.List;

public interface TutorRepository extends JpaRepository<Tutor, Integer> { 
    List<Tutor> findByPrimerNombreAndPrimerApellidoAndSegundoNombreAndSegundoApellido(String primerNombre, String primerApellido, String segundoNombre, String segundoApellido);
}
