import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getActiveSession,
  setActiveSession,
  clearActiveSession,
} from './activeSessionStorage';
import { ActiveSession } from '../types';

jest.mock('@react-native-async-storage/async-storage');

const active: ActiveSession = {
  id: 'a1',
  categoryId: 'reunioes',
  teamId: '2',
  startedAt: '2026-01-01T09:00:00.000Z',
};

beforeEach(() => AsyncStorage.clear());

describe('activeSessionStorage', () => {
  it('returns null when nothing stored', async () => {
    expect(await getActiveSession()).toBeNull();
  });

  it('sets and retrieves active session', async () => {
    await setActiveSession(active);
    expect(await getActiveSession()).toEqual(active);
  });

  it('clears active session', async () => {
    await setActiveSession(active);
    await clearActiveSession();
    expect(await getActiveSession()).toBeNull();
  });
});
