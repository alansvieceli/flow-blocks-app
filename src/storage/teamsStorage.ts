import AsyncStorage from '@react-native-async-storage/async-storage';
import { sortByOrder } from '../lib/sortByOrder';
import { Team } from '../types';

const KEY = 'teams';

export async function getTeams(): Promise<Team[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  return sortByOrder(
    (JSON.parse(raw) as Team[]).map((team, index) => ({
      ...team,
      order: team.order ?? index + 1,
    })),
  );
}

export async function saveTeams(teams: Team[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(sortByOrder(teams)));
}
