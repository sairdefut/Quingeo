# Auditoria De Base De Datos Restaurada Desde `main`

## Contexto

Se reemplazo la base local `hce_prueba2` con la version versionada en la rama `main` del repositorio:

- `Dump20260127.sql`
- `db/patches/001-fix-azuay-parroquias.sql`
- `db/patches/002-referencia-medica.sql`
- `db/patches/003-agregar-enfermedades-cie10.sql`
- `db/patches/004-anio-escolar.sql`

La restauracion fue exitosa y el backend levanta con `spring.jpa.hibernate.ddl-auto=none`.

## Verificaciones Basicas

- Backend saludable: `GET /actuator/health -> {"status":"UP"}`
- Tablas restauradas: `38`
- Catalogos clave:
  - `enfermedades`: `181`
  - `parroquias`: `1131`
  - `personal`: `2`
- Columnas de parches presentes:
  - `pacientes.tipo_identificacion`
  - `pacientes.anio_escolar`
  - `consultas.referencia_hospital`
  - `consultas.motivo_referencia`

## Hallazgos Principales

### 1. La base de `main` no materializa la mayoria de relaciones como foreign keys

Solo existen 4 relaciones fisicas en MySQL:

- `cirugias_previas.id_paciente -> pacientes.id_paciente`
- `consultas.id_paciente -> pacientes.id_paciente`
- `consultas.id_paciente -> pacientes.id_paciente` (duplicada en el dump)
- `hospitalizaciones_previas.id_paciente -> pacientes.id_paciente`

Esto implica que el dump actual del repo sigue teniendo relaciones incompletas a nivel de integridad referencial.

### 2. Varias entidades JPA no coinciden con la base restaurada desde `main`

#### Alta severidad

- `backend-hce/src/main/java/ec/gob/salud/hce/backend/entity/ExamenFisico.java`
  - Mapea `id_historia_clinica`, `id_paciente`, `id_signo_vital`, `id_examen_fisico_segmentario`
  - La tabla real `examenes_fisicos` solo tiene `id_examen_fisico`, `id_consulta` y auditoria

- `backend-hce/src/main/java/ec/gob/salud/hce/backend/entity/ExamenFisicoSegmentario.java`
  - Mapea columnas texto `aspecto_general`, `piel_faneras`, `cabeza_cuello`, `cardio_pulmonar`, `abdomen`, `neurologico`, `evolucion_clinica`
  - La tabla real solo tiene `id_examen_fisico`, `id_aspectos_general`, `observaciones` y auditoria

- `backend-hce/src/main/java/ec/gob/salud/hce/backend/entity/AntecedentePerinatal.java`
  - Espera `id_paciente`, `embarazo_planificado`, `controles_prenatales`, `antecedentes`, `otros_antecedentes`
  - La tabla real `antecedentes_perinatales` no tiene esas columnas

- `backend-hce/src/main/java/ec/gob/salud/hce/backend/entity/DesarrolloPsicomotor.java`
  - Mapea `id_paciente`
  - La tabla real `desarrollos_psicomotores` no tiene `id_paciente`

#### Media-alta severidad

- `backend-hce/src/main/java/ec/gob/salud/hce/backend/entity/Alimentacion.java`
  - Usa `@Table(name = "alimentacion")`
  - La tabla real es `alimentaciones`

- `backend-hce/src/main/java/ec/gob/salud/hce/backend/entity/CardioPulmonar.java`
  - Usa `@Table(name = "cardio_pulmonares")`
  - La tabla real es `cardiospulmonares`

- `backend-hce/src/main/java/ec/gob/salud/hce/backend/entity/CabezaCuello.java`
  - Usa `@Column(name = "id_cabeza_cuelloint")`
  - La columna real es `id_cabeza_cuello`

- `backend-hce/src/main/java/ec/gob/salud/hce/backend/entity/SignoVital.java`
  - Usa campo `puntuacion` sin mapear la columna real
  - La columna en MySQL es `puntuacionz`

### 3. Algunos endpoints pueden arrancar bien pero fallar al consultar o guardar

Casos especialmente riesgosos:

- `backend-hce/src/main/java/ec/gob/salud/hce/backend/controller/ExamenFisicoController.java`
- `backend-hce/src/main/java/ec/gob/salud/hce/backend/controller/AntecedentePerinatalController.java`
- `backend-hce/src/main/java/ec/gob/salud/hce/backend/controller/DesarrolloPsicomotorController.java`
- `backend-hce/src/main/java/ec/gob/salud/hce/backend/controller/SignoVitalController.java`

El backend queda saludable porque no valida el esquema al iniciar, pero eso no garantiza compatibilidad real entre entidades y tablas.

## Conclusiones

- La base local si quedo alineada con la version actual del repo en `main`
- El problema no estaba solo en la base anterior: tambien hay desalineaciones reales entre el dump del repo y varias entidades del backend
- No es recomendable agregar nuevas foreign keys o rehacer la base por cuenta propia antes de alinear primero el backend con el esquema versionado

## Recomendacion Segura

1. Tomar esta auditoria como referencia de revision
2. Corregir primero las entidades/controladores JPA para que coincidan con la base restaurada desde `main`
3. Despues evaluar si conviene fortalecer relaciones fisicas en MySQL con migraciones explicitamente acordadas por el equipo
