# Session Reminder + Manual Entry Presets — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add configurable periodic session-reminder notifications (spec 015) and update manual-entry duration presets to 15m / 30m / 50m (spec 012). Spec 016 is already implemented via `history.tsx` + `manual-entry.tsx?sessionId`.

**Architecture:** On session start, schedule a fixed batch of local notifications spaced `sessionReminderIntervalMinutes` apart. Store their IDs on `ActiveSession`. On session stop, cancel all pending IDs. Two new settings fields (`sessionReminderIntervalMinutes`, `sessionReminderCount`) are added to `AppSettings`.

**Tech Stack:** React Native / Expo, expo-notifications, AsyncStorage, TypeScript, Jest.

---

### Task 1: Update duration presets (spec 012)

**Files:**

- Modify: `app/manual-entry.tsx` (lines 23–28)

- [ ] **Step 1: Update `DURATION_PRESETS`**

Replace:

```ts
const DURATION_PRESETS = [
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '45m', minutes: 45 },
  { label: '1h', minutes: 60 },
];
```

With:

```ts
const DURATION_PRESETS = [
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '50m', minutes: 50 },
];
```

- [ ] **Step 2: Run check**

```bash
npm run check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/manual-entry.tsx
git commit -m "feat: update manual-entry presets to 15m/30m/50m (spec 012)"
```

---

### Task 2: Types + settings storage (spec 015)

**Files:**

- Modify: `src/types/index.ts`
- Modify: `src/storage/settingsStorage.ts`
- Modify: `src/storage/settingsStorage.test.ts`

- [ ] **Step 1: Add `reminderNotificationIds` to `ActiveSession`**

In `src/types/index.ts`, find the `ActiveSession` interface and add the optional field:

```ts
export interface ActiveSession {
  id: string;
  categoryId: CategoryId;
  teamId: string | null;
  startedAt: string;
  reminderNotificationIds?: string[];
}
```

- [ ] **Step 2: Add new settings fields to `AppSettings` and `DEFAULTS`**

In `src/storage/settingsStorage.ts`, update `AppSettings`:

```ts
export interface AppSettings {
  notificationsEnabled: boolean;
  historyMonths: number;
  nudgeAbandonHours: number;
  workStartHour: number;
  workEndHour: number;
  lunchDurationMinutes: number;
  sessionReminderIntervalMinutes: number | null;
  sessionReminderCount: number;
}
```

Update `DEFAULTS`:

```ts
const DEFAULTS: AppSettings = {
  notificationsEnabled: true,
  historyMonths: 4,
  nudgeAbandonHours: 8,
  workStartHour: 8,
  workEndHour: 18,
  lunchDurationMinutes: 60,
  sessionReminderIntervalMinutes: 60,
  sessionReminderCount: 12,
};
```

- [ ] **Step 3: Update `DEFAULT_SETTINGS` in `AppDataProvider`**

In `src/state/AppDataProvider.tsx`, update the `DEFAULT_SETTINGS` constant (lines ~88–95):

```ts
const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: true,
  historyMonths: 4,
  nudgeAbandonHours: 8,
  workStartHour: 8,
  workEndHour: 18,
  lunchDurationMinutes: 60,
  sessionReminderIntervalMinutes: 60,
  sessionReminderCount: 12,
};
```

- [ ] **Step 4: Write failing tests for new settings fields**

Add to `src/storage/settingsStorage.test.ts`:

```ts
it('returns default sessionReminderIntervalMinutes of 60', async () => {
  const settings = await getSettings();
  expect(settings.sessionReminderIntervalMinutes).toBe(60);
});

it('returns default sessionReminderCount of 12', async () => {
  const settings = await getSettings();
  expect(settings.sessionReminderCount).toBe(12);
});

it('merges session reminder fields from old stored format', async () => {
  await AsyncStorage.setItem(
    'appSettings',
    JSON.stringify({ notificationsEnabled: false, historyMonths: 3 }),
  );
  const settings = await getSettings();
  expect(settings.sessionReminderIntervalMinutes).toBe(60);
  expect(settings.sessionReminderCount).toBe(12);
});

it('saves and retrieves sessionReminderIntervalMinutes as null (disabled)', async () => {
  await saveSettings({
    notificationsEnabled: true,
    historyMonths: 4,
    nudgeAbandonHours: 8,
    workStartHour: 8,
    workEndHour: 18,
    lunchDurationMinutes: 60,
    sessionReminderIntervalMinutes: null,
    sessionReminderCount: 6,
  });
  const settings = await getSettings();
  expect(settings.sessionReminderIntervalMinutes).toBeNull();
  expect(settings.sessionReminderCount).toBe(6);
});
```

- [ ] **Step 5: Run tests**

```bash
npm test -- --testPathPattern="settingsStorage" --no-coverage
```

Expected: all tests pass.

- [ ] **Step 6: Run check**

```bash
npm run check
```

- [ ] **Step 7: Commit**

```bash
git add src/types/index.ts src/storage/settingsStorage.ts src/storage/settingsStorage.test.ts src/state/AppDataProvider.tsx
git commit -m "feat: add session reminder fields to AppSettings and ActiveSession types (spec 015)"
```

---

### Task 3: Notification helper (spec 015)

**Files:**

- Modify: `src/lib/notifications.ts`

- [ ] **Step 1: Add `scheduleSessionReminderNotification`**

Append to `src/lib/notifications.ts` (after `cancelAllNotifications`):

```ts
export async function scheduleSessionReminderNotification(opts: {
  startedAt: string;
  fireAt: number;
}): Promise<string | null> {
  if (!ExpoNotifications) return null;
  try {
    const trigger = new Date(opts.fireAt);
    if (trigger.getTime() <= Date.now()) return null;
    await ensureAndroidNotificationChannel();
    const elapsedHours = Math.round(
      (opts.fireAt - new Date(opts.startedAt).getTime()) / 3_600_000,
    );
    const body =
      elapsedHours <= 1
        ? 'Você tem uma sessão ativa há 1 hora. Toque para verificar.'
        : `Você tem uma sessão ativa há ${elapsedHours} horas. Toque para verificar.`;
    const notificationId = await ExpoNotifications.scheduleNotificationAsync({
      content: {
        title: 'Sessão em andamento',
        body,
        sound: 'default',
      },
      trigger: {
        type: ExpoNotifications.SchedulableTriggerInputTypes.DATE,
        date: trigger,
        channelId: DEFAULT_CHANNEL_ID,
      },
    });
    return notificationId;
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Run check**

```bash
npm run check
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/notifications.ts
git commit -m "feat: add scheduleSessionReminderNotification helper (spec 015)"
```

---

### Task 4: Home screen — schedule on start, cancel on stop (spec 015)

**Files:**

- Modify: `app/(tabs)/index.tsx`

- [ ] **Step 1: Import the new notification helper**

In `app/(tabs)/index.tsx`, add `scheduleSessionReminderNotification` to the existing notifications import:

```ts
import {
  cancelReminderNotification,
  scheduleNudgeNotification,
  scheduleSessionReminderNotification,
} from '../../src/lib/notifications';
```

- [ ] **Step 2: Update `handleStart` to schedule reminders**

Replace the existing `handleStart` function:

```ts
async function handleStart() {
  if (!canStart || !selectedCategory) return;
  const startedAt = new Date().toISOString();
  const session: ActiveSession = {
    id: Date.now().toString(),
    categoryId: selectedCategory,
    teamId: selectedTeamId,
    startedAt,
  };

  const { sessionReminderIntervalMinutes, sessionReminderCount, notificationsEnabled } =
    settings;

  if (sessionReminderIntervalMinutes !== null && notificationsEnabled) {
    const startMs = new Date(startedAt).getTime();
    const ids: string[] = [];
    for (let i = 1; i <= sessionReminderCount; i++) {
      const fireAt = startMs + i * sessionReminderIntervalMinutes * 60_000;
      const id = await scheduleSessionReminderNotification({ startedAt, fireAt });
      if (id) ids.push(id);
    }
    session.reminderNotificationIds = ids;
  }

  await setActiveSession(session);
  setElapsed(0);
  startTick(session.startedAt);
}
```

- [ ] **Step 3: Update `handleStop` to cancel pending reminders**

Replace the existing `handleStop` function:

```ts
async function handleStop() {
  if (!activeSession) return;
  stopTick();

  if (activeSession.reminderNotificationIds?.length) {
    await Promise.all(
      activeSession.reminderNotificationIds.map((id) => cancelReminderNotification(id)),
    );
  }

  const endedAt = new Date().toISOString();
  const durationSeconds = elapsedSeconds(activeSession.startedAt);
  const newSession = {
    id: activeSession.id,
    categoryId: activeSession.categoryId,
    teamId: activeSession.teamId,
    startedAt: activeSession.startedAt,
    endedAt,
    durationSeconds,
    note: null,
  };
  await appendSession(newSession);
  await clearActiveSession();
  setElapsed(0);
  setNoteSessionId(newSession.id);
  setNoteModalVisible(true);
}
```

- [ ] **Step 4: Run check**

```bash
npm run check
```

- [ ] **Step 5: Commit**

```bash
git add "app/(tabs)/index.tsx"
git commit -m "feat: schedule and cancel session reminder notifications on start/stop (spec 015)"
```

---

### Task 5: Settings screen — "SESSÃO ATIVA" section (spec 015)

**Files:**

- Modify: `app/settings.tsx`

- [ ] **Step 1: Add option constants**

After the `LUNCH_OPTIONS` array, add:

```ts
const SESSION_REMINDER_INTERVAL_OPTIONS = [
  { id: 'disabled', label: 'Desativado' },
  { id: '30', label: '30 min' },
  { id: '60', label: '1 hora' },
  { id: '120', label: '2 horas' },
  { id: '180', label: '3 horas' },
];

const SESSION_REMINDER_COUNT_OPTIONS = [
  { id: '1', label: '1' },
  { id: '2', label: '2' },
  { id: '3', label: '3' },
  { id: '6', label: '6' },
  { id: '12', label: '12' },
  { id: '24', label: '24' },
];
```

- [ ] **Step 2: Add new section to the Settings JSX**

In `SettingsScreen`, just before the reset section (`<View style={[styles.section, styles.sectionSpaced]}>`), add:

```tsx
<SectionHeader title="SESSÃO ATIVA" style={styles.sectionHeader} />
<OptionPicker
  label="Lembrete de sessão"
  items={SESSION_REMINDER_INTERVAL_OPTIONS}
  onSelect={(id) =>
    update({ sessionReminderIntervalMinutes: id === 'disabled' ? null : Number(id) })
  }
  placeholder="Selecionar intervalo"
  selectedId={
    settings.sessionReminderIntervalMinutes === null
      ? 'disabled'
      : String(settings.sessionReminderIntervalMinutes)
  }
/>
{settings.sessionReminderIntervalMinutes !== null && (
  <OptionPicker
    label="Quantidade de lembretes"
    items={SESSION_REMINDER_COUNT_OPTIONS}
    onSelect={(id) => update({ sessionReminderCount: Number(id) })}
    placeholder="Selecionar quantidade"
    selectedId={String(settings.sessionReminderCount)}
  />
)}
```

- [ ] **Step 3: Run check**

```bash
npm run check
```

- [ ] **Step 4: Commit**

```bash
git add app/settings.tsx
git commit -m "feat: add session reminder settings section (spec 015)"
```

---

### Task 6: Final validation

- [ ] **Step 1: Run full check**

```bash
npm run check
```

Expected: no TypeScript errors, no lint errors, all tests pass.
