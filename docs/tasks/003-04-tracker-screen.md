# Task 003-04 - Tracker Screen

## Plan Reference

`docs/plans/003-time-tracker-plan.md`

## Status

Pending

## Description

Build the Tracker screen, replacing the placeholder from task 003-01.

**Features:**

- **Category picker**: select one of the four fixed categories. Required before starting.
- **Team picker**: list of user-created teams. Required if at least one team exists; hidden or optional when no teams exist.
- **Start button**: disabled until required fields are filled. On tap, records `startedAt` via `activeSessionStorage` and starts the timer.
- **Live elapsed timer**: shows `HH:MM:SS` counting up every second while a session is active. Uses `startedAt` to calculate elapsed time so the counter survives background/foreground cycles.
- **Stop button**: shown while a session is active. On tap, calculates `durationSeconds`, persists session via `sessionsStorage`, clears active session, then shows the note prompt.
- **Note prompt**: modal or inline field after stopping. User can type a short note or skip. Session is saved either way.
- **Quick restart**: after stopping (and dismissing the note prompt), show a button to restart with the same team + category as the last session.
- Only one session can be active at a time; if an active session is found in storage on mount, resume the timer from `startedAt`.

## Acceptance Criteria

- Cannot start without selecting a category (and team if teams exist).
- Elapsed timer updates every second and reflects real elapsed time after backgrounding.
- Stopping a session saves the record immediately.
- Note can be skipped; session is saved either way.
- Quick restart uses last session's team and category.
- `npm run typecheck` and `npm run lint` pass.

## Result

<!-- Fill after completion -->
