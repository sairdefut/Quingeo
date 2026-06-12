package ec.gob.salud.hce.backend.repository;

import ec.gob.salud.hce.backend.entity.Alimentacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlimentacionRepository extends JpaRepository<Alimentacion, Integer> {
    List<Alimentacion> findByDesarrolloPsicomotor_IdDesarrolloPsicomotor(Integer idDesarrolloPsicomotor);
    void deleteByDesarrolloPsicomotor_IdDesarrolloPsicomotor(Integer idDesarrolloPsicomotor);
}
