import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSessions, saveSessions } from './sessionsStorage';
import { Session } from '../types';

jest.mock('@react-native-async-storage/async-storage');

const session: Session = {
  id: 's1',
  categoryId: 'foco_profundo',
  teamId: '1',
  startedAt: '2026-01-01T09:00:00.000Z',
  endedAt: '2026-01-01T10:00:00.000Z',
  durationSeconds: 3600,
  note: null,
};

beforeEach(() => AsyncStorage.clear());

describe('sessionsStorage', () => {
  it('returns empty array when nothing stored', async () => {
    expect(await getSessions()).toEqual([]);
  });

  it('saves and retrieves sessions', async () => {
    await saveSessions([session]);
    expect(await getSessions()).toEqual([session]);
  });

  it('overwrites with new list', async () => {
    await saveSessions([session]);
    await saveSessions([]);
    expect(await getSessions()).toEqual([]);
  });
});
