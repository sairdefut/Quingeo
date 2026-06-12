package ec.gob.salud.hce.backend.repository;

import ec.gob.salud.hce.backend.entity.SignoVital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SignoVitalRepository extends JpaRepository<SignoVital, Integer> {
    List<SignoVital> findByExamenFisico_IdExamenFisico(Integer idExamenFisico);
    void deleteByExamenFisico_IdExamenFisico(Integer idExamenFisico);
}
