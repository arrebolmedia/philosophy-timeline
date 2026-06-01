# Timeline — Historia de la Filosofía

Timeline interactivo de la historia de la filosofía. Next.js + Node + PostgreSQL.
Infra en Docker + Traefik en `data.arrebolweddings.com` (8GB).

---

## Estado actual

| Tabla | Total | Último ID |
|-------|-------|-----------|
| philosophers | 177 | #206 (Pieper) |
| statements | 484 | #515 |
| connections | 982 | #1134 |
| tags | 79 | #79 |
| references | 254 | — |

**Módulos auditados:** M1, M2, M4, M7, M8, M9, M10, M12, M13, M14, M15, M16, M18, M19, M20, M21, M22 (17 de los 19 doctrinales). Pendientes: M3 (técnicas de investigación) y M6 (redacción) — no doctrinales. Lingüísticos saltados: M5, M11, M17.
**Auditoría:** 0 pending — toda la timeline auditada con tipología completa.
**Versión:** 2.1.18

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

**Conexiones (proceso riguroso desde 2026-05-15):**

1. **Descubrimiento de candidatos** (3 queries automáticas):
   - Q1: mismos tags conceptuales
   - Q2: misma categoría, cross-period
   - Q3: keywords del problema (3-5 manuales)
   Presentar candidatos al usuario para que seleccione.

2. **Evaluación con 4 (5) tests:**
   - **Test 1 — Objeto:** ¿comparten el mismo problema, no solo una palabra?
   - **Test 2 — Contacto:** documentado / plausible / sin contacto
   - **Test 5 — Cross-period (gap ≥ 200 años):** 5a tesis identificable, 5b cadena documental, 5c consenso académico
   - **Test 3 — Naturaleza:** asigna subtipo según pregunta clave de 3b
   - **Test 4 — Fuente:** primaria → confidence 4-5, secundaria estándar → 3-4, lectura propia → ≤2

3. **Tipología (13 subtipos en 2 familias, validados por CHECK constraint):**
   - `resonate`: cita_directa, discipulado, desarrollo, respuesta, influencia, convergencia
   - `oppose`: refutacion, critica, inversion, superacion, deconstruccion, contraste_doctrinal, oposicion_reconstruida

4. **Reglas técnicas:**
   - Solo entre filósofos distintos (trigger `trg_no_same_philosopher`)
   - `connection_type` (familia) + `connection_subtype` (tipo específico)
   - `strength` (centralidad de la tesis) y `confidence` (solidez de la evidencia): 1-5
   - Toda conexión nueva entra con `audit_status = 'validated'`
   - Si confidence ≥ 3, llenar `source_title` y `source_author`
   - Subtipos "fuertes" (cita_directa, discipulado, refutacion, inversion, superacion, deconstruccion) requieren contacto documentado; degradar si no hay
   - Cross-period sin cadena documental → solo `convergencia` u `oposicion_reconstruida`

5. **Estados de auditoría:**
   - `pending`: conexión histórica sin revisar (las 699 originales arrancan así)
   - `validated`: pasa los tests + subtipo asignado
   - `recalificada`: cambió tipo/subtipo durante revisión
   - `marcada_debil`: se mantiene visible con confidence bajo (uso humano, no automático)
   - `rechazada`: filtrada del render público (no se borra)

6. **Auditoría histórica (699 pending):**
   El triaje automático SQL no aplica: las conexiones históricas tienen
   confidence ≥ 3 y explicaciones largas, no hay señal objetiva de debilidad.
   El **gap temporal NO es indicador de debilidad** — las cross-period son
   filosóficamente las más interesantes (Heráclito-Hegel, Sócrates-Wittgenstein).
   La revisión es **humana por cluster temático** (presocráticos, eleatas,
   sofistas, platonismo, etc.) aplicando los 4 (5) tests por conexión.

Ver progreso: `SELECT * FROM v_connections_audit_report;`

### Jerarquía de fuentes (orden de rigor decreciente)

**Nivel 1** — Texto primario del filósofo (cuando existe digitalizado: Perseus, MIT Classics, Gutenberg, Adam-Tannery, etc.)
**Nivel 2** — Fragmentos doxográficos antiguos (Simplicio, Diógenes Laercio, Sexto Empírico, Plutarco, Hipólito). Identificados por códigos **DK** (Diels-Kranz) o **LM** (Laks-Most 2016).
**Nivel 3** — Enciclopedias filosóficas: **SEP** (más estricta) e **IEP** (más entradas individuales, especialmente presocráticos).
**Nivel 4** — Ediciones críticas: DK, LM, KRS (Kirk-Raven-Schofield), OCT (Oxford Classical Texts), AT (Adam-Tannery), GA (Gesamtausgabe Heidegger).
**Nivel 5** — Manuales: Copleston, Reale-Antiseri, Hirschberger, Guthrie.
**Nivel 6** — Estudios académicos sobre el autor (para interpretación matizada).

**Descartadas como cita formal:** Wikipedia (solo pointer informal), blogs no peer-reviewed, YouTube/podcasts, IA.

**Aplicación a los campos:**
- `references.title/author` = la **obra** (Nivel 1 o 2)
- `statement_references.page_specific` = localización canónica (Bekker, Stephanus, DK/LM, AT, A/B Kant)
- `statement_references.url_specific` = texto primario en línea si existe; si no, entrada propia del filósofo en SEP/IEP como pointer académico
- `audit_notes` = atribuciones discutidas (ej. "Aristóteles surmises..."), conflictos entre fuentes

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
| 2.1.0 | 2026-05-15 | Sistema riguroso de auditoría de conexiones: 13 subtipos en 2 familias, 4 tests obligatorios, schema DB (`connection_subtype`, `audit_status`, `audit_notes`, `audited_at` + CHECK + vista de reporte), admin UI rediseñada con filtros por subtipo/estado/filósofo y form de auditoría inline. Endpoint nuevo `/api/admin/connections/by-philosopher/:id`. |
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
