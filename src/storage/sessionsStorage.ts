import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '../types';

const KEY = 'sessions';

export async function getSessions(): Promise<Session[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  return JSON.parse(raw) as Session[];
}

export async function saveSessions(sessions: Session[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(sessions));
}
