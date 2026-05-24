# Indice de endpoints por carpeta de Postman

Este indice muestra en que carpeta/controlador de la coleccion Postman se encuentra cada endpoint.

Coleccion principal:

- `todos-los-controladores.postman_collection.json`

## Endpoints

| Metodo | Endpoint | Carpeta en Postman |
|---|---|---|
| POST | `/api/auth/login` | `AuthController` |
| POST | `/api/auth/logout` | `AuthController` |
| GET | `/api/auth/historial` | `AuthController` |
| GET | `/api/abdomenes` | `AbdomenController` |
| POST | `/api/abdomenes` | `AbdomenController` |
| GET | `/api/admin/test` | `AdminController` |
| GET | `/api/admin/usuarios` | `AdminController` |
| POST | `/api/admin/usuarios` | `AdminController` |
| GET | `/api/alergias` | `AlergiaController` |
| POST | `/api/alergias` | `AlergiaController` |
| PUT | `/api/alergias/{{idAlergia}}` | `AlergiaController` |
| GET | `/api/alergias-paciente` | `AlergiaPacienteController` |
| GET | `/api/alergias-paciente/paciente/{{idPaciente}}` | `AlergiaPacienteController` |
| POST | `/api/alergias-paciente` | `AlergiaPacienteController` |
| GET | `/api/alimentacion` | `AlimentacionController` |
| GET | `/api/alimentacion/{{idAlimentacion}}` | `AlimentacionController` |
| POST | `/api/alimentacion` | `AlimentacionController` |
| PUT | `/api/alimentacion/{{idAlimentacion}}` | `AlimentacionController` |
| GET | `/api/antecedentes-familiares` | `AntecedenteFamiliarController` |
| GET | `/api/antecedentes-familiares/{{idAntecedenteFamiliar}}` | `AntecedenteFamiliarController` |
| POST | `/api/antecedentes-familiares` | `AntecedenteFamiliarController` |
| PUT | `/api/antecedentes-familiares/{{idAntecedenteFamiliar}}` | `AntecedenteFamiliarController` |
| GET | `/api/antecedentes-inmunizacion` | `AntecedenteInmunizacionController` |
| GET | `/api/antecedentes-inmunizacion/paciente/{{idPaciente}}` | `AntecedenteInmunizacionController` |
| POST | `/api/antecedentes-inmunizacion` | `AntecedenteInmunizacionController` |
| GET | `/api/antecedentes-patologicos-personales` | `AntecedentePatologicoPersonalController` |
| POST | `/api/antecedentes-patologicos-personales` | `AntecedentePatologicoPersonalController` |
| GET | `/api/antecedentes-perinatales` | `AntecedentePerinatalController` |
| GET | `/api/antecedentes-perinatales/paciente/{{idPaciente}}` | `AntecedentePerinatalController` |
| POST | `/api/antecedentes-perinatales` | `AntecedentePerinatalController` |
| GET | `/api/cabezas-cuellos` | `CabezaCuelloController` |
| POST | `/api/cabezas-cuellos` | `CabezaCuelloController` |
| GET | `/api/cardio-pulmonares` | `CardioPulmonarController` |
| POST | `/api/cardio-pulmonares` | `CardioPulmonarController` |
| GET | `/api/catalogos/etnias` | `CatalogoController` |
| GET | `/api/catalogos/glasgow/15` | `CatalogoController` |
| GET | `/api/catalogos/glasgow/opciones` | `CatalogoController` |
| GET | `/api/catalogos/cie10/buscar?q=diabetes` | `CatalogoController` |
| GET | `/api/cirugias-previas` | `CirugiaPreviaController` |
| GET | `/api/cirugias-previas/paciente/{{idPaciente}}` | `CirugiaPreviaController` |
| POST | `/api/cirugias-previas` | `CirugiaPreviaController` |
| GET | `/api/complicaciones-perinatales` | `ComplicacionPerinatalController` |
| POST | `/api/complicaciones-perinatales` | `ComplicacionPerinatalController` |
| GET | `/api/consultas` | `ConsultaController` |
| GET | `/api/consultas/paciente/{{idPaciente}}` | `ConsultaController` |
| POST | `/api/consultas` | `ConsultaController` |
| GET | `/api/datos-gestacionales` | `DatoGestacionalController` |
| POST | `/api/datos-gestacionales` | `DatoGestacionalController` |
| GET | `/api/desarrollo-psicomotor` | `DesarrolloPsicomotorController` |
| GET | `/api/desarrollo-psicomotor/historia/{{idHistoriaClinica}}` | `DesarrolloPsicomotorController` |
| POST | `/api/desarrollo-psicomotor` | `DesarrolloPsicomotorController` |
| GET | `/api/diagnosticos-planes` | `DiagnosticoPlanManejoController` |
| POST | `/api/diagnosticos-planes` | `DiagnosticoPlanManejoController` |
| GET | `/api/enfermedades` | `EnfermedadController` |
| POST | `/api/enfermedades` | `EnfermedadController` |
| GET | `/api/enfermedades-diagnosticadas` | `EnfermedadDiagnosticadaController` |
| POST | `/api/enfermedades-diagnosticadas` | `EnfermedadDiagnosticadaController` |
| GET | `/api/estudios-laboratorios` | `EstudioLaboratorioController` |
| POST | `/api/estudios-laboratorios` | `EstudioLaboratorioController` |
| GET | `/api/examen-fisico` | `ExamenFisicoController` |
| POST | `/api/examen-fisico` | `ExamenFisicoController` |
| POST | `/api/examen-fisico-segmentario` | `ExamenFisicoSegmentarioController` |
| GET | `/api/grupos-etnicos` | `GrupoEtnicoController` |
| GET | `/api/historias_clinicas` | `HistoriaClinicaController` |
| GET | `/api/historias_clinicas/{{idHistoriaClinica}}` | `HistoriaClinicaController` |
| GET | `/api/historias_clinicas/paciente/{{idPaciente}}` | `HistoriaClinicaController` |
| POST | `/api/historias_clinicas` | `HistoriaClinicaController` |
| GET | `/api/hitos-desarrollo` | `HitoDesarrolloController` |
| POST | `/api/hitos-desarrollo` | `HitoDesarrolloController` |
| GET | `/api/hospitalizaciones-previas` | `HospitalizacionPreviaController` |
| GET | `/api/hospitalizaciones-previas/paciente/{{idPaciente}}` | `HospitalizacionPreviaController` |
| POST | `/api/hospitalizaciones-previas` | `HospitalizacionPreviaController` |
| GET | `/medico/test` | `MedicoController` |
| GET | `/api/neurologicos` | `NeurologicoController` |
| POST | `/api/neurologicos` | `NeurologicoController` |
| GET | `/api/pacientes` | `PacienteController` |
| GET | `/api/pacientes/{{idPaciente}}` | `PacienteController` |
| GET | `/api/pacientes/buscar?q=ana` | `PacienteController` |
| POST | `/api/pacientes` | `PacienteController` |
| GET | `/api/pacientes_tutores` | `PacienteTutorController` |
| POST | `/api/pacientes_tutores` | `PacienteTutorController` |
| GET | `/api/pieles-faneras` | `PielFaneraController` |
| POST | `/api/pieles-faneras` | `PielFaneraController` |
| GET | `/api/planes-terapeuticos` | `PlanTerapeuticoController` |
| POST | `/api/planes-terapeuticos` | `PlanTerapeuticoController` |
| GET | `/api/reportes/historia/{{cedulaPaciente}}` | `ReporteController` |
| GET | `/api/signos-vitales` | `SignoVitalController` |
| POST | `/api/signos-vitales` | `SignoVitalController` |
| GET | `/api/sync/down` | `SyncController` |
| POST | `/api/sync/up` | `SyncController` |
| GET | `/api/tutores` | `TutorController` |
| POST | `/api/tutores` | `TutorController` |
| GET | `/api/ubicaciones/provincias` | `UbicacionController` |
| GET | `/api/ubicaciones/provincias/{{idProvincia}}/cantones` | `UbicacionController` |
| GET | `/api/ubicaciones/provincias/{{idProvincia}}/cantones/{{idCanton}}/parroquias` | `UbicacionController` |
| GET | `/api/ubicaciones/provincias/{{idProvincia}}/cantones/{{idCanton}}/parroquias/{{idParroquia}}` | `UbicacionController` |

## Busqueda rapida por carpeta

| Carpeta en Postman | Prefijos principales |
|---|---|
| `AuthController` | `/api/auth` |
| `AbdomenController` | `/api/abdomenes` |
| `AdminController` | `/api/admin` |
| `AlergiaController` | `/api/alergias` |
| `AlergiaPacienteController` | `/api/alergias-paciente` |
| `AlimentacionController` | `/api/alimentacion` |
| `AntecedenteFamiliarController` | `/api/antecedentes-familiares` |
| `AntecedenteInmunizacionController` | `/api/antecedentes-inmunizacion` |
| `AntecedentePatologicoPersonalController` | `/api/antecedentes-patologicos-personales` |
| `AntecedentePerinatalController` | `/api/antecedentes-perinatales` |
| `CabezaCuelloController` | `/api/cabezas-cuellos` |
| `CardioPulmonarController` | `/api/cardio-pulmonares` |
| `CatalogoController` | `/api/catalogos` |
| `CirugiaPreviaController` | `/api/cirugias-previas` |
| `ComplicacionPerinatalController` | `/api/complicaciones-perinatales` |
| `ConsultaController` | `/api/consultas` |
| `DatoGestacionalController` | `/api/datos-gestacionales` |
| `DesarrolloPsicomotorController` | `/api/desarrollo-psicomotor` |
| `DiagnosticoPlanManejoController` | `/api/diagnosticos-planes` |
| `EnfermedadController` | `/api/enfermedades` |
| `EnfermedadDiagnosticadaController` | `/api/enfermedades-diagnosticadas` |
| `EstudioLaboratorioController` | `/api/estudios-laboratorios` |
| `ExamenFisicoController` | `/api/examen-fisico` |
| `ExamenFisicoSegmentarioController` | `/api/examen-fisico-segmentario` |
| `GrupoEtnicoController` | `/api/grupos-etnicos` |
| `HistoriaClinicaController` | `/api/historias_clinicas` |
| `HitoDesarrolloController` | `/api/hitos-desarrollo` |
| `HospitalizacionPreviaController` | `/api/hospitalizaciones-previas` |
| `MedicoController` | `/medico` |
| `NeurologicoController` | `/api/neurologicos` |
| `PacienteController` | `/api/pacientes` |
| `PacienteTutorController` | `/api/pacientes_tutores` |
| `PielFaneraController` | `/api/pieles-faneras` |
| `PlanTerapeuticoController` | `/api/planes-terapeuticos` |
| `ReporteController` | `/api/reportes` |
| `SignoVitalController` | `/api/signos-vitales` |
| `SyncController` | `/api/sync` |
| `TutorController` | `/api/tutores` |
| `UbicacionController` | `/api/ubicaciones` |
