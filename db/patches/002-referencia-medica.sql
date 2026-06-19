-- Migración para agregar campos nuevos
-- D-1: tipo_identificacion en pacientes
-- D-5: referenciaHospital y motivoReferencia en consultas
-- Fecha: 13 Mayo 2026

-- ============================================
-- D-1: Agregar tipo_identificacion a pacientes
-- ============================================
DELIMITER //
CREATE PROCEDURE AddColumnIfNotExist()
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'pacientes' 
        AND COLUMN_NAME = 'tipo_identificacion'
    ) THEN
        ALTER TABLE pacientes ADD COLUMN tipo_identificacion VARCHAR(20) DEFAULT 'CEDULA' AFTER cedula;
    END IF;
END//
DELIMITER ;
CALL AddColumnIfNotExist();
DROP PROCEDURE AddColumnIfNotExist;

-- ============================================
-- D-5: Agregar referencia médica a consultas
-- ============================================
ALTER TABLE consultas 
ADD COLUMN referencia_hospital TINYINT(1) DEFAULT 0,
ADD COLUMN motivo_referencia VARCHAR(500);