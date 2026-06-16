# Plan 003 - Time Tracker

## Spec Reference

`docs/specs/003-time-tracker.md`

## Objective

Implement a simple start/stop time tracker that lets the user pick a team and category, run a session with a live elapsed timer, optionally add a note after stopping, and review past sessions in a history screen. Teams are user-managed with CRUD and an optional weekly percentage cap.

## Assumptions

- Navigation is added in this spec (tabs: Tracker, History, Teams). Navigation library: Expo Router or React Navigation — choose the one already present in the Expo SDK version in use.
- AsyncStorage is used for persistence (`@react-native-async-storage/async-storage`).
- Categories are a fixed constant, not stored in AsyncStorage.
- Only one active session at a time; no background timer — the timer resumes from `startedAt` if the app is foregrounded mid-session.
- `teamId` is nullable; team selection is required only when at least one team exists.
- Deleted teams do not remove historical sessions; History shows "Equipe removida" for unresolvable `teamId`.
- No editing of past sessions.

## Tasks

| #   | File                                            | Description                                                                                            |
| --- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 1   | `docs/tasks/003-01-navigation-setup.md`         | Add tab navigation (Tracker, History, Teams) and remove placeholder home screen                        |
| 2   | `docs/tasks/003-02-data-layer.md`               | Define types, constants, and AsyncStorage read/write helpers for teams and sessions                    |
| 3   | `docs/tasks/003-03-teams-screen.md`             | Build Teams screen: list teams, add, rename, delete, set maxWeeklyPercent                              |
| 4   | `docs/tasks/003-04-tracker-screen.md`           | Build Tracker screen: category/team picker, Start/Stop, live elapsed timer, note prompt, quick restart |
| 5   | `docs/tasks/003-05-history-screen.md`           | Build History screen: list sessions most-recent-first with all fields                                  |
| 6   | `docs/tasks/003-06-active-session-indicator.md` | Show running timer in persistent header or tab badge while a session is active                         |
| 7   | `docs/tasks/003-07-validate.md`                 | Run `npm run check` and confirm all acceptance criteria pass                                           |

## Sequential Order

Tasks must be executed in order. Each task depends on the previous completing successfully. Tasks 3, 4, and 5 depend on the data layer from task 2. Task 6 depends on tasks 4 and the navigation shell from task 1.

## Validation

After all tasks are complete:

```bash
npm run check
```

Expected result: no lint, format, TypeScript, or test errors. Coverage stays at or above 80% in `src/lib/`.

## Documentation

After implementation, update `docs/app-context.md` and `README.md` per the relevant standards.

## Out of Scope

- Charts or metrics (spec 005)
- Reminders or notifications (spec 004)
- Personal time planner (spec 006)
- Backend, sync, authentication
- Editing past session records
