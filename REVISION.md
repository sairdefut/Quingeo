# Revisión Integral del Proyecto HCE - Historia Clínica Electrónica

## 📋 Información General

| Campo | Valor |
|-------|-------|
| **Nombre del Proyecto** | Quingeo - HCE |
| **Tipo** | Sistema de Historia Clínica Electrónica |
| **Arquitectura** | Offline-First con sincronización bidireccional |
| **Estado del Repo** | Sincronizado con origin/main |

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        DOCKER COMPOSE                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │   Frontend   │  │   Backend    │  │       MySQL           │
│  │   (Nginx)    │──│ (Spring Boot)│──│      (v8.0)           │
│  │   Puerto 80  │  │  Puerto 8080 │  │     Puerto 3306       │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
│         │                 │                     │             │
│         │         ┌───────┴───────┐            │             │
│         │         │   Synced by   │            │             │
│         │         │    Nginx       │            │             │
│         │         └───────────────┘            │             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                 ┌────────────────────────┐
                 │   IndexedDB (Dexie.js) │
                 │   (Navegador Cliente)  │
                 └────────────────────────┘
```

---

## 🛠️ Stack Tecnológico

### Backend
- **Lenguaje:** Java 21
- **Framework:** Spring Boot 3.x
- **Seguridad:** Spring Security + JWT (HttpOnly Cookies)
- **ORM:** JPA / Hibernate
- **Base de Datos:** MySQL 8.0

### Frontend
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Estilos:** Bootstrap 5 + CSS Custom
- **Base de Datos Local:** IndexedDB (Dexie.js)
- **Sincronización:** SyncService con reintentos y backoff exponencial

### Infraestructura
- **Contenedores:** Docker + Docker Compose
- **Servidor Web:** Nginx (Alpine)
- **PUA:** Configurado con Service Workers

---

## 📦 Estructura del Proyecto

```
/Users/famitry/Documents/Quingeo/
├── .env                           # Variables de entorno
├── .env.example                   # Ejemplo de variables
├── README.md                      # Documentación principal
├── RESUMEN_CAMBIOS.md             # Resumen de cambios técnicos
├── PLAN.md                        # Plan de trabajo de Daniel
├── CAMBIOS.md                     # Historial de cambios
├── ESTADO_PROYECTO_PRESENTACION.md
├── DOCKER_README.md
├── Dump20260127.sql               # Dump de base de datos
├── docker-compose.yml             # Orquestación de servicios
├── start.bat                      # Script de inicio
│
├── backend-hce/                   # Backend Java Spring Boot
│   ├── src/main/java/
│   │   └── ec/gob/salud/hce/backend/
│   │       ├── BackendHceApplication.java
│   │       ├── config/            # Configuración Spring
│   │       ├── controller/        # Controladores REST
│   │       ├── entity/            # Entidades JPA
│   │       ├── repository/        # Repositorios
│   │       ├── service/           # Lógica de negocio
│   │       ├── security/          # JWT, filtros, seguridad
│   │       └── dto/               # Objetos de transferencia
│   ├── pom.xml
│   └── Dockerfile
│
├── hce_frontend/                  # Frontend React
│   ├── src/
│   │   ├── components/           # Componentes reutilizables
│   │   ├── pages/                # Páginas de la aplicación
│   │   │   ├── auth/             # Login, autenticación
│   │   │   ├── admin/            # Administración
│   │   │   ├── historial/        # Historia clínica
│   │   │   └── ...
│   │   ├── services/             # Servicios de API y sync
│   │   │   ├── authSession.ts    # Manejo de sesión
│   │   │   ├── syncService.ts    # Sincronización offline
│   │   │   └── dbPacienteService.ts
│   │   ├── db/                   # Configuración IndexedDB
│   │   │   └── db.ts
│   │   ├── models/               # Modelos TypeScript
│   │   └── styles/               # Estilos CSS
│   ├── package.json
│   ├── vite.config.ts
│   ├── nginx.conf               # Configuración Nginx
│   └── Dockerfile
│
└── db/
    └── patches/                 # Patches de base de datos
        └── 001-fix-azuay-parroquias.sql
```

---

## 🔐 Autenticación y Seguridad

### Implementado
- ✅ JWT con cookies HttpOnly (no localStorage)
- ✅ Login con credenciales de base de datos
- ✅ Roles de usuario (Admin, etc.)
- ✅ CORS configurado por variable de entorno
- ✅ Reintentos con backoff exponencial en syncUp

### Pendiente
- ⚠️ JWT_SECRET hardcodeado en JwtService.java

---

## 🔄 Sistema de Sincronización Offline-First

### Flujo Sync Down (Servidor → Cliente)
1. Frontend llama a `/api/sync/down`
2. Backend retorna pacientes, catálogos y consultas
3. Frontend transforma datos y guarda en IndexedDB

### Flujo Sync Up (Cliente → Servidor)
1. Usuario crea paciente sin internet
2. Se guarda localmente con uuidOffline
3. Se añade a Cola de Sincronización
4. Al detectar conexión, se envía automáticamente
5. Backend devuelve ID real y se actualiza registro local

---

## 📊 Funcionalidades Implementadas

### Módulo Pacientes
- ✅ Registro de pacientes con validación
- ✅ Búsqueda por cédula
- ✅ Listado de pacientes con paginación
- ✅ Historial clínico por paciente

### Módulo Historia Clínica
- ✅ Antecedentes perinatales
- ✅ Antecedentes familiares
- ✅ Antecedentes personales
- ✅ Examen físico
- ✅ Diagnósticos (CIE-10) - *Con problemas*
- ✅ Plan terapéutico
- ✅ Estudios y laboratorios

### Módulo Administración
- ✅ Gestión de usuarios
- ✅ Roles y permisos
- ✅ Panel de administración

### Reportes
- ✅ Generación de PDF de consulta
- ✅ Reporte médico completo

---

## ⚠️ Problemas Conocidos

### 1. Catálogo CIE-10 (Alta Prioridad)
- **Problema:** El catálogo de enfermedades CIE-10 no se carga correctamente
- **Síntoma:** Error "Unexpected end of JSON input" al guardar diagnósticos
- **Causa:** El backend no devuelve datos de enfermedades o la sincronización falla
- **Estado:** Pendiente de solución

### 2. Credenciales Semilla
- **Problema:** El backend resetea contraseñas de usuarios existentes en cada inicio
- **Causa:** Lógica en BackendHceApplication.java que reescribe usuarios
- **Estado:** Pendiente de corrección

### 3. Hardcoded de Catálogos
- **Problema:** Algunas parroquias y etnias están hardcodeadas en dbPacienteService.ts
- **Parroquias soportadas:** Tarqui, El Vecino, Baños, Totoracocha
- **Estado:** Pendiente de dinamizar

### 4. Merge en syncDown
- **Problema:** Posible pérdida de datos locales en sincronización
- **Estado:** Pendiente de implementar merge seguro

---

## 👥 Equipo y Contribuciones

### Commits Recientes
```
c033ab7 - Revert "docs: add project plan overview"
976b252 - docs: add project plan overview
55af3e3 - fix: load full Ecuador parish catalog
eb4df2b - fix: sync catalogs when opening patient registration
61e2e5f - fix: restore diagnosis catalogs and consultation sync
64c4245 - fix: restore patient registration and Azuay parish catalogs
9a649d4 - Merge pull request #7 from sairdefut/feature/daniel/seguridad-consolidada
```

### Ramas Activas
- `main` - Rama principal (sincronizada)
- `develop` - Rama local de desarrollo
- `feature/daniel/seguridad-consolidada` - Rama con cambios de seguridad

### Credenciales por Defecto
- **Usuario:** `amora`
- **Contraseña:** `Salud2026!`

---

## 📱 Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/logout` | Cerrar sesión |
| GET | `/api/sync/down` | Descargar datos del servidor |
| POST | `/api/sync/up` | Subir cambios pendientes |
| GET | `/api/pacientes` | Listar pacientes |
| POST | `/api/pacientes` | Crear paciente |
| GET | `/api/catalogos` | Obtener catálogos |
| GET | `/api/admin/usuarios` | Listar usuarios (admin) |

---

## 🚀 Cómo Ejecutar

### Con Docker (Recomendado)
```bash
cd /Users/famitry/Documents/Quingeo
docker-compose up -d
```

### Acceso
- **Frontend:** http://localhost
- **Backend:** http://localhost:8080
- **MySQL:** localhost:3306

---

## 📝 Tareas Pendientes

### Alta Prioridad
1. 🔴 Solucionar error de CIE-10
2. 🟡 Corregir lógica de reset de contraseñas seed

### Media Prioridad
1. Eliminar hardcoding de catálogos
2. Implementar merge seguro en syncDown
3. Dynamizar parroquias y etnias

### Baja Prioridad
1. Externalizar JWT_SECRET
2. Implementar Flyway para migraciones
3. Optimizar rendimiento IndexedDB

---

## 📅 Fecha de Revisión

**Fecha:** 13 de Mayo de 2026  
**Revisor:** opencode (asistencia automática)  
**Proyecto:** Quingeo - HCE