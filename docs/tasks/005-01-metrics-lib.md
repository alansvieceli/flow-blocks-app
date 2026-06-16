# Task 005-01 - Metrics Library

## Plan Reference

`docs/plans/005-time-visibility-dashboard-plan.md`

## Status

Pending

## Description

Create `src/lib/metrics.ts` with all pure functions needed by the Dashboard and Home screens. No React, no storage reads — all functions receive data as parameters.

**Functions to implement:**

```ts
// Weekly metrics (current Mon–Sun)
getWeeklyMetricsByCategory(sessions: Session[], today: Date): CategoryMetrics
getWeeklyMetricsByTeam(sessions: Session[], teams: Team[], today: Date): TeamMetrics[]

// Heatmap: returns a 7×24 matrix of total focus minutes
// dayOfWeek: 0=Mon, 1=Tue, ..., 6=Sun (display order, not JS getDay)
getHeatmapData(sessions: Session[], options?: { teamId?: string; categoryId?: string }): number[][]

// Streak: consecutive days with ≥1 completed session, counting back from today (or yesterday)
getStreak(sessions: Session[], today: Date): number

// Context switches: team or category change between consecutive sessions
getContextSwitches(sessions: Session[], today: Date): { today: number; week: number }

// Team balance alert: teams exceeding their maxWeeklyPercent this week
getTeamBalanceAlerts(sessions: Session[], teams: Team[], today: Date): TeamBalanceAlert[]

// Daily totals for Home screen: total focus minutes today + top 2 teams
getDailyMetrics(sessions: Session[], teams: Team[], today: Date): DailyMetrics
```

**Type definitions** (add to `src/types/index.ts` or a dedicated file):

```ts
interface CategoryMetrics {
  deepWorkMinutes: number;
  interruptionMinutes: number; // meetings + code review + admin
  totalMinutes: number;
}

interface TeamMetrics {
  teamId: string;
  teamName: string;
  minutes: number;
  percentage: number; // of total weekly focus minutes
}

interface TeamBalanceAlert {
  teamId: string;
  teamName: string;
  actualPercent: number;
  maxWeeklyPercent: number;
}

interface DailyMetrics {
  totalMinutes: number;
  topTeams: { teamName: string; minutes: number }[]; // up to 2
}
```

**Unit tests** (`src/lib/__tests__/metrics.test.ts`):

Cover all functions with edge cases:

- Empty sessions array → all zeros.
- Sessions spanning multiple weeks → only current week counts for weekly metrics.
- Heatmap cells correctly accumulate minutes by day and hour.
- Streak resets to 0 after a gap day; counts correctly when today has no session.
- Context switches: first session has no switch; switches detected for both teamId and categoryId changes.
- Team balance alert fires only for teams with `maxWeeklyPercent` set and only when exceeded.

## Acceptance Criteria

- All functions implemented and exported from `src/lib/metrics.ts`.
- Full unit test suite passes.
- Coverage in `src/lib/` stays ≥ 80%.
- `npm run check` passes.
