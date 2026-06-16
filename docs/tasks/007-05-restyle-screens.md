# Task 007-05 - Restyle Teams and History Screens

## Plan Reference

`docs/plans/007-ui-layout-plan.md`

## Status

Pending

## Description

Apply the dark theme and card layout to the Teams screen (`app/equipes.tsx`) and History screen (`app/historico.tsx`). No business logic changes — only styles.

**Teams screen (`app/equipes.tsx`):**

- Background: `colors.background`.
- Header title "Equipes" in `screenTitle` typography.
- "+ Adicionar" button in header: text in `colors.accentFrom`.
- Each team row in a card: gradient background, `borderRadius: 18`, border `colors.cardBorder`.
  - Team name in `textPrimary`.
  - `maxWeeklyPercent` shown as "Meta: X%" in `textSecondary` if set.
  - Edit/delete actions: keep existing logic, restyle buttons.
- Add team modal/form: dark background, card-style inputs with border `colors.cardBorder`, text `colors.textPrimary`, placeholders in `colors.textSecondary`.
- "Nova equipe" button at bottom: primary gradient, `borderRadius: 12`.

**History screen (`app/historico.tsx`):**

- Background: `colors.background`.
- Header title "Histórico" in `screenTitle` typography.
- Filter chips (Hoje / Semana / Mês): active gradient, inactive `chipInactiveBackground`.
- Sessions grouped by day: group header shows date + daily total in `sectionLabel` + `textSecondary`.
- Each session in a card: category name + team name + start/end time + duration. "Equipe removida" in `colors.textDisabled` when team no longer exists.
- Empty state: centered text in `colors.textSecondary`.

## Acceptance Criteria

- Both screens use `colors.background` as background.
- All cards use gradient background and `borderRadius: 18`.
- All existing functionality (add/edit/delete team, filter history) still works.
- `npm run typecheck` and `npm run lint` pass.
