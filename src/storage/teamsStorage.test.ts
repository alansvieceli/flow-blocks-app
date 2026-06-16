import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTeams, saveTeams } from './teamsStorage';
import { Team } from '../types';

const team: Team = { id: '1', name: 'Alpha', maxWeeklyPercent: 40 };

beforeEach(() => AsyncStorage.clear());

describe('teamsStorage', () => {
  it('returns empty array when nothing stored', async () => {
    expect(await getTeams()).toEqual([]);
  });

  it('saves and retrieves teams', async () => {
    await saveTeams([team]);
    expect(await getTeams()).toEqual([team]);
  });

  it('overwrites with new list', async () => {
    await saveTeams([team]);
    await saveTeams([]);
    expect(await getTeams()).toEqual([]);
  });
});
