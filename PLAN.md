# Plan de Daniel

## 1. Alcance asignado a Daniel

Estas fueron las 4 tareas asignadas a Daniel:

1. Eliminar credenciales del repo
2. Ajustar CORS
3. Agregar reintentos con backoff
4. Migrar tokens a cookies HttpOnly

La rama consolidada de trabajo quedó en:

- `feature/daniel/seguridad-consolidada`

## 2. Cambios realizados por Daniel

### 2.1 Eliminar credenciales del repo

Se movieron valores sensibles fuera del código fuente y se pasó a usar variables de entorno.

Archivos principales tocados:

- `backend-hce/src/main/java/ec/gob/salud/hce/backend/BackendHceApplication.java`
- `backend-hce/src/main/resources/application.properties`
- `docker-compose.yml`
- `.env.example`
- `README.md`
- `DOCKER_README.md`

Qué se cambió:

- se eliminó el uso hardcodeado de contraseña de base de datos en `application.properties`
- se pasó a usar `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME` y `SPRING_DATASOURCE_PASSWORD`
- se introdujo `HCE_DEFAULT_USER_PASSWORD` para usuarios semilla
- se actualizó la documentación para que ya no sugiera credenciales embebidas como `root/root`

### 2.2 Ajustar CORS

Archivos principales tocados:

- `backend-hce/src/main/java/ec/gob/salud/hce/backend/config/SecurityConfig.java`
- `docker-compose.yml`
- `.env.example`

Qué se cambió:

- se dejó de permitir cualquier origen con `*`
- se agregó la variable `ALLOWED_ORIGINS`
- se parsea una lista separada por comas y se habilitan credenciales de forma compatible con cookies

### 2.3 Agregar reintentos con backoff

Archivo principal tocado:

- `hce_frontend/src/services/syncService.ts`

Qué se cambió:

- se agregaron reintentos para `syncUp()`
- se definieron pausas de `1000`, `2000` y `4000` ms
- se mantiene el intento hasta agotar el backoff
- se informa error al usuario cuando no se logra completar la sincronización

### 2.4 Migrar tokens a cookies HttpOnly

Archivos principales tocados:

- `backend-hce/src/main/java/ec/gob/salud/hce/backend/controller/AuthController.java`
- `backend-hce/src/main/java/ec/gob/salud/hce/backend/security/JwtAuthFilter.java`
- `backend-hce/src/main/java/ec/gob/salud/hce/backend/security/JwtService.java`
- `hce_frontend/src/pages/auth/Login.tsx`
- `hce_frontend/src/pages/HeaderUsuario.tsx`
- `hce_frontend/src/pages/admin/AdminUsuarios.tsx`
- `hce_frontend/src/services/dbPacienteService.ts`
- `hce_frontend/src/services/syncService.ts`
- `hce_frontend/src/services/DTO/api.js`

Qué se cambió:

- el backend ya no debería depender de exponer el JWT al frontend
- el login pasa a responder con cookie `HttpOnly`
- se agregó endpoint de logout que limpia la cookie
- el filtro JWT extrae el token desde cookie en vez de cabecera `Authorization`
- el frontend cambió a `credentials: 'include'`
- se dejó de guardar el token en `localStorage`

## 3. Ajustes adicionales hechos por alineación con el análisis

Además de las 4 tareas, se dejó alineada la documentación y la configuración al estado real:

- `README.md`
- `DOCKER_README.md`
- `RESUMEN_CAMBIOS.md`
- `.gitignore`

También se excluyeron del repo artefactos locales de análisis:

- `SPLIT.md`
- `sistemasalud_tech_analysis_v2.html`

## 4. Estado de verificación alcanzado

- backend: `sh ./mvnw test` OK
- frontend: `npm run build:check` seguía fallando por errores TypeScript preexistentes fuera del alcance de Daniel

Errores preexistentes de frontend identificados entonces:

- imports `React` no usados
- `useNavigate` no usado en otros módulos
- variables no usadas en archivos fuera del alcance de Daniel

## 5. Problema detectado después: credenciales semilla

Se detectó una corrección pendiente en la lógica de usuarios semilla.

Estado actual del código:

- `BackendHceApplication.java` busca `amora` y `fvasquez`
- si existen, igual les vuelve a escribir la contraseña en cada arranque
- la contraseña usada sale de `HCE_DEFAULT_USER_PASSWORD`

Por qué es problema:

- la contraseña efectiva deja de depender solo de la base de datos
- cada reinicio del backend puede reescribirla
- genera confusión entre la data persistida y la configuración del entorno

Qué se debe hacer:

1. crear el usuario semilla solo si no existe
2. si el usuario ya existe, no sobrescribir su contraseña
3. si se quiere, actualizar solo nombre, apellido o cargo

## 6. Qué quedó resuelto del análisis HTML

Hallazgos del análisis que sí quedaron cubiertos por Daniel:

1. credenciales expuestas en repo
2. CORS permisivo
3. falta de reintentos con backoff en sincronización
4. uso de tokens accesibles desde frontend en vez de cookies HttpOnly

## 7. Qué sigue pendiente del análisis HTML

Estos puntos quedaron fuera del alcance original de Daniel y siguen como trabajo pendiente del proyecto:

1. eliminar hardcoding de catálogos
2. hacer merge seguro en `syncDown` para evitar pérdida de datos
3. corregir mismatches de tabla
4. introducir Flyway para migraciones
5. sincronizar catálogos en frontend
6. auditar tablas legacy
7. documentar estrategia JSON

## 8. Arreglos que ahora conviene hacer

### 8.1 Prioridad alta

1. corregir la lógica de seed para no resetear contraseñas existentes
2. verificar que el entorno ejecutado realmente use la versión más reciente de la rama consolidada
3. reconstruir contenedores con build limpio antes de validar login y cookies

### 8.2 Pendientes funcionales del análisis

1. Sebastian:
   - eliminar hardcoding de catálogos
   - merge seguro en `syncDown`
   - sincronizar catálogos en frontend

2. Jonnathan:
   - corregir mismatches de tabla
   - introducir Flyway
   - auditar tablas legacy
   - documentar estrategia JSON

### 8.3 Endurecimiento adicional futuro

Quedó identificado otro punto de seguridad que no era parte de las 4 tareas de Daniel:

1. externalizar la clave JWT hardcodeada en `backend-hce/src/main/java/ec/gob/salud/hce/backend/security/JwtService.java`

## 9. Guía operativa para la parte de Daniel

Si se retoma o se presenta el trabajo de Daniel, el enfoque correcto es:

1. partir de `feature/daniel/seguridad-consolidada`
2. presentar las 4 tareas originales como entregables cerrados
3. aclarar que los cambios de documentación fueron de soporte y alineación
4. aclarar que el problema de reset de contraseña de usuarios semilla es una corrección posterior detectada durante pruebas
5. no mezclar pendientes de Sebastian o Jonnathan como si fueran parte del alcance original de Daniel
