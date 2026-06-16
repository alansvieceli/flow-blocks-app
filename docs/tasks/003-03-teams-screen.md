# Task 003-03 - Teams Screen

## Plan Reference

`docs/plans/003-time-tracker-plan.md`

## Status

Pending

## Description

Build the Teams screen, replacing the placeholder from task 003-01.

**Features:**

- List of teams with name and `maxWeeklyPercent` (shown as "—" when null).
- Add team: text input + confirm button. Name must be non-empty.
- Rename team: inline or modal edit.
- Delete team: confirmation prompt before removing.
- Set `maxWeeklyPercent`: optional numeric input (0–100) on add or edit; clear sets it back to null.
- Changes persist via `teamsStorage` from task 003-02.

## Acceptance Criteria

- Teams persist across app restarts.
- Empty name is rejected.
- `maxWeeklyPercent` outside 0–100 is rejected.
- Deleting a team requires confirmation.
- `npm run typecheck` and `npm run lint` pass.

## Result

<!-- Fill after completion -->
