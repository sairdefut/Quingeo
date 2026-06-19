# Sistema HCE con Docker

## Arquitectura de producción

El único punto de entrada público es el proxy Nginx:

| Servicio | Acceso |
|---|---|
| Aplicación | `https://hce.codifyhub.dev/` |
| API | `https://hce.codifyhub.dev/api/` |
| Nginx | Puertos públicos `80` y `443` |
| Frontend | Solo red interna Docker, puerto `80` |
| Backend | Solo red interna Docker, puerto `8080` |
| MySQL | Solo red interna Docker, puerto `3306` |

El tráfico HTTP se redirige a HTTPS. Los certificados de Let's Encrypt y los archivos de desafío ACME se conservan en volúmenes Docker.

## Primer despliegue HTTPS

### Requisitos

- Docker Engine y Docker Compose v2.
- El registro DNS `A` de `hce.codifyhub.dev` debe apuntar a `34.45.247.176`.
- Los puertos TCP `80` y `443` deben estar abiertos en el firewall del servidor y del proveedor cloud.
- Ningún otro proceso debe estar utilizando los puertos `80` o `443`.

### 1. Configurar el entorno

```bash
cp .env.example .env
```

Define como mínimo valores seguros para `MYSQL_ROOT_PASSWORD` y `HCE_DEFAULT_USER_PASSWORD`. Conserva este origen permitido:

```dotenv
ALLOWED_ORIGINS=https://hce.codifyhub.dev
```

### 2. Obtener el certificado inicial

El proxy HTTPS todavía no debe estar levantado, porque Certbot necesita ocupar temporalmente el puerto 80:

```bash
docker compose down
docker compose --profile cert-init run --rm --service-ports certbot-init
```

Certbot se registra sin correo y almacena el certificado en el volumen `hce-certbot-conf`.

### 3. Levantar la aplicación

```bash
docker compose up -d --build
docker compose ps
```

Comprueba el acceso en `https://hce.codifyhub.dev/`. El contenedor `certbot` revisará la renovación cada 12 horas y Nginx recargará los certificados periódicamente.

## Verificación

```bash
# Validar la configuración resuelta de Compose
docker compose config --quiet

# Validar Nginx dentro del contenedor
docker compose exec reverse-proxy nginx -t

# Consultar el frontend y la API a través del proxy
curl -I http://hce.codifyhub.dev/
curl -I https://hce.codifyhub.dev/
curl https://hce.codifyhub.dev/api/actuator/health

# Ensayar la renovación sin modificar el certificado vigente
docker compose exec certbot certbot renew --dry-run --webroot --webroot-path /var/www/certbot
```

Para comprobar la PWA, abre la aplicación una vez con Internet y confirma en las herramientas del navegador que `/sw.js` controla la página. Después desconecta la red y refresca una ruta como `/dashboard`.

## Operación

```bash
# Estado
docker compose ps

# Logs
docker compose logs -f
docker compose logs -f reverse-proxy certbot

# Reiniciar un servicio
docker compose restart backend

# Reconstruir la aplicación
docker compose up -d --build

# Detener sin borrar datos ni certificados
docker compose down
```

Para acceder a MySQL desde el servidor usa el propio contenedor:

```bash
docker exec -it hce-mysql mysql -uroot -p hce_prueba2
```

No uses `docker compose down -v` salvo que quieras eliminar tanto la base de datos como los certificados persistentes.

## Resolución de problemas

- Si Certbot no valida el dominio, confirma primero el DNS con `nslookup hce.codifyhub.dev` y revisa el firewall del puerto 80.
- Si Nginx indica que no encuentra `fullchain.pem`, ejecuta nuevamente el paso de obtención inicial antes de levantar el stack.
- Si el navegador continúa mostrando HTTP, verifica que estés entrando mediante el dominio y no mediante la IP.
- Si la API rechaza el origen, confirma que `.env` contenga `ALLOWED_ORIGINS=https://hce.codifyhub.dev` y recrea el backend.
