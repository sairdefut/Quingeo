-- Limpia referencias huerfanas provocadas por truncados parciales y amplía
-- columnas clínicas que reciben texto de formularios offline.

DELIMITER $$

DROP PROCEDURE IF EXISTS modify_column_if_exists $$
CREATE PROCEDURE modify_column_if_exists(
    IN p_table_name VARCHAR(128),
    IN p_column_name VARCHAR(128),
    IN p_definition TEXT
)
BEGIN
    IF EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = p_table_name
          AND COLUMN_NAME = p_column_name
    ) THEN
        SET @sql = CONCAT(
            'ALTER TABLE `', p_table_name,
            '` MODIFY COLUMN `', p_column_name, '` ', p_definition
        );
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END $$

DELIMITER ;

DELETE pt
FROM planes_terapeuticos pt
LEFT JOIN consultas c ON c.id_consulta = pt.id_consulta
WHERE c.id_consulta IS NULL;

DELETE el
FROM estudios_laboratorios el
LEFT JOIN consultas c ON c.id_consulta = el.id_consulta
WHERE c.id_consulta IS NULL;

DELETE ef
FROM examenes_fisicos ef
LEFT JOIN consultas c ON c.id_consulta = ef.id_consulta
WHERE c.id_consulta IS NULL;

DELETE c
FROM consultas c
LEFT JOIN historias_clinicas h ON h.id_historia_clinica = c.id_historia_clinica
WHERE h.id_historia_clinica IS NULL;

CALL modify_column_if_exists('alimentacion', 'descripcion', 'TEXT NULL');
CALL modify_column_if_exists('antecedentes_patologicos_personales', 'observaciones', 'TEXT NULL');
CALL modify_column_if_exists('antecedentes_inmunizaciones', 'descripcion', 'TEXT NULL');
CALL modify_column_if_exists('complicaciones_perinatales', 'descripcion', 'TEXT NULL');
CALL modify_column_if_exists('hospitalizaciones_previas', 'causa', 'TEXT NULL');

DROP PROCEDURE IF EXISTS modify_column_if_exists;
