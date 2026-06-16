import AsyncStorage from '@react-native-async-storage/async-storage';
import { Team } from '../types';

const KEY = 'teams';

export async function getTeams(): Promise<Team[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  return JSON.parse(raw) as Team[];
}

export async function saveTeams(teams: Team[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(teams));
}
