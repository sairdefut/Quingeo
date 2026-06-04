package ec.gob.salud.hce.backend.repository;

import ec.gob.salud.hce.backend.entity.ActividadClinica;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActividadClinicaRepository extends JpaRepository<ActividadClinica, Long> {
    List<ActividadClinica> findTop100ByOrderByFechaHoraDesc();
}
