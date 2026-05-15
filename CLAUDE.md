# Timeline — Historia de la Filosofía

Timeline interactivo de la historia de la filosofía. Next.js + Node + PostgreSQL.
Infra en Docker + Traefik en `data.arrebolweddings.com` (8GB).

---

## Estado actual

| Tabla | Último ID |
|-------|-----------|
| philosophers | #178 (Enesidemo) |
| statements | #434 |
| connections | #776 |
| tags | #79 |

**Módulos:** M1–M22 procesados. Próximo M23.
**Versión:** 2.0.5

---

## Conexiones a DB

```bash
# Local (Docker)
docker exec -i timeline-db-1 psql -U filosofia -d historia_filosofia

# Producción (Arrebol droplet)
ssh root@data.arrebolweddings.com "docker exec -i timeline-db psql -U filosofia -d filosofia"
```

⚠️ **Nombres distintos:** local es `historia_filosofia`, prod es `filosofia`.

---

## Workflow PDF → DB (por tema)

### 1. Extraer PDF
Base: `C:\Users\Marketing\OneDrive\Desktop\Licenciatura en Filosofía\M{N}. {Módulo}\M{N}T{T}. {Tema}.pdf`

```powershell
node -e "
const fs = require('fs');
const pdfParse = require('C:/Projects/digest/node_modules/pdf-parse');
pdfParse(fs.readFileSync('ruta.pdf')).then(d => fs.writeFileSync('C:/tmp/m{N}/m{N}t{T}.txt', d.text));
"
```
Hasta 4 PDFs en paralelo con `run_in_background: true`. **No usar Vision API** — pdf-parse es gratis e instantáneo.

### 2. Análisis
- Filósofos nuevos → INSERT en `philosophers`
- Existentes con ángulo nuevo → solo `statements`
- **Siempre** `SELECT` por `philosopher_id` antes de proponer (evita duplicados)
- **Umbral:** cita textual o paráfrasis con contenido propio del autor (no menciones de pasada)

### 3. Revisión con usuario
Tabla por tema, esperar aprobación explícita antes de insertar.

**Statements:** ~160 chars, sin guiones largos (—), sin redundancia.
- `difficulty_level`: 1–5
- `category_id`: ver "Taxonomía"

**Conexiones:**
- Solo entre filósofos distintos (trigger `trg_no_same_philosopher`)
- `connection_type`: `resonate` o `oppose`
- `strength` y `confidence`: 1–5
- Explicación de 1–2 frases

### 4. Sync a producción

⚠️ **Nunca usar heredoc de PowerShell con UTF-8** (tildes/ñ se corrompen en SSH).

```bash
# 1. Escribir SQL con Write tool a c:\tmp\sync.sql
# 2. Subir y ejecutar:
scp /c/tmp/sync.sql root@data.arrebolweddings.com:/tmp/sync.sql && \
  ssh root@data.arrebolweddings.com "docker exec -i timeline-db psql -U filosofia -d filosofia < /tmp/sync.sql"
```

Patrón SQL obligatorio:
```sql
INSERT INTO philosophers (id, ...) OVERRIDING SYSTEM VALUE VALUES (...) ON CONFLICT (id) DO NOTHING;
INSERT INTO statements (id, ...) OVERRIDING SYSTEM VALUE VALUES (...) ON CONFLICT (id) DO NOTHING;
INSERT INTO connections (id, ...) OVERRIDING SYSTEM VALUE VALUES (...) ON CONFLICT (id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('philosophers', 'id'), (SELECT MAX(id) FROM philosophers));
SELECT setval(pg_get_serial_sequence('statements', 'id'), (SELECT MAX(id) FROM statements));
SELECT setval(pg_get_serial_sequence('connections', 'id'), (SELECT MAX(id) FROM connections));
```

### 5. Deploy de código (al terminar módulo completo)
Bump `frontend/src/version.ts` en PATCH.

```bash
ssh root@data.arrebolweddings.com "cd /opt/timeline && git pull && docker compose up -d --build frontend backend"
```

---

## Taxonomía

### Categories (ramas, 12)
1. Ética · 2. Metafísica · 3. Epistemología · 4. Política · 5. Estética · 6. Lenguaje · 7. Antropología · 8. Religión · 9. Ciencia · 10. Naturaleza · 11. Mente · 12. Lógica

### Schools (32)
1 Presocráticos · 2 Sofistas · 3 Platonismo · 4 Aristotelismo · 5 Estoicismo · 6 Epicureísmo · 7 Escolástica · 8 Humanismo · 9 Racionalismo · 10 Empirismo · 11 Idealismo Alemán · 12 Positivismo · 13 Existencialismo · 14 Fenomenología · 15 Filosofía Analítica · 17 Neoplatonismo · 18 Escepticismo · 19 Nominalismo · 20–32 expandidas (consultar DB)

### Periods (7)
1 Antigua · 2 Moderna · 3 s. XIX · 4 s. XX · 5 Contemporánea · 6 Medieval · 7 Renacimiento

### Tags (79, en 4 tipos)
**tema · método · corriente · concepto.** Ver tabla `tags` para lista completa.
**Regla de tagging:** se decide por contenido del statement, no por filósofo.

---

## Errores frecuentes

| Error | Solución |
|-------|----------|
| `No se pueden conectar statements del mismo filósofo` | Trigger `trg_no_same_philosopher` — usar filósofos distintos |
| `Could not resolve authentication method` | Setear `$env:ANTHROPIC_API_KEY` desde `c:\Projects\digest\.env` |
| IDs divergen local/prod | Usar `OVERRIDING SYSTEM VALUE` + `ON CONFLICT DO NOTHING` + `setval` |
| Caracteres rotos en SSH (tildes, ñ) | Write tool → scp → `psql -f`, nunca heredoc |
| Statement duplicado | `SELECT` por `philosopher_id` antes de proponer |

---

## Changelog (últimas versiones)

**Regla:** versiones reflejan SOLO software (UI/UX/features/fixes). Publicar contenido NO bumpea versión — se registra en categoría `proposiciones` vía triggers.

| Versión | Fecha | Cambio |
|---------|-------|--------|
| 2.0.5 | 2026-05-15 | Performance zoom/drag: removidos GPU hints contraproducentes (`will-change`, `translateZ(0)`) que saturaban el compositor con 1500 nodos SVG; sin momentum en zoom (precisión); inercia del drag acortada (decay 0.74, boost 0.12). Link de Deniz a /philo/. |
| 2.0.3 | 2026-05-14 | Filósofos vivos: "presente" en lugar de NULL. Stats sidebar muestra "Edad" calculada contra año actual cuando vive. |
| 2.0.2 | 2026-05-14 | Filename PNG descriptivo con chips activos. |
| 2.0.0 | 2026-05-14 | **Rediseño mayor.** Filtros declarativos (Época·Rama·Escuela·Años, chips combinables), 12 ramas reales, 70 tags semánticos, 32 escuelas, Modo Meditación, URLs compartibles. |
| 1.5.x | 2026-05-13 | OG dinámico por filtro con `/api/og` (edge runtime). |
| 1.4.x | 2026-05-13 | URLs compartibles, toasts (sonner), nombre dinámico de PNG. |
| 1.3.x | 2026-05-06 | UX: momentum drag/zoom, footer global, badge conexiones, paginación logs. |
| 1.2.x | 2026-05-03 | Rediseño layout diagonal único, triggers de changelog automático. |
| 1.1.x | 2026-04-15 | NextAuth admin, hover reactivo, semicírculos verdes/rojos. |
| 1.0.0 | 2025-10-22 | Lanzamiento inicial — presocráticos. |

---

## Infraestructura

- **Host prod:** `data.arrebolweddings.com` (138.68.55.125, 8GB)
- **Stack:** Docker + Traefik v2.10 + Let's Encrypt (`le`)
- **Containers timeline:** `timeline-frontend`, `timeline-backend`, `timeline-db` (postgres:17-alpine)
- **Compose files:** `/opt/timeline/docker-compose.yml`
- **Network compartida:** `traefik-public` (external)
- **Notas Docker:** backend `node:20-slim` (libssl Prisma); frontend `--legacy-peer-deps` (next-themes vs React 18)

---

## Swarm config
Ver `.claude-flow/filosofia-timeline.yml`.
