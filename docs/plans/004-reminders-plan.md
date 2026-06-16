# Plan 004 - Reminders

## Spec Reference

`docs/specs/004-reminders.md`

## Objective

Allow the user to create scheduled reminders that fire local notifications, optionally linked to a category and/or team. Provide a list screen and a create/edit form.

## Assumptions

- `expo-notifications` is used for scheduling and cancelling local notifications. Install if not already present.
- Notification permissions are requested at first use (when the user tries to create a reminder). If denied, reminders are saved but `notificationId` remains `null`.
- The Lembretes tab already exists as a placeholder after spec 007. This plan replaces it with a functional screen.
- Categories are the fixed constant list from spec 003 (`foco_profundo`, `reunioes`, `revisao_codigo`, `admin`).
- Teams are read from `teamsStorage` (spec 003).
- Datetime picker: use `@react-native-community/datetimepicker` (available in Expo managed workflow without extra install on SDK 50+). Show separate date and time pickers sequentially.
- Swipe-to-delete uses a simple pressable row action (no third-party swipe library).

## Tasks

| #   | File                                        | Description                                                                                 |
| --- | ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 1   | `docs/tasks/004-01-data-layer.md`           | Add `Reminder` type, `remindersStorage` helper, and unit tests                              |
| 2   | `docs/tasks/004-02-notification-helpers.md` | Set up `expo-notifications`, permission helper, schedule and cancel helpers with unit tests |
| 3   | `docs/tasks/004-03-reminders-screen.md`     | Reminders list screen: upcoming/past sections, delete action, navigation to form            |
| 4   | `docs/tasks/004-04-reminder-form.md`        | Create/edit form: title, description, datetime, category, team; save schedules notification |
| 5   | `docs/tasks/004-05-validate.md`             | Run `npm run check` and verify all acceptance criteria                                      |

## Sequential Order

Task 2 depends on task 1 (uses `Reminder` type). Tasks 3 and 4 depend on tasks 1 and 2. Task 5 is last.

## Validation

```bash
npm run check
```

## Out of Scope

- Recurring/repeating reminders
- Snooze functionality
- Linking reminders to specific Pomodoro sessions
