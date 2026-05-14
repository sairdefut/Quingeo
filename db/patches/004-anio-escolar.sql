-- ============================================
-- S-3: Agregar campo anio_escolar a pacientes
-- ============================================
ALTER TABLE pacientes 
ADD COLUMN anio_escolar VARCHAR(50) DEFAULT NULL AFTER tipo_sangre;
