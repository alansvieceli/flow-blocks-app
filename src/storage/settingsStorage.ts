import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppSettings {
  notificationsEnabled: boolean;
  historyMonths: number;
  nudgeAbandonHours: number;
  workStartHour: number;
  workEndHour: number;
  lunchDurationMinutes: number;
  sessionReminderIntervalMinutes: number | null;
  sessionReminderCount: number;
}

const KEY = 'appSettings';

const DEFAULTS: AppSettings = {
  notificationsEnabled: true,
  historyMonths: 4,
  nudgeAbandonHours: 8,
  workStartHour: 8,
  workEndHour: 18,
  lunchDurationMinutes: 60,
  sessionReminderIntervalMinutes: 60,
  sessionReminderCount: 12,
};

export async function getSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return { ...DEFAULTS };
  return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<AppSettings>) };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(settings));
}
