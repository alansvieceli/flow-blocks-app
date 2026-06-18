# Task 011-04 - AppDataProvider: activeNudge state

## Plan Reference

`docs/plans/011-activity-nudge-plan.md`

## Status

Pending

## Description

Wire `activeNudge` into `AppDataProvider` following the same pattern as `activeSession`. The home screen and nudge form will read and mutate nudge state through the provider.

---

- [ ] **Step 1: Add imports to `src/state/AppDataProvider.tsx`**

Add alongside the existing `activeSessionStorage` imports:

```ts
import {
  clearActiveNudge,
  getActiveNudge,
  setActiveNudge as persistActiveNudge,
  subscribeActiveNudge,
} from '../storage/activeNudgeStorage';
```

Add `ActiveNudge` to the types import:

```ts
import {
  ActiveNudge,
  ActiveSession,
  Category,
  // ... rest unchanged
} from '../types';
```

- [ ] **Step 2: Add `activeNudge` to `AppDataState` and `AppDataContextValue`**

In `AppDataState`:

```ts
interface AppDataState {
  activeNudge: ActiveNudge | null; // add this
  activeSession: ActiveSession | null;
  // ... rest unchanged
}
```

In `AppDataContextValue`:

```ts
interface AppDataContextValue extends AppDataState {
  clearActiveNudge: () => Promise<void>; // add this
  setActiveNudge: (nudge: ActiveNudge) => Promise<void>; // add this
  // ... rest unchanged
}
```

- [ ] **Step 3: Update initial state in `AppDataProvider`**

```ts
const [state, setState] = useState<AppDataState>({
  activeNudge: null, // add this
  activeSession: null,
  // ... rest unchanged
});
```

- [ ] **Step 4: Load `activeNudge` on startup in `loadAppData`**

Add `getActiveNudge()` to the `Promise.all` call:

```ts
const [
  teams,
  sessions,
  activeSession,
  activeNudge, // add this
  categories,
  reminders,
  settings,
  personalActivities,
  personalWeeklyTemplate,
  personalDailyPlans,
] = await Promise.all([
  getTeams(),
  getSessions(),
  getActiveSession(),
  getActiveNudge(), // add this
  getCategories(),
  getReminders(),
  getSettings(),
  getPersonalActivities(),
  getPersonalWeeklyTemplate(),
  getPersonalDailyPlans(),
]);
```

Add `activeNudge` to the returned object at the bottom of `loadAppData`:

```ts
return {
  activeNudge, // add this
  activeSession,
  categories,
  // ... rest unchanged
};
```

- [ ] **Step 5: Subscribe to nudge changes (alongside the session subscription)**

In the `useEffect` inside `AppDataProvider`:

```ts
useEffect(() => {
  void refreshAll();
  const unsubSession = subscribeActiveSession((activeSession) => {
    setState((current) => ({ ...current, activeSession }));
  });
  const unsubNudge = subscribeActiveNudge((activeNudge) => {
    // add this
    setState((current) => ({ ...current, activeNudge })); // add this
  }); // add this
  return () => {
    unsubSession();
    unsubNudge(); // add this
  };
}, [refreshAll]);
```

- [ ] **Step 6: Add `setActiveNudge` and `clearActiveNudge` to the context value**

Inside the `useMemo` that builds the context value, add:

```ts
clearActiveNudge: async () => {
  setState((current) => ({ ...current, activeNudge: null }));
  await clearActiveNudge();
},
setActiveNudge: async (activeNudge) => {
  setState((current) => ({ ...current, activeNudge }));
  await persistActiveNudge(activeNudge);
},
```

- [ ] **Step 7: Add `active_nudge` key to `ALL_STORAGE_KEYS` so `resetAll` clears it**

```ts
const ALL_STORAGE_KEYS = [
  'active_nudge', // add this
  'teams',
  'sessions',
  // ... rest unchanged
] as const;
```

- [ ] **Step 8: Run check**

```bash
npm run check
```

Expected: no TypeScript errors.

## Acceptance Criteria

- `useAppData()` exposes `activeNudge`, `setActiveNudge`, `clearActiveNudge`.
- `activeNudge` is loaded from storage on app startup.
- Subscribers are notified when nudge changes.
- `resetAll` clears the nudge key.
- `npm run check` passes.
