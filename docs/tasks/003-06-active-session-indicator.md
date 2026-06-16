# Task 003-06 - Active Session Indicator

## Plan Reference

`docs/plans/003-time-tracker-plan.md`

## Status

Done

## Description

Show a persistent visual indicator when a session is active, visible from any tab.

**Options (choose one based on what the navigation library supports):**

- A persistent header bar at the top of the app showing the elapsed time and the active category/team.
- A badge on the Tracker tab icon showing the elapsed time or a dot while active.

The indicator must:

- Be visible regardless of which tab is active.
- Update every second while the session is running.
- Disappear as soon as the session is stopped.
- Tapping it (if it is a header bar) navigates to the Tracker tab.

## Acceptance Criteria

- Active session indicator is visible on History and Teams tabs.
- Indicator updates every second.
- Indicator disappears immediately after stopping.
- `npm run typecheck` and `npm run lint` pass.

## Result

Banner azul persistente no topo da navegação mostrando categoria e elapsed. Visível em todos os tabs. Tapping navega para o Tracker. Hook `src/lib/useActiveSession.ts` centraliza o polling do AsyncStorage.
