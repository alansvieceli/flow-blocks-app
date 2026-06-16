# Spec 003 - Time Tracker

## Objective

Let the user track time spent per team and category with a simple start/stop timer — no fixed cycles, no forced breaks. The goal is visibility: where is my time actually going across teams and types of work?

## Context

Flow Blocks helps a developer who works across multiple teams (and at any hour — nights, weekends) understand how their time is distributed. This spec replaces the original Pomodoro-based spec 003. Specs 004 (reminders), 005 (dashboard), and 006 (personal time) build on the session data recorded here.

## Goals

- **Session tracking**: user picks a team and a category, taps Start, works freely, taps Stop when done. Duration is calculated automatically. A session can last 5 minutes or 5 hours — no constraints.
- **Active session indicator**: while a session is running, the app shows a visible running timer (elapsed time) on the main screen and in the tab bar badge or persistent header, so the user always knows a session is active.
- **Quick restart**: after stopping, the app offers one-tap restart with the same team + category as the last session.
- **Categories** (fixed list): `foco profundo`, `reuniões`, `revisão de código`, `admin`.
- **Teams management**: user-managed list of teams/projects with basic CRUD (add, rename, remove). Each team has an optional `maxWeeklyPercent` (0–100) used by the spec 005 balance alert; defaults to `null`. No pre-seeded teams.
- **Optional note**: after stopping a session, user can optionally add a short note (one line) to the session record. Can be skipped.
- **History screen**: list of all past sessions (most recent first) showing date, start/end time, duration, category, team, and note if present.

## Non-goals

- No Pomodoro cycles, forced breaks, or fixed durations.
- No timer countdown — only elapsed time counting up.
- No notifications for session end (the user decides when to stop).
- No editing of past session records.
- No backend, sync, or authentication.
- No charts or metrics (spec 005).
- No reminders (spec 004).

## Data Model (AsyncStorage)

- `teams`: `{ id: string; name: string; maxWeeklyPercent: number | null }[]`
- `sessions`: `{ id: string; categoryId: 'foco_profundo' | 'reunioes' | 'revisao_codigo' | 'admin'; teamId: string | null; startedAt: string; endedAt: string; durationSeconds: number; note: string | null }[]`

`teamId` is nullable so a session can be saved without a team selected. A deleted team does not remove historical sessions; those sessions retain the old `teamId` and the History screen shows "Equipe removida" when the id no longer resolves.

## Acceptance Criteria

- User can create, rename, and delete teams, and optionally set a `maxWeeklyPercent` per team; persists across restarts.
- Starting a session requires selecting a category; team selection is required if at least one team exists, optional if no teams are configured yet.
- While a session is running, the elapsed time is visible and updates every second.
- Only one session can be active at a time; starting a new one requires stopping the current one first.
- Stopping a session calculates `durationSeconds` from `startedAt` to `endedAt` and persists the record immediately.
- After stopping, user can add an optional note; skipping the note still saves the session.
- Quick restart (same team + category) is available after stopping.
- History screen lists all sessions with date, start/end time, duration, category, team name (or "Equipe removida"), and note.
- `npm run check` passes.

## Validation Commands

```bash
npm run check
```
