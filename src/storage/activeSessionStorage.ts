import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActiveSession } from '../types';

const KEY = 'active_session';
type ActiveSessionListener = (session: ActiveSession | null) => void;
const listeners = new Set<ActiveSessionListener>();

function notifyActiveSessionChanged(session: ActiveSession | null): void {
  listeners.forEach((listener) => listener(session));
}

export async function getActiveSession(): Promise<ActiveSession | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return null;
  return JSON.parse(raw) as ActiveSession;
}

export async function setActiveSession(session: ActiveSession): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(session));
  notifyActiveSessionChanged(session);
}

export async function clearActiveSession(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
  notifyActiveSessionChanged(null);
}

export function subscribeActiveSession(listener: ActiveSessionListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
