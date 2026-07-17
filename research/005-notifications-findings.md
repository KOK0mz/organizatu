# 005 — Local Notifications in Expo (Android)

**Project:** OrganizaTu (Expo SDK 57, React Native 0.86)
**Target:** Honor X6b (Android)
**Status:** Research complete

---

## 1. expo-notifications Setup

### Installation

```bash
npx expo install expo-notifications expo-device expo-constants
```

- `expo-notifications`: Core notification APIs (scheduling, permissions, channels)
- `expo-device`: Check if running on a physical device (notifications don't work on emulators)
- `expo-constants`: Access `projectId` for push tokens (not needed for local-only, but good to have)

### app.json Configuration

Add the `expo-notifications` plugin and Android-specific settings:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#208AEF",
          "defaultChannel": "default"
        }
      ]
    ],
    "android": {
      "package": "com.organizatu.app",
      "adaptiveIcon": { ... },
      "useNextNotificationsApi": true
    }
  }
}
```

**Config plugin options** (build-time only, require `eas build` or `npx expo run:android`):

| Option | Description |
|--------|-------------|
| `icon` | Local path to 96x96 all-white PNG with transparency |
| `color` | Tint color for notification tray icon |
| `defaultChannel` | Default Android notification channel for FCM notifications |
| `sounds` | Array of local `.wav` file paths for custom sounds |

### Android Manifest Permissions (auto-added by expo-notifications)

| Permission | Purpose |
|------------|---------|
| `RECEIVE_BOOT_COMPLETED` | Re-schedule notifications after device restart |
| `SCHEDULE_EXACT_ALARM` | Fire notifications at exact times (Android 12+ / API 31+) |

> These are added automatically by the library's AndroidManifest.xml. No manual config needed.

### Critical SDK 53+ Note

Push notifications (remote) **no longer work in Expo Go on Android** as of SDK 53. Local notifications still work in Expo Go for prototyping. A development build (`expo-dev-client`) is required for remote push notifications.

For OrganizaTu (SDK 57): **We only need local notifications**, so Expo Go is sufficient for development/testing.

---

## 2. Scheduling Local Notifications

### Foreground Handler Setup

Must be called at module top-level (e.g., in root layout or a notifications module):

```ts
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
```

This controls how notifications behave **when the app is in the foreground**.

### Schedule a One-Time Notification (Task Deadline)

```ts
async function scheduleTaskDeadline(
  taskId: string,
  title: string,
  body: string,
  deadlineDate: Date
): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { type: 'task', taskId },
      sound: true,
      channelId: 'tasks',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: deadlineDate,
    },
  });

  return notificationId;
}

// Usage
const deadline = new Date('2026-07-20T14:00:00');
const id = await scheduleTaskDeadline(
  'task-abc123',
  'Tarea por vencer',
  'Completar informe antes de las 14:00',
  deadline
);
```

### Schedule a Notification for a Calendar Event

```ts
async function scheduleEventReminder(
  eventId: string,
  title: string,
  body: string,
  eventDate: Date,
  reminderMinutes: number = 15
): Promise<string> {
  // Schedule notification X minutes before the event
  const triggerDate = new Date(eventDate.getTime() - reminderMinutes * 60 * 1000);

  // Don't schedule if the trigger date is in the past
  if (triggerDate <= new Date()) {
    return '';
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { type: 'event', eventId },
      sound: true,
      channelId: 'events',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });

  return notificationId;
}

// Usage
const eventDate = new Date('2026-07-21T10:00:00');
const id = await scheduleEventReminder(
  'event-xyz789',
  'Reunión de equipo',
  'Comienza en 15 minutos — Sala 3',
  eventDate,
  15 // reminder 15 min before
);
```

### Schedule a Repeating Notification

```ts
// Daily reminder at a specific hour
const dailyId = await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Revisa tus tareas',
    body: 'Tienes tareas pendientes para hoy',
    channelId: 'tasks',
  },
  trigger: {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour: 9,
    minute: 0,
  },
});
```

### Trigger Types Summary

| Type | Use Case | Platforms |
|------|----------|-----------|
| `DATE` | Fire once at a specific `Date` object | Android, iOS |
| `TIME_INTERVAL` | Fire after N seconds from now | Android, iOS |
| `DAILY` | Fire every day at hour:minute | Android, iOS |
| `CALENDAR` | Fire on matching calendar components | iOS only |

> For Android, use `DATE` for task deadlines and event reminders. `CALENDAR` trigger is iOS-only.

---

## 3. Android 13+ (API 33) Notification Permissions

### What Changed

Starting with Android 13 (API 33), users **must explicitly opt-in** to receive notifications. On Android 12 and below, notifications were enabled by default. On Android 13+, they are **off by default** until the user grants the `POST_NOTIFICATIONS` permission.

### Critical Gotcha: Channel Before Permission

The permission prompt **will not appear** until at least one notification channel is created. This is a common source of bugs.

**Correct order:**
1. Create notification channel → `setNotificationChannelAsync()`
2. Request permission → `requestPermissionsAsync()`
3. Get push token (if needed)

### Runtime Permission Flow

```ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

async function requestNotificationPermission(): Promise<boolean> {
  // Not needed on web/emulator
  if (!Device.isDevice) return false;

  // Step 1: Create channel BEFORE requesting permission (Android 13 requirement)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'General',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // Step 2: Check existing permission status
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') return true;

  // Step 3: Request permission (shows system dialog on Android 13+)
  const { status } = await Notifications.requestPermissionsAsync();

  return status === 'granted';
}
```

### Permission Behavior by Android Version

| Android Version | API Level | Behavior |
|----------------|-----------|----------|
| 12L and below | ≤ 32 | Notifications enabled by default |
| 13+ | 33+ | Notifications off by default, must request `POST_NOTIFICATIONS` |
| Existing users upgrading | — | Permission auto-granted if notifications were not disabled |

### Important Notes

- If a user denies the permission, the app **cannot** re-prompt them until the app is uninstalled/reinstalled or updated to target a new SDK version
- The Expo `requestPermissionsAsync()` handles the `POST_NOTIFICATIONS` permission internally for SDK 57
- There is no `shouldShowRequestPermissionRationale` equivalent in expo-notifications — if denied, you can only show an in-app settings redirect

---

## 4. Cancelling Notifications

### Cancel a Specific Notification by Identifier

```ts
// scheduleNotificationAsync returns the identifier
const notificationId = await Notifications.scheduleNotificationAsync({
  content: { title: 'Tarea', body: 'Vence mañana' },
  trigger: {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: tomorrow,
  },
});

// Later, cancel it (e.g., when task is completed)
await Notifications.cancelScheduledNotificationAsync(notificationId);
```

### Cancel All Notifications

```ts
// Nuclear option — cancels everything
await Notifications.cancelAllScheduledNotificationsAsync();
```

### Cancel Multiple Notifications for a Task

A task may have multiple scheduled notifications (deadline reminder + recurring check). Store all IDs and cancel them:

```ts
// Store notification IDs when scheduling
interface TaskNotifications {
  taskId: string;
  notificationIds: string[];
}

// Cancel all notifications for a specific task
async function cancelTaskNotifications(notificationIds: string[]): Promise<void> {
  for (const id of notificationIds) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }
}
```

### List All Scheduled Notifications

```ts
const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
console.log(`Pending: ${allScheduled.length}`);

// Filter by data payload
const taskNotifications = allScheduled.filter(
  (n) => n.content.data?.type === 'task' && n.content.data?.taskId === 'task-abc123'
);
```

### Dismiss vs Cancel

| Function | What it does |
|----------|-------------|
| `cancelScheduledNotificationAsync(id)` | Prevents a **future** scheduled notification from firing |
| `dismissNotificationAsync(id)` | Removes an **already-displayed** notification from the tray |
| `dismissAllNotificationsAsync()` | Removes all displayed notifications from the tray |

---

## 5. Notification Channels (Android 8.0+)

### Why Channels Matter

Starting with Android 8.0 (API 26), **every notification must be assigned to a channel**. If no channel is specified, `expo-notifications` falls back to a "Miscellaneous" channel — which has "Pop on screen" disabled by default, making notifications invisible.

### Recommended Channels for OrganizaTu

```ts
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  // Task deadline notifications — high priority, heads-up
  await Notifications.setNotificationChannelAsync('tasks', {
    name: 'Tareas',
    description: 'Recordatorios de fechas límite de tareas',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#208AEF',
    sound: 'default',
    enableLights: true,
    enableVibrate: true,
    showBadge: true,
  });

  // Calendar event notifications — high priority, heads-up
  await Notifications.setNotificationChannelAsync('events', {
    name: 'Eventos',
    description: 'Recordatorios de eventos del calendario',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#4CAF50',
    sound: 'default',
    enableLights: true,
    enableVibrate: true,
    showBadge: true,
  });

  // General app notifications — default priority
  await Notifications.setNotificationChannelAsync('general', {
    name: 'General',
    description: 'Notificaciones generales de la aplicación',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });
}
```

### Channel Importance Levels

| Level | Behavior |
|-------|----------|
| `MIN` | No sound, no visual interruption, shade only |
| `LOW` | No sound, no heads-up, status bar only |
| `DEFAULT` | Sound, no heads-up |
| `HIGH` | Sound + heads-up (pop on screen) |
| `MAX` | Sound + heads-up + override Doze |

### Channel Limitations

- Once created, **only `name` and `description` can be changed** — importance, sound, vibration are locked in
- To change locked settings, you must delete the channel and create a new one with a different ID
- Users can always override channel settings in Android Settings → App → Notifications

### Assigning Channel to Notifications

```ts
await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Tarea por vencer',
    body: 'Vence en 1 hora',
    channelId: 'tasks', // ← Must match a channel ID
  },
  trigger: {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: deadline,
    channelId: 'tasks', // ← Also specify here for reliability
  },
});
```

> Always explicitly set `channelId` on every notification to avoid the "Miscellaneous" fallback.

---

## 6. Background Notifications

### Can Notifications Fire When the App Is Closed?

**Yes.** Scheduled local notifications fire even when the app is completely terminated. This is handled by the Android OS scheduler, not by the running app.

**How it works:**
1. `scheduleNotificationAsync()` registers the notification with the Android `AlarmManager`
2. The OS fires the notification at the scheduled time, even if the app is not running
3. The `RECEIVE_BOOT_COMPLETED` permission ensures notifications survive device restarts

### App State Behaviors

| State | What Happens |
|-------|-------------|
| **Foreground** | `setNotificationHandler` callback runs → show banner/sound as configured |
| **Background** | OS shows notification in tray, app's `NotificationReceivedListener` fires |
| **Terminated** | OS shows notification in tray, listener does NOT fire until app is opened |
| **Tapped (from any state)** | `NotificationResponseReceivedListener` fires |

### Limitations

1. **Doze Mode**: Android's battery optimization may delay notifications when the device is idle and not charging. Using `SCHEDULE_EXACT_ALARM` permission (auto-added by expo-notifications) mitigates this for most cases.

2. **Force-stopped apps**: If the user force-stops the app from Android Settings, the OS will not deliver any notifications until the app is manually opened again.

3. **Battery optimization**: Honor devices (and other manufacturers) may aggressively kill background processes. The user may need to exempt the app from battery optimization for reliable notifications.

4. **No JS execution in background**: Local scheduled notifications don't run any JavaScript code — they simply display a notification. If you need to execute JS in the background (e.g., to fetch data before showing a notification), you need `expo-task-manager` with headless background tasks.

### Handling Notification Taps (Deep Linking)

```ts
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

export function useNotificationResponse() {
  const router = useRouter();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    // Handle notification tap when app is opened from terminated state
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) handleResponse(response);
    });

    // Handle notification taps while app is running
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => handleResponse(response)
    );

    return () => {
      responseListener.current?.remove();
    };
  }, []);

  function handleResponse(response: Notifications.NotificationResponse) {
    const data = response.notification.request.content.data;

    if (data.type === 'task' && data.taskId) {
      router.push(`/task/${data.taskId}`);
    } else if (data.type === 'event' && data.eventId) {
      router.push(`/event/${data.eventId}`);
    }
  }
}
```

---

## 7. Best Practices

### Notification Identifier Structure

Use a consistent, predictable naming convention so IDs can be constructed and matched:

```
task-${taskId}                    → deadline reminder
task-${taskId}-check              → recurring check (if applicable)
event-${eventId}                  → event reminder
event-${eventId}-pre              → pre-event reminder (e.g., 1 hour before)
daily-reminder                    → daily recurring check
```

Example:

```ts
function getTaskNotificationId(taskId: string): string {
  return `task-${taskId}`;
}

function getEventNotificationId(eventId: string): string {
  return `event-${eventId}`;
}
```

### Notification Content Guidelines

```ts
{
  title: 'Tarea por vencer',           // Short, action-oriented
  body: 'Completar informe — vence en 2 horas',  // Include context + time
  data: {
    type: 'task',                      // For routing on tap
    taskId: 'abc-123',                 // For matching/cancelling
  },
  sound: true,                         // Play default sound
  channelId: 'tasks',                 // Always explicit
}
```

### Sound & Vibration

- Use `sound: 'default'` for standard notification sound
- Custom sounds require `.wav` files in `assets/sounds/` and config in `app.json` plugin
- Vibration patterns are set at the **channel level**, not per notification
- Recommended pattern: `[0, 250, 250, 250]` (short buzz-pause-buzz-pause-buzz)

### Persist Notification IDs

Store notification IDs in persistent storage (e.g., SQLite with expo-sqlite, or AsyncStorage/MMKV) to:

1. Cancel notifications when tasks are completed/deleted
2. Recover notification state after app reinstall
3. Query which notifications are still pending

```ts
// Example: Store alongside task in SQLite
// INSERT INTO tasks (id, title, deadline, notification_id) VALUES (...)
// When completing a task:
// SELECT notification_id FROM tasks WHERE id = ?
// await Notifications.cancelScheduledNotificationAsync(notificationId);
```

### Complete Initialization Flow

```ts
// notifications/setup.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export async function initializeNotifications(): Promise<boolean> {
  // 1. Set foreground handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  // 2. Create channels (BEFORE requesting permissions on Android 13+)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('tasks', {
      name: 'Tareas',
      description: 'Recordatorios de tareas',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('events', {
      name: 'Eventos',
      description: 'Recordatorios de eventos',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
    });
  }

  // 3. Request permissions
  if (!Device.isDevice) return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}
```

### Recommended Architecture for OrganizaTu

```
src/
  notifications/
    setup.ts          ← initializeNotifications(), channel setup
    scheduler.ts      ← scheduleTaskNotification(), scheduleEventNotification()
    canceller.ts      ← cancelTaskNotifications(), cancelEventNotifications()
    handlers.ts       ← setNotificationHandler(), response listener
    identifiers.ts    ← ID generation helpers
```

---

## 8. Honor X6b Specific Considerations

The Honor X6b runs Android 14 (API 34) with MagicOS 8. Key considerations:

- **POST_NOTIFICATIONS permission**: Required (Android 13+). Handled by the flow above.
- **Battery optimization**: MagicOS may aggressively kill background processes. Users should be guided to exempt the app from battery optimization if notifications are unreliable.
- **Notification channels**: Fully supported. No known issues.
- **Exact alarms**: Supported via `SCHEDULE_EXACT_ALARM`. May require user confirmation on some Honor devices.

---

## 9. Dependencies to Add

```bash
npx expo install expo-notifications
```

Optional but recommended:
```bash
npx expo install expo-device expo-constants
```

For background JS execution (if needed in the future):
```bash
npx expo install expo-task-manager
```

---

## 10. Sources

- Expo Notifications SDK docs: https://docs.expo.dev/versions/latest/sdk/notifications/
- Expo Push Notifications Setup: https://docs.expo.dev/push-notifications/push-notifications-setup/
- Android Notification Permission (API 33): https://developer.android.com/develop/ui/views/notifications/notification-permission
- Expo Notification Channels guide: https://docs.expo.dev/archive/push-notifications/notification-channels
- What you need to know about notifications: https://docs.expo.dev/push-notifications/what-you-need-to-know/
- Expo SDK 57 release notes: https://docs.expo.dev/versions/v57.0.0/
