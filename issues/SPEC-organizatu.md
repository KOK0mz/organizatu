# OrganizaTu — PRD (Product Requirements Document)

**Label:** `ready-for-agent`
**Status:** SPEC READY
**Date:** 2026-07-16
**Platform:** Android (Honor X6b), APK local
**Tech Stack:** React Native + Expo SDK 57 + TypeScript + SQLite

---

## Problem Statement

Como usuario de un teléfono Android, siento que mi vida está desorganizada: se me olvidan pendientes, ideas, cosas que debo trabajar, revisar y estudiar. Necesito una app móvil minimalista y limpia que me ayude a organizar todo en un solo lugar, sin depender de servicios en la nube ni crear cuentas.

---

## Solution

Una app móvil Android (APK) de uso personal con 3 módulos principales:

1. **Tareas**: Lista de pendientes con fechas límite, categorías predefinidas, y notificaciones de recordatorio
2. **Notas**: Captura rápida de ideas en texto (Markdown) y notas de voz (grabación + transcripción)
3. **Calendario**: Vista mensual de eventos con recordatorios

Los datos se almacenan localmente en SQLite. Sin login, sin servidor, sin sincronización. Modo Sistema por defecto.

---

## User Stories

### Tareas

1. As a user, I want to see a list of my pending tasks sorted by due date, so that I know what to do first
2. As a user, I want to filter tasks by category (Trabajo, Personal, Estudio, Finanzas, Ocio), so that I can focus on one area
3. As a user, I want to tap a floating action button to create a new task, so that I can quickly add something new
4. As a user, I want to enter a task title (required), description (optional), due date (optional), and category when creating a task, so that I have all the context I need
5. As a user, I want to see tasks grouped by date (Hoy, Mañana, Esta semana, Después), so that I can prioritize
6. As a user, I want to tap a checkbox to mark a task as complete, with a strikethrough animation, so that I feel a sense of progress
7. As a user, I want completed tasks to move to the bottom of their group (or disappear after 2 seconds), so that my list stays clean
8. As a user, I want to see an empty state illustration when there are no tasks, with a prompt to create one, so that the app doesn't feel broken
9. As a user, I want to create a task from the calendar view by tapping a day, with the date pre-filled, so that I don't have to enter it twice
10. As a user, I want to receive a notification when a task's due date arrives, so that I don't forget
11. As a user, I want the notification to be cancelled if I complete the task before the deadline, so that I'm not bothered unnecessarily

### Notas de texto

12. As a user, I want to create a text note with a title (required) and Markdown content, so that I can write structured notes
13. As a user, I want to assign a category to a note (optional), so that I can organize them by area
14. As a user, I want to edit notes in a full-screen editor with a toggle between writing and preview mode, so that I can see how my Markdown renders
15. As a user, I want a formatting toolbar (Bold, Italic, H1, H2, Lists, Code, Link), so that I can format without remembering Markdown syntax
16. As a user, I want my notes to auto-save every 3 seconds while editing, so that I never lose work
17. As a user, I want drafts to be preserved if I close the editor, so that I can continue later
18. As a user, I want to see drafts in a separate section of the notes list, so that I know what's published vs. work-in-progress
19. As a user, I want to delete a note, so that I can remove things I no longer need
20. As a user, I want to see an empty state when there are no notes, with a prompt to create one

### Notas de voz

21. As a user, I want to record a voice note by tapping a big red button, so that I can capture ideas without typing
22. As a user, I want to see the recording duration and a waveform while recording, so that I know it's working
23. As a user, I want to stop recording by tapping the button again, so that the note is saved
24. As a user, I want voice notes to be saved with an auto-generated title (e.g., "Nota de voz - 15 jul 14:30"), so that I don't have to name them
25. As a user, I want to play back a voice note with a player showing progress, play/pause, and seek controls, so that I can review what I recorded
26. As a user, I want to optionally transcribe a voice note to text using Whisper API, so that I can read what I said
27. As a user, I want voice notes to appear in a separate section of the notes list, with a voice badge, so that I can distinguish them from text notes
28. As a user, I want to delete a voice note and have the audio file removed, so that I don't waste storage
29. As a user, I want to see an empty state when there are no voice notes, with a prompt to record one

### Calendario

30. As a user, I want to see a monthly calendar grid with dots indicating days that have events, so that I can see my schedule at a glance
31. As a user, I want to tap a day to see all events for that day, so that I can drill down
32. As a user, I want to see events sorted: all-day events first, then timed events chronologically, so that the view is logical
33. As a user, I want to create an event by tapping a floating action button, so that I can add something new
34. As a user, I want to enter a title (required), toggle all-day vs. timed, start/end times, category, and optional description when creating an event, so that I have full control
35. As a user, I want to receive a notification 15 minutes before a timed event starts, so that I'm reminded
36. As a user, I want to receive a notification on the morning of an all-day event, so that I'm reminded
37. As a user, I want to see an empty state when there are no events for a day, with a prompt to create one
38. As a user, I want to delete an event and have its notification cancelled, so that I'm not bothered

### Navegación y general

39. As a user, I want bottom tab navigation (Tareas, Notas, Calendario), so that I can switch between sections quickly
40. As a user, I want the app to use system mode by default (following OS setting), so that it matches my device preference
41. As a user, I want the app to be in Spanish, so that I can use it comfortably
42. As a user, I want to see the current category colors consistently across all sections, so that the UI feels cohesive
43. As a user, I want the app to work entirely offline, so that I don't need internet connection
44. As a user, I want to receive a notification permission prompt on first launch, so that I can enable reminders

### Ajustes y tema

45. As a user, I want a gear icon in the header of each main screen, so that I can access theme settings quickly
46. As a user, I want to cycle between System/Light/Dark themes by tapping the gear icon, so that I can choose my preferred appearance
47. As a user, I want my theme preference to persist across app restarts, so that I don't have to re-set it
48. As a user, I want the "System" option to follow my device's theme in real time, so that the app matches my OS setting
49. As a user, I want the gear icon to visually reflect the current theme mode, so that I know which mode is active at a glance

---

## Implementation Decisions

### Architecture

- **Structure:** Feature-based folders under `src/features/` (tasks, notes, calendar)
- **Navigation:** expo-router (file-based routing, already configured)
- **State management:** No global state manager — local state + SQLite as source of truth
- **UI Components:** @expo/ui (already installed) + custom components
- **TypeScript:** Strict mode + Expo Lint
- **Build:** EAS Build local (`eas build --platform android --local`)
- **Conventions:** PascalCase for components/types, camelCase for functions/hooks, kebab-case for folders

### Database (SQLite)

- **API:** `openDatabaseAsync` + `withExclusiveTransactionAsync`
- **Tables:** categories, tasks, notes, events (study_topics and study_notes discarded)
- **Dates:** TEXT ISO 8601 (UTC, `datetime('now')`)
- **Booleans:** INTEGER 0/1
- **IDs:** INTEGER PRIMARY KEY AUTOINCREMENT
- **Categories:** TEXT string (no FK in v1)
- **Migrations:** `PRAGMA user_version` + switch statement in `onInit`
- **TypeScript types:** Manual types (no ORM in v1)
- **Indexes:** Composite `(completed, due_date)` for tasks, `(updated_at DESC)` for notes, `(start_time)` for events

### Schema DDL

```sql
PRAGMA journal_mode = 'wal';
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categories (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  name  TEXT    NOT NULL UNIQUE,
  icon  TEXT    NOT NULL DEFAULT '',
  color TEXT    NOT NULL DEFAULT '#808080'
);

CREATE TABLE IF NOT EXISTS tasks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  description TEXT    NOT NULL DEFAULT '',
  category    TEXT    NOT NULL DEFAULT '',
  due_date    TEXT,
  completed   INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  content     TEXT    NOT NULL DEFAULT '',
  category    TEXT    NOT NULL DEFAULT '',
  audio_path  TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  description TEXT    NOT NULL DEFAULT '',
  start_time  TEXT    NOT NULL,
  end_time    TEXT    NOT NULL,
  all_day     INTEGER NOT NULL DEFAULT 0,
  category    TEXT    NOT NULL DEFAULT '',
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
```

### Notifications

- **Library:** expo-notifications + expo-device + expo-constants
- **Channels:** 2 channels — `tasks` (HIGH importance) and `events` (HIGH importance)
- **Permission flow:** Create channels BEFORE requesting permission (Android 13+ requirement)
- **Scheduling:** DATE trigger for task deadlines and event reminders
- **Cancellation:** `cancelScheduledNotificationAsync(id)` with IDs stored in SQLite
- **IDs:** Format `task-${taskId}` and `event-${eventId}`
- **Background:** Scheduled notifications fire via AlarmManager even when app is closed

### Audio (Voice Notes)

- **Recording:** expo-audio (NOT expo-av, deprecated since SDK 55)
- **Preset:** `RecordingPresets.HIGH_QUALITY` — AAC 128kbps, mono
- **Storage:** `documentDirectory/audio/` via expo-file-system (persistent)
- **Naming:** `audio_${noteId}_${Date.now()}.m4a`
- **Playback:** `useAudioPlayer` + `useAudioPlayerStatus` (expo-audio)
- **Transcription:** OpenAI `gpt-4o-mini-transcribe` — $0.003/min, supports Spanish
- **File size:** ~0.94 MB/min, ~4.7 MB per 5-min note

### UI Design System

- **Primary color:** #2563EB (blue)
- **System mode:** Default, follows OS setting
- **Category colors:** Trabajo=#2563EB, Personal=#7C3AED, Estudio=#059669, Finanzas=#D97706, Ocio=#E11D48
- **Typography:** DM Sans via expo-font (300-800)
- **Spacing:** Grid of 4px (4/8/12/16/20/24/32/48/64)
- **Border radius:** sm=8px, md=12px, lg=16px, full=9999px
- **Icons:** @expo/ui Icon + @expo/material-symbols
- **Animations:** Simple only — tab transitions, modal opening, checkbox toggle (reanimated)

### Theme & Settings

- **ThemeContext:** Extend existing context to accept `themeMode: 'system' | 'light' | 'dark'` override
- **System mode:** When `themeMode` is `'system'`, delegates to `useColorScheme()` which reacts to OS changes in real time
- **Light/Dark mode:** When `themeMode` is `'light'` or `'dark'`, forces that value as override
- **Persistence:** AsyncStorage — stores `themeMode` value, loaded on app init
- **UI pattern:** Gear icon in the header of each main screen (Tareas, Notas, Calendario); tapping cycles: Sistema → Claro → Oscuro → Sistema
- **Icon state:** Gear icon changes visually based on active mode (e.g., filled vs outline, or different icon)
- **No separate settings screen:** The toggle is inline in the header, not a dedicated view

### Content Creation Flows

- **Tasks:** Created from tasks screen (FAB) or calendar (tap day → date pre-filled)
- **Text notes:** FAB → "Nota de texto" → full-screen editor with Markdown toggle
- **Voice notes:** FAB → "Nota de voz" → recording screen with big red button
- **Events:** FAB in calendar → form with title, all-day toggle, time pickers, category
- **Auto-save:** Every 3 seconds while editing notes, with draft preservation

---

## Testing Decisions

### Testing approach

- **Test external behavior, not implementation details** — test what the user sees and does
- **Feature-level tests** are preferred over unit tests for UI components
- **Service-level tests** for notification scheduling and audio recording logic
- **DB-level tests** for queries and migrations

### Seams (test boundaries)

1. **Tasks feature** — CRUD operations, filtering, completion flow, notification scheduling
2. **Notes feature** — CRUD operations, text/audio types, auto-save, draft management
3. **Calendar feature** — Monthly view, day view, event CRUD, notification scheduling
4. **Notification service** — Channel creation, permission flow, scheduling, cancellation
5. **Audio service** — Recording, playback, file persistence, cleanup
6. **Database layer** — Migrations, queries, index performance
7. **Theme/Settings feature** — Toggle cycle behavior, persistence, ThemeContext reactivity, header icon state

### Testing tools

- **Expo testing:** Jest (already configured with Expo)
- **Component testing:** @testing-library/react-native
- **E2E testing:** Detox (if needed for critical flows)

### Prior art

- No existing tests in the codebase (new project)
- Follow Expo's testing patterns and React Native Testing Library conventions

---

## Out of Scope

- **Google Play Store publication** — APK only for personal use
- **Device synchronization** — local data only
- **User authentication** — single user, no login
- **Habits/routines tracking** — discarded by user
- **Study notebook (study_topics, study_notes)** — discarded by user in ticket 006
- **Backup/Export** — user said "not essential", may add later
- **Web functionality** — user said "later", evaluate after MVP
- **Text search** — user said category filters are sufficient
- **Custom categories** — user confirmed 5 predefined categories are enough


---

## Further Notes

- The app must be entirely in Spanish
- The Honor X6b has Android 14 (API 34) with MagicOS 8
- Battery optimization may need to be disabled for reliable notifications
- expo-audio is the current library (expo-av is deprecated and removed from Expo Go as of SDK 55)
- Transcription via Whisper API requires network connection; offline transcription via whisper.rn is a future option
- FTS5 is enabled by default in expo-sqlite but search is out of scope for MVP
- The project already has a partial Expo structure with src/features/calendar and src/features/notes directories
