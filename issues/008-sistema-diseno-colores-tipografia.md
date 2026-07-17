# Ticket: Sistema de diseño (colores, tipografía, espaciado)

**Labels:** `wayfinder:prototype`
**Parent:** MAP.md
**Status:** CLOSED

## Question

Definir el sistema visual de la app: paleta de colores, tipografía y reglas de espaciado. El estilo debe ser minimalista y limpio.

## Resolution

Ver `prototypes/design-system.html` — prototipo visual interactivo con dark mode toggle.

### Decisiones clave

| Decisión | Respuesta |
|---|---|
| Primario | Azul `#2563EB` (neutro, profesional) |
| Dark mode | Por defecto, respeta sistema |
| Categorías | Trabajo=#2563EB, Personal=#7C3AED, Estudio=#059669, Finanzas=#D97706, Ocio=#E11D48 |
| Tipografía | DM Sans vía `expo-font` (300–800) |
| Espaciado | Grid de 4px (4/8/12/16/20/24/32/48/64) |
| Border radius | 3 niveles: sm=8px, md=12px, lg=16px, full=9999px |
| Sombras | 3 niveles: sm (cards), md (nav/modales), lg (FAB/dropdowns) |
| Iconos | `@expo/ui` Icon + `@expo/material-symbols` (instalado) |
| Animaciones | Solo sencillas: transiciones tabs, apertura modales, toggle checkbox (reanimated) |

### Paleta completa

- **Primario:** `#2563EB` / `#3B82F6` (light) / `#1D4ED8` (dark) / `#EFF6FF` (surface)
- **Superficies (light/dark):** `#FFFFFF`/`#0F172A`, `#F8FAFC`/`#1E293B`, `#F1F5F9`/`#334155`
- **Bordes:** `#E2E8F0` / `#CBD5E1` (strong)
- **Texto:** `#0F172A` (primary), `#475569` (secondary), `#94A3B8` (tertiary)
- **Semánticos:** success=#059669, warning=#D97706, error=#DC2626, info=#2563EB

### Iconos necesarios

- **Navegación:** check_circle, edit_note, calendar_month
- **Acciones:** add, close, delete, search, filter_list
- **Categorías:** work, person, school, savings, sports_esports
- **Contenido:** mic, mic_off, play_arrow, pause, check
