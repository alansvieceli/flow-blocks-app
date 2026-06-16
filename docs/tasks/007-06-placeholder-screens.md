# Task 007-06 - Placeholder Screens (Painel and Lembretes)

## Plan Reference

`docs/plans/007-ui-layout-plan.md`

## Status

Pending

## Description

Create minimal placeholder screens for the Painel and Lembretes tabs. These are replaced with real content in specs 005 and 004 respectively.

**Painel (`app/(tabs)/painel.tsx`):**

- Background: `colors.background`.
- Centered content: icon (e.g. `grid-outline`, size 48, `colors.tabInactive`) + text "Em breve" in `colors.textSecondary` + subtitle "Dashboard disponível na próxima atualização." in `body` typography.

**Lembretes (`app/(tabs)/lembretes.tsx`):**

- Background: `colors.background`.
- Centered content: icon (`notifications-outline`, size 48, `colors.tabInactive`) + text "Em breve" in `colors.textSecondary` + subtitle "Lembretes disponíveis na próxima atualização." in `body` typography.

Both files should be minimal functional components with no state.

## Acceptance Criteria

- Both screens render without errors.
- Background is `colors.background`.
- Content is visually centered.
- `npm run typecheck` and `npm run lint` pass.
