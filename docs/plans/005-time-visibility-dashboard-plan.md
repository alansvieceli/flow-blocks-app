# Plan 005 - Time Visibility Dashboard

## Spec Reference

`docs/specs/005-time-visibility-dashboard.md`

## Objective

Build the Dashboard screen with weekly metrics by category and team, an hourly heatmap, focus streak, context-switch count, and team balance alerts. Also replace the daily metrics placeholder on the Home screen with real computed values.

## Assumptions

- All data reads come from `sessionsStorage` and `teamsStorage` (spec 003).
- "Completed focus session" is interpreted as any session that has an `endedAt` timestamp (was stopped by the user). The spec 003 `Session` type has no explicit `type` or `completed` field.
- Heatmap covers the last 4 weeks (28 days). Filter recomputes from the full session list.
- Week is Monday–Sunday. "Current week" is computed relative to today at runtime.
- Streak counts consecutive calendar days (ending today or yesterday) with ≥1 session whose `endedAt` date matches that day.
- Context switch: a switch occurs when a completed session's `teamId` OR `categoryId` differs from the immediately preceding completed session (ordered by `startedAt`). The first session of a period has no switch.
- All metric logic lives in pure functions in `src/lib/metrics.ts` (fully testable without React).
- The Painel tab was a placeholder in spec 007. This plan replaces it with the real screen.
- Heatmap cells: 7 rows (Mon–Sun) × 24 columns (hours 0–23). Cell color intensity is proportional to total focus minutes in that slot.

## Tasks

| #   | File                                      | Description                                                                                       |
| --- | ----------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 1   | `docs/tasks/005-01-metrics-lib.md`        | Pure functions in `src/lib/metrics.ts` for all dashboard metrics, with comprehensive unit tests   |
| 2   | `docs/tasks/005-02-dashboard-weekly.md`   | Dashboard screen weekly metrics section: category breakdown + team breakdown with horizontal bars |
| 3   | `docs/tasks/005-03-dashboard-heatmap.md`  | Dashboard screen heatmap section: 7×24 grid with intensity shading, team/category filter chips    |
| 4   | `docs/tasks/005-04-dashboard-extras.md`   | Streak card, context-switch card, team balance alert badges on Dashboard screen                   |
| 5   | `docs/tasks/005-05-home-daily-metrics.md` | Replace Home screen daily metrics placeholder with real computed totals (today + top 2 teams)     |
| 6   | `docs/tasks/005-06-validate.md`           | Run `npm run check` and verify all acceptance criteria                                            |

## Sequential Order

Task 1 must be completed first — all screen tasks depend on the metrics library. Tasks 2, 3, 4 follow in order (they are sections of the same Dashboard screen). Task 5 is independent of tasks 2–4 but depends on task 1. Task 6 is last.

## Validation

```bash
npm run check
```

Coverage in `src/lib/` must stay ≥ 80%.

## Out of Scope

- Data export
- Multi-week comparison for weekly metrics
- Configurable streak thresholds
- New session recording (spec 003)
