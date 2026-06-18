# Work Schedule & Idle Time Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a configurable work schedule (start/end hour + lunch deduction) to settings, then derive idle time and work efficiency metrics shown in the Painel tab.

**Architecture:** Three new fields are added to `AppSettings` (no new storage key). Idle and efficiency values are computed at render time in `src/lib/metrics.ts` — no new writes to storage. The Dashboard reads `settings` from `useAppData()` (already available) and passes a `WorkSchedule` object down to the relevant components.

**Tech Stack:** TypeScript, React Native, Expo, Jest, AsyncStorage

---

## File Map

| File                                  | Change                                                                                                         |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `src/storage/settingsStorage.ts`      | Add `workStartHour`, `workEndHour`, `lunchDurationMinutes` to `AppSettings` + `DEFAULTS`                       |
| `src/state/AppDataProvider.tsx`       | Update `DEFAULT_SETTINGS` constant to include new fields                                                       |
| `src/lib/metrics.ts`                  | Export `WorkSchedule`, `WorkEfficiency` types + `getDayAvailableMinutes`, `getWorkEfficiency` functions        |
| `src/lib/__tests__/metrics.test.ts`   | Tests for new metric functions                                                                                 |
| `src/storage/settingsStorage.test.ts` | Tests for new field defaults                                                                                   |
| `app/settings.tsx`                    | New "JORNADA DE TRABALHO" section with 3 `OptionPicker`s                                                       |
| `app/(tabs)/dashboard.tsx`            | Pass `WorkSchedule` to `HeatmapSection`; idle cell color; new `EfficiencySection`; idle row in `WeeklySection` |

---

### Task 1: Extend AppSettings with work schedule fields

**Files:**

- Modify: `src/storage/settingsStorage.ts`
- Modify: `src/state/AppDataProvider.tsx`
- Modify: `src/storage/settingsStorage.test.ts`

- [ ] **Step 1: Write the failing tests**

Add to `src/storage/settingsStorage.test.ts` (inside the `describe` block, after the existing tests):

```ts
it('returns default workStartHour of 8', async () => {
  const settings = await getSettings();
  expect(settings.workStartHour).toBe(8);
});

it('returns default workEndHour of 18', async () => {
  const settings = await getSettings();
  expect(settings.workEndHour).toBe(18);
});

it('returns default lunchDurationMinutes of 60', async () => {
  const settings = await getSettings();
  expect(settings.lunchDurationMinutes).toBe(60);
});

it('merges new fields with defaults when stored value is partial (old format)', async () => {
  await AsyncStorage.setItem(
    'appSettings',
    JSON.stringify({
      notificationsEnabled: false,
      historyMonths: 6,
      nudgeAbandonHours: 8,
    }),
  );
  const settings = await getSettings();
  expect(settings.workStartHour).toBe(8);
  expect(settings.workEndHour).toBe(18);
  expect(settings.lunchDurationMinutes).toBe(60);
});

it('saves and retrieves custom work schedule fields', async () => {
  await saveSettings({
    notificationsEnabled: true,
    historyMonths: 4,
    nudgeAbandonHours: 8,
    workStartHour: 9,
    workEndHour: 17,
    lunchDurationMinutes: 30,
  });
  const settings = await getSettings();
  expect(settings.workStartHour).toBe(9);
  expect(settings.workEndHour).toBe(17);
  expect(settings.lunchDurationMinutes).toBe(30);
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```
npm test -- --testPathPattern=settingsStorage --no-coverage
```

Expected: FAIL — TypeScript errors because `workStartHour`, `workEndHour`, `lunchDurationMinutes` don't exist yet.

- [ ] **Step 3: Extend `AppSettings` in `src/storage/settingsStorage.ts`**

Replace the entire file with:

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppSettings {
  notificationsEnabled: boolean;
  historyMonths: number;
  nudgeAbandonHours: number;
  workStartHour: number;
  workEndHour: number;
  lunchDurationMinutes: number;
}

const KEY = 'appSettings';

const DEFAULTS: AppSettings = {
  notificationsEnabled: true,
  historyMonths: 4,
  nudgeAbandonHours: 8,
  workStartHour: 8,
  workEndHour: 18,
  lunchDurationMinutes: 60,
};

export async function getSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return { ...DEFAULTS };
  return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<AppSettings>) };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(settings));
}
```

- [ ] **Step 4: Update `DEFAULT_SETTINGS` in `src/state/AppDataProvider.tsx`**

Find the `DEFAULT_SETTINGS` constant (around line 88) and replace it:

```ts
const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: true,
  historyMonths: 4,
  nudgeAbandonHours: 8,
  workStartHour: 8,
  workEndHour: 18,
  lunchDurationMinutes: 60,
};
```

- [ ] **Step 5: Run tests to confirm they pass**

```
npm test -- --testPathPattern=settingsStorage --no-coverage
```

Expected: All tests PASS.

- [ ] **Step 6: Run full check**

```
npm run check
```

Expected: PASS (TypeScript now accepts the new fields everywhere via the spread `{ ...settings, ...patch }` pattern in settings.tsx).

- [ ] **Step 7: Commit**

```
git add src/storage/settingsStorage.ts src/state/AppDataProvider.tsx src/storage/settingsStorage.test.ts
git commit -m "feat: add work schedule fields to AppSettings"
```

---

### Task 2: Idle and efficiency metrics

**Files:**

- Modify: `src/lib/metrics.ts`
- Modify: `src/lib/__tests__/metrics.test.ts`

- [ ] **Step 1: Write failing tests**

Add to `src/lib/__tests__/metrics.test.ts` at the end of the file:

```ts
// ── WorkSchedule helpers ────────────────────────────────────────────────────

import { getDayAvailableMinutes, getWorkEfficiency } from '../metrics';
import type { WorkSchedule } from '../metrics';

const SCHEDULE: WorkSchedule = {
  workStartHour: 8,
  workEndHour: 18,
  lunchDurationMinutes: 60,
};

// TODAY = Tuesday 2026-06-16 (already defined at top of file)

describe('getDayAvailableMinutes', () => {
  it('returns (end - start) * 60 - lunch', () => {
    expect(getDayAvailableMinutes(SCHEDULE)).toBe(540); // (18-8)*60 - 60
  });

  it('handles short schedule', () => {
    expect(
      getDayAvailableMinutes({
        workStartHour: 9,
        workEndHour: 13,
        lunchDurationMinutes: 0,
      }),
    ).toBe(240);
  });
});

describe('getWorkEfficiency', () => {
  it('returns zero worked and full available when no sessions on a weekday', () => {
    const result = getWorkEfficiency([], SCHEDULE, TODAY);
    expect(result.todayWorkedMinutes).toBe(0);
    expect(result.todayAvailableMinutes).toBe(540);
    expect(result.todayIdleMinutes).toBe(540);
  });

  it('returns zero available when today is a weekend', () => {
    const saturday = new Date('2026-06-20T12:00:00.000Z');
    const result = getWorkEfficiency([], SCHEDULE, saturday);
    expect(result.todayAvailableMinutes).toBe(0);
    expect(result.todayIdleMinutes).toBe(0);
  });

  it('clamps idle to 0 when sessions exceed available', () => {
    const longSession = makeSession({
      startedAt: '2026-06-16T06:00:00.000Z',
      durationSeconds: 600 * 60, // 600 min >> 540 available
    });
    const result = getWorkEfficiency([longSession], SCHEDULE, TODAY);
    expect(result.todayIdleMinutes).toBe(0);
  });

  it('correctly counts week available only for weekdays up to today', () => {
    // TODAY = Tuesday 2026-06-16. Week started Monday 2026-06-15.
    // So 2 weekdays counted: Mon + Tue = 2 * 540 = 1080 min available.
    const result = getWorkEfficiency([], SCHEDULE, TODAY);
    expect(result.weekAvailableMinutes).toBe(1080);
  });

  it('subtracts worked minutes from weekly idle', () => {
    // SESSION_MON_FOCUS: 60 min on Monday
    const result = getWorkEfficiency([SESSION_MON_FOCUS], SCHEDULE, TODAY);
    expect(result.weekWorkedMinutes).toBe(60);
    expect(result.weekIdleMinutes).toBe(1080 - 60);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```
npm test -- --testPathPattern=metrics --no-coverage
```

Expected: FAIL — `getDayAvailableMinutes`, `getWorkEfficiency`, `WorkSchedule` not exported.

- [ ] **Step 3: Add types and functions to `src/lib/metrics.ts`**

Add after the existing imports and before the first function:

```ts
export interface WorkSchedule {
  workStartHour: number;
  workEndHour: number;
  lunchDurationMinutes: number;
}

export interface WorkEfficiency {
  todayWorkedMinutes: number;
  todayAvailableMinutes: number;
  todayIdleMinutes: number;
  weekWorkedMinutes: number;
  weekAvailableMinutes: number;
  weekIdleMinutes: number;
}
```

Add at the end of the file:

```ts
export function getDayAvailableMinutes(schedule: WorkSchedule): number {
  return (
    (schedule.workEndHour - schedule.workStartHour) * 60 - schedule.lunchDurationMinutes
  );
}

function getDayWorkedMinutes(sessions: Session[], dateStr: string): number {
  return sessions
    .filter((s) => toLocalDateString(new Date(s.startedAt)) === dateStr)
    .reduce((acc, s) => acc + sessionMinutes(s), 0);
}

export function getWorkEfficiency(
  sessions: Session[],
  schedule: WorkSchedule,
  today: Date,
): WorkEfficiency {
  const todayStr = toLocalDateString(today);
  const todayDow = today.getDay();
  const isTodayWeekday = todayDow !== 0 && todayDow !== 6;
  const todayAvailableMinutes = isTodayWeekday ? getDayAvailableMinutes(schedule) : 0;
  const todayWorkedMinutes = getDayWorkedMinutes(sessions, todayStr);
  const todayIdleMinutes = Math.max(0, todayAvailableMinutes - todayWorkedMinutes);

  const weekStart = getLocalWeekStart(today);
  let weekWorkedMinutes = 0;
  let weekAvailableMinutes = 0;
  const cursor = new Date(weekStart);
  while (cursor <= today) {
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) {
      weekAvailableMinutes += getDayAvailableMinutes(schedule);
      weekWorkedMinutes += getDayWorkedMinutes(sessions, toLocalDateString(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  const weekIdleMinutes = Math.max(0, weekAvailableMinutes - weekWorkedMinutes);

  return {
    todayWorkedMinutes,
    todayAvailableMinutes,
    todayIdleMinutes,
    weekWorkedMinutes,
    weekAvailableMinutes,
    weekIdleMinutes,
  };
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```
npm test -- --testPathPattern=metrics --no-coverage
```

Expected: All tests PASS.

- [ ] **Step 5: Run full check**

```
npm run check
```

Expected: PASS.

- [ ] **Step 6: Commit**

```
git add src/lib/metrics.ts src/lib/__tests__/metrics.test.ts
git commit -m "feat: add WorkSchedule types and getWorkEfficiency to metrics lib"
```

---

### Task 3: Work schedule settings UI

**Files:**

- Modify: `app/settings.tsx`

- [ ] **Step 1: Add option arrays for work schedule pickers**

In `app/settings.tsx`, add after the existing `NUDGE_ABANDON_OPTIONS` constant:

```ts
const WORK_START_OPTIONS = [
  { id: '6', label: '06:00' },
  { id: '7', label: '07:00' },
  { id: '8', label: '08:00' },
  { id: '9', label: '09:00' },
  { id: '10', label: '10:00' },
];

const WORK_END_OPTIONS = [
  { id: '15', label: '15:00' },
  { id: '16', label: '16:00' },
  { id: '17', label: '17:00' },
  { id: '18', label: '18:00' },
  { id: '19', label: '19:00' },
  { id: '20', label: '20:00' },
];

const LUNCH_OPTIONS = [
  { id: '30', label: '30 min' },
  { id: '45', label: '45 min' },
  { id: '60', label: '60 min' },
  { id: '90', label: '90 min' },
];
```

- [ ] **Step 2: Add JORNADA DE TRABALHO section to the screen**

In `app/settings.tsx`, find the `<SectionHeader title="DADOS" .../>` block and add the new section **after** the nudge abandon `OptionPicker` (before the reset section):

```tsx
<SectionHeader title="JORNADA DE TRABALHO" style={styles.sectionHeader} />
<OptionPicker
  label="Início do expediente"
  items={WORK_START_OPTIONS}
  onSelect={(id) => update({ workStartHour: Number(id) })}
  placeholder="Selecionar hora"
  selectedId={String(settings.workStartHour ?? 8)}
/>
<OptionPicker
  label="Fim do expediente"
  items={WORK_END_OPTIONS}
  onSelect={(id) => update({ workEndHour: Number(id) })}
  placeholder="Selecionar hora"
  selectedId={String(settings.workEndHour ?? 18)}
/>
<OptionPicker
  label="Duração do almoço"
  items={LUNCH_OPTIONS}
  onSelect={(id) => update({ lunchDurationMinutes: Number(id) })}
  placeholder="Selecionar duração"
  selectedId={String(settings.lunchDurationMinutes ?? 60)}
/>
```

- [ ] **Step 3: Run full check**

```
npm run check
```

Expected: PASS.

- [ ] **Step 4: Commit**

```
git add app/settings.tsx
git commit -m "feat: add work schedule section to settings screen"
```

---

### Task 4: Heatmap idle cell highlighting

**Files:**

- Modify: `app/(tabs)/dashboard.tsx`

- [ ] **Step 1: Import WorkSchedule and update HeatmapSection signature**

In `app/(tabs)/dashboard.tsx`, add `WorkSchedule` to the imports from `../../src/lib/metrics`:

```ts
import {
  CategoryMetrics,
  TeamBalanceAlert,
  TeamMetrics,
  WorkEfficiency,
  WorkSchedule,
  getDailyMetrics,
  getContextSwitches,
  getHeatmapData,
  getStreak,
  getTeamBalanceAlerts,
  getWeeklyMetricsByCategory,
  getWeeklyMetricsByTeam,
  getWorkEfficiency,
} from '../../src/lib/metrics';
```

- [ ] **Step 2: Add `schedule` prop to `HeatmapSection` and update `cellColor`**

Replace the `HeatmapSection` function signature and `cellColor` helper inside it:

```tsx
function HeatmapSection({
  categories,
  sessions,
  teams,
  schedule,
}: {
  categories: Category[];
  sessions: Session[];
  teams: Team[];
  schedule: WorkSchedule;
}) {
```

Replace the `cellColor` function inside `HeatmapSection`:

```tsx
function isWorkCell(dayIdx: number, hourIdx: number): boolean {
  return (
    dayIdx <= 4 && hourIdx >= schedule.workStartHour && hourIdx < schedule.workEndHour
  );
}

function cellColor(val: number, dayIdx: number, hourIdx: number): string {
  if (val > 0) {
    const intensity = Math.min(val / maxVal, 1);
    const r = Math.round(124 + (124 - 124) * intensity);
    const g = Math.round(58 * (1 - intensity));
    const b = Math.round(237 * intensity);
    const hex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${hex(r)}${hex(g)}${hex(b)}`;
  }
  if (isWorkCell(dayIdx, hourIdx)) return '#1e1e2e';
  return colors.cardBorder;
}
```

- [ ] **Step 3: Update heatmap cell rendering to pass dayIdx and hourIdx**

Find the inner map inside the heatmap render and update the `backgroundColor` call:

```tsx
{
  matrix.map((row, dayIdx) => (
    <View key={dayIdx} style={styles.heatmapRow}>
      <Text style={styles.heatmapDayLabel}>{DAY_LABELS[dayIdx]}</Text>
      {row.map((val, hourIdx) => (
        <View
          key={hourIdx}
          style={[
            styles.heatmapCell,
            { backgroundColor: cellColor(val, dayIdx, hourIdx) },
          ]}
        />
      ))}
    </View>
  ));
}
```

- [ ] **Step 4: Pass `schedule` from `DashboardScreen` to `HeatmapSection`**

In `DashboardScreen`, destructure `settings` from `useAppData()` and define `today` and `schedule` at the top of the component (before the existing metric calls):

```tsx
const { categories, sessions, settings, teams } = useAppData();

const today = new Date();
const schedule: WorkSchedule = {
  workStartHour: settings.workStartHour,
  workEndHour: settings.workEndHour,
  lunchDurationMinutes: settings.lunchDurationMinutes,
};
```

Also remove the `const today = new Date();` line that currently exists in `ExtrasSection` — it becomes redundant once `today` is passed as a prop. Update `ExtrasSection` to accept `today` as a prop and pass it from `DashboardScreen`:

```tsx
function ExtrasSection({ sessions, teams, today }: { sessions: Session[]; teams: Team[]; today: Date }) {
```

Pass `today` in the JSX:

```tsx
<ExtrasSection sessions={sessions} teams={teams} today={today} />
```

Update the `HeatmapSection` JSX:

```tsx
<HeatmapSection
  categories={categories}
  sessions={sessions}
  teams={teams}
  schedule={schedule}
/>
```

- [ ] **Step 5: Run full check**

```
npm run check
```

Expected: PASS.

- [ ] **Step 6: Commit**

```
git add app/(tabs)/dashboard.tsx
git commit -m "feat: highlight idle work cells in heatmap"
```

---

### Task 5: Efficiency section and idle row in weekly section

**Files:**

- Modify: `app/(tabs)/dashboard.tsx`

- [ ] **Step 1: Add `EfficiencySection` component**

Add the following new component in `app/(tabs)/dashboard.tsx`, after `PersonalChartSection` and before `DashboardScreen`:

```tsx
function EfficiencySection({ efficiency }: { efficiency: WorkEfficiency }) {
  function pct(worked: number, available: number): string {
    if (available === 0) return '—';
    return `${Math.round((worked / available) * 100)}%`;
  }

  return (
    <>
      <SectionTitle icon="speedometer-outline" label="APROVEITAMENTO" />
      <View style={styles.card}>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Hoje</Text>
          <Text style={styles.switchValue}>
            {formatMinutes(efficiency.todayWorkedMinutes)}
          </Text>
          <Text style={styles.switchUnit}>
            / {formatMinutes(efficiency.todayAvailableMinutes)} (
            {pct(efficiency.todayWorkedMinutes, efficiency.todayAvailableMinutes)})
          </Text>
        </View>
        <View style={[styles.switchRow, styles.switchRowSpaced]}>
          <Text style={styles.switchLabel}>Esta semana</Text>
          <Text style={styles.switchValue}>
            {formatMinutes(efficiency.weekWorkedMinutes)}
          </Text>
          <Text style={styles.switchUnit}>
            / {formatMinutes(efficiency.weekAvailableMinutes)} (
            {pct(efficiency.weekWorkedMinutes, efficiency.weekAvailableMinutes)})
          </Text>
        </View>
      </View>
    </>
  );
}
```

- [ ] **Step 2: Add idle row to `WeeklySection`**

Update `WeeklySection` props to accept `weekIdleMinutes`:

```tsx
function WeeklySection({
  categoryMetrics,
  teamMetrics,
  alerts,
  weekIdleMinutes,
}: {
  categoryMetrics: CategoryMetrics;
  teamMetrics: TeamMetrics[];
  alerts: TeamBalanceAlert[];
  weekIdleMinutes: number;
}) {
```

Inside the first `<View style={styles.card}>` (the category card), add a third row after the "Interrupções" row:

```tsx
<View style={[styles.metricRow, styles.metricRowSpaced]}>
  <View style={styles.metricLabelRow}>
    <Ionicons name="time-outline" size={11} color={colors.textSecondary} />
    <Text style={styles.metricLabel}>Ocioso</Text>
  </View>
  <MetricBar
    value={weekIdleMinutes}
    total={categoryMetrics.totalMinutes + weekIdleMinutes}
    accent="primary"
  />
  <Text style={styles.metricValue}>{formatMinutes(weekIdleMinutes)}</Text>
</View>
```

- [ ] **Step 3: Compute efficiency in `DashboardScreen` and pass to components**

In `DashboardScreen`, add after the `schedule` constant:

```tsx
const efficiency = getWorkEfficiency(sessions, schedule, today);
```

Pass `weekIdleMinutes` to `WeeklySection`:

```tsx
<WeeklySection
  categoryMetrics={categoryMetrics}
  teamMetrics={teamMetrics}
  alerts={alerts}
  weekIdleMinutes={efficiency.weekIdleMinutes}
/>
```

Add `EfficiencySection` to the render output, after `ExtrasSection`:

```tsx
<EfficiencySection efficiency={efficiency} />
```

The full render order in `DashboardScreen` should be:

```tsx
<WeeklySection ... />
<HeatmapSection ... />
<ExtrasSection ... />
<EfficiencySection efficiency={efficiency} />
<PersonalChartSection />
```

- [ ] **Step 4: Run full check**

```
npm run check
```

Expected: PASS.

- [ ] **Step 5: Commit**

```
git add app/(tabs)/dashboard.tsx
git commit -m "feat: add efficiency section and idle row to dashboard"
```
