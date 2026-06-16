import AsyncStorage from '@react-native-async-storage/async-storage';
import { Reminder } from '../types';

const KEY = 'reminders';

export async function getReminders(): Promise<Reminder[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  return JSON.parse(raw) as Reminder[];
}

export async function saveReminders(reminders: Reminder[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(reminders));
}
