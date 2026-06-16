import { Reminder } from '../types';

// expo-notifications was removed from Expo Go in SDK 53.
// We load it dynamically so the app still works in Expo Go (without notifications).
let ExpoNotifications: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ExpoNotifications = require('expo-notifications');
} catch {
  // running in Expo Go or environment without expo-notifications
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!ExpoNotifications) return false;
  try {
    const { status } = await ExpoNotifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleReminderNotification(
  reminder: Pick<Reminder, 'id' | 'title' | 'description' | 'datetime'>,
): Promise<string | null> {
  if (!ExpoNotifications) return null;
  try {
    const trigger = new Date(reminder.datetime);
    if (trigger.getTime() <= Date.now()) return null;
    const notificationId = await ExpoNotifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.description ?? undefined,
        data: { reminderId: reminder.id },
      },
      trigger: {
        type: ExpoNotifications.SchedulableTriggerInputTypes.DATE,
        date: trigger,
      },
    });
    return notificationId;
  } catch {
    return null;
  }
}

export async function cancelReminderNotification(
  notificationId: string,
): Promise<void> {
  if (!ExpoNotifications) return;
  try {
    await ExpoNotifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // ignore
  }
}
