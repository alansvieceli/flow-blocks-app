import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActiveNudge } from '../types';

const KEY = 'active_nudge';
type ActiveNudgeListener = (nudge: ActiveNudge | null) => void;
const listeners = new Set<ActiveNudgeListener>();

function notify(nudge: ActiveNudge | null): void {
  listeners.forEach((l) => l(nudge));
}

export async function getActiveNudge(): Promise<ActiveNudge | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return null;
  return JSON.parse(raw) as ActiveNudge;
}

export async function setActiveNudge(nudge: ActiveNudge): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(nudge));
  notify(nudge);
}

export async function clearActiveNudge(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
  notify(null);
}

export function subscribeActiveNudge(listener: ActiveNudgeListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
