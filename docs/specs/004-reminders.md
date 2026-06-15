# Spec 004 - Reminders

## Objective

Let the user create scheduled reminders that fire local notifications, optionally linked to a category and/or team/project.

## Context

Builds on spec 003 (categories and teams already exist via `teams` storage and the fixed category list). This is independent of the Pomodoro timer's own focus/break notifications.

## Goals

- Provide a Reminders screen listing all reminders, ordered by date/time (soonest first), distinguishing upcoming vs. past reminders.
- Provide a create/edit form with:
  - Title (required).
  - Description (optional).
  - Date and time (required).
  - Category (optional, from the same fixed list as spec 003: `deep work`, `meetings`, `code review`, `admin`).
  - Team/project (optional, from the `teams` list managed in spec 003).
- Schedule a local notification via `expo-notifications` for the chosen date/time when a reminder is created or edited.
- Allow deleting a reminder, which cancels its scheduled notification.
- Allow editing a reminder, which reschedules its notification (cancel old, schedule new).
- Request notification permissions on first use of this feature if not already granted; if denied, allow creating reminders but show a message that notifications won't fire.

## Non-goals

- No recurring/repeating reminders.
- No snooze functionality.
- No linking reminders to specific Pomodoro sessions.

## Data Model (AsyncStorage)

- `reminders`: `{ id: string; title: string; description: string | null; datetime: string; categoryId: 'deep_work' | 'meetings' | 'code_review' | 'admin' | null; teamId: string | null; notificationId: string | null }[]`

`notificationId` stores the id returned by `expo-notifications` so it can be cancelled on edit/delete. It is `null` if scheduling failed (e.g. permission denied).

## Acceptance Criteria

- User can create a reminder with only title + date/time (category and team optional).
- User can create a reminder with category and/or team set.
- A notification fires at the scheduled date/time for a reminder with a granted permission.
- Editing a reminder's date/time reschedules the notification (old one no longer fires).
- Deleting a reminder cancels its notification and removes it from the list.
- Reminders screen separates or visually distinguishes past vs. upcoming reminders.
- `npm run check` passes.

## Validation Commands

```bash
npm run check
```
