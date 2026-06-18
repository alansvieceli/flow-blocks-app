# Painel Reorder + Hoje Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorder the Painel tab so "Hoje" sits first (next to "Esta Semana"), merge "Hoje" and "Aproveitamento" into one richer card, and remove the "Sequência" section entirely.

**Architecture:** `src/lib/metrics.ts` gains category-split fields on `DailyMetrics` and loses the now-unused `getStreak`. `app/(tabs)/dashboard.tsx` replaces `ExtrasSection` + `EfficiencySection` with a single `TodaySection`, and `DashboardScreen` renders sections in the new order: `TodaySection` → `WeeklySection` → `HeatmapSection` → `PersonalChartSection`.

**Tech Stack:** React Native, Expo, TypeScript, Jest.

---

## File Map

| Action | Path                                | Responsibility                                                             |
| ------ | ----------------------------------- | -------------------------------------------------------------------------- |
| Modify | `src/lib/metrics.ts`                | Add category split to `DailyMetrics`/`getDailyMetrics`, remove `getStreak` |
| Modify | `src/lib/__tests__/metrics.test.ts` | Remove `getStreak` tests, extend `getDailyMetrics` tests                   |
| Modify | `app/(tabs)/dashboard.tsx`          | Replace `ExtrasSection`+`EfficiencySection` with `TodaySection`, reorder   |

---

### Task 1: Extend `DailyMetrics` and remove `getStreak` in `src/lib/metrics.ts`

**Files:**

- Modify: `src/lib/metrics.ts:40-43` (interface), `src/lib/metrics.ts:127-152` (`getStreak`), `src/lib/metrics.ts:229-253` (`getDailyMetrics`)

- [ ] **Step 1: Update the `DailyMetrics` interface**

Replace:

```typescript
export interface DailyMetrics {
  totalMinutes: number;
  topTeams: { teamName: string; minutes: number }[];
}
```

With:

```typescript
export interface DailyMetrics {
  totalMinutes: number;
  deepWorkMinutes: number;
  interruptionMinutes: number;
  topTeams: { teamName: string; minutes: number }[];
}
```

- [ ] **Step 2: Delete `getStreak`**

Delete the entire function (lines 127-152 in the current file):

```typescript
export function getStreak(sessions: Session[], today: Date): number {
  const todayStr = toLocalDateString(today);
  const sessionDates = new Set(
    sessions.map((s) => toLocalDateString(new Date(s.endedAt))),
  );

  // Check if today has a session; if not, start counting from yesterday
  const startStr = sessionDates.has(todayStr)
    ? todayStr
    : (() => {
        const y = new Date(today);
        y.setDate(y.getDate() - 1);
        return toLocalDateString(y);
      })();

  if (!sessionDates.has(startStr)) return 0;

  let streak = 0;
  const [year, month, day] = startStr.split('-').map(Number);
  const cursor = new Date(year, month - 1, day, 12);
  while (sessionDates.has(toLocalDateString(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
```

- [ ] **Step 3: Update `getDailyMetrics` to compute the category split**

Replace the function body with:

```typescript
export function getDailyMetrics(
  sessions: Session[],
  teams: Team[],
  today: Date,
): DailyMetrics {
  const todayStr = toLocalDateString(today);
  const todaySessions = sessions.filter(
    (s) => toLocalDateString(new Date(s.startedAt)) === todayStr,
  );

  let deepWorkMinutes = 0;
  let interruptionMinutes = 0;
  const minutesById = new Map<string, number>();
  for (const s of todaySessions) {
    const m = sessionMinutes(s);
    if (isFocusCategory(s.categoryId)) {
      deepWorkMinutes += m;
    } else {
      interruptionMinutes += m;
    }
    if (s.teamId) {
      minutesById.set(s.teamId, (minutesById.get(s.teamId) ?? 0) + m);
    }
  }

  const topTeams = teams
    .filter((t) => minutesById.has(t.id))
    .map((t) => ({ teamName: t.name, minutes: minutesById.get(t.id) ?? 0 }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 2);

  return {
    totalMinutes: deepWorkMinutes + interruptionMinutes,
    deepWorkMinutes,
    interruptionMinutes,
    topTeams,
  };
}
```

- [ ] **Step 4: Verify TypeScript passes**

```bash
npx tsc --noEmit
```

Expected: fails right now because `metrics.test.ts` still imports `getStreak` — that's fixed in Task 2. Confirm the only errors mention `getStreak` / `dashboard.tsx` (the latter is fixed in Task 3).

- [ ] **Step 5: Commit**

```bash
git add src/lib/metrics.ts
git commit -m "feat: split daily metrics by category and remove getStreak"
```

---

### Task 2: Update `src/lib/__tests__/metrics.test.ts`

**Files:**

- Modify: `src/lib/__tests__/metrics.test.ts`

- [ ] **Step 1: Remove `getStreak` from the import list**

In the import block at the top of the file, remove `getStreak,`:

```typescript
import {
  getDailyMetrics,
  getContextSwitches,
  getHeatmapData,
  getTeamBalanceAlerts,
  getWeeklyMetricsByCategory,
  getWeeklyMetricsByTeam,
  WorkSchedule,
  getDayAvailableMinutes,
  getWorkEfficiency,
} from '../metrics';
import { Session, Team } from '../../types';
```

- [ ] **Step 2: Delete the entire `getStreak` describe block**

Delete this block (currently lines 168-215):

```typescript
// ── getStreak ───────────────────────────────────────────────────────────────

describe('getStreak', () => {
  it('returns 0 when no sessions', () => {
    expect(getStreak([], TODAY)).toBe(0);
  });

  it('returns 0 when no session yesterday and none today', () => {
    const old = makeSession({
      startedAt: '2026-06-10T10:00:00.000Z',
      durationSeconds: 60,
    });
    expect(getStreak([old], TODAY)).toBe(0);
  });

  it('counts consecutive days ending today', () => {
    const s1 = makeSession({
      startedAt: '2026-06-14T10:00:00.000Z',
      endedAt: '2026-06-14T10:00:00.000Z',
      durationSeconds: 60,
    });
    const s2 = makeSession({
      startedAt: '2026-06-15T10:00:00.000Z',
      endedAt: '2026-06-15T10:00:00.000Z',
      durationSeconds: 60,
    });
    const s3 = makeSession({
      startedAt: '2026-06-16T10:00:00.000Z',
      endedAt: '2026-06-16T10:00:00.000Z',
      durationSeconds: 60,
    });
    expect(getStreak([s1, s2, s3], TODAY)).toBe(3);
  });

  it('counts consecutive days ending yesterday when no session today', () => {
    const s1 = makeSession({
      startedAt: '2026-06-14T10:00:00.000Z',
      endedAt: '2026-06-14T10:00:00.000Z',
      durationSeconds: 60,
    });
    const s2 = makeSession({
      startedAt: '2026-06-15T10:00:00.000Z',
      endedAt: '2026-06-15T10:00:00.000Z',
      durationSeconds: 60,
    });
    expect(getStreak([s1, s2], TODAY)).toBe(2);
  });
});
```

- [ ] **Step 3: Update the `getDailyMetrics` describe block**

Replace the entire `describe('getDailyMetrics', ...)` block with:

```typescript
describe('getDailyMetrics', () => {
  it('returns zeros and empty topTeams for no sessions today', () => {
    const result = getDailyMetrics([SESSION_MON_FOCUS], [TEAM_A], TODAY);
    // SESSION_MON_FOCUS is on Mon 15, TODAY is Tue 16 → no sessions today
    expect(result.totalMinutes).toBe(0);
    expect(result.deepWorkMinutes).toBe(0);
    expect(result.interruptionMinutes).toBe(0);
    expect(result.topTeams).toEqual([]);
  });

  it('sums minutes for sessions today and picks top 2 teams', () => {
    const s1 = makeSession({
      startedAt: '2026-06-16T09:00:00.000Z',
      durationSeconds: 3600, // 60 min teamA
      teamId: 'teamA',
    });
    const s2 = makeSession({
      startedAt: '2026-06-16T10:00:00.000Z',
      durationSeconds: 1800, // 30 min teamB
      teamId: 'teamB',
    });
    const result = getDailyMetrics([s1, s2], [TEAM_A, TEAM_B], TODAY);
    expect(result.totalMinutes).toBe(90);
    expect(result.topTeams).toHaveLength(2);
    expect(result.topTeams[0]).toEqual({ teamName: 'Team A', minutes: 60 });
    expect(result.topTeams[1]).toEqual({ teamName: 'Team B', minutes: 30 });
  });

  it('splits today minutes into deepWork and interruption by category', () => {
    const focus = makeSession({
      startedAt: '2026-06-16T09:00:00.000Z',
      durationSeconds: 3600, // 60 min
      categoryId: 'foco_profundo',
    });
    const meeting = makeSession({
      startedAt: '2026-06-16T11:00:00.000Z',
      durationSeconds: 1200, // 20 min
      categoryId: 'reunioes',
    });
    const result = getDailyMetrics([focus, meeting], [], TODAY);
    expect(result.deepWorkMinutes).toBe(60);
    expect(result.interruptionMinutes).toBe(20);
    expect(result.totalMinutes).toBe(80);
  });

  it('uses local date for late-night sessions', () => {
    const lateNight = makeSession({
      startedAt: '2026-06-17T01:00:00.000Z',
      durationSeconds: 1800,
      teamId: 'teamA',
    });
    const result = getDailyMetrics([lateNight], [TEAM_A], TODAY);
    expect(result.totalMinutes).toBe(30);
  });

  it('limits topTeams to 2', () => {
    const TEAM_C: Team = {
      id: 'teamC',
      name: 'Team C',
      order: 3,
      maxWeeklyPercent: null,
    };
    const s1 = makeSession({
      startedAt: '2026-06-16T09:00:00.000Z',
      durationSeconds: 3600,
      teamId: 'teamA',
    });
    const s2 = makeSession({
      startedAt: '2026-06-16T10:00:00.000Z',
      durationSeconds: 1200,
      teamId: 'teamB',
    });
    const s3 = makeSession({
      startedAt: '2026-06-16T11:00:00.000Z',
      durationSeconds: 600,
      teamId: 'teamC',
    });
    const result = getDailyMetrics([s1, s2, s3], [TEAM_A, TEAM_B, TEAM_C], TODAY);
    expect(result.topTeams).toHaveLength(2);
  });
});
```

- [ ] **Step 4: Run the metrics test suite**

```bash
npx jest src/lib/__tests__/metrics.test.ts --no-coverage
```

Expected: all tests pass, none reference `getStreak`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/__tests__/metrics.test.ts
git commit -m "test: cover daily category split and drop getStreak tests"
```

---

### Task 3: Rebuild `app/(tabs)/dashboard.tsx` — `TodaySection`, removals, reorder

**Files:**

- Modify: `app/(tabs)/dashboard.tsx`

- [ ] **Step 1: Update the import block**

Replace the current import block (lines 1-22) with:

```tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppHeader } from '../../src/components/AppHeader';
import {
  CategoryMetrics,
  DailyMetrics,
  TeamMetrics,
  WorkEfficiency,
  WorkSchedule,
  getDailyMetrics,
  getHeatmapData,
  getWeeklyMetricsByCategory,
  getWeeklyMetricsByTeam,
  getWorkEfficiency,
} from '../../src/lib/metrics';
import { getPersonalDoneMinutesByActivity } from '../../src/lib/personalMetrics';
import { useAppData } from '../../src/state/AppDataProvider';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { Category, Session, Team } from '../../src/types';
```

This drops `toLocalDateString` (only used by the removed `ExtrasSection`) and `getStreak`, and adds `DailyMetrics` to the type imports.

- [ ] **Step 2: Replace `ExtrasSection` and `EfficiencySection` with `TodaySection`**

Delete the entire `ExtrasSection` function and the entire `EfficiencySection` function (currently lines 321-404), and insert `TodaySection` in their place:

```tsx
function TodaySection({
  dailyMetrics,
  efficiency,
}: {
  dailyMetrics: DailyMetrics;
  efficiency: WorkEfficiency;
}) {
  function pct(worked: number, available: number): string {
    if (available === 0) return '—';
    return `${Math.round((worked / available) * 100)}%`;
  }

  return (
    <>
      <SectionTitle icon="today-outline" label="HOJE" />
      <View style={styles.card}>
        <View style={styles.todayHeaderRow}>
          <Text style={styles.todayHeaderValue}>
            {formatMinutes(efficiency.todayWorkedMinutes)}
          </Text>
          <Text style={styles.todayHeaderUnit}>
            / {formatMinutes(efficiency.todayAvailableMinutes)} (
            {pct(efficiency.todayWorkedMinutes, efficiency.todayAvailableMinutes)})
          </Text>
        </View>
        <View style={styles.todayBarRow}>
          <MetricBar
            value={efficiency.todayWorkedMinutes}
            total={efficiency.todayAvailableMinutes}
            accent="primary"
          />
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metricLabelRow}>
            <Ionicons name="flash-outline" size={11} color={colors.textSecondary} />
            <Text style={styles.metricLabel}>Foco</Text>
          </View>
          <MetricBar
            value={dailyMetrics.deepWorkMinutes}
            total={dailyMetrics.totalMinutes}
            accent="primary"
          />
          <Text style={styles.metricValue}>
            {formatMinutes(dailyMetrics.deepWorkMinutes)}
          </Text>
        </View>
        <View style={[styles.metricRow, styles.metricRowSpaced]}>
          <View style={styles.metricLabelRow}>
            <Ionicons name="shuffle-outline" size={11} color={colors.textSecondary} />
            <Text style={styles.metricLabel}>Reuniões</Text>
          </View>
          <MetricBar
            value={dailyMetrics.interruptionMinutes}
            total={dailyMetrics.totalMinutes}
            accent="alert"
          />
          <Text style={styles.metricValue}>
            {formatMinutes(dailyMetrics.interruptionMinutes)}
          </Text>
        </View>

        <View style={[styles.switchRow, styles.todayWeekDivider]}>
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

Note: `MetricBar` and `SectionTitle` are defined earlier in the file (above `WeeklySection`) — no new imports needed.

- [ ] **Step 3: Reorder `DashboardScreen`**

Replace the `DashboardScreen` function with:

```tsx
export default function DashboardScreen() {
  const { categories, sessions, settings, teams } = useAppData();

  const today = new Date();
  const schedule: WorkSchedule = {
    workStartHour: settings.workStartHour,
    workEndHour: settings.workEndHour,
    lunchDurationMinutes: settings.lunchDurationMinutes,
  };

  const categoryMetrics = getWeeklyMetricsByCategory(sessions, today);
  const teamMetrics = getWeeklyMetricsByTeam(sessions, teams, today);
  const efficiency = getWorkEfficiency(sessions, schedule, today);
  const dailyMetrics = getDailyMetrics(sessions, teams, today);

  return (
    <View style={styles.container}>
      <AppHeader title="Painel" />
      <ScrollView contentContainerStyle={styles.content}>
        <TodaySection dailyMetrics={dailyMetrics} efficiency={efficiency} />

        <WeeklySection
          categoryMetrics={categoryMetrics}
          teamMetrics={teamMetrics}
          weekIdleMinutes={efficiency.weekIdleMinutes}
        />

        <HeatmapSection
          categories={categories}
          sessions={sessions}
          teams={teams}
          schedule={schedule}
        />

        <PersonalChartSection />
      </ScrollView>
    </View>
  );
}
```

- [ ] **Step 4: Update the stylesheet**

In the `StyleSheet.create({...})` block:

1. Delete these now-unused style keys: `streakRow`, `streakNumber`, `streakLabels`, `streakLabel`, `streakSub`, `dailyTotal`, `dailyTeam`, `switchRowSpaced`.
2. Add these new keys (place them near `totalRow`/`switchRow` for readability):

```tsx
  todayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  todayHeaderValue: {
    ...typography.screenTitle,
    color: colors.textPrimary,
  },
  todayHeaderUnit: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  todayBarRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  todayWeekDivider: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
```

- [ ] **Step 5: Verify TypeScript passes**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add "app/(tabs)/dashboard.tsx"
git commit -m "feat: merge Hoje/Aproveitamento into one card and reorder Painel"
```

---

### Task 4: Final validation

- [ ] **Step 1: Run the full check**

```bash
npm run check
```

Expected: lint, format, typecheck, and all tests pass with no errors.

- [ ] **Step 2: If lint/format errors appear, fix them**

```bash
npm run lint:fix
npm run format
```

Re-run `npm run check` until clean.

- [ ] **Step 3: Commit fixes if any**

```bash
git add -p
git commit -m "fix: address lint and format issues in painel reorder"
```

---

## Self-Review

### Spec coverage (Spec 013)

| Requirement                                                          | Task      |
| -------------------------------------------------------------------- | --------- |
| Nova ordem: Hoje → Esta Semana → Mapa de Calor → Atividades Pessoais | Task 3    |
| Remover seção Sequência e `getStreak`                                | Task 1, 3 |
| Remover testes de `getStreak`                                        | Task 2    |
| Card Hoje: barra de progresso do dia com %                           | Task 3    |
| Card Hoje: divisão Foco/Reuniões do dia                              | Task 1, 3 |
| Card Hoje: linha "Esta semana" (texto, sem barra)                    | Task 3    |
| `DailyMetrics` ganha `deepWorkMinutes`/`interruptionMinutes`         | Task 1, 2 |
| `topTeams` continua existindo (usado em `app/(tabs)/index.tsx`)      | Task 1    |
| `npm run check` passa                                                | Task 4    |

### Potential issues to watch

1. **`MetricBar` flex behavior** — `MetricBar`'s root view uses `flex: 1`, which only expands width inside a `flexDirection: 'row'` parent. `todayBarRow` wraps the standalone day-progress bar in a row so it stretches full width; the category rows already sit inside `metricRow` (also a row), so no change needed there.
2. **`app/(tabs)/index.tsx` is untouched** — it imports `getDailyMetrics` and reads `daily.topTeams[0]`/`[1]`, both still present on the returned object. No changes required there.
3. **Order of edits in Task 1** — `tsc` will show transient errors until Task 2 (test file) and Task 3 (dashboard) land, since both still reference removed names until updated. This is expected; the step note in Task 1 calls it out.
