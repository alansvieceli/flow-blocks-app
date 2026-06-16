# Spec 003 - Pomodoro Time Tracking

## Objective

Implement the core time-tracking loop: a configurable Pomodoro timer where the user declares a category and a team/project before starting a focus block, with local persistence of completed sessions.

## Context

Flow Blocks helps a developer who works across multiple teams understand where their focus time goes. This is the first product spec; specs 004 (reminders) and 005 (dashboards) build on the session data created here.

## Goals

- Provide a setup screen where the user configures, before starting a block:
  - Focus duration and break duration (default 25/5 minutes, both editable per session).
  - Category, chosen from a fixed list: `deep work`, `meetings`, `code review`, `admin`.
  - Team/project, chosen from a user-managed list (see Teams management below).
- Provide a Teams management screen with basic CRUD (add, rename, remove) for teams/projects, persisted locally. Seed with no default teams (user creates their own, e.g. "Equipe X", "Equipe Y"). Each team has an optional "max weekly %" target (0-100), used by the spec 005 dashboard alert; leave unset (`null`) by default.
- Provide a Timer screen that:
  - Counts down the configured focus duration.
  - On completion, fires a local notification ("Focus block complete") and automatically starts the configured break duration.
  - On break completion, fires a local notification ("Break complete") and returns to the setup screen.
  - Allows the user to cancel/stop the current block early.
- Persist every completed or stopped block as a session record (see Data Model).
- Provide a History screen listing past sessions (most recent first) showing date, category, team, type (focus/break), planned duration, and actual duration.

## Non-goals

- No charts, weekly metrics, heatmap, or streaks (spec 005).
- No standalone reminders (spec 004).
- No backend, sync, or authentication.
- No brain dump feature.
- No editing of past session records.

## Data Model (AsyncStorage)

- `teams`: `{ id: string; name: string; maxWeeklyPercent: number | null }[]`
- `sessions`: `{ id: string; categoryId: 'deep_work' | 'meetings' | 'code_review' | 'admin'; teamId: string | null; type: 'focus' | 'break'; plannedDurationMinutes: number; actualDurationSeconds: number; startedAt: string; endedAt: string; completed: boolean }[]`
- `settings`: `{ defaultFocusMinutes: number; defaultBreakMinutes: number }` (defaults: 25 / 5)

`teamId` is nullable so a session can be recorded without a team selected. A removed team does not delete its historical sessions; `teamId` keeps the old id and the History screen displays "Unknown team" if the id no longer resolves.

## Acceptance Criteria

- User can create, rename, and delete teams, and optionally set a "max weekly %" target per team; the list persists across app restarts.
- User can configure focus/break duration on the setup screen; values default to the persisted `settings` (initially 25/5) and changes to `settings` persist for future sessions.
- Starting a block requires a category and allows (does not require) a team selection.
- Timer counts down accurately, transitions focus -> break -> setup automatically, and fires a local notification at each transition.
- Stopping a block early still records a session with `completed: false` and the actual elapsed duration. This is the intended flow for handling mid-block interruptions: stop the current block (preserving real elapsed time), then start a new block with the correct category (e.g. switching from "deep work" to "meetings" when a meeting starts unexpectedly).
- History screen lists all recorded sessions with category, team name (or "Unknown team"), type, planned and actual duration, and start date/time.
- `npm run check` passes.

## Validation Commands

```bash
npm run check
```
