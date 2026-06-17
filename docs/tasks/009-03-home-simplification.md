# Task 009-03 - Home Simplification

## Plan Reference

`docs/plans/009-ux-navigation-refactor-plan.md`

## Status

Done

## Description

Simplify Home into a daily action hub focused on starting or monitoring work.

## Scope

Update `app/(tabs)/index.tsx`.

Keep:

- Greeting/header.
- Active session card when running.
- New block card when idle.
- Compact daily work summary.
- Compact "Esta noite" card linking to the daily personal plan.

Move out:

- Full personal activity chart.
- Dense analytics that belong in Painel.

## Requirements

- Use shared app data provider from task 009-02.
- Use common UI components from task 009-01.
- Keep start/stop behavior intact.
- Keep active-session banner behavior intact.
- Avoid initial empty-state flicker.

## Acceptance Criteria

- Home is visibly lighter and shorter.
- Starting and stopping a session works.
- Today summary uses local date.
- "Esta noite" still opens the daily plan.
- `npm run typecheck` passes.
