# Ticket: Modelo de datos SQLite

**Labels:** `wayfinder:research`
**Parent:** MAP.md
**Status:** CLOSED

## Question

¿Cuál es el esquema exacto de tablas SQLite? ¿Relaciones entre tablas? ¿Índices necesarios? Investigar mejores prácticas de expo-sqlite.

## Resolution

Ver `research/002-sqlite-findings.md` para investigación completa.

### Decisiones clave

| Decisión | Respuesta |
|---|---|
| API | `openDatabaseAsync` + `withExclusiveTransactionAsync` |
| Fechas | TEXT ISO 8601 (`datetime('now')` en UTC) |
| Booleanos | INTEGER 0/1 |
| IDs | INTEGER PRIMARY KEY AUTOINCREMENT |
| Categorías | TEXT string (no FK en v1) |
| Búsqueda | FTS5 virtual table con triggers |
| Índices | Composites: `(completed, due_date)` para tasks, `(updated_at DESC)` para notes |
| Audio | `audio_path` TEXT con URI `file://`, directorio `document` |
| Migraciones | `PRAGMA user_version` + switch en `onInit` |
| TypeScript | Tipos manuales (sin ORM en v1) |
| ORM futuro | Drizzle como opción si crece la complejidad |

### Esquema DDL

6 tablas: `categories`, `tasks`, `notes`, `study_topics`, `study_notes`, `events`. Dates como TEXT ISO 8601, booleans como INTEGER 0/1, `category` como TEXT (no FK) para simplificar v1.
