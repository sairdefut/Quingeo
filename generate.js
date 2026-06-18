const fs = require('fs');

const sql = fs.readFileSync('db/patches/001-fix-azuay-parroquias.sql', 'utf-8');

// Buscamos todas las tuplas de INSERT INTO seed_parroquias_ecuador (id_cnt_provincia, id_canton, nombre) VALUES
// (1, 1, 'CUENCA'),
// (1, 1, 'BAÑOS'), ...

const regex = /\((\d+),\s*(\d+),\s*'([^']+)'\)/g;
let match;
const cantonesMap = new Map();

while ((match = regex.exec(sql)) !== null) {
    const idProvincia = parseInt(match[1], 10);
    const idCanton = parseInt(match[2], 10);
    const nombre = match[3];

    // Asumimos que la primera parroquia de cada cantón tiene el mismo nombre que el cantón (cabecera cantonal)
    // O simplemente usamos la primera que encontremos.
    if (!cantonesMap.has(idCanton)) {
        cantonesMap.set(idCanton, {
            id_provincia: idProvincia,
            nombre: nombre
        });
    }
}

// Generamos el SQL
let cantonesSql = `CREATE TABLE IF NOT EXISTS cantones (
    id_canton BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    id_provincia BIGINT,
    uuid_offline VARCHAR(36),
    sync_status VARCHAR(20),
    CONSTRAINT FK_cantones_provincias FOREIGN KEY (id_provincia) REFERENCES provincias(id_provincia)
);\n\nINSERT IGNORE INTO cantones (id_canton, nombre, id_provincia) VALUES\n`;

const values = [];
for (const [idCanton, data] of cantonesMap.entries()) {
    values.push(`    (${idCanton}, '${data.nombre}', ${data.id_provincia})`);
}

cantonesSql += values.join(',\n') + ';\n';

fs.writeFileSync('db/patches/000b-cantones.sql', cantonesSql, 'utf-8');
console.log('Cantones generados correctamente en 000b-cantones.sql');
