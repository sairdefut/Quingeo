CREATE TABLE IF NOT EXISTS sync_mutations (
    id_sync_mutation BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(80) NOT NULL,
    user_id VARCHAR(80) NULL,
    client_mutation_id VARCHAR(80) NOT NULL,
    entity VARCHAR(40) NULL,
    uuid_offline VARCHAR(80) NULL,
    status VARCHAR(20) NOT NULL,
    server_id INT NULL,
    numero_historia_clinica VARCHAR(30) NULL,
    server_last_modified DATETIME NULL,
    reason TEXT NULL,
    response_json LONGTEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_sync_mutation_device_client (device_id, client_mutation_id),
    KEY idx_sync_mutations_entity_uuid (entity, uuid_offline),
    KEY idx_sync_mutations_created_at (created_at)
);
