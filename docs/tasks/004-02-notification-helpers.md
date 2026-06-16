# Task 004-02 - Notification Helpers

## Plan Reference

`docs/plans/004-reminders-plan.md`

## Status

Pending

## Description

Set up `expo-notifications` and create helpers for permission requests, scheduling, and cancelling notifications.

**Install** (if not already present):

```bash
npx expo install expo-notifications
```

**Helpers** (`src/lib/notifications.ts`):

- `requestNotificationPermission(): Promise<boolean>` — requests permission via `expo-notifications`. Returns `true` if granted, `false` otherwise.
- `scheduleReminderNotification(reminder: Pick<Reminder, 'id' | 'title' | 'description' | 'datetime'>): Promise<string | null>` — schedules a local notification at `reminder.datetime`. Returns the notification ID string on success, `null` if scheduling fails (e.g. datetime in the past, permission denied).
- `cancelReminderNotification(notificationId: string): Promise<void>` — cancels the scheduled notification by ID.

**Unit tests** (`src/lib/__tests__/notifications.test.ts`):

- Mock `expo-notifications` module.
- Test that `requestNotificationPermission` returns `true` when permission is granted and `false` when denied.
- Test that `scheduleReminderNotification` calls the correct `expo-notifications` API and returns the notification ID.
- Test that `scheduleReminderNotification` returns `null` when an error is thrown.
- Test that `cancelReminderNotification` calls the cancel API with the correct ID.

## Acceptance Criteria

- Helpers exist in `src/lib/notifications.ts` and are fully unit-tested.
- `npm run check` passes with coverage ≥ 80% in `src/lib/`.
