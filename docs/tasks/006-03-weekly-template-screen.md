# Task 006-03 - Weekly Template Screen

## Plan Reference

`docs/plans/006-personal-time-planner-plan.md`

## Status

Pending

## Description

Build the weekly template editor screen (`app/template-semanal.tsx`), accessible from the Mais menu.

**Layout:**

- Screen background: `colors.background`.
- Header: "Template semanal" (`screenTitle`).
- List of 7 days (Monday through Sunday, in display order: Seg → Dom).

**Each day row:**

- Left indicator: small dot in `colors.accentFrom` if the day has at least one template entry, `colors.tabInactive` if empty.
- Day name (e.g. "Segunda-feira") in `textPrimary`.
- Preview: activity names joined by " · " in `textSecondary`, truncated to one line.
- Right: "Editar" link in `colors.accentFrom` (or "Adicionar" if no entries).
- Tapping opens the day detail editor.

**Day detail editor (stack screen or modal):**

- Title: "Template — [day name]".
- List of existing blocks: activity name (resolved from `personalActivities`) + duration ("X min") + edit/delete buttons.
- "Atividade removida" in `textDisabled` for unresolvable `activityId`.
- "+ Adicionar bloco" button: opens a mini-form to pick an activity (from the activities list) and enter planned duration in minutes.
- Changes saved immediately to `savePersonalWeeklyTemplate`.

## Acceptance Criteria

- All 7 days displayed.
- Dot indicator reflects whether a day has template entries.
- User can add, edit, and remove blocks per day.
- Template persists across app restarts.
- Unresolvable activity IDs show "Atividade removida".
- `npm run typecheck` and `npm run lint` pass.
