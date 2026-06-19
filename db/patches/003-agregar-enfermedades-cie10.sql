-- Agregar más enfermedades CIE-10 desde fuente MSP Ecuador
-- Fecha: 13 Mayo 2026

INSERT INTO enfermedades (codigo, nombre, estado, sync_status) VALUES
-- A00-A09: enfermedades intestinales
('A00', 'Cólera', 'ACTIVO', 'PENDING'),
('A01', 'Fiebres tifoidea y paratifoidea', 'ACTIVO', 'PENDING'),
('A02', 'Infecciones debidas a otras salmonelas', 'ACTIVO', 'PENDING'),
('A03', 'Shigelosis', 'ACTIVO', 'PENDING'),
('A04', 'Otras infecciones intestinales bacterianas', 'ACTIVO', 'PENDING'),
('A05', 'Intoxicación alimentaria bacteriana', 'ACTIVO', 'PENDING'),
('A06', 'Amebiasis', 'ACTIVO', 'PENDING'),
('A07', 'Otras enfermedades parasitarias intestinales', 'ACTIVO', 'PENDING'),
('A08', 'Otras gastroenteritis y colitis', 'ACTIVO', 'PENDING'),
('A09', 'Gastroenteritis y colitis de origen no especificado', 'ACTIVO', 'PENDING'),

-- B00-B09: enfermedades virales
('B00', 'Infecciones por virus del herpes', 'ACTIVO', 'PENDING'),
('B01', 'Varicela', 'ACTIVO', 'PENDING'),
('B02', 'Herpes zoster', 'ACTIVO', 'PENDING'),
('B03', 'Viruela', 'ACTIVO', 'PENDING'),
('B04', 'Mononucleosis infecciosa', 'ACTIVO', 'PENDING'),
('B05', 'Sarampión', 'ACTIVO', 'PENDING'),
('B06', 'Rubéola', 'ACTIVO', 'PENDING'),
('B07', 'Verrugas víricas', 'ACTIVO', 'PENDING'),
('B08', 'Otras enfermedades virales', 'ACTIVO', 'PENDING'),
('B09', 'Infecciones virales no especificadas', 'ACTIVO', 'PENDING'),

-- E00-E10: enfermedades endocrinas
('E00', 'Síndrome de deficiencia de yodo', 'ACTIVO', 'PENDING'),
('E01', 'Bocio endémico por deficiencia de yodo', 'ACTIVO', 'PENDING'),
('E02', 'Hipotiroidismo subclínico por deficiencia de yodo', 'ACTIVO', 'PENDING'),
('E03', 'Hipotiroidismo congénito', 'ACTIVO', 'PENDING'),
('E04', 'Hipotiroidismo adquirido', 'ACTIVO', 'PENDING'),
('E05', 'Hipertiroidismo', 'ACTIVO', 'PENDING'),
('E10', 'Diabetes mellitus tipo 1', 'ACTIVO', 'PENDING'),
('E11', 'Diabetes mellitus tipo 2', 'ACTIVO', 'PENDING'),
('E12', 'Diabetes mellitus mal definida', 'ACTIVO', 'PENDING'),
('E13', 'Otras diabetes mellitus', 'ACTIVO', 'PENDING'),

-- I00-I99: enfermedades del sistema circulatorio
('I10', 'Hipertensión esencial (primaria)', 'ACTIVO', 'PENDING'),
('I11', 'Enfermedad cardíaca hipertensiva', 'ACTIVO', 'PENDING'),
('I12', 'Enfermedad renal hipertensiva', 'ACTIVO', 'PENDING'),
('I13', 'Enfermedad cardiorrenal hipertensiva', 'ACTIVO', 'PENDING'),
('I20', 'Angina de pecho', 'ACTIVO', 'PENDING'),
('I21', 'Infarto agudo del miocardio', 'ACTIVO', 'PENDING'),
('I22', 'Infarto subsecuente del miocardio', 'ACTIVO', 'PENDING'),
('I25', 'Enfermedad ateroesclerótica del corazón', 'ACTIVO', 'PENDING'),
('I50', 'Insuficiencia cardíaca', 'ACTIVO', 'PENDING'),
('I63', 'Infarto cerebral', 'ACTIVO', 'PENDING'),

-- J00-J99: enfermedades del sistema respiratorio
('J00', 'Nasofaringitis aguda (resfriado común)', 'ACTIVO', 'PENDING'),
('J01', 'Sinusitis aguda', 'ACTIVO', 'PENDING'),
('J02', 'Faringitis aguda', 'ACTIVO', 'PENDING'),
('J03', 'Amigdalitis aguda', 'ACTIVO', 'PENDING'),
('J04', 'Laringitis y traqueítis aguda', 'ACTIVO', 'PENDING'),
('J05', 'Crup', 'ACTIVO', 'PENDING'),
('J06', 'Infecciones agudas de las vías respiratorias superiores', 'ACTIVO', 'PENDING'),
('J18', 'Neumonía', 'ACTIVO', 'PENDING'),
('J44', 'Enfermedad pulmonar obstructiva crónica', 'ACTIVO', 'PENDING'),
('J45', 'Asma', 'ACTIVO', 'PENDING'),

-- K00-K95: enfermedades del sistema digestivo
('K29', 'Gastritis y duodenitis', 'ACTIVO', 'PENDING'),
('K30', 'Dispepsia', 'ACTIVO', 'PENDING'),
('K35', 'Apendicitis aguda', 'ACTIVO', 'PENDING'),
('K50', 'Enfermedad de Crohn', 'ACTIVO', 'PENDING'),
('K51', 'Colitis ulcerosa', 'ACTIVO', 'PENDING'),
('K70', 'Enfermedad hepática alcohólica', 'ACTIVO', 'PENDING'),
('K80', 'Litiasis de la vesícula biliar', 'ACTIVO', 'PENDING'),
('K85', 'Pancreatitis aguda', 'ACTIVO', 'PENDING'),

-- N00-N99: enfermedades del sistema genitourinario
('N00', 'Síndrome nefrítico agudo', 'ACTIVO', 'PENDING'),
('N10', 'Nefritis tubulointersticial aguda', 'ACTIVO', 'PENDING'),
('N30', 'Cistitis', 'ACTIVO', 'PENDING'),
('N39', 'Otros trastornos del sistema urinario', 'ACTIVO', 'PENDING'),
('N40', 'Hiperplasia prostática', 'ACTIVO', 'PENDING'),

-- R00-R99: síntomas y signos
('R05', 'Tos', 'ACTIVO', 'PENDING'),
('R10', 'Dolor abdominal y pelvis', 'ACTIVO', 'PENDING'),
('R50', 'Fiebre de origen desconocido', 'ACTIVO', 'PENDING'),
('R51', 'Cefalea', 'ACTIVO', 'PENDING'),
('R10.0', 'Abdomen agudo', 'ACTIVO', 'PENDING'),
('R10.1', 'Dolor epigástrico', 'ACTIVO', 'PENDING'),
('R10.2', 'Dolor torácico', 'ACTIVO', 'PENDING'),

-- S00-T98: lesiones
('S00', 'Traumatismo de la cabeza', 'ACTIVO', 'PENDING'),
('S01', 'Traumatismo de la cara y cráneo', 'ACTIVO', 'PENDING'),
('S06', 'Traumatismo intracraneal', 'ACTIVO', 'PENDING'),
('S70', 'Contusión de la cadera y del muslo', 'ACTIVO', 'PENDING'),
('S80', 'Contusión de la pierna', 'ACTIVO', 'PENDING'),
('S90', 'Contusión del pie y del tobillo', 'ACTIVO', 'PENDING'),

-- O00-O9A: embarazo, parto y puerperio
('O00', 'Embarazo ectópico', 'ACTIVO', 'PENDING'),
('O03', 'Aborto espontáneo', 'ACTIVO', 'PENDING'),
('O09', 'Embarazo de alto riesgo', 'ACTIVO', 'PENDING'),
('O24', 'Diabetes mellitus gestacional', 'ACTIVO', 'PENDING'),
('O32', 'Atención prenatal por sospecha de fetales anormales', 'ACTIVO', 'PENDING');

SELECT COUNT(*) as total_enfermedades FROM enfermedades;