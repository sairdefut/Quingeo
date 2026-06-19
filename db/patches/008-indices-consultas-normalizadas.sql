-- Indices de soporte para el guardado normalizado de consultas.
-- El patch es idempotente y solo crea indices cuando la tabla/columna existe.

DELIMITER $$

DROP PROCEDURE IF EXISTS add_index_if_missing $$
CREATE PROCEDURE add_index_if_missing(
    IN p_table_name VARCHAR(128),
    IN p_column_name VARCHAR(128),
    IN p_index_name VARCHAR(128)
)
BEGIN
    IF EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = p_table_name
          AND COLUMN_NAME = p_column_name
    )
    AND NOT EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = p_table_name
          AND INDEX_NAME = p_index_name
    ) THEN
        SET @sql = CONCAT(
            'ALTER TABLE `', p_table_name,
            '` ADD INDEX `', p_index_name,
            '` (`', p_column_name, '`)'
        );
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END $$

DELIMITER ;

CALL add_index_if_missing('antecedentes_perinatales', 'id_historia_clinica', 'idx_ant_per_historia');
CALL add_index_if_missing('datos_gestacionales', 'id_antecedente_perinatal', 'idx_dato_gest_ant_per');
CALL add_index_if_missing('complicaciones_perinatales', 'id_dato_gestacional', 'idx_comp_per_dato_gest');
CALL add_index_if_missing('antecedentes_inmunizaciones', 'id_historia_clinica', 'idx_ant_inm_historia');
CALL add_index_if_missing('antecedentes_inmunizaciones', 'id_antecedente_perinatal', 'idx_ant_inm_ant_per');
CALL add_index_if_missing('antecedentes_patologicos_personales', 'id_antecedente_perinatal', 'idx_ant_pat_ant_per');
CALL add_index_if_missing('enfermedades_diagnosticadas', 'id_antecedente_patologico_personal', 'idx_enf_diag_ant_pat');
CALL add_index_if_missing('alergias_pacientes', 'id_antecedente_patologico_personal', 'idx_alerg_pac_ant_pat');
CALL add_index_if_missing('hospitalizaciones_previas', 'id_antecedente_patologico_personal', 'idx_hosp_ant_pat');
CALL add_index_if_missing('cirugias_previas', 'id_antecedente_patologico_personal', 'idx_cir_ant_pat');
CALL add_index_if_missing('antecedentes_familiares', 'id_antecedente_perinatal', 'idx_ant_fam_ant_per');
CALL add_index_if_missing('desarrollos_psicomotores', 'id_historia_clinica', 'idx_des_psico_historia');
CALL add_index_if_missing('hitos_desarrollo', 'id_desarrollo_psicomotor', 'idx_hito_des_psico');
CALL add_index_if_missing('alimentacion', 'id_desarrollo_psicomotor', 'idx_alim_des_psico');
CALL add_index_if_missing('examenes_fisicos', 'id_consulta', 'idx_examen_consulta');
CALL add_index_if_missing('signos_vitales', 'id_examen_fisico', 'idx_signos_examen');
CALL add_index_if_missing('examenes_fisicos_segmentarios', 'id_examen_fisico', 'idx_seg_examen');
CALL add_index_if_missing('pieles_faneras', 'id_examen_fisico_segmentario', 'idx_piel_seg');
CALL add_index_if_missing('cabezas_cuellos', 'id_examen_fisico_segmentario', 'idx_cabeza_seg');
CALL add_index_if_missing('cardio_pulmonares', 'id_examen_fisico_segmentario', 'idx_cardio_seg');
CALL add_index_if_missing('abdomenes', 'id_examen_fisico_segmentario', 'idx_abdomen_seg');
CALL add_index_if_missing('neurologicos', 'id_examen_fisico_segmentario', 'idx_neuro_seg');
CALL add_index_if_missing('diagnosticos_planes_manejos', 'id_historia_clinica', 'idx_diag_plan_historia');

DROP PROCEDURE IF EXISTS add_index_if_missing;
