# Plan 009 - UX Navigation Refactor

## Spec Reference

`docs/specs/009-ux-navigation-refactor.md`

## Objective

Refactor the app experience around a stable 4-tab structure, smoother data loading, and consistent screen/action patterns. This plan does not add product features; it reorganizes existing functionality and reduces flicker.

## Assumptions

- The existing 4-tab shell from spec 007 remains.
- The fourth tab remains `Mais`.
- The current AsyncStorage adapters remain the persistence layer.
- No new dependencies are required.
- React Context plus local hooks are sufficient for shared app data.
- Existing specs 003-006 define the product capabilities; this spec only changes composition and UX flow.
- The previous Lembretes FAB correction should be preserved.

## Tasks

| #   | File                                                 | Description                                                                |
| --- | ---------------------------------------------------- | -------------------------------------------------------------------------- |
| 1   | `docs/tasks/009-01-common-ui-components.md`          | Create shared common UI components for screen scaffolds, cards, rows, FABs |
| 2   | `docs/tasks/009-02-shared-app-data-provider.md`      | Add shared app data provider/hooks to reduce repeated AsyncStorage flicker |
| 3   | `docs/tasks/009-03-home-simplification.md`           | Simplify Home into daily action hub and remove dense analytics             |
| 4   | `docs/tasks/009-04-dashboard-consolidation.md`       | Move personal chart into Painel and stabilize dashboard loading/layout     |
| 5   | `docs/tasks/009-05-reminders-flow-polish.md`         | Align Lembretes list/create/edit flow with shared list and FAB patterns    |
| 6   | `docs/tasks/009-06-mais-information-architecture.md` | Rebuild Mais sections for Trabalho, Pessoal, and App destinations          |
| 7   | `docs/tasks/009-07-transition-and-loading-polish.md` | Remove visible flicker and layout jumps across tabs/stack screens          |
| 8   | `docs/tasks/009-08-docs-and-validation.md`           | Run validation and update README/app-context after implementation          |

## Sequential Order

Tasks must be executed in order.

1. Task 1 creates the reusable UI pieces used by later screens.
2. Task 2 creates shared data loading primitives before screens are rearranged.
3. Tasks 3-6 apply the new information architecture screen by screen.
4. Task 7 handles cross-screen polish after the structure is in place.
5. Task 8 closes the spec with validation and documentation updates.

## Validation

Use the full quality gate:

```bash
npm run check
```

Manual verification on Android should include:

- Open app fresh and confirm the initial load does not flash incorrect empty states.
- Switch repeatedly between Início, Painel, Lembretes, and Mais.
- Start and stop a work session and confirm the banner remains stable.
- Create/edit/delete a reminder.
- Navigate through Mais destinations and back.
- Open daily plan and template screens.
- Confirm Home remains lightweight and Painel owns analytics.

## Out of Scope

- New business logic.
- New persistent data entities beyond a shared in-memory data provider.
- Auth, backend, sync, monetization, or external integrations.
- New animation dependencies.
- Major visual identity changes outside consistency fixes.
