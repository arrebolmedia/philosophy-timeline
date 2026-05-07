# Deploy — Historia de la Filosofía Timeline

## Infraestructura

| Componente | Detalle |
|------------|---------|
| Servidor | `root@64.23.231.86` |
| App dir | `/var/www/timeline` |
| Frontend PM2 | `filosofia-frontend` (id=1) |
| Backend PM2 | `filosofia-backend` (id=0) |
| DB producción | PostgreSQL nativo, puerto `5433`, usuario `filosofia`, base `filosofia` |
| DB local | Docker `timeline-db-1`, usuario `filosofia`, base `historia_filosofia` |

## Deploy de código (frontend/backend)

```powershell
ssh root@64.23.231.86 "cd /var/www/timeline && git pull origin main && cd frontend && npm run build && pm2 restart filosofia-frontend && pm2 status"
```

## Sincronización de DB local → producción

Los cambios de DB (filósofos, statements, conexiones) **no se aplican automáticamente**. Hay que sincronizarlos manualmente.

### Insertar en producción con IDs explícitos

Siempre usar `OVERRIDING SYSTEM VALUE` para mantener IDs idénticos entre local y producción:

```sql
INSERT INTO philosophers (id, name, ...) OVERRIDING SYSTEM VALUE VALUES (...);
INSERT INTO statements (id, philosopher_id, ...) OVERRIDING SYSTEM VALUE VALUES (...);
INSERT INTO connections (id, statement_from_id, ...) OVERRIDING SYSTEM VALUE VALUES (...);
SELECT setval(pg_get_serial_sequence('philosophers', 'id'), (SELECT MAX(id) FROM philosophers));
SELECT setval(pg_get_serial_sequence('statements', 'id'), (SELECT MAX(id) FROM statements));
SELECT setval(pg_get_serial_sequence('connections', 'id'), (SELECT MAX(id) FROM connections));
```

### Ejecutar SQL en producción

```powershell
Get-Content c:\tmp\mi_archivo.sql | ssh root@64.23.231.86 "sudo -u postgres psql -p 5433 -d filosofia"
```

### Verificar estado de producción

```powershell
ssh root@64.23.231.86 "sudo -u postgres psql -p 5433 -d filosofia -c 'SELECT MAX(id) FROM philosophers; SELECT MAX(id) FROM statements; SELECT MAX(id) FROM connections;'"
```

## Versioning

Seguir semver `MAJOR.MINOR.PATCH`:
- **PATCH** (`1.3.x`): contenido nuevo (filósofos, statements, conexiones, fixes menores)
- **MINOR** (`1.x.0`): cambios de UI o funcionalidad significativa
- **MAJOR** (`x.0.0`): cambios de arquitectura

Archivo de versión: `frontend/src/version.ts`

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
