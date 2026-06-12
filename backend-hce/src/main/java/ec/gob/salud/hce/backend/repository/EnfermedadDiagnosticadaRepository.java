package ec.gob.salud.hce.backend.repository;

import ec.gob.salud.hce.backend.entity.EnfermedadDiagnosticada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnfermedadDiagnosticadaRepository extends JpaRepository<EnfermedadDiagnosticada, Integer> {
    List<EnfermedadDiagnosticada> findByAntecedentePatologicoPersonal_IdAntecedentePatologicoPersonal(Integer idAntecedentePatologicoPersonal);
    void deleteByAntecedentePatologicoPersonal_IdAntecedentePatologicoPersonal(Integer idAntecedentePatologicoPersonal);
}
