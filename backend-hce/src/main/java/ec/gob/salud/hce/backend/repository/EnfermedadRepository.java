package ec.gob.salud.hce.backend.repository;

import ec.gob.salud.hce.backend.entity.Enfermedad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnfermedadRepository extends JpaRepository<Enfermedad, Integer> {

    // D-4: Buscar por código o nombre (LIKE insensible a mayúsculas)
    @Query("SELECT e FROM Enfermedad e WHERE LOWER(e.codigo) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(e.nombre) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Enfermedad> buscarPorCodigoONombre(@Param("q") String q);
}