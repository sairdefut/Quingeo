-- Estructura necesaria para importar el catálogo geográfico de Ecuador.
-- La consolidación y reasignación de referencias se ejecuta transaccionalmente
-- desde GeographicCatalogImportService antes de cada importación.

DELIMITER $$
DROP PROCEDURE IF EXISTS apply_geographic_catalog_schema$$
CREATE PROCEDURE apply_geographic_catalog_schema()
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = DATABASE() AND table_name = 'provincias' AND column_name = 'codigo'
    ) THEN
        ALTER TABLE provincias ADD COLUMN codigo VARCHAR(20) NULL AFTER id_provincia;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = DATABASE() AND table_name = 'cantones' AND column_name = 'codigo'
    ) THEN
        ALTER TABLE cantones ADD COLUMN codigo VARCHAR(20) NULL AFTER id_canton;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = DATABASE() AND table_name = 'parroquias' AND column_name = 'codigo'
    ) THEN
        ALTER TABLE parroquias ADD COLUMN codigo VARCHAR(20) NULL AFTER id_parroquia;
    END IF;

    ALTER TABLE parroquias MODIFY COLUMN nombre VARCHAR(255) NOT NULL;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.statistics
        WHERE table_schema = DATABASE() AND table_name = 'provincias' AND index_name = 'idx_provincias_codigo'
    ) THEN
        CREATE INDEX idx_provincias_codigo ON provincias(codigo);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.statistics
        WHERE table_schema = DATABASE() AND table_name = 'cantones' AND index_name = 'idx_cantones_provincia_codigo'
    ) THEN
        CREATE INDEX idx_cantones_provincia_codigo ON cantones(id_provincia, codigo);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.statistics
        WHERE table_schema = DATABASE() AND table_name = 'parroquias' AND index_name = 'idx_parroquias_canton_codigo'
    ) THEN
        CREATE INDEX idx_parroquias_canton_codigo ON parroquias(id_canton, codigo);
    END IF;
END$$
CALL apply_geographic_catalog_schema()$$
DROP PROCEDURE apply_geographic_catalog_schema$$
DELIMITER ;
