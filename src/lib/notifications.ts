import { Platform } from 'react-native';
import { ActiveNudge, Reminder } from '../types';

const DEFAULT_CHANNEL_ID = 'default';

// Push notifications are not available in Expo Go on Android since SDK 53.
// Local scheduled notifications remain available, so keep the module optional for tests
// and unsupported runtimes while still configuring it when present.
let ExpoNotifications: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ExpoNotifications = require('expo-notifications');
  ExpoNotifications.setNotificationHandler?.({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch {
  // running in an environment without expo-notifications
}

async function ensureAndroidNotificationChannel(): Promise<void> {
  if (!ExpoNotifications || Platform.OS !== 'android') return;
  if (!ExpoNotifications.setNotificationChannelAsync) return;

  await ExpoNotifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
    name: 'Lembretes',
    importance: ExpoNotifications.AndroidImportance?.MAX ?? 5,
    vibrationPattern: [0, 250, 250, 250],
    sound: 'default',
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!ExpoNotifications) return false;
  try {
    await ensureAndroidNotificationChannel();
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
    await ensureAndroidNotificationChannel();
    const notificationId = await ExpoNotifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.description ?? undefined,
        data: { reminderId: reminder.id },
        sound: 'default',
      },
      trigger: {
        type: ExpoNotifications.SchedulableTriggerInputTypes.DATE,
        date: trigger,
        channelId: DEFAULT_CHANNEL_ID,
      },
    });
    return notificationId;
  } catch {
    return null;
  }
}

export async function scheduleNudgeNotification(
  nudge: Pick<ActiveNudge, 'id' | 'label' | 'endsAt'>,
): Promise<string | null> {
  if (!ExpoNotifications) return null;
  try {
    const trigger = new Date(nudge.endsAt);
    if (trigger.getTime() <= Date.now()) return null;
    await ensureAndroidNotificationChannel();
    const notificationId = await ExpoNotifications.scheduleNotificationAsync({
      content: {
        title: nudge.label,
        body: 'Seu tempo acabou. Quer continuar ou encerrar?',
        data: { nudgeId: nudge.id },
        sound: 'default',
      },
      trigger: {
        type: ExpoNotifications.SchedulableTriggerInputTypes.DATE,
        date: trigger,
        channelId: DEFAULT_CHANNEL_ID,
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

export async function cancelAllNotifications(): Promise<void> {
  if (!ExpoNotifications) return;
  try {
    await ExpoNotifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignore
  }
}
