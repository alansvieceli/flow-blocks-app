# Task 011-01 - Types + Storage

## Plan Reference

`docs/plans/011-activity-nudge-plan.md`

## Status

Pending

## Description

Add the `ActiveNudge` type and `activeNudgeStorage` helpers. Mirrors the existing `ActiveSession` / `activeSessionStorage` pattern exactly.

---

- [ ] **Step 1: Add `ActiveNudge` to `src/types/index.ts`**

Append after the `Reminder` interface:

```ts
export interface ActiveNudge {
  id: string;
  label: string;
  type: 'personal' | 'work';
  activityId?: string;
  teamId?: string;
  categoryId?: string;
  startedAt: string;
  durationSeconds: number;
  endsAt: string;
  notificationId: string | null;
  extendCount: number;
}
```

- [ ] **Step 2: Create `src/storage/activeNudgeStorage.ts`**

```ts
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
```

- [ ] **Step 3: Write the tests — create `src/storage/activeNudgeStorage.test.ts`**

```ts
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
```

- [ ] **Step 4: Run tests**

```bash
npm test -- activeNudgeStorage --watchAll=false
```

Expected: 4 tests pass.

## Acceptance Criteria

- `ActiveNudge` exported from `src/types/index.ts`.
- `activeNudgeStorage` exports `getActiveNudge`, `setActiveNudge`, `clearActiveNudge`, `subscribeActiveNudge`.
- All 4 tests pass.
- `npm run check` passes.
