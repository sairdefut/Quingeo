package ec.gob.salud.hce.backend.repository;

import ec.gob.salud.hce.backend.entity.HitoDesarrollo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HitoDesarrolloRepository extends JpaRepository<HitoDesarrollo, Integer> {
    List<HitoDesarrollo> findByDesarrolloPsicomotor_IdDesarrolloPsicomotor(Integer idDesarrolloPsicomotor);
    void deleteByDesarrolloPsicomotor_IdDesarrolloPsicomotor(Integer idDesarrolloPsicomotor);
}
