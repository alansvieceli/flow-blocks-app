# Task 005-05 - Home Screen Daily Metrics

## Plan Reference

`docs/plans/005-time-visibility-dashboard-plan.md`

## Status

Pending

## Description

Replace the placeholder daily metrics card on the Home screen with real computed values.

**Card layout (3 columns):**

| Column     | Value                                                               |
| ---------- | ------------------------------------------------------------------- |
| Total hoje | Sum of `durationSeconds` for today's sessions, formatted as "Xh Ym" |
| Top equipe | Team with most focus minutes today (name + "Xh Ym")                 |
| 2ª equipe  | Second team (name + "Xh Ym")                                        |

If fewer than 2 teams have sessions today, show "--" for missing columns.

**Data loading:** on the Home screen, load sessions from `sessionsStorage` on mount and on `useFocusEffect`. Pass to `getDailyMetrics` from `src/lib/metrics.ts` along with teams from `teamsStorage`.

**Visual:** same card style as other cards (gradient, `borderRadius: 18`, border). Metric numbers in `metricMedium` typography with `colors.accentFrom`. Labels in `sectionLabel` style below each number.

## Acceptance Criteria

- Card shows real today's total focus time.
- Top 2 teams by today's focus time are shown correctly.
- "--" shown for missing team slots.
- Values update when returning to Home tab after recording a session.
- `npm run typecheck` and `npm run lint` pass.
