# 06 — Notifications: Task + Event Reminders

**What to build:** Notification channels created on first launch, permission prompt shown. Task due date triggers notification, cancelled if completed. Timed events trigger 15-min reminder, all-day events trigger morning notification. Event deletion cancels its notification.

**Blocked by:** 02 — Tasks: List + CRUD + Completion, 03 — Calendar: Monthly Grid + Events CRUD

**Status:** ready-for-agent

- [ ] Two notification channels created on app launch: "Tareas" (HIGH importance) and "Eventos" (HIGH importance)
- [ ] Permission prompt shown on first launch, before any scheduling
- [ ] Task creation with due date schedules a notification at the due date
- [ ] Completing a task before its due date cancels the scheduled notification
- [ ] Timed event creation schedules a notification 15 minutes before start time
- [ ] All-day event creation schedules a morning notification (8:00 AM local)
- [ ] Deleting an event cancels its scheduled notification
- [ ] Notification IDs follow format: task-{taskId} and event-{eventId}
- [ ] Notification IDs are stored in SQLite for reliable cancellation
- [ ] Notifications fire via AlarmManager even when app is closed
