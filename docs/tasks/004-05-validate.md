# Task 004-05 - Validate

## Plan Reference

`docs/plans/004-reminders-plan.md`

## Status

Pending

## Description

Run the full quality gate and verify all spec 004 acceptance criteria.

```bash
npm run check
```

**Manual verification checklist:**

- [ ] Lembretes tab shows the reminders list (not the placeholder).
- [ ] Tapping "+ Novo" opens the reminder form.
- [ ] Creating a reminder with only title + datetime (no category/team) saves and appears in "Próximos".
- [ ] Creating a reminder with category and team set shows the badges on the list row.
- [ ] Past reminders appear in "Passados" with reduced opacity.
- [ ] Tapping a reminder opens the edit form with pre-filled values.
- [ ] Editing the datetime reschedules the notification (old one no longer fires on device).
- [ ] Deleting a reminder from the list removes it.
- [ ] Deleting a reminder from the form removes it.
- [ ] Permission denied flow shows the warning message and still saves the reminder.

## Acceptance Criteria

- `npm run check` passes with no errors.
- Coverage in `src/lib/` stays at or above 80%.
- All manual checklist items verified.
