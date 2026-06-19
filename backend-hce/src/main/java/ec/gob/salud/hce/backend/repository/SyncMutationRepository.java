package ec.gob.salud.hce.backend.repository;

import ec.gob.salud.hce.backend.entity.SyncMutation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SyncMutationRepository extends JpaRepository<SyncMutation, Long> {
    Optional<SyncMutation> findByDeviceIdAndClientMutationId(String deviceId, String clientMutationId);
}
