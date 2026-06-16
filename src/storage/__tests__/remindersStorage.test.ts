import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReminders, saveReminders } from '../remindersStorage';
import { Reminder } from '../../types';

const reminder: Reminder = {
  id: '1',
  title: 'Test',
  description: null,
  datetime: '2026-06-20T10:00:00.000Z',
  categoryId: 'foco_profundo',
  teamId: null,
  notificationId: 'notif-1',
};

describe('remindersStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns [] when key is absent', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    expect(await getReminders()).toEqual([]);
  });

  it('returns parsed array when key exists', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([reminder]));
    expect(await getReminders()).toEqual([reminder]);
  });

  it('saves and retrieves reminders', async () => {
    let stored: string | null = null;
    (AsyncStorage.setItem as jest.Mock).mockImplementation((_k: string, v: string) => {
      stored = v;
      return Promise.resolve();
    });
    (AsyncStorage.getItem as jest.Mock).mockImplementation(() =>
      Promise.resolve(stored),
    );
    await saveReminders([reminder]);
    expect(await getReminders()).toEqual([reminder]);
  });
});
