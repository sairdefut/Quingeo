package ec.gob.salud.hce.backend.repository;

import ec.gob.salud.hce.backend.entity.AlergiaPaciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlergiaPacienteRepository extends JpaRepository<AlergiaPaciente, Integer> {
    List<AlergiaPaciente> findByPaciente_IdPaciente(Integer idPaciente);
    List<AlergiaPaciente> findByIdAntecedentePatologicoPersonal(Integer idAntecedentePatologicoPersonal);
    void deleteByIdAntecedentePatologicoPersonal(Integer idAntecedentePatologicoPersonal);
}
