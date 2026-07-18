# 02 — Tasks: List + CRUD + Completion

**What to build:** User sees tasks grouped by date (Hoy, Mañana, Esta semana, Después), creates tasks via FAB with title/description/due date/category, marks tasks complete with checkbox animation, completed tasks move to bottom. Empty state when no tasks.

**Blocked by:** 01 — Foundation: SQLite + Design System + Navigation

**Status:** done

- [x] Task list screen displays tasks grouped by due date sections: Hoy, Mañana, Esta semana, Después
- [x] Tasks without due date appear in a "Sin fecha" section
- [x] Each task shows title, category chip with color, and optional due date
- [x] FAB opens a create-task modal/form with: title (required), description (optional), due date picker, category selector (predefined chips)
- [x] Tapping checkbox marks task complete with strikethrough animation
- [x] Completed tasks move to bottom of their group (or fade out after 2 seconds)
- [x] Task list filters by category via horizontal chip bar at top
- [x] Empty state shown when no tasks exist, with illustration and "Crear tarea" CTA
- [x] Tasks are persisted in SQLite and survive app restarts
