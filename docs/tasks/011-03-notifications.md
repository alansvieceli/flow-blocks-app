# Task 011-03 - Notifications: scheduleNudgeNotification

## Plan Reference

`docs/plans/011-activity-nudge-plan.md`

## Status

Pending

## Description

Add `scheduleNudgeNotification` to `src/lib/notifications.ts`. Mirrors `scheduleReminderNotification` but uses `nudge.endsAt` as the trigger and `nudge.label` as the title.

---

- [ ] **Step 1: Add function to `src/lib/notifications.ts`**

Add after `scheduleReminderNotification`:

```ts
export async function scheduleNudgeNotification(
  nudge: Pick<ActiveNudge, 'id' | 'label' | 'endsAt'>,
): Promise<string | null> {
  if (!ExpoNotifications) return null;
  try {
    const trigger = new Date(nudge.endsAt);
    if (trigger.getTime() <= Date.now()) return null;
    await ensureAndroidNotificationChannel();
    const notificationId = await ExpoNotifications.scheduleNotificationAsync({
      content: {
        title: nudge.label,
        body: 'Seu tempo acabou. Quer continuar ou encerrar?',
        data: { nudgeId: nudge.id },
        sound: 'default',
      },
      trigger: {
        type: ExpoNotifications.SchedulableTriggerInputTypes.DATE,
        date: trigger,
        channelId: DEFAULT_CHANNEL_ID,
      },
    });
    return notificationId;
  } catch {
    return null;
  }
}
```

Also add the import for `ActiveNudge` at the top of the file (alongside the existing `Reminder` import):

```ts
import { ActiveNudge, Reminder } from '../types';
```

- [ ] **Step 2: Add test in `src/lib/__tests__/notifications.test.ts`**

Add after the existing `cancelReminderNotification` describe block:

```ts
describe('scheduleNudgeNotification', () => {
  const futureEndsAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  it('schedules and returns notification id', async () => {
    ExpoNotifications.setNotificationChannelAsync.mockResolvedValue(undefined);
    ExpoNotifications.scheduleNotificationAsync.mockResolvedValue('nudge-notif-1');
    const result = await scheduleNudgeNotification({
      id: 'n1',
      label: 'Video Game',
      endsAt: futureEndsAt,
    });
    expect(result).toBe('nudge-notif-1');
    expect(ExpoNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ title: 'Video Game' }),
      }),
    );
  });

  it('returns null when endsAt is in the past', async () => {
    const result = await scheduleNudgeNotification({
      id: 'n1',
      label: 'Video Game',
      endsAt: new Date(Date.now() - 1000).toISOString(),
    });
    expect(result).toBeNull();
  });

  it('returns null when scheduling throws', async () => {
    ExpoNotifications.scheduleNotificationAsync.mockRejectedValue(new Error('fail'));
    const result = await scheduleNudgeNotification({
      id: 'n1',
      label: 'Video Game',
      endsAt: futureEndsAt,
    });
    expect(result).toBeNull();
  });
});
```

Also add `scheduleNudgeNotification` to the import at the top of the test file:

```ts
import {
  cancelReminderNotification,
  requestNotificationPermission,
  scheduleNudgeNotification,
  scheduleReminderNotification,
} from '../notifications';
```

- [ ] **Step 3: Run tests**

```bash
npm test -- notifications --watchAll=false
```

Expected: all existing tests still pass + 3 new tests pass.

## Acceptance Criteria

- `scheduleNudgeNotification` exported from `src/lib/notifications.ts`.
- All 3 new tests pass; no existing tests broken.
- `npm run check` passes.
