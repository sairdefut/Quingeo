package ec.gob.salud.hce.backend.repository;

import ec.gob.salud.hce.backend.entity.AntecedenteFamiliar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AntecedenteFamiliarRepository extends JpaRepository<AntecedenteFamiliar, Integer> {
    Optional<AntecedenteFamiliar> findByUuidOffline(String uuidOffline);
    List<AntecedenteFamiliar> findByIdAntecedentePerinatal(Integer idAntecedentePerinatal);
    void deleteByIdAntecedentePerinatal(Integer idAntecedentePerinatal);
}
