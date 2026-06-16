# Task 003-07 - Validate

## Plan Reference

`docs/plans/003-time-tracker-plan.md`

## Status

Pending

## Description

Run the full quality gate and verify all spec 003 acceptance criteria.

```bash
npm run check
```

**Manual verification checklist:**

- [ ] Create a team, rename it, set `maxWeeklyPercent`, delete it.
- [ ] Start a session (category + team), let it run a few seconds, stop it.
- [ ] Background the app mid-session, foreground it — timer continues from correct elapsed time.
- [ ] Add a note after stopping. Verify it appears in History.
- [ ] Stop a session and skip the note. Verify session is saved without a note.
- [ ] Use quick restart. Verify same team and category are pre-selected.
- [ ] Delete a team that has sessions. Open History — those sessions show "Equipe removida".
- [ ] Active session indicator is visible on History and Teams tabs while a session is running.
- [ ] Restart the app mid-session — timer resumes correctly.

## Acceptance Criteria

- `npm run check` passes with no errors.
- Coverage in `src/lib/` and `src/storage/` stays at or above 80%.
- All manual checklist items verified.

## Result

<!-- Fill after completion -->
