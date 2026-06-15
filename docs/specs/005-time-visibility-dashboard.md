# Spec 005 - Time Visibility Dashboard

## Objective

Give the user visibility into how their focus time is distributed: weekly metrics by category and team, an hourly heatmap of focus concentration, and a focus streak counter.

## Context

Consumes the `sessions` data recorded by spec 003. Read-only: no new session data is written by this spec (derived values may be cached for performance, but `sessions` remains the source of truth).

## Goals

- Provide a Dashboard screen with three sections:
  1. **Weekly metrics**: for the current week (Monday-Sunday), total focus time grouped by category (`deep work` vs. `meetings`/`code review`/`admin` as "interruptions"), and total focus time grouped by team/project (e.g. Equipe X vs. Equipe Y).
  2. **Heatmap**: a 7x24 grid (day of week x hour of day) showing total focus minutes per cell, for all-time or a recent window (e.g. last 4 weeks - implementer's choice within spec, documented in the plan). Includes a filter by team and/or category that recomputes the heatmap.
  3. **Streak**: number of consecutive days (including today, or up to yesterday if today has no session yet) with at least one completed focus session (`type: 'focus'`, `completed: true`).
- Only sessions with `type: 'focus'` count toward all metrics in this spec (breaks are excluded).
- Team/category filters on the heatmap use the same `teams` and fixed category list as spec 003. Selecting "All" removes the filter.

## Non-goals

- No export of data.
- No comparison across multiple weeks (only current week for weekly metrics).
- No goal-setting or configurable streak thresholds.
- No changes to session recording (spec 003 already covers this).

## Data Model

No new persisted entities. Reads `sessions` and `teams` from AsyncStorage (as defined in spec 003). May compute and hold derived aggregates in memory or in a non-authoritative cache key (e.g. `dashboardCache`) for performance; if used, the cache must be invalidated/recomputed whenever `sessions` changes.

## Acceptance Criteria

- Weekly metrics correctly sum focus minutes by category and by team for the current week, using only `completed: true` focus sessions.
- Heatmap renders a 7x24 grid with visually distinguishable intensity per cell based on accumulated focus minutes.
- Heatmap filter by team and/or category updates the grid accordingly; "All" shows unfiltered totals.
- Streak count correctly reflects consecutive days with >=1 completed focus session, resetting to 0 after a gap day.
- Dashboard handles the empty-data case (no sessions yet) without errors, showing zeroed/empty states.
- `npm run check` passes.

## Validation Commands

```bash
npm run check
```
