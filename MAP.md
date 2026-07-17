# Mapa: OrganizaTu

**Labels:** `wayfinder:map`

## Destination

Una app móvil Android (APK) minimalista y limpia para organizar tareas, notas (texto y voz) y calendario. Datos locales en SQLite, sin login, categorías predefinidas, notificaciones, soporte Markdown, grabación de audio para notas de voz. Tech: React Native + Expo + TypeScript.

## Notes

- Dominio: productividad personal, app móvil Android
- Plataforma: Honor X6b (Android), solo APK local
- Tech stack: React Native, Expo, TypeScript, SQLite, expo-notifications
- El usuario tiene experiencia moderada y tiempo moderado
- Estilo: minimalista y limpio
- El usuario habla español — la app debe estar en español
- Categorías predefinidas: Trabajo, Personal, Estudio, Finanzas, Ocio

## Decisions so far

<!-- Index: one line per closed ticket — gist + link -->

- [001-arquitectura-estructura-proyecto](issues/001-arquitectura-estructura-proyecto.md) — Estructura por feature, expo-router, sin state manager, @expo/ui, EAS Build local, PascalCase/camelCase/kebab-case
- [002-modelo-datos-sqlite](issues/002-modelo-datos-sqlite.md) — 6 tablas (categories, tasks, notes, study_topics, study_notes, events), TEXT ISO 8601, FTS5, PRAGMA user_version, tipos manuales
- [005-sistema-notificaciones](issues/005-sistema-notificaciones.md) — expo-notifications, 2 canales (tasks/events), DATE triggers, IDs en SQLite, canales ANTES de permiso
- [007-grabacion-almacenamiento-audio](issues/007-grabacion-almacenamiento-audio.md) — expo-audio (no expo-av), AAC/M4A 128kbps, documentDirectory, Whisper API $0.003/min
- [003-diseno-ui-pantalla-tareas](issues/003-diseno-ui-pantalla-tareas.md) — Lista vertical por fecha, chips de categoría, FAB + modal para crear, checkbox con animación de tachado
- [006-flujo-creacion-contenido](issues/006-flujo-creacion-contenido.md) — Tareas desde tareas+calendario, notas texto/voz como tipos separados, FAB con submenú, autoguardado 3s con borradores, cuaderno de estudio descartado
- [004-diseno-ui-calendario-notas](issues/004-diseno-ui-calendario-notas.md) — Calendario mensual con tap a día, crear evento con toggle todo el día, editor Markdown toggle写/preview, nota de voz con waveform+transcripción Whisper, estados vacíos con CTA
- [008-sistema-diseno-colores-tipografia](issues/008-sistema-diseno-colores-tipografia.md) — Modo Sistema por defecto, DM Sans, azul #2563EB, grid 4px, radius 8/12/16, @expo/material-symbols, animaciones sencillas
- [009-pantalla-ajustes-toggle-tema](issues/009-pantalla-ajustes-toggle-tema.md) — Icono en header de cada pantalla, cíclico Sistema/Claro/Oscuro, persistencia AsyncStorage, ThemeContext override con `themeMode`, reacción en tiempo real via `useColorScheme()`

## Not yet specified

- Gestión de errores y edge cases — demasiado vago todavía, se concreta al construir

## Out of scope

- Publicación en Google Play Store — solo APK local para uso personal
- Sincronización entre dispositivos — solo datos locales
- Login/autenticación de usuarios — solo un usuario
- Hábitos/rutinas — descartado por el usuario
- Cuaderno de estudio (study_topics, study_notes) — descartado por el usuario en ticket 006
- Backup/Export de datos — usuario dijo "no esencial", no va en MVP
- Funcionalidad web — usuario dijo "luego veo", se evalúa después
