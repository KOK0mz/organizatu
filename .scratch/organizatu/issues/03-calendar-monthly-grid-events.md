# 03 — Calendar: Monthly Grid + Events CRUD

**What to build:** User sees a monthly calendar with dots on days that have events, taps a day to see events (all-day first, then timed chronologically). Creates/edits/deletes events via FAB with title, all-day toggle, time pickers, category. Can create a task from calendar with date pre-filled.

**Blocked by:** 01 — Foundation: SQLite + Design System + Navigation

**Status:** ready-for-agent

- [ ] Monthly calendar grid renders with correct days for the current month
- [ ] Days with events show a colored dot indicator
- [ ] Tapping a day opens a day view listing all events for that day
- [ ] Events are sorted: all-day events first, then timed events chronologically
- [ ] FAB on calendar/day view opens event creation form
- [ ] Event form includes: title (required), all-day toggle, start/end time pickers (for timed events), category selector, optional description
- [ ] Events are persisted in SQLite
- [ ] Empty day state shown when no events exist, with "Crear evento" CTA
- [ ] Creating a task from calendar view pre-fills the due date
- [ ] Navigation between months via arrows or swipe
