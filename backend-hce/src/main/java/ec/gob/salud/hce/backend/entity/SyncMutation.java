package ec.gob.salud.hce.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "sync_mutations",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_sync_mutation_device_client",
                columnNames = { "device_id", "client_mutation_id" }
        )
)
@Getter
@Setter
public class SyncMutation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sync_mutation")
    private Long idSyncMutation;

    @Column(name = "device_id", nullable = false, length = 80)
    private String deviceId;

    @Column(name = "user_id", length = 80)
    private String userId;

    @Column(name = "client_mutation_id", nullable = false, length = 80)
    private String clientMutationId;

    @Column(name = "entity", length = 40)
    private String entity;

    @Column(name = "uuid_offline", length = 80)
    private String uuidOffline;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "server_id")
    private Integer serverId;

    @Column(name = "numero_historia_clinica", length = 30)
    private String numeroHistoriaClinica;

    @Column(name = "server_last_modified")
    private LocalDateTime serverLastModified;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "response_json", columnDefinition = "LONGTEXT")
    private String responseJson;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
