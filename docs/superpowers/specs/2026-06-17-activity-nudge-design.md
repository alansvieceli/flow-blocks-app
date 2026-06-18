# Design — Activity Nudge (Spec 011)

**Date:** 2026-06-17  
**Status:** Approved

## Problem

The user wants a way to start an activity (video game, work focus, etc.) and be notified after a chosen duration — without manually watching a clock or managing the existing session timer. After the notification fires, they can extend or end. The time spent needs to count in existing charts.

## What It Is

A countdown notification tool. You pick an activity and a duration, tap Start, and the app notifies you when time is up. You can keep extending or end it. When it ends, the time is automatically saved to the appropriate data store.

It is **not** a replacement for the manual session timer. Both can run simultaneously. The nudge is orthogonal to `active_session`.

## Data Model

New type in `src/types/index.ts`:

```ts
export interface ActiveNudge {
  id: string;
  label: string; // display name, e.g. "Video Game" or "Foco · Apoio"
  type: 'personal' | 'work';
  activityId?: string; // set when type = 'personal'
  teamId?: string; // set when type = 'work'
  categoryId?: string; // set when type = 'work'
  startedAt: string; // ISO 8601
  durationSeconds: number; // original duration chosen by user
  endsAt: string; // ISO 8601 — when notification will fire (updated on each extend)
  notificationId: string | null;
  extendCount: number; // how many times the user extended
}
```

New `src/storage/activeNudgeStorage.ts` — stores a single `ActiveNudge | null`, analogous to `activeSessionStorage.ts`.

## Home Screen

**No active nudge:** a small amber dashed button "⏱ Iniciar nudge de atividade" appears between the session card and the "Esta noite" section.

**Active nudge:** an amber card replaces the button, showing:

- Label ("⏱ Nudge ativo" badge + "Encerrar" button)
- Activity name
- Time remaining (large) + elapsed / total on the right
- Amber progress bar
- Color: `#f59e0b` (amber) — distinct from the emerald used in "Esta noite"

Everything else on the home screen is unchanged.

## Create Nudge Flow

Triggered by tapping the amber button. Opens a bottom sheet / modal with:

1. **Type:** chips — "🎮 Pessoal" / "💼 Trabalho"
2. **Activity / Team:** chips from the corresponding list (personalActivities or teams)
   - If work: also shows category picker (same categories as sessions)
3. **Duration:** grid of presets — 15 min, 30 min, 45 min, 60 min, 90 min, Custom
4. **"▶ Iniciar Nudge"** button — disabled until all required fields are set: type + activity/team + duration. For work type, category is also required (both team and category must be selected).

On start: saves `ActiveNudge` to storage, schedules notification via `scheduleNudgeNotification`, shows amber card on home.

## Notification & Extend Flow

When the notification fires, the user taps it → app opens → detects `active_nudge` with `endsAt` in the past → shows bottom sheet. The same detection runs on every app open (foreground resume):

- If `endsAt` is less than `nudgeAbandonHours` hours in the past: shows the bottom sheet. The user must choose extend or end — no data is saved and nothing is cleared until they explicitly act.
- If `endsAt` is `nudgeAbandonHours` or more hours in the past: auto-discards silently (clears `active_nudge`, cancels any pending notification, saves nothing). The nudge is considered abandoned.

- **"+ 15 minutos"**
- **"+ 30 minutos"**
- **"+ 60 minutos"**
- **"Encerrar atividade"** (destructive)

**Extending:** cancels current notification, recalculates `endsAt = now + chosenExtension`, reschedules notification, increments `extendCount`, saves updated `ActiveNudge`.

**Ending (via sheet or via "Encerrar" button on home card):** see Save Logic below.

## Save Logic (on end only)

Extending does not save time. Only ending triggers a save.

### Personal nudge

Upserts into today's `personalDailyPlan`:

- **Entry exists for this `activityId`:** adds the nudge's selected duration in minutes to `plannedMinutes`, then marks `done: true`, `status: 'done'`.
- **No entry exists:** inserts a new entry with `plannedMinutes = Math.round(durationSeconds / 60)`, `done: true`, `status: 'done'`.

Personal nudges save the selected/extended nudge duration, not the wall-clock time until the user taps "Encerrar". Extending a nudge increases `durationSeconds` by the extension amount so the final saved personal time reflects the full committed duration.

Uses the existing `updatePersonalDailyPlans` path. No schema changes required.

### Work nudge

Creates a `Session`:

```ts
{
  id: Date.now().toString(),
  categoryId: nudge.categoryId!,
  teamId: nudge.teamId ?? null,
  startedAt: nudge.startedAt,
  endedAt: new Date().toISOString(),
  durationSeconds: Math.floor((Date.now() - new Date(nudge.startedAt).getTime()) / 1000),
  note: null,
}
```

Uses the existing `updateSessions` path. Appears in History and all dashboard charts automatically.

After saving: clears `active_nudge` from storage, cancels any pending notification.

## Notifications

Reuses `expo-notifications` infrastructure already in place.

New function `scheduleNudgeNotification(nudge: ActiveNudge)` in `src/lib/notifications.ts` — analogous to `scheduleReminderNotification`. Schedules for `nudge.endsAt`.

Uses the same `DEFAULT_CHANNEL_ID` ('default') and `cancelReminderNotification` for cancellation.

## Settings

New field in `AppSettings` (`src/storage/settingsStorage.ts`):

```ts
nudgeAbandonHours: number; // default: 8
```

Exposed in the Settings screen as a picker/selector (e.g., 1h, 2h, 4h, 8h, 12h, 24h). Controls how long after `endsAt` a stale nudge is auto-discarded instead of shown in the bottom sheet.

## Constraints

- Maximum 1 active nudge at a time. Starting a new one requires ending the current one.
- A work nudge and an `active_session` can coexist. If both track the same team simultaneously, time is counted for each independently (user responsibility).
- Notification permission follows the same flow already in place for reminders.

## Non-Goals

- No nudge history or log.
- No recurring nudges.
- No editing a nudge after it starts (only extend or end).
- No notes on nudge end.
- No blocking of simultaneous manual session + work nudge for the same team.

## Acceptance Criteria

- User can start a personal nudge → notification fires at chosen time → extend or end → activity marked done in "Esta noite" and personal plan.
- User can start a work nudge → notification fires → end → session appears in History and Painel charts.
- Home shows amber card when nudge is active; shows amber dashed button when no nudge is active.
- Cannot start a second nudge while one is active.
- Extending reschedules the notification correctly; old notification does not fire.
- Manual end (from home card) also triggers save logic.
- `npm run check` passes.
