# Ticket: Sistema de notificaciones

**Labels:** `wayfinder:research`
**Parent:** MAP.md
**Status:** CLOSED

## Question

¿Cómo funcionan las notificaciones locales en Expo? ¿Cómo programar notificaciones para tareas con deadline y eventos con hora? Investigar expo-notifications.

## Resolution

Ver `research/005-notifications-findings.md` para investigación completa.

### Decisiones clave

| Decisión | Respuesta |
|---|---|
| Paquete | `expo-notifications` + `expo-device` + `expo-constants` |
| Config | Plugin `expo-notifications` en app.json, `useNextNotificationsApi: true` |
| Canales | 2 canales: `tasks` (HIGH importance) y `events` (HIGH importance) |
| Permisos | Crear canal ANTES de solicitar permiso (Android 13+ requerido) |
| Scheduling | Trigger `DATE` para deadlines de tareas y recordatorios de eventos |
| Cancelación | `cancelScheduledNotificationAsync(id)` con IDs almacenados en SQLite |
| Background | Las notificaciones programadas se disparan con app cerrada (AlarmManager) |
| IDs | Formato `task-${taskId}` y `event-${eventId}` |

### Flujo de inicialización

1. Crear canales de notificación (tasks, events)
2. Solicitar permiso `POST_NOTIFICATIONS`
3. Configurar handler para primer plano
4. Al schedulear: devolver ID para guardar en SQLite
5. Al completar tarea: cancelar notificación por ID

### Limitaciones

- Si el usuario deniega permiso, no se puede re-promptear sin reinstalar
- Honor X6b puede matar procesos en background — guiar al usuario para eximir de optimización de batería
- No hay ejecución de JS en background sin `expo-task-manager`
