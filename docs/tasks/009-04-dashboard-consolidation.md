# Task 009-04 - Dashboard Consolidation

## Plan Reference

`docs/plans/009-ux-navigation-refactor-plan.md`

## Status

Done

## Description

Make Painel the single analytics destination and move the personal chart from Home into Painel.

## Scope

Update `app/(tabs)/painel.tsx`.

Include:

- Weekly work metrics.
- Team/category breakdown.
- Heatmap.
- Streak and context switches.
- Team-balance alerts.
- Personal time chart for current week and last 4 weeks.

## Requirements

- Use shared data provider from task 009-02.
- Use common UI components from task 009-01.
- Keep section order stable.
- Use loading placeholders without flashing false empty data.
- Keep metrics based on local date/time.

## Acceptance Criteria

- Painel owns the full analytics experience.
- Personal chart no longer appears on Home.
- Dashboard handles no-data state gracefully.
- Existing metrics tests pass.
- `npm run typecheck` passes.
