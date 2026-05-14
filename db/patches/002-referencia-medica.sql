-- Migración para agregar campos nuevos
-- D-1: tipo_identificacion en pacientes
-- D-5: referenciaHospital y motivoReferencia en consultas
-- Fecha: 13 Mayo 2026

-- ============================================
-- D-1: Agregar tipo_identificacion a pacientes
-- ============================================
ALTER TABLE pacientes 
ADD COLUMN tipo_identificacion VARCHAR(20) DEFAULT 'CEDULA' AFTER cedula;

-- ============================================
-- D-5: Agregar referencia médica a consultas
-- ============================================
ALTER TABLE consultas 
ADD COLUMN referencia_hospital TINYINT(1) DEFAULT 0,
ADD COLUMN motivo_referencia VARCHAR(500);