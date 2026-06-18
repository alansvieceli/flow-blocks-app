import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getActiveNudge,
  setActiveNudge,
  clearActiveNudge,
  subscribeActiveNudge,
} from './activeNudgeStorage';
import { ActiveNudge } from '../types';

const nudge: ActiveNudge = {
  id: 'n1',
  label: 'Video Game',
  type: 'personal',
  activityId: 'act-1',
  startedAt: '2026-01-01T20:00:00.000Z',
  durationSeconds: 3600,
  endsAt: '2026-01-01T21:00:00.000Z',
  notificationId: 'notif-1',
  extendCount: 0,
};

beforeEach(() => AsyncStorage.clear());

describe('activeNudgeStorage', () => {
  it('returns null when nothing stored', async () => {
    expect(await getActiveNudge()).toBeNull();
  });

  it('sets and retrieves active nudge', async () => {
    await setActiveNudge(nudge);
    expect(await getActiveNudge()).toEqual(nudge);
  });

  it('clears active nudge', async () => {
    await setActiveNudge(nudge);
    await clearActiveNudge();
    expect(await getActiveNudge()).toBeNull();
  });

  it('notifies subscribers on set and clear', async () => {
    const listener = jest.fn();
    const unsubscribe = subscribeActiveNudge(listener);

    await setActiveNudge(nudge);
    await clearActiveNudge();
    unsubscribe();
    await setActiveNudge(nudge);

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenNthCalledWith(1, nudge);
    expect(listener).toHaveBeenNthCalledWith(2, null);
  });
});
