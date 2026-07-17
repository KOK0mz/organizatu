# Ticket: Diseño de UI - Calendario y Notas

**Labels:** `wayfinder:prototype`
**Parent:** MAP.md
**Status:** CLOSED
**Blocked by:** 003-diseno-ui-pantalla-tareas.md

## Question

¿Cómo se ve el calendario (vista mensual vs diaria)? ¿Cómo se editan las notas con Markdown? ¿Cómo se graba y reproduce una nota de voz? Prototipar estas pantallas.

Aspectos a decidir:
- Calendario: vista mensual como default, ¿tap para ver día?
- Día: lista de eventos del día (todo el día + con hora)
- Crear evento: campos, selector de hora, todo el día vs con hora
- Notas: editor Markdown, ¿preview en vivo o toggle?
- Notas de voz: botón de grabar, player de audio, ¿transcripción?
- Estado vacío de cada sección
- ~~Notas de estudio: cómo se organizan por tema~~ — FUERA DE SCOPE (descartado en ticket 006)

## Resolution

**Asset:** [prototypes/004-calendario-notas.html](../prototypes/004-calendario-notas.html) — prototipo HTML interactivo con 6 pantallas

### Decisiones

| Aspecto | Decisión |
|---------|----------|
| Calendario | Vista mensual como default; tap en día → lista de eventos del día |
| Día | Lista vertical: eventos "todo el día" primero, luego los con hora ordenados cronológicamente |
| Crear evento | Formulario con: título, toggle todo el día, pickers hora inicio/fin, categoría (pills), nota opcional |
| Editor Markdown | Toggle "Escribir / Vista previa" (no split screen — ocupa demasiado en móvil). Toolbar con B, I, H1, H2, listas, código, enlace |
| Nota de voz | Botón grande rojo para grabar, player con waveform + controles, transcripción Whisper debajo del player |
| Estados vacíos | Icono + título + descripción + llamada a acción ("Toca + para crear...") |
| Notas de estudio | Fuera de scope — descartado por el usuario |

### Pantallas prototipadas

1. **Calendario mensual** — grid de días con dots de eventos, día actual en color primario
2. **Crear evento** — formulario completo con todos los campos
3. **Lista de notas** — secciones "texto" y "voz", badges de tipo
4. **Editor Markdown** — toolbar de formato, toggle escritura/preview, autoguardado visible
5. **Nota de voz** — waveform animado, controles de reproducción, transcripción
6. **Estado vacío** — calendario sin eventos
