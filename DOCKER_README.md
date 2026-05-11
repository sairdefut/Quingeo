# 🐳 Sistema HCE - Dockerizado

## Inicio Rápido

### Requisitos Previos
- Docker Desktop instalado
- Docker Compose v2+
- 4GB RAM disponible

### 1️⃣ Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales (opcional)
# Define al menos MYSQL_ROOT_PASSWORD y HCE_DEFAULT_USER_PASSWORD
```

### 2️⃣ Iniciar el Sistema

```bash
# Construir e iniciar todos los contenedores
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f
```

Espera ~60 segundos para que todo esté listo.

### 3️⃣ Verificar que Funcione

**Frontend Web:**
```bash
# Abrir en navegador
http://localhost
```

**Backend API:**
```bash
curl http://localhost:8080/actuator/health
```

**Base de Datos:**
```bash
docker exec -it hce-mysql mysql -uroot -p<TU_PASSWORD_MYSQL> -e "SHOW DATABASES;"
```

---

## 🎯 Acceso a los Servicios

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **Frontend Web** | http://localhost | - |
| **Backend API** | http://localhost:8080 | - |
| **MySQL** | localhost:3306 | root / valor de `MYSQL_ROOT_PASSWORD` |
| **Health Check Backend** | http://localhost:8080/actuator/health | - |

> **Nota**: El frontend hace proxy de `/api/*` → `backend:8080/api/*` automáticamente

---

## 🛠️ Comandos Útiles

### Ver Estado de Contenedores
```bash
docker-compose ps
```

### Ver Logs
```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo MySQL
docker-compose logs -f mysql
```

### Detener el Sistema
```bash
docker-compose down
```

### Detener y Eliminar Datos
```bash
# ⚠️ CUIDADO: Elimina la base de datos
docker-compose down -v
```

### Reiniciar un Servicio
```bash
docker-compose restart backend
```

### Reconstruir Imagen del Backend
```bash
docker-compose build backend
docker-compose up -d backend
```

---

## 🗄️ Base de Datos

### Acceder a MySQL
```bash
docker exec -it hce-mysql mysql -uroot -p<TU_PASSWORD_MYSQL> hce_prueba2
```

### Backup de la BD
```bash
docker exec hce-mysql mysqldump -uroot -p<TU_PASSWORD_MYSQL> hce_prueba2 > backup_$(date +%Y%m%d).sql
```

### Restaurar Backup
```bash
docker exec -i hce-mysql mysql -uroot -p<TU_PASSWORD_MYSQL> hce_prueba2 < backup.sql
```

---

## 🔧 Desarrollo Local

### Modo Desarrollo (sin Docker)

**Backend:**
```bash
cd backend-hce/backend-hce
./mvnw spring-boot:run
```

**MySQL (con Docker):**
```bash
docker-compose up -d mysql
```

---

## 📦 Estructura de Volúmenes

```
hce-mysql-data/     # Datos persistentes de MySQL
```

Los datos sobreviven a reinicios de contenedores.

---

## ⚠️ Troubleshooting

### Error: Puerto 3306 ya en uso
```bash
# Detener MySQL local
sudo systemctl stop mysql
# o en Windows: Services → MySQL → Stop
```

### Error: Puerto 8080 ya en uso
```bash
# Cambiar en .env
BACKEND_PORT=8081
```

### Backend no se conecta a MySQL
```bash
# Verificar que MySQL esté healthy
docker-compose ps

# Ver logs de MySQL
docker-compose logs mysql
```

### Reiniciar desde cero
```bash
docker-compose down -v
docker-compose up -d
```


---

## 📝 Notas

- El dump SQL se ejecuta **solo la primera vez** que se crea el contenedor MySQL
- Para reinicializar la BD: `docker-compose down -v && docker-compose up -d`
- Health checks aseguran que los servicios estén listos antes de aceptar tráfico
