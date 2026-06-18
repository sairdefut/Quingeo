-- Refuerza idempotencia de sincronizacion offline.
-- MySQL permite multiples NULL en UNIQUE, por eso se limpian duplicados no nulos.

UPDATE pacientes p
JOIN (
    SELECT uuid_offline, MIN(id_paciente) AS keep_id
    FROM pacientes
    WHERE uuid_offline IS NOT NULL AND uuid_offline <> ''
    GROUP BY uuid_offline
    HAVING COUNT(*) > 1
) d ON d.uuid_offline = p.uuid_offline
SET p.uuid_offline = NULL
WHERE p.id_paciente <> d.keep_id;

UPDATE consultas c
JOIN (
    SELECT uuid_offline, MIN(id_consulta) AS keep_id
    FROM consultas
    WHERE uuid_offline IS NOT NULL AND uuid_offline <> ''
    GROUP BY uuid_offline
    HAVING COUNT(*) > 1
) d ON d.uuid_offline = c.uuid_offline
SET c.uuid_offline = NULL
WHERE c.id_consulta <> d.keep_id;

SET @add_unique_pacientes_uuid := (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE pacientes ADD UNIQUE KEY uk_pacientes_uuid_offline (uuid_offline)',
        'SELECT 1'
    )
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'pacientes'
      AND INDEX_NAME = 'uk_pacientes_uuid_offline'
);
PREPARE stmt FROM @add_unique_pacientes_uuid;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_unique_consultas_uuid := (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE consultas ADD UNIQUE KEY uk_consultas_uuid_offline (uuid_offline)',
        'SELECT 1'
    )
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'consultas'
      AND INDEX_NAME = 'uk_consultas_uuid_offline'
);
PREPARE stmt FROM @add_unique_consultas_uuid;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
