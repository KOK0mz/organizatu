# Ticket: Diseño de UI - Pantalla de Tareas

**Labels:** `wayfinder:prototype`
**Parent:** MAP.md
**Status:** CLOSED
**Blocked by:** 001-arquitectura-estructura-proyecto.md

## Question

¿Cómo se ve la pantalla principal de tareas? ¿Cómo se filtra por categoría? ¿Cómo se crea una tarea? Prototipar el diseño.

Aspectos a decidir:
- Layout de la lista de tareas (¿por fecha, por categoría, por prioridad?)
- Filtro de categorías (¿tabs, dropdown, chips?)
- Botón de crear tarea (¿FAB, botón en header?)
- Formulario de creación (¿cuántos campos?, ¿modal o pantalla separada?)
- Estado vacío (¿qué muestra cuando no hay tareas?)
- Comportamiento de checkbox de completar

## Answer

**Layout:** Lista vertical, agrupada por fecha (hoy, mañana, semana, luego). Cada tarea muestra checkbox + título + chip de categoría con color.

**Filtro de categorías:** Chips horizontales scrollables en la parte superior (Todas, Trabajo, Personal, Estudio, Finanzas, Ocio). El seleccionado resalta.

**Crear tarea:** FAB (botón flotante) abajo a la derecha. Abre un modal con:
- Título (obligatorio)
- Descripción (opcional, expandible)
- Fecha límite (date picker)
- Categoría (selector, pre-seleccionada si hay filtro activo)

**Estado vacío:** Ilustración simple + texto "No hay tareas. ¡Crea la primera!" y el FAB visible.

**Checkbox de completar:** Tap en el checkbox tacha el título con animación suave y la tarea baja al fondo de su grupo (o desaparece tras 2s).

## Assets

- [Prototipo wireframe](../prototypes/003-pantalla-tareas.html) — 4 pantallas: lista con chips de categoría, modal de creación, estado vacío, tarea completada
