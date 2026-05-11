# Timeline — Historia de la Filosofía

## Proyecto

Timeline interactivo de la historia de la filosofía. Next.js frontend + Node backend + PostgreSQL.
Ver `deploy.md` para infraestructura, IDs, comandos de DB y deploy.

---

## Proceso consolidado: extracción de PDFs → DB

Este es el workflow estándar para procesar cada tema (M1T1, M1T2, …):

### Estructura de carpetas y archivos

- Base: `C:\Users\Marketing\OneDrive\Desktop\Licenciatura en Filosofía\`
- Carpeta: `M{N}. {Nombre del módulo}` (ej. `M3. Principios y Técnicas de la Investigación Filosófica`)
- Archivo: `M{N}T{T}. {Nombre del tema}.pdf` (ej. `M3T1. Valor de la investigación.pdf`)

### 1. Extracción de PDF (pdf-parse — sin API)

```powershell
node -e "
const fs = require('fs');
const pdfParse = require('C:/Projects/digest/node_modules/pdf-parse');
const buf = fs.readFileSync('ruta\\al\\archivo.pdf');
pdfParse(buf).then(d => fs.writeFileSync('C:/tmp/m{N}/m{N}t{T}.txt', d.text));
"
```

Lanzar en paralelo hasta 4 PDFs con `run_in_background: true`. Esperar notificación — no hacer polling.
**No usar Vision API** — pdf-parse extrae texto nativo, es gratis e instantáneo.

### 2. Análisis del contenido

Por cada tema extraído, identificar:
- **Filósofos nuevos** (no están en DB) — necesitan INSERT en `philosophers`
- **Filósofos existentes** con ángulo nuevo — solo INSERT en `statements`
- **Statements redundantes** — verificar siempre con `SELECT` antes de proponer

**Umbral de relevancia:** Entra si hay cita textual o paráfrasis con contenido filosófico propio del autor. No requiere que sea el tema central del PDF — basta con que aporte una idea argumentada, no solo una mención de pasada.

**Filósofos de peso faltantes** (ej. Hume, Locke, Avicena): agregar si el PDF ofrece un statement válido. Si solo los menciona de pasada, esperar a su módulo propio.

```powershell
# Verificar si existe filósofo
docker exec -i timeline-db-1 psql -U filosofia -d historia_filosofia -c "SELECT id, name FROM philosophers WHERE name ILIKE '%nombre%';"

# Ver statements existentes de un filósofo
docker exec -i timeline-db-1 psql -U filosofia -d historia_filosofia -c "SELECT s.id, s.text FROM statements s WHERE philosopher_id = <id>;"
```

### 3. Revisión con usuario

Presentar por tema: 2-3 líneas de contexto del tema → luego tabla:

| Filósofo | Statement | Dificultad | Categoría | Conexiones propuestas |
|----------|-----------|------------|-----------|----------------------|

Claude propone `difficulty_level` y `category_id` con justificación breve. Usuario confirma o ajusta antes de insertar.
No insertar nada hasta recibir aprobación explícita.

**Reglas de statements:**
- ~160 caracteres (una idea clara y completa)
- Sin redundancia con statements existentes del mismo filósofo
- Si hay duda entre dos formulaciones similares: proponer síntesis
- `difficulty_level`: 1=muy accesible, 2=accesible, 3=moderado, 4=complejo, 5=muy denso
- `category_id`: 1=Ética, 2=Metafísica, 3=Epistemología

**Reglas de conexiones:**
- Solo entre statements de filósofos **distintos** (trigger `trg_no_same_philosopher` lo bloquea)
- `connection_type`: `resonate` (coinciden) o `oppose` (se refutan)
- `strength` y `confidence`: 1-5
- Explicación: 1-2 frases que justifiquen la relación

### 4. Inserción local

```powershell
# Filósofos nuevos
docker exec -i timeline-db-1 psql -U filosofia -d historia_filosofia -c "
INSERT INTO philosophers (name, slug, birth_year, death_year, nationality, school_id, period_id, bio_short, updated_at)
VALUES (...) RETURNING id, name;"

# Statements
docker exec -i timeline-db-1 psql -U filosofia -d historia_filosofia -c "
INSERT INTO statements (philosopher_id, text, category_id, is_direct_quote, difficulty_level, updated_at)
VALUES (...) RETURNING id, philosopher_id, left(text, 65) AS preview;"

# Connections
docker exec -i timeline-db-1 psql -U filosofia -d historia_filosofia -c "
INSERT INTO connections (statement_from_id, statement_to_id, connection_type, strength, confidence, is_bidirectional, explanation)
VALUES (...) RETURNING id, statement_from_id, statement_to_id, connection_type;"
```

### 5. Sincronización a producción

**IMPORTANTE:** No usar heredoc de PowerShell con caracteres UTF-8 (tildes, ñ) — se corrompen en SSH.
El método correcto es escribir el SQL a un archivo y subirlo con `scp`:

```bash
# 1. Escribir SQL a c:\tmp\sync.sql con Write tool (soporta UTF-8)
# 2. Subir y ejecutar:
scp /c/tmp/sync.sql root@64.23.231.86:/tmp/sync.sql && ssh root@64.23.231.86 "sudo -u postgres psql -p 5433 -d filosofia -f /tmp/sync.sql"
```

El SQL siempre incluye `OVERRIDING SYSTEM VALUE` + `ON CONFLICT DO NOTHING` + `setval` al final:

```sql
INSERT INTO philosophers (id, ...) OVERRIDING SYSTEM VALUE VALUES (...) ON CONFLICT (id) DO NOTHING;
INSERT INTO statements (id, ...) OVERRIDING SYSTEM VALUE VALUES (...) ON CONFLICT (id) DO NOTHING;
INSERT INTO connections (id, ...) OVERRIDING SYSTEM VALUE VALUES (...) ON CONFLICT (id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('philosophers', 'id'), (SELECT MAX(id) FROM philosophers));
SELECT setval(pg_get_serial_sequence('statements', 'id'), (SELECT MAX(id) FROM statements));
SELECT setval(pg_get_serial_sequence('connections', 'id'), (SELECT MAX(id) FROM connections));
```

Hacer sync en background mientras se trabaja en el siguiente tema.

### 6. Versioning y deploy de código

Commit y deploy **al terminar el módulo completo**, no por tema individual.
Bump `frontend/src/version.ts` en PATCH una vez por módulo:

```typescript
export const VERSION = '1.3.x';
```

Deploy:
```powershell
ssh root@64.23.231.86 "cd /var/www/timeline && git pull origin main && cd frontend && npm run build && pm2 restart filosofia-frontend"
```

---

## IDs de referencia rápida

### Schools
| id | nombre |
|----|--------|
| 1 | Presocráticos | 2 | Sofistas | 3 | Platonismo | 4 | Aristotelismo |
| 5 | Estoicismo | 6 | Epicureísmo | 7 | Escolástica | 8 | Humanismo |
| 9 | Racionalismo | 10 | Empirismo | 11 | Idealismo Alemán | 12 | Positivismo |
| 13 | Existencialismo | 14 | Fenomenología | 15 | Filosofía Analítica |
| 17 | Neoplatonismo | 18 | Escepticismo | 19 | Nominalismo |

### Periods
| id | nombre |
|----|--------|
| 1 | Filosofía Antigua | 2 | Filosofía Moderna | 3 | Filosofía del s. XIX |
| 4 | Filosofía del s. XX | 5 | Filosofía Contemporánea | 6 | Filosofía Medieval | 7 | Renacimiento |

### Estado actual de IDs (actualizar tras cada batch)
- Filósofos: hasta **#143** (Umberto Eco)
- Statements: hasta **#357** (Eco — muerte espectáculo)
- Connections: hasta **#585** (M15 completo)

### Changelog de versiones (solo software/UI/UX)

**Regla:** Las versiones reflejan SOLO cambios de software (UI, UX, features, fixes). Las publicaciones de contenido filosófico se registran automáticamente en la categoría `proposiciones` vía triggers y NO bumpean versión.

| Versión | Fecha | Cambio |
|---------|-------|--------|
| 1.3.4 | 2026-05-07 | Fix: botón de reset zoom funciona sin filtro activo. |
| 1.3.3 | 2026-05-07 | Badge de conexiones en el timeline. |
| 1.3.2 | 2026-05-07 | Footer global, páginas /legal y /privacidad, sección Sobre mí. Fix: fechas de filósofo. |
| 1.3.1 | 2026-05-06 | UX: momentum drag/zoom, transiciones suaves al agrupar, fix conexiones extra, pointer-events, click-outside suave. |
| 1.3.0 | 2026-05-06 | Logs paginados de 10 en 10 + header fijo + spacing compacto. |
| 1.2.2 | 2026-05-05 | Registro de cambios automático mediante triggers PostgreSQL. |
| 1.2.1 | 2026-05-05 | Página de inicio rediseñada: hero con typing animation. |
| 1.2.0 | 2026-05-03 | Rediseño layout: eje diagonal único, filósofos y proposiciones sobre una sola línea. |
| 1.1.5 | 2026-04-28 | Fix race condition al hacer clic rápido. |
| 1.1.4 | 2026-04-25 | Hover reactivo muestra conexiones relacionadas. |
| 1.1.3 | 2026-04-22 | Compactación sin huecos al filtrar. |
| 1.1.2 | 2026-04-20 | Semicírculos SVG 180° (verdes acuerdo, rojos desacuerdo). |
| 1.1.1 | 2026-04-15 | Trigger batch changelog agrupa inserts del mismo módulo. |
| 1.1.0 | 2026-02-10 | NextAuth para panel de administración. |
| 1.0.0 | 2025-10-22 | Lanzamiento inicial — timeline con presocráticos. |

---

## Errores frecuentes y soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| `No se pueden conectar statements del mismo filósofo` | Trigger `trg_no_same_philosopher` | Verificar que `from` y `to` son de filósofos distintos |
| `Could not resolve authentication method` | `ANTHROPIC_API_KEY` no heredada en background | Leer key desde `c:\Projects\digest\.env` y setear `$env:ANTHROPIC_API_KEY` |
| IDs divergen entre local y prod | Inserciones sin `OVERRIDING SYSTEM VALUE` | Siempre usar el patrón con `ON CONFLICT DO NOTHING` + `setval` |
| Caracteres rotos en producción (tildes, ñ) | Heredoc de PowerShell corrompe UTF-8 en SSH | Escribir SQL con Write tool a `c:\tmp\*.sql`, subir con `scp`, ejecutar con `psql -f` |
| Statement de Wittgenstein/Jaspers/etc. duplicado | No verificar existentes antes de proponer | Siempre `SELECT` primero por `philosopher_id` |

---

## Swarm config

Ver `.claude-flow/filosofia-timeline.yml` para la configuración de agentes paralelos.
