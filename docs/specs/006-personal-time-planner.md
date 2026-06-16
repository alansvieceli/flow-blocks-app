# Spec 006 - Personal Time Planner

## Objective

Let the user plan and track personal (post-work) time: define reusable weekly templates per day of the week, get the day pre-filled automatically, mark activities done or not done, and see a historical chart of how personal time was actually spent.

## Context

Complements the work-focused specs (003–005). Personal time tracking is intentionally separate from the Pomodoro loop — no timer, no focus/break cycle. The user wants to protect and understand their leisure time with the same intentionality applied to work.

## Goals

- **Personal activities CRUD**: user creates and names their own activities (e.g. "Leitura", "Videogame", "Descanso", "Sair de casa"). No fixed defaults. Same CRUD pattern as Teams in spec 003.
- **Weekly template**: for each day of the week (Mon–Sun), the user defines a default list of activity blocks (activity + planned duration in minutes). Configured once, reused every week. A day with no template entries means no pre-fill for that weekday.
- **Daily plan**: each day opens pre-filled with that weekday's template entries. The user can adjust (add, remove, or edit entries) before or during the day. Each entry is marked ✅ done or ❌ not done by the user at any point during the day.
- **Personal dashboard section**: a chart (e.g. bar or pie) showing accumulated done minutes per activity for the current week and for the last 4 weeks. Separate from work metrics (spec 005). Only entries marked ✅ count toward the chart.

## Non-goals

- No live timer for personal activities (no start/stop chronometer).
- No per-activity time goals or balance alerts (spec 006 scope only covers plan + check).
- No integration with the Pomodoro session history.
- No shared or synced data.

## Data Model (AsyncStorage)

- `personalActivities`: `{ id: string; name: string }[]`
- `personalWeeklyTemplate`: `{ dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; entries: { activityId: string; plannedMinutes: number }[] }[]` (0 = Sunday, 1 = Monday, …, 6 = Saturday)
- `personalDailyPlan`: `{ date: string; entries: { id: string; activityId: string; plannedMinutes: number; done: boolean }[] }[]` — one record per calendar date, generated from the weekly template when the day is first opened (or empty if no template). Edits to the daily plan do not affect the template.

A deleted activity does not delete historical daily plan entries; those entries retain the old `activityId` and the UI displays "Unknown activity" if the id no longer resolves.

## Acceptance Criteria

- User can create, rename, and delete personal activities; list persists across app restarts.
- User can define template entries per weekday (add, edit, remove blocks per day); template persists across app restarts.
- Opening the daily plan for today (or any date) for the first time pre-fills it from that weekday's template. Subsequent opens show the already-generated (possibly edited) plan.
- User can add, remove, or edit entries on the daily plan without affecting the weekly template.
- User can mark each daily plan entry as done (✅) or not done (❌); state persists immediately.
- Personal dashboard shows done minutes per activity for current week and last 4 weeks, using only entries marked done.
- Empty states (no activities, no template, no plan entries) are handled gracefully without errors.
- `npm run check` passes.

## Validation Commands

```bash
npm run check
```
