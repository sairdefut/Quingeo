# Plan Offline-First por Fases para HCE Quingeo

## Resumen
Implementar offline por fases hasta cubrir toda la app, empezando por el flujo clínico esencial: pacientes, catálogos, consultas e historial. La base actual ya tiene Dexie, PWA, `syncService`, `uuidOffline`, `lastModified` y endpoints `/api/sync`; el trabajo será consolidar eso en una arquitectura robusta, idempotente y con control explícito de conflictos.

No se puede garantizar “cero conflictos nunca” si dos usuarios editan el mismo dato offline, pero sí se puede diseñar para que no haya pérdida silenciosa de datos, duplicados evitables ni sobrescrituras invisibles.

## Cambios Clave
- Convertir `dbPacienteService` en la fachada única offline-first para pacientes y consultas.
- Retirar gradualmente `pacienteStorage.ts` con `localStorage` para evitar doble fuente de verdad.
- Registrar el service worker de Vite PWA en `main.tsx` y cachear shell/app estática para que el sistema abra sin internet.
- Ampliar IndexedDB con tablas/estado:
  - `pacientes`, `consultas`, `catalogos`
  - `syncQueue`
  - `conflicts`
  - `syncState`
  - `failedSyncItems`
- Cada cambio local debe guardar:
  - `uuidOffline`
  - `entity`
  - `operation`: `CREATE`, `UPDATE`, `DELETE`
  - `clientMutationId`
  - `baseVersion` o `baseLastModified`
  - `localUpdatedAt`
  - `payload`
  - `status`: `pending`, `syncing`, `synced`, `failed`, `conflict`
- Backend debe aceptar operaciones idempotentes: repetir el mismo `clientMutationId` no debe crear duplicados.
- Backend debe devolver mappings completos:
  - `uuidOffline`
  - `clientMutationId`
  - `entityType`
  - `serverId`
  - `serverLastModified`
  - `numeroHistoriaClinica` cuando aplique.
- Agregar sincronización incremental:
  - `GET /api/sync/down?since=<timestamp>`
  - mantener descarga inicial como fallback.
- Agregar manejo explícito de conflictos:
  - si el servidor cambió después de `baseLastModified`, no sobrescribir automáticamente;
  - guardar conflicto local;
  - mostrar estado “requiere revisión”;
  - para consultas clínicas nuevas, preferir append-only y evitar edición destructiva cuando sea posible.

## Implementación por Fases
- Fase 1: Base robusta offline clínico esencial.
  - Activar PWA correctamente.
  - Usar IndexedDB como única fuente local.
  - Pacientes, catálogos, búsqueda, registro de pacientes y creación de consultas deben funcionar offline.
  - Sincronización automática al reconectar y botón manual “Sincronizar”.
  - Indicador global: online/offline, última sincronización, cambios pendientes, errores.

- Fase 2: Edición y conflictos.
  - Soportar actualización offline de pacientes y consultas.
  - Agregar `clientMutationId`, `baseLastModified` y respuestas idempotentes.
  - Crear vista o panel de conflictos.
  - Política recomendada:
    - catálogos: servidor gana;
    - nuevas consultas: se agregan sin pisar;
    - edición de paciente: detectar conflicto y pedir revisión;
    - edición de consulta existente: detectar conflicto y conservar ambas versiones hasta resolver.

- Fase 3: Cobertura extendida.
  - Incluir reportes generados desde datos locales cuando sea posible.
  - Incluir historial de actividad local y sincronizado.
  - Evaluar administración de usuarios como modo “solo online” al inicio, por seguridad.
  - Añadir limpieza controlada de cola sincronizada y migraciones Dexie versionadas.

- Fase 4: Toda la app.
  - Revisar cada pantalla y clasificarla como `offline read`, `offline write`, `online only`.
  - Completar entidades clínicas adicionales si se editan fuera del JSON de consulta.
  - Añadir observabilidad de sincronización: errores, reintentos, conflictos, duración y último resultado.

## APIs e Interfaces
- Mantener `/api/sync/up`, pero cambiar el contrato para aceptar lotes:
  - `deviceId`
  - `userId`
  - `items[]`
  - cada item con `clientMutationId`, `entity`, `operation`, `uuidOffline`, `baseLastModified`, `payload`.
- Mantener `/api/sync/down`, pero hacerlo incremental con `since`.
- Agregar respuesta de sync:
  - `accepted[]`
  - `rejected[]`
  - `conflicts[]`
  - `mappings[]`
  - `serverTime`
- Agregar campos DTO donde falten:
  - `ConsultaDTO.uuidOffline`
  - `ConsultaDTO.lastModified`
  - `ConsultaDTO.syncStatus`
  - opcionalmente `version` si se decide usar `@Version` en JPA.
- Recomendación backend: agregar `@Version` o equivalente a `Paciente` y `Consulta` para control optimista real.

## Pruebas
- Frontend:
  - crear paciente offline, recargar app, verificar persistencia;
  - reconectar y verificar mapping `uuidOffline -> idPaciente`;
  - crear consulta offline para paciente ya sincronizado;
  - crear paciente offline y luego consulta offline antes de sincronizar;
  - simular fallo de red y verificar que la cola no pierde datos;
  - verificar que la app abre sin internet después del primer load.
- Backend:
  - repetir dos veces el mismo `clientMutationId` y confirmar que no duplica;
  - subir paciente con cédula ya existente y confirmar mapping correcto;
  - conflicto por `lastModified` divergente devuelve `409` o entrada en `conflicts`;
  - sync incremental devuelve solo cambios posteriores a `since`.
- Integración:
  - dos usuarios editan el mismo paciente offline y sincronizan en distinto orden;
  - reconexión intermitente durante `syncUp`;
  - sesión expirada durante sincronización conserva cola local y pide login;
  - catálogos se actualizan sin borrar cambios clínicos pendientes.

## Supuestos
- Se implementará por fases porque el objetivo final es toda la app, pero el primer entregable robusto será clínico esencial.
- IndexedDB/Dexie será la fuente offline principal; `localStorage` queda solo para sesión y preferencias ligeras.
- Las pantallas administrativas sensibles pueden quedar temporalmente online-only hasta definir reglas de seguridad offline.
- La prioridad es no perder datos ni sobrescribir en silencio, incluso si eso implica mostrar conflictos para revisión manual.
