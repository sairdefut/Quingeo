package ec.gob.salud.hce.backend.repository;

import ec.gob.salud.hce.backend.entity.AntecedenteInmunizacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AntecedenteInmunizacionRepository extends JpaRepository<AntecedenteInmunizacion, Integer> {
    List<AntecedenteInmunizacion> findByHistoriaClinica_Paciente_IdPaciente(Integer idPaciente);
    List<AntecedenteInmunizacion> findByHistoriaClinica_IdHistoriaClinica(Long idHistoriaClinica);
    void deleteByHistoriaClinica_IdHistoriaClinica(Long idHistoriaClinica);
}
