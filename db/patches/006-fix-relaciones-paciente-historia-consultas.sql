-- Corrige las relaciones principales:
-- pacientes -> historias_clinicas -> consultas
-- Elimina la relacion redundante pacientes -> consultas

SET @add_idx_historias_paciente := (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE historias_clinicas ADD INDEX idx_historias_clinicas_paciente (id_paciente)',
        'SELECT 1'
    )
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'historias_clinicas'
      AND INDEX_NAME = 'idx_historias_clinicas_paciente'
);
PREPARE stmt FROM @add_idx_historias_paciente;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @duplicados_historias_paciente := (
    SELECT COUNT(*)
    FROM (
        SELECT id_paciente
        FROM historias_clinicas
        GROUP BY id_paciente
        HAVING COUNT(*) > 1
    ) duplicados
);

SET @add_unique_historias_paciente := (
    SELECT IF(
        @duplicados_historias_paciente = 0
        AND NOT EXISTS (
            SELECT 1
            FROM information_schema.STATISTICS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'historias_clinicas'
              AND INDEX_NAME = 'uk_historias_clinicas_paciente'
        ),
        'ALTER TABLE historias_clinicas ADD UNIQUE KEY uk_historias_clinicas_paciente (id_paciente)',
        'SELECT 1'
    )
);
PREPARE stmt FROM @add_unique_historias_paciente;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_idx_consultas_historia := (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE consultas ADD INDEX idx_consultas_historia_clinica (id_historia_clinica)',
        'SELECT 1'
    )
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'consultas'
      AND INDEX_NAME = 'idx_consultas_historia_clinica'
);
PREPARE stmt FROM @add_idx_consultas_historia;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sync_consultas_paciente := (
    SELECT IF(
        COUNT(*) > 0,
        'UPDATE consultas c JOIN historias_clinicas hc ON hc.id_historia_clinica = c.id_historia_clinica SET c.id_paciente = hc.id_paciente WHERE c.id_paciente IS NULL',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'consultas'
      AND COLUMN_NAME = 'id_paciente'
);
PREPARE stmt FROM @sync_consultas_paciente;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @drop_duplicate_fk := (
    SELECT IF(
        COUNT(*) > 0,
        'ALTER TABLE consultas DROP FOREIGN KEY fk_consultas_paciente_new',
        'SELECT 1'
    )
    FROM information_schema.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'consultas'
      AND CONSTRAINT_NAME = 'fk_consultas_paciente_new'
);
PREPARE stmt FROM @drop_duplicate_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @drop_consultas_paciente_fk := (
    SELECT IF(
        COUNT(*) > 0,
        'ALTER TABLE consultas DROP FOREIGN KEY fk_consultas_paciente',
        'SELECT 1'
    )
    FROM information_schema.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'consultas'
      AND CONSTRAINT_NAME = 'fk_consultas_paciente'
);
PREPARE stmt FROM @drop_consultas_paciente_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @drop_consultas_paciente_index := (
    SELECT IF(
        COUNT(*) > 0,
        'ALTER TABLE consultas DROP INDEX fk_consultas_paciente_new',
        'SELECT 1'
    )
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'consultas'
      AND INDEX_NAME = 'fk_consultas_paciente_new'
);
PREPARE stmt FROM @drop_consultas_paciente_index;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @drop_consultas_paciente_column := (
    SELECT IF(
        COUNT(*) > 0,
        'ALTER TABLE consultas DROP COLUMN id_paciente',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'consultas'
      AND COLUMN_NAME = 'id_paciente'
);
PREPARE stmt FROM @drop_consultas_paciente_column;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_fk_historias_paciente := (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE historias_clinicas ADD CONSTRAINT fk_historias_clinicas_paciente FOREIGN KEY (id_paciente) REFERENCES pacientes (id_paciente)',
        'SELECT 1'
    )
    FROM information_schema.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'historias_clinicas'
      AND CONSTRAINT_NAME = 'fk_historias_clinicas_paciente'
);
PREPARE stmt FROM @add_fk_historias_paciente;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_fk_consultas_historia := (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE consultas ADD CONSTRAINT fk_consultas_historia_clinica FOREIGN KEY (id_historia_clinica) REFERENCES historias_clinicas (id_historia_clinica)',
        'SELECT 1'
    )
    FROM information_schema.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'consultas'
      AND CONSTRAINT_NAME = 'fk_consultas_historia_clinica'
);
PREPARE stmt FROM @add_fk_consultas_historia;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
