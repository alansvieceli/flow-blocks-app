import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActiveSession } from '../types';

const KEY = 'active_session';

export async function getActiveSession(): Promise<ActiveSession | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return null;
  return JSON.parse(raw) as ActiveSession;
}

export async function setActiveSession(session: ActiveSession): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(session));
}

export async function clearActiveSession(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
