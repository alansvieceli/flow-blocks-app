# Task 006-08 - Validate

## Plan Reference

`docs/plans/006-personal-time-planner-plan.md`

## Status

Pending

## Description

Run the full quality gate and verify all spec 006 acceptance criteria.

```bash
npm run check
```

**Manual verification checklist:**

- [ ] Mais menu shows "Pessoal" section with Atividades and Template semanal links.
- [ ] Create a personal activity ("Leitura"); it appears in the list and persists after restart.
- [ ] Rename the activity; new name appears everywhere it's referenced.
- [ ] Delete the activity; removed from list. Plan entries referencing it show "Atividade removida".
- [ ] Open Template semanal; all 7 days listed. Dot is grey for days without entries.
- [ ] Add a block to Monday (activity + planned minutes); dot turns colored.
- [ ] Template persists after restart.
- [ ] Open daily plan for today; entries pre-filled from today's weekday template.
- [ ] Open the same date again; shows persisted plan (not regenerated).
- [ ] Mark an entry as done; green checkmark appears and persists.
- [ ] Mark an entry as not done; strikethrough appears and persists.
- [ ] Add a one-off entry to today's daily plan; does not affect the weekly template.
- [ ] Remove an entry from today's plan; does not affect the weekly template.
- [ ] Footer summary "X feito · X não rolou · X pendentes" updates correctly.
- [ ] "Esta noite" card on Home shows today's plan with done/total count.
- [ ] Tapping "Esta noite" card navigates to today's daily plan.
- [ ] Personal chart shows done minutes per activity for current week.
- [ ] Period toggle switches to "Últimas 4 semanas" and shows correct data.
- [ ] Empty states (no activities, no template, no plan) render without errors.

## Acceptance Criteria

- `npm run check` passes with no errors.
- Coverage in `src/lib/` stays at or above 80%.
- All manual checklist items verified.
