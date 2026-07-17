# 01 — Foundation: SQLite + Design System + Navigation

**What to build:** App opens with bottom tab navigation (Tareas, Notas, Calendario), system mode with DM Sans font, and a SQLite database initialized with the full schema (categories, tasks, notes, events). Seed data for the 5 predefined categories.

**Blocked by:** None — can start immediately

**Status:** done

- [x] SQLite database initializes on app launch with WAL mode and foreign keys enabled
- [x] Schema DDL creates all tables: categories, tasks, notes, events (with correct columns, defaults, and types)
- [x] Categories seeded with 5 predefined entries: Trabajo (#2563EB), Personal (#7C3AED), Estudio (#059669), Finanzas (#D97706), Ocio (#E11D48)
- [x] Bottom tab navigation renders 3 tabs: Tareas, Notas, Calendario — with correct icons
- [x] System mode is default, follows OS setting
- [x] DM Sans font loads and applies across the app
- [x] Design system constants defined: primary color #2563EB, spacing grid (4px), border radius (sm=8, md=12, lg=16, full=9999)
- [x] TypeScript types defined for all entities (Task, Note, Event, Category)
- [x] Database helper functions for CRUD operations are accessible from feature modules
