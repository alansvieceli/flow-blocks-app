# Task 007-04 - Mais Menu Screen

## Plan Reference

`docs/plans/007-ui-layout-plan.md`

## Status

Pending

## Description

Build the Mais menu screen (`app/(tabs)/mais.tsx`) as a simple sectioned list.

**Sections:**

| Section      | Items                                        |
| ------------ | -------------------------------------------- |
| **Trabalho** | Equipes → navigates to `app/equipes.tsx`     |
|              | Histórico → navigates to `app/historico.tsx` |
| **App**      | Lembretes → disabled (spec 004 placeholder)  |

**Visual design:**

- Screen background: `colors.background`.
- Screen title "Mais" in header using `screenTitle` typography.
- Each section header: `sectionLabel` typography in `colors.textSecondary`.
- Each row: card-style item with right chevron (`›`) in `colors.textDisabled`. Tappable rows navigate; disabled rows (Lembretes) show `colors.textDisabled` text and no press feedback.
- Separator between items: thin line in `colors.cardBorder`.

**Spec 006 note:** a "Pessoal" section (Atividades, Template semanal) is added in spec 006 task 007-07. Do not add it here; the Mais screen is extended later.

## Acceptance Criteria

- Screen shows two sections: Trabalho and App.
- Tapping Equipes navigates to the Teams screen.
- Tapping Histórico navigates to the History screen.
- Lembretes row is visually disabled and not tappable.
- `npm run typecheck` and `npm run lint` pass.
