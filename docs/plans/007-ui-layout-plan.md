# Plan 007 - UI Layout

## Spec Reference

`docs/specs/007-ui-layout.md`

## Objective

Apply the approved visual identity and restructure navigation to 4 tabs. Move the tracker to the Home screen, relocate Teams and History under Mais, add placeholder screens for Painel and Lembretes, and replace all styles with the dark theme defined in `docs/superpowers/specs/2026-06-16-ui-design.md`.

## Assumptions

- Existing screens from spec 003 (Teams, History, Tracker) are fully functional. This spec reskins and rearranges them without changing business logic.
- `expo-linear-gradient` is used for gradient backgrounds and buttons (already available in Expo SDK).
- `@expo/vector-icons` Ionicons is used for tab bar icons (already available in Expo).
- The active session banner replaces the per-screen active session indicator from spec 003; the underlying shared state (`activeSessionStorage`) is unchanged.
- "Daily metrics" card on Home is a placeholder only — no real data computation (spec 005 scope).
- "Esta noite" card on Home is out of scope — spec 006 scope.

## Tasks

| #   | File                                          | Description                                                                                          |
| --- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1   | `docs/tasks/007-01-theme-constants.md`        | Create `src/theme/` with color and typography constants                                              |
| 2   | `docs/tasks/007-02-navigation-restructure.md` | Replace 3-tab layout with 4-tab layout (Início, Painel, Lembretes, Mais)                             |
| 3   | `docs/tasks/007-03-home-screen.md`            | Build Home screen: greeting header, daily metrics placeholder, Novo bloco card, active session state |
| 4   | `docs/tasks/007-04-mais-menu.md`              | Build Mais menu screen with Trabalho and App sections                                                |
| 5   | `docs/tasks/007-05-restyle-screens.md`        | Restyle Teams and History screens with dark theme and card layout                                    |
| 6   | `docs/tasks/007-06-placeholder-screens.md`    | Add Painel and Lembretes placeholder screens ("Em breve")                                            |
| 7   | `docs/tasks/007-07-active-session-banner.md`  | Persistent banner above tab bar showing running timer from any tab                                   |
| 8   | `docs/tasks/007-08-validate.md`               | Run `npm run check` and verify all acceptance criteria                                               |

## Sequential Order

Tasks must be executed in order. Tasks 3–6 depend on the 4-tab navigation shell from task 2. Tasks 3 and 7 share the active session state — complete task 3 first. Task 7 replaces the old per-screen indicator; remove the old indicator as part of task 7.

## Validation

```bash
npm run check
```

Expected result: no lint, format, TypeScript, or test errors.

## Out of Scope

- New features (reminders, charts, personal planner — specs 004–006)
- Daily metrics computation (spec 005)
- "Esta noite" card (spec 006)
- Light theme
- Animations or transitions
