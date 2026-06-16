# Task 006-02 - Personal Activities Screen

## Plan Reference

`docs/plans/006-personal-time-planner-plan.md`

## Status

Pending

## Description

Build the Personal Activities CRUD screen (`app/atividades.tsx`), accessible from the Mais menu (added in task 006-07).

**Layout:**

- Screen background: `colors.background`.
- Header: "Atividades pessoais" (`screenTitle`) + "+ Adicionar" button.
- List of activities: each in a card row with the activity name in `textPrimary` and action buttons (rename, delete) on the right.
- "Nenhuma atividade" empty state when the list is empty.

**Create:** tapping "+ Adicionar" shows an inline modal or bottom sheet with a text input for the activity name. Pressing "Salvar" creates a new `PersonalActivity` with a generated `id` and saves via `savePersonalActivities`.

**Rename:** tapping the edit icon opens the same modal pre-filled with the activity name.

**Delete:** tapping the delete icon removes the activity from the list. Does not modify `personalDailyPlan` or `personalWeeklyTemplate` entries referencing this activity — those show "Atividade removida" in their UIs.

**Persistence:** all changes saved immediately to AsyncStorage.

## Acceptance Criteria

- User can create a named activity; it appears in the list.
- User can rename an existing activity.
- User can delete an activity; it disappears from the list.
- List persists across app restarts.
- "Atividade removida" text shown in plan/template views for deleted activity IDs (verified in later tasks).
- `npm run typecheck` and `npm run lint` pass.
