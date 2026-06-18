CREATE TABLE IF NOT EXISTS provincias (
    id_provincia BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    uuid_offline VARCHAR(36),
    sync_status VARCHAR(20)
);

INSERT INTO provincias (id_provincia, nombre) VALUES
    (1, 'Azuay'),
    (2, 'Bolívar'),
    (3, 'Cañar'),
    (4, 'Carchi'),
    (5, 'Cotopaxi'),
    (6, 'Chimborazo'),
    (7, 'El Oro'),
    (8, 'Esmeraldas'),
    (9, 'Guayas'),
    (10, 'Imbabura'),
    (11, 'Loja'),
    (12, 'Los Ríos'),
    (13, 'Manabí'),
    (14, 'Morona Santiago'),
    (15, 'Napo'),
    (16, 'Pastaza'),
    (17, 'Pichincha'),
    (18, 'Tungurahua'),
    (19, 'Zamora Chinchipe'),
    (20, 'Galápagos'),
    (21, 'Sucumbíos'),
    (22, 'Orellana'),
    (23, 'Santo Domingo de los Tsáchilas'),
    (24, 'Santa Elena');
