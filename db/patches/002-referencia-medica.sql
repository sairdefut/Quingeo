-- D-5: Agregar campos de referencia médica a la tabla consultas
-- Fecha: 13 Mayo 2026

ALTER TABLE consultas 
ADD COLUMN referencia_hospital TINYINT(1) DEFAULT 0,
ADD COLUMN motivo_referencia VARCHAR(500);

-- Verificar que los campos se crearon correctamente
-- SHOW COLUMNS FROM consultas LIKE 'referencia_hospital';
-- SHOW COLUMNS FROM consultas LIKE 'motivo_referencia';