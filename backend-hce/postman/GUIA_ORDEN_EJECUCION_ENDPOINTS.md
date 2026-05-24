# Guia de orden de ejecucion de endpoints

Esta guia indica el orden recomendado para ejecutar las colecciones Postman del backend HCE, evitando errores por relaciones o llaves foraneas.

Antes de empezar, importa las colecciones ubicadas en esta carpeta:

- `todos-los-controladores.postman_collection.json`

Tambien revisa las variables de coleccion, especialmente:
- `baseUrl`
- `username`
- `password`
- `idPaciente`
- `idTutor`
- `idHistoriaClinica`
- `idAntecedentePerinatal`
- `idAntecedentePatologicoPersonal`
- `idDesarrolloPsicomotor`
- `idConsulta`
- `idExamenFisicoSegmentario`
- `idExamenFisico`
- `idSignoVital`

Para saber en que carpeta/controlador de Postman esta cada endpoint, revisa:

- `INDICE_ENDPOINTS_POSTMAN.md`

Si Postman no actualiza alguna variable automaticamente, copia manualmente el ID devuelto por el endpoint y actualiza la variable antes de continuar.

## 1. Autenticacion

Ejecutar primero:

```http
POST /api/auth/login
```

Esto deja guardada la cookie `HCE_AUTH_TOKEN`, necesaria para la mayoria de endpoints protegidos.

## 2. Catalogos y datos base

Ejecutar endpoints de lectura para confirmar IDs existentes:

```http
GET /api/ubicaciones/provincias
GET /api/ubicaciones/provincias/{id}/cantones
GET /api/ubicaciones/provincias/{provinciaId}/cantones/{cantonId}/parroquias
GET /api/grupos-etnicos
GET /api/catalogos/etnias
GET /api/enfermedades
```

Si necesitas una enfermedad de prueba:

```http
POST /api/enfermedades
```

Guardar o verificar:

- `idProvincia`
- `idCanton`
- `idParroquia`
- `idGrupoEtnico`
- `idEnfermedad`

## 3. Tutor y paciente

Crear primero el tutor:

```http
POST /api/tutores
```

Guardar:

- `idTutor`

Luego crear el paciente:

```http
POST /api/pacientes
```

Guardar:

- `idPaciente`
- `cedulaPaciente`

Despues relacionar paciente con tutor:

```http
POST /api/pacientes_tutores
```

Usa:

- `idPaciente`
- `idTutor`

## 4. Historia clinica

Primero consulta si ya existe historia clinica para el paciente:

```http
GET /api/historias_clinicas/paciente/{idPaciente}
```

Guardar:

- `idHistoriaClinica`

Nota: `POST /api/historias_clinicas` existe, pero actualmente el servicio retorna `null`, por lo que puede responder `201` con cuerpo vacio y no crear correctamente la historia.

## 5. Antecedentes perinatales y derivados

Crear antecedente perinatal:

```http
POST /api/antecedentes-perinatales
```

Usa:

- `idPaciente`
- `idHistoriaClinica`

Guardar:

- `idAntecedentePerinatal`

Crear datos gestacionales:

```http
POST /api/datos-gestacionales
```

Usa:

- `idAntecedentePerinatal`

Guardar:

- `idDatoGestacional`

Crear complicaciones perinatales:

```http
POST /api/complicaciones-perinatales
```

Usa:

- `idDatoGestacional`
- `idEnfermedad`

Crear antecedentes de inmunizacion:

```http
POST /api/antecedentes-inmunizacion
```

Usa:

- `idHistoriaClinica`
- `idAntecedentePerinatal`

## 6. Antecedentes patologicos y relacionados

Crear antecedente patologico personal:

```http
POST /api/antecedentes-patologicos-personales
```

Usa:

- `idAntecedentePerinatal`

Guardar:

- `idAntecedentePatologicoPersonal`

Crear alergia:

```http
POST /api/alergias
```

Guardar:

- `idAlergia`

Relacionar alergia con paciente:

```http
POST /api/alergias-paciente
```

Usa:

- `idPaciente`
- `idAlergia`
- `idAntecedentePatologicoPersonal`

Crear cirugia previa:

```http
POST /api/cirugias-previas
```

Usa:

- `idPaciente`
- `idAntecedentePatologicoPersonal`

Crear hospitalizacion previa:

```http
POST /api/hospitalizaciones-previas
```

Usa:

- `idPaciente`
- `idAntecedentePatologicoPersonal`

Crear enfermedad diagnosticada:

```http
POST /api/enfermedades-diagnosticadas
```

Usa:

- `idEnfermedad`
- `idAntecedentePatologicoPersonal`

Crear antecedente familiar:

```http
POST /api/antecedentes-familiares
```

Usa:

- `idAntecedentePerinatal`
- `idEnfermedad`

## 7. Desarrollo psicomotor

Crear desarrollo psicomotor:

```http
POST /api/desarrollo-psicomotor
```

Usa:

- `idHistoriaClinica`

Guardar:

- `idDesarrolloPsicomotor`

Crear alimentacion:

```http
POST /api/alimentacion
```

Usa:

- `idDesarrolloPsicomotor`

Crear hitos de desarrollo:

```http
POST /api/hitos-desarrollo
```

Usa:

- `idDesarrolloPsicomotor`

## 8. Consulta medica

Crear consulta:

```http
POST /api/consultas
```

Usa:

- `idPaciente`
- `idHistoriaClinica`

Guardar:

- `idConsulta`

Crear plan terapeutico:

```http
POST /api/planes-terapeuticos
```

Usa:

- `idConsulta`

Crear estudio de laboratorio:

```http
POST /api/estudios-laboratorios
```

Usa:

- `idConsulta`

## 9. Examen fisico

Crear examen fisico segmentario:

```http
POST /api/examen-fisico-segmentario
```

Guardar:

- `idExamenFisicoSegmentario`

Crear signos vitales:

```http
POST /api/signos-vitales
```

Guardar:

- `idSignoVital`

Crear examen fisico:

```http
POST /api/examen-fisico
```

Usa:

- `idConsulta`
- `idSignoVital`
- `idExamenFisicoSegmentario`

Guardar:

- `idExamenFisico`

Crear detalles del examen fisico segmentario:

```http
POST /api/cabezas-cuellos
POST /api/cardio-pulmonares
POST /api/abdomenes
POST /api/neurologicos
POST /api/pieles-faneras
```

Todos usan:

- `idExamenFisicoSegmentario`

## 10. Diagnostico, reportes y sincronizacion

Crear diagnostico/plan de manejo:

```http
POST /api/diagnosticos-planes
```

Usa:

- `idHistoriaClinica`

Generar reporte de historia clinica:

```http
GET /api/reportes/historia/{cedula}
```

Usa:

- `cedulaPaciente`

Probar sincronizacion al final:

```http
GET /api/sync/down
POST /api/sync/up
```

## Resumen rapido de dependencias

Orden corto:

```text
Login
Ubicaciones / grupos etnicos / enfermedades
Tutor
Paciente
PacienteTutor
HistoriaClinica existente
AntecedentePerinatal
DatoGestacional
AntecedentePatologicoPersonal
Alergia / AlergiaPaciente
CirugiaPrevia / HospitalizacionPrevia / EnfermedadDiagnosticada
DesarrolloPsicomotor
Alimentacion / HitoDesarrollo
Consulta
PlanTerapeutico / EstudioLaboratorio
ExamenFisicoSegmentario
SignoVital
ExamenFisico
CabezaCuello / CardioPulmonar / Abdomen / Neurologico / PielFanera
DiagnosticoPlanManejo
Reporte
Sync
```
