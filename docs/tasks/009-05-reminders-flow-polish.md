# Task 009-05 - Reminders Flow Polish

## Plan Reference

`docs/plans/009-ux-navigation-refactor-plan.md`

## Status

Done

## Description

Polish the Lembretes tab and reminder form flow to match the app-wide list/action pattern.

## Scope

Update:

- `app/(tabs)/lembretes.tsx`
- `app/lembrete-form.tsx`

## Requirements

- Header contains title only on the list screen.
- Add action uses `FabButton`.
- Reminder rows use common `ListRow`/`Card` patterns.
- Create/edit form remains a stack screen.
- Keep create, edit, delete, and notification scheduling behavior intact.
- Avoid list flicker while reminders load.

## Acceptance Criteria

- FAB position/style matches Atividades and common FAB.
- Empty state text references the FAB, not a top button.
- Upcoming/past reminder rendering remains clear.
- Reminder form transitions feel consistent with other stack screens.
- Reminder tests still pass.
- `npm run typecheck` passes.
