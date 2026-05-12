INSERT INTO parroquias (nombre, id_canton, id_cnt_provincia)
SELECT parroquia, canton_id, 1
FROM (
    SELECT 'Camilo Ponce Enríquez' AS parroquia, 210 AS canton_id UNION ALL
    SELECT 'El Carmen de Pijilí', 210 UNION ALL
    SELECT 'Chordeleg', 202 UNION ALL
    SELECT 'La Unión', 202 UNION ALL
    SELECT 'Luis Galarza Orellana', 202 UNION ALL
    SELECT 'Principal', 202 UNION ALL
    SELECT 'San Martín de Puzhío', 202 UNION ALL
    SELECT 'El Pan', 203 UNION ALL
    SELECT 'San Vicente', 203 UNION ALL
    SELECT 'Girón', 16 UNION ALL
    SELECT 'La Asunción', 16 UNION ALL
    SELECT 'San Gerardo', 16 UNION ALL
    SELECT 'Guachapala', 205 UNION ALL
    SELECT 'Gualaceo', 17 UNION ALL
    SELECT 'Daniel Córdova Toral', 17 UNION ALL
    SELECT 'Jadán', 17 UNION ALL
    SELECT 'Luis Cordero Vega', 17 UNION ALL
    SELECT 'Mariano Moreno', 17 UNION ALL
    SELECT 'Remigio Crespo Toral', 17 UNION ALL
    SELECT 'San Juan', 17 UNION ALL
    SELECT 'Simón Bolívar', 17 UNION ALL
    SELECT 'Zhidmad', 17 UNION ALL
    SELECT 'Nabón', 18 UNION ALL
    SELECT 'Cochapata', 18 UNION ALL
    SELECT 'El Progreso', 18 UNION ALL
    SELECT 'Las Nieves', 18 UNION ALL
    SELECT 'San Felipe de Oña', 201 UNION ALL
    SELECT 'Susudel', 201 UNION ALL
    SELECT 'Paute', 19 UNION ALL
    SELECT 'Bulán', 19 UNION ALL
    SELECT 'Chicán', 19 UNION ALL
    SELECT 'Dug Dug', 19 UNION ALL
    SELECT 'El Cabo', 19 UNION ALL
    SELECT 'Guarainag', 19 UNION ALL
    SELECT 'San Cristóbal', 19 UNION ALL
    SELECT 'Tomebamba', 19 UNION ALL
    SELECT 'Pucará', 20 UNION ALL
    SELECT 'San Rafael de Sharug', 20 UNION ALL
    SELECT 'San Fernando', 21 UNION ALL
    SELECT 'Chumblín', 21 UNION ALL
    SELECT 'Santa Isabel', 22 UNION ALL
    SELECT 'Abdón Calderón', 22 UNION ALL
    SELECT 'San Pablo de Shaglli', 22 UNION ALL
    SELECT 'San Salvador de Cañaribamba', 22 UNION ALL
    SELECT 'Sevilla de Oro', 204 UNION ALL
    SELECT 'Amaluza', 204 UNION ALL
    SELECT 'Palmas', 204 UNION ALL
    SELECT 'Sígsig', 23 UNION ALL
    SELECT 'Cutchil', 23 UNION ALL
    SELECT 'Güel', 23 UNION ALL
    SELECT 'Jima', 23 UNION ALL
    SELECT 'Ludo', 23 UNION ALL
    SELECT 'San Bartolomé', 23 UNION ALL
    SELECT 'San José de Raranga', 23
) AS datos
WHERE NOT EXISTS (
    SELECT 1
    FROM parroquias p
    WHERE p.nombre = datos.parroquia
      AND p.id_canton = datos.canton_id
      AND p.id_cnt_provincia = 1
);
