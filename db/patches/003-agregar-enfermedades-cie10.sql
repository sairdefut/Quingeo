-- Agregar más enfermedades CIE-10 desde fuente MSP Ecuador
-- Fecha: 13 Mayo 2026

INSERT INTO enfermedades (codigo, nombre, estado) VALUES
-- A00-A09: enfermedades intestinales
('A00', 'Cólera', 'ACTIVO'),
('A01', 'Fiebres tifoidea y paratifoidea', 'ACTIVO'),
('A02', 'Infecciones debidas a otras salmonelas', 'ACTIVO'),
('A03', 'Shigelosis', 'ACTIVO'),
('A04', 'Otras infecciones intestinales bacterianas', 'ACTIVO'),
('A05', 'Intoxicación alimentaria bacteriana', 'ACTIVO'),
('A06', 'Amebiasis', 'ACTIVO'),
('A07', 'Otras enfermedades parasitarias intestinales', 'ACTIVO'),
('A08', 'Otras gastroenteritis y colitis', 'ACTIVO'),
('A09', 'Gastroenteritis y colitis de origen no especificado', 'ACTIVO'),

-- B00-B09: enfermedades virales
('B00', 'Infecciones por virus del herpes', 'ACTIVO'),
('B01', 'Varicela', 'ACTIVO'),
('B02', 'Herpes zoster', 'ACTIVO'),
('B03', 'Viruela', 'ACTIVO'),
('B04', 'Mononucleosis infecciosa', 'ACTIVO'),
('B05', 'Sarampión', 'ACTIVO'),
('B06', 'Rubéola', 'ACTIVO'),
('B07', 'Verrugas víricas', 'ACTIVO'),
('B08', 'Otras enfermedades virales', 'ACTIVO'),
('B09', 'Infecciones virales no especificadas', 'ACTIVO'),

-- E00-E10: enfermedades endocrinas
('E00', 'Síndrome de deficiencia de yodo', 'ACTIVO'),
('E01', 'Bocio endémico por deficiencia de yodo', 'ACTIVO'),
('E02', 'Hipotiroidismo subclínico por deficiencia de yodo', 'ACTIVO'),
('E03', 'Hipotiroidismo congénito', 'ACTIVO'),
('E04', 'Hipotiroidismo adquirido', 'ACTIVO'),
('E05', 'Hipertiroidismo', 'ACTIVO'),
('E10', 'Diabetes mellitus tipo 1', 'ACTIVO'),
('E11', 'Diabetes mellitus tipo 2', 'ACTIVO'),
('E12', 'Diabetes mellitus mal definida', 'ACTIVO'),
('E13', 'Otras diabetes mellitus', 'ACTIVO'),

-- I00-I99: enfermedades del sistema circulatorio
('I10', 'Hipertensión esencial (primaria)', 'ACTIVO'),
('I11', 'Enfermedad cardíaca hipertensiva', 'ACTIVO'),
('I12', 'Enfermedad renal hipertensiva', 'ACTIVO'),
('I13', 'Enfermedad cardiorrenal hipertensiva', 'ACTIVO'),
('I20', 'Angina de pecho', 'ACTIVO'),
('I21', 'Infarto agudo del miocardio', 'ACTIVO'),
('I22', 'Infarto subsecuente del miocardio', 'ACTIVO'),
('I25', 'Enfermedad ateroesclerótica del corazón', 'ACTIVO'),
('I50', 'Insuficiencia cardíaca', 'ACTIVO'),
('I63', 'Infarto cerebral', 'ACTIVO'),

-- J00-J99: enfermedades del sistema respiratorio
('J00', 'Nasofaringitis aguda (resfriado común)', 'ACTIVO'),
('J01', 'Sinusitis aguda', 'ACTIVO'),
('J02', 'Faringitis aguda', 'ACTIVO'),
('J03', 'Amigdalitis aguda', 'ACTIVO'),
('J04', 'Laringitis y traqueítis aguda', 'ACTIVO'),
('J05', 'Crup', 'ACTIVO'),
('J06', 'Infecciones agudas de las vías respiratorias superiores', 'ACTIVO'),
('J18', 'Neumonía', 'ACTIVO'),
('J44', 'Enfermedad pulmonar obstructiva crónica', 'ACTIVO'),
('J45', 'Asma', 'ACTIVO'),

-- K00-K95: enfermedades del sistema digestivo
('K29', 'Gastritis y duodenitis', 'ACTIVO'),
('K30', 'Dispepsia', 'ACTIVO'),
('K35', 'Apendicitis aguda', 'ACTIVO'),
('K50', 'Enfermedad de Crohn', 'ACTIVO'),
('K51', 'Colitis ulcerosa', 'ACTIVO'),
('K70', 'Enfermedad hepática alcohólica', 'ACTIVO'),
('K80', 'Litiasis de la vesícula biliar', 'ACTIVO'),
('K85', 'Pancreatitis aguda', 'ACTIVO'),

-- N00-N99: enfermedades del sistema genitourinario
('N00', 'Síndrome nefrítico agudo', 'ACTIVO'),
('N10', 'Nefritis tubulointersticial aguda', 'ACTIVO'),
('N30', 'Cistitis', 'ACTIVO'),
('N39', 'Otros trastornos del sistema urinario', 'ACTIVO'),
('N40', 'Hiperplasia prostática', 'ACTIVO'),

-- R00-R99: síntomas y signos
('R05', 'Tos', 'ACTIVO'),
('R10', 'Dolor abdominal y pelvis', 'ACTIVO'),
('R50', 'Fiebre de origen desconocido', 'ACTIVO'),
('R51', 'Cefalea', 'ACTIVO'),
('R10.0', 'Abdomen agudo', 'ACTIVO'),
('R10.1', 'Dolor epigástrico', 'ACTIVO'),
('R10.2', 'Dolor torácico', 'ACTIVO'),

-- S00-T98: lesiones
('S00', 'Traumatismo de la cabeza', 'ACTIVO'),
('S01', 'Traumatismo de la cara y cráneo', 'ACTIVO'),
('S06', 'Traumatismo intracraneal', 'ACTIVO'),
('S70', 'Contusión de la cadera y del muslo', 'ACTIVO'),
('S80', 'Contusión de la pierna', 'ACTIVO'),
('S90', 'Contusión del pie y del tobillo', 'ACTIVO'),

-- O00-O9A: embarazo, parto y puerperio
('O00', 'Embarazo ectópico', 'ACTIVO'),
('O03', 'Aborto espontáneo', 'ACTIVO'),
('O09', 'Embarazo de alto riesgo', 'ACTIVO'),
('O24', 'Diabetes mellitus gestacional', 'ACTIVO'),
('O32', 'Atención prenatal por sospecha de fetales anormales', 'ACTIVO');

SELECT COUNT(*) as total_enfermedades FROM enfermedades;