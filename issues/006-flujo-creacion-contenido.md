# Ticket: Flujo de creación de contenido

**Labels:** `wayfinder:grilling`
**Parent:** MAP.md
**Status:** CLOSED
**Blocked by:** 002-modelo-datos-sqlite.md

## Question

¿Cómo se crea una tarea? ¿Cuántos campos? ¿Se puede crear desde cualquier pantalla? ¿Cómo se crea una nota (texto o voz)? ¿Cómo funciona el flujo de grabación de voz? ¿Cómo se organiza el cuaderno de estudio?

Decisiones esperadas:
- Tarea: ¿título obligatorio?, ¿descripción opcional?, ¿fecha límite?, ¿categoría?
- ¿Se puede crear tarea desde la pantalla de tareas y desde el calendario?
- Nota: título + contenido Markdown, ¿categoría?
- Nota de voz: ¿grabar directamente o grabar y luego editar?
- Nota de estudio: ¿se asocia a un tema o es libre?
- Flujo de crear tema de estudio → agregar notas
- ¿Borradores? ¿Autoguardado?

## Resolution

### Crear tarea

| Decisión | Respuesta |
|---|---|
| Desde dónde | **Ambas pantallas**: FAB en tareas + tocar día en calendario abre formulario con fecha pre-seleccionada |
| Campos | Título (obligatorio), descripción (opcional), fecha límite (date picker), categoría (selector) |
| Formulario | Modal (ya decidido en ticket 003) |

### Crear nota de texto

| Decisión | Respuesta |
|---|---|
| Campos | Título (obligatorio) + contenido Markdown + categoría (opcional) |
| Categoría | Sí, opcional. Misma categoría que tareas: Trabajo, Personal, Estudio, Finanzas, Ocio |
| Editor | Pantalla completa (no modal), con toggle de preview Markdown |
| Creación | FAB en pantalla de Notas → "Nota de texto" |

### Crear nota de voz

| Decisión | Respuesta |
|---|---|
| Tipo | **Nota de voz** como tipo separado, no vinculada a nota de texto |
| Flujo | FAB en pantalla de Notas → "Nota de voz" → pantalla de grabación con botón grande |
| Grabación | Tap para grabar, tap para parar (expo-audio) |
| Transcripción | Opcional, via Whisper API |
| Título | Automático con timestamp (ej. "Nota de voz - 15 jul 14:30") |

### Cuaderno de estudio

**Descartado por el usuario.** Las tablas `study_topics` y `study_notes` del modelo de datos (ticket 002) ya no se necesitan. Se eliminan del esquema.

### Borradores y autoguardado

| Decisión | Respuesta |
|---|---|
| Autoguardado | Sí, cada 3 segundos mientras se edita |
| Borradores | Flag `is_draft` en SQLite. Borradores visibles en sección aparte de la lista de notas |
| Cierre sin guardar | Se mantiene el borrador automáticamente |
