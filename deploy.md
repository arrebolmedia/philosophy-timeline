# Deploy — Historia de la Filosofía Timeline

> Actualizado 2026-10-26 (mudanza a `anthonycazares.cafe/timeline`). La versión anterior de
> este archivo describía un servidor ya retirado (`64.23.231.86`, PM2, PostgreSQL nativo).

## Infraestructura

| Componente | Detalle |
|------------|---------|
| URL pública | `https://anthonycazares.cafe/timeline` (el subdominio `timeline.anthonycazares.cafe` redirige 301 conservando ruta y query) |
| Servidor | `root@data.arrebolweddings.com` (SSH en el puerto 2222, ya en `~/.ssh/config`) |
| App dir | `/opt/timeline` (checkout de git + `docker-compose.yml` de producción **fuera de git**, con secretos) |
| Contenedores | `timeline-frontend` (Next, :3000), `timeline-backend` (Express/Prisma, :5000), `timeline-db` (postgres:17-alpine) |
| Proxy | Traefik v2.10 (red `traefik-public`); reglas en las labels del compose de producción |
| DB producción | `docker exec -i timeline-db psql -U filosofia -d filosofia` |
| DB local | Docker `timeline-db-1`, usuario `filosofia`, base `historia_filosofia` (puerto 5435) |

Rutas en Traefik (todas sobre `Host(anthonycazares.cafe)`; el sitio principal atiende el resto del dominio con prioridad 200):

| Ruta | Destino | Prioridad |
|------|---------|-----------|
| `/timeline/api/auth/*`, `/timeline/api/og` | frontend (NextAuth y OG viven en Next) | 320 |
| `/timeline/api/*` | backend, con `stripprefix /timeline` | 310 |
| `/timeline*` | frontend (Next con `basePath: '/timeline'`, sin quitar prefijo) | 300 |
| `Host(timeline.anthonycazares.cafe)` | redirect 301 → `https://anthonycazares.cafe/timeline/…` | 1000 |

## Deploy de código (frontend/backend)

En el host solo existe `docker-compose` standalone (no el plugin `docker compose`). Los Dockerfiles
de `frontend/` y `backend/` existen solo en el servidor: no sobrescribirlos.

```bash
ssh root@data.arrebolweddings.com
cd /opt/timeline
docker tag timeline-frontend:latest timeline-frontend:previo   # para volver atrás
git pull
docker-compose build timeline-frontend                          # la imagen vieja sigue sirviendo mientras compila
docker-compose up -d --no-deps timeline-frontend timeline-backend
```

`NEXT_PUBLIC_API_URL` y `NEXT_PUBLIC_BASE_URL` (= `https://anthonycazares.cafe/timeline`) se incrustan
en el build: cambiar sus valores exige reconstruir la imagen del frontend. `NEXTAUTH_URL` debe incluir
la ruta: `https://anthonycazares.cafe/timeline/api/auth`.

**Volver atrás:** `docker tag timeline-frontend:previo timeline-frontend:latest` y
`docker-compose up -d --no-deps timeline-frontend` (si también cambió el compose, restaurar el
respaldo `docker-compose.yml.bak-*` antes).

## Sincronización de DB local → producción

Los cambios de DB (filósofos, statements, conexiones) **no se aplican automáticamente**.

```sql
INSERT INTO philosophers (id, name, ...) OVERRIDING SYSTEM VALUE VALUES (...) ON CONFLICT (id) DO NOTHING;
INSERT INTO statements (id, philosopher_id, ...) OVERRIDING SYSTEM VALUE VALUES (...) ON CONFLICT (id) DO NOTHING;
INSERT INTO connections (id, statement_from_id, ...) OVERRIDING SYSTEM VALUE VALUES (...) ON CONFLICT (id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('philosophers', 'id'), (SELECT MAX(id) FROM philosophers));
SELECT setval(pg_get_serial_sequence('statements', 'id'), (SELECT MAX(id) FROM statements));
SELECT setval(pg_get_serial_sequence('connections', 'id'), (SELECT MAX(id) FROM connections));
```

⚠️ Los IDs de `references` antiguos difieren entre local y producción: enlazar referencias existentes
por título (`(SELECT id FROM "references" WHERE title = '…' ORDER BY id LIMIT 1)`), no por número.

```bash
# Escribir el SQL con un editor (no heredoc de PowerShell: rompe tildes y eñes), subir y ejecutar:
scp /c/tmp/sync.sql root@data.arrebolweddings.com:/tmp/sync.sql && \
  ssh root@data.arrebolweddings.com "docker exec -i timeline-db psql -U filosofia -d filosofia -v ON_ERROR_STOP=1 < /tmp/sync.sql"
```

## Versioning

Seguir semver `MAJOR.MINOR.PATCH` (archivo: `frontend/src/version.ts`):
- **PATCH**: contenido nuevo (filósofos, statements, conexiones), fixes menores
- **MINOR**: cambios de UI, rutas o funcionalidad significativa
- **MAJOR**: cambios de arquitectura

## Constraints activos en DB

- `trg_no_same_philosopher`: impide conexiones entre statements del mismo filósofo
- Triggers batch changelog: un log por sentencia SQL, no por fila

## Comandos locales útiles

```powershell
# Consulta local
docker exec -i timeline-db-1 psql -U filosofia -d historia_filosofia -c "SELECT ..."

# Aplicar SQL local
Get-Content c:\tmp\archivo.sql | docker exec -i timeline-db-1 psql -U filosofia -d historia_filosofia
```
