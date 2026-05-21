ALTER TABLE pacientes
ADD COLUMN numero_historia_clinica VARCHAR(14) NULL AFTER id_paciente;

UPDATE pacientes p
JOIN (
    SELECT
        id_paciente,
        ROW_NUMBER() OVER (ORDER BY id_paciente) AS rn
    FROM pacientes
    WHERE numero_historia_clinica IS NULL
) seq ON seq.id_paciente = p.id_paciente
SET p.numero_historia_clinica = CONCAT(
    'HC-',
    LPAD(1 + FLOOR((seq.rn - 1) / 998001), 3, '0'),
    '-',
    LPAD(1 + FLOOR(((seq.rn - 1) % 998001) / 999), 3, '0'),
    '-',
    LPAD(1 + ((seq.rn - 1) % 999), 3, '0')
);

ALTER TABLE pacientes
ADD UNIQUE KEY uk_pacientes_numero_historia_clinica (numero_historia_clinica);
