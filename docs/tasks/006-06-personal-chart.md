# Task 006-06 - Personal Chart

## Plan Reference

`docs/plans/006-personal-time-planner-plan.md`

## Status

Pending

## Description

Add a personal time summary chart to the app. Implementation decision: place it on the Home screen as a collapsible card below "Esta noite", or as a dedicated screen accessible from Mais → Pessoal. Document the final placement in the Result field after implementation.

**Data computation (pure function in `src/lib/personalMetrics.ts`):**

```ts
getPersonalDoneMinutesByActivity(
  plans: PersonalDailyPlan[],
  activities: PersonalActivity[],
  options: { period: 'currentWeek' | 'last4Weeks'; today: Date }
): { activityName: string; minutes: number }[]
```

- Returns only activities with `done: true` entries.
- "Current week": Monday–Sunday of today's week.
- "Last 4 weeks": the 28 days ending today.
- Results sorted by minutes descending.

**Unit tests** (`src/lib/__tests__/personalMetrics.test.ts`): empty input, single activity, multiple activities, period filtering.

**Chart UI:**

- Period toggle chips: "Esta semana" / "Últimas 4 semanas".
- Horizontal bar chart: one bar per activity, width proportional to share of total done minutes. Bar color: `colors.success` (solid).
- Each row: activity name (left) + "Xh Ym" (right) + bar below.
- No external charting library — implement with `View` width percentages.
- Empty state: "Nenhuma atividade concluída no período."

## Acceptance Criteria

- Chart shows done minutes per activity for the selected period.
- Period toggle switches between current week and last 4 weeks.
- Bars are proportional to share of total done minutes.
- Empty state rendered when no done entries exist.
- `src/lib/personalMetrics.ts` is unit-tested.
- `npm run check` passes with coverage ≥ 80% in `src/lib/`.
