# Proyecto HCE - Historia Clínica Electrónica (Offline-First)

Este proyecto implementa un sistema de Historia Clínica Electrónica (HCE) con una arquitectura de microservicios contenerizada y capacidades **Offline-First**, permitiendo el registro de pacientes y consultas incluso sin conexión a internet.

---

## 🚀 Despliegue Rápido (Quick Start)

### 1. Requisitos Previos
*   Tener **Docker Desktop** instalado y **en ejecución**.
*   (Opcional) Git para clonar el repositorio.

### 2. Comandos de Instalación
Abre una terminal (PowerShell, CMD o Bash) en la carpeta raíz del proyecto y ejecuta:

```bash
# 1. Construir e iniciar todos los servicios (Backend, Frontend, Base de Datos)
docker-compose up --build -d

# 2. Verificar que los contenedores estén corriendo
docker-compose ps
```

### 3. Acceso al Sistema
Una vez iniciados los contenedores, accede a:
*   **Frontend (App):** [http://localhost](http://localhost)
*   **Backend (API):** [http://localhost:8080](http://localhost:8080)
*   **Base de Datos (MySQL):** Puerto `3306` (Usuario: `root`, Password: `root`, DB: `hce_prueba2`)

---

## 🛠️ Arquitectura del Sistema

El proyecto utiliza **Docker Compose** para orquestar los siguientes servicios:

*   **hce-mysql (Base de Datos):**
    *   Imagen: `mysql:8.0`
    *   Persistencia: Volumen `hce-mysql-data` (Los datos NO se pierden al reiniciar).
    *   Inicialización: Carga automática de `Dump20260127.sql` si la base está vacía.

*   **hce-backend (API REST):**
    *   Tecnología: Java 21 (Spring Boot).
    *   Puerto Interno: `8080`.
    *   Función: Gestión de lógica de negocio, persistencia JPA y endpoints de sincronización.

*   **hce-frontend (Cliente Web):**
    *   Tecnología: React + Vite + TypeScript.
    *   Servidor: Nginx (Alpine).
    *   Puerto: `80`.
    *   Función: Interfaz de usuario y lógica de sincronización local (IndexedDB).

---

## 📲 Funcionamiento Offline-First

El sistema permite trabajar sin conexión gracias a una base de datos local en el navegador (`IndexedDB` vía Dexie.js).

### Flujo de Sincronización (`SyncService.ts`)

#### 1. Descarga de Datos (Sync Down)
Al iniciar sesión o recuperar conexión:
*   El frontend solicita `/api/sync/down`.
*   El backend envía los últimos datos del servidor.
*   El frontend **transforma** los datos (ej: une nombres y apellidos, estructura objetos anidados) y los guarda en IndexedDB.

#### 2. Subida de Cambios (Sync Up)
Al crear un paciente sin internet:
*   Se guarda localmente con un `uuidOffline`.
*   Se añade a una **Cola de Sincronización**.
*   Al detectar conexión (`window.ononline`), el sistema envía automáticamente los cambios pendientes al backend (`/api/sync/up`).
*   El backend devuelve el ID real de base de datos, y el frontend actualiza su registro local.

---

## ⚠️ Notas Importantes (Known Issues)

> [!IMPORTANT]
> **IDs "QUEMADOS" (Hardcoded):**
> Actualmente, para facilitar la demostración sin un sistema completo de gestión de catálogos, algunos IDs de ubicación y etnia están fijos en el código del frontend (`dbPacienteService.ts`).

*   **Parroquias Soportadas:**
    *   "Tarqui" (ID 120)
    *   "El Vecino" (ID 92)
    *   "Baños" (ID 103)
    *   "Totoracocha" (ID 100)
*   **Grupos Étnicos:** Mestizo, Blanco, Indígena, Afroecuatoriano.

**Nota:** Si se intenta registrar una ubicación no listada aquí, el backend podría recibir un valor nulo.

---

## 🔮 Roadmap (Futuras Mejoras)

1.  **Gestión Dinámica de Catálogos:**
    *   Implementar endpoints en el backend para servir parroquias, cantones y etnias.
    *   Sincronizar estos catálogos en IndexedDB para eliminar los IDs fijos.

2.  **Sincronización Completa de Consultas:**
    *   Extender la lógica de `syncUp` para soportar la subida de nuevas consultas médicas individuales, no solo pacientes.

3.  **Seguridad:**
    *   Habilitar seguridad JWT en los endpoints de sincronización.
    *   Implementar manejo seguro de sesiones en el frontend.

4.  **PWA (Progressive Web App):**
    *   Configurar Service Workers para cachear los archivos estáticos (HTML, CSS, JS), permitiendo que la app cargue "instantáneamente" sin red.

# Quingeo

