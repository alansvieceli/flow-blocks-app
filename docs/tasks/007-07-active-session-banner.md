# Task 007-07 - Active Session Banner

## Plan Reference

`docs/plans/007-ui-layout-plan.md`

## Status

Pending

## Description

Show a persistent banner above the tab bar that displays the running session timer when a session is active, visible from all tabs.

**Placement:** rendered inside the tab layout (`app/(tabs)/_layout.tsx`) above the tab bar, so it appears on every tab without duplicating logic in each screen.

**Banner content (when session is active):**

- Left: pulsing orange dot (`colors.alert`) + "Gravando" label in `colors.alert`, `fontSize: 12`.
- Center: elapsed timer `HH:MM:SS` in `colors.textPrimary`, `fontWeight: '800'`, `fontSize: 16`.
- Right: tappable "Parar" text or small stop icon that navigates to the Home tab (where the Stop button lives). Do not stop the session from the banner — only navigate home.

**Banner content (when no active session):** render nothing (height 0, no visual space).

**Shared state:** read `activeSessionStorage` on a 1-second interval (same pattern as the Home screen timer). The banner and Home screen both read the same storage key independently — no shared in-memory state is needed.

**Remove old indicator:** delete any previous per-screen active session indicator added in spec 003 task 003-06. The banner is the single source of truth for cross-tab visibility.

## Acceptance Criteria

- Banner appears above the tab bar on all tabs while a session is running.
- Banner shows correct elapsed time, updating every second.
- Banner disappears when no session is active.
- Tapping the banner's stop affordance navigates to the Home tab.
- The Home tab's active session card and the banner stay in sync.
- `npm run typecheck` and `npm run lint` pass.
