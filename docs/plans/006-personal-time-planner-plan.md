# Plan 006 - Personal Time Planner

## Spec Reference

`docs/specs/006-personal-time-planner.md`

## Objective

Let the user define personal activities, configure a recurring weekly template, use it as a daily plan with done/not-done tracking, see a summary chart of personal time, and preview tonight's plan on the Home screen.

## Assumptions

- AsyncStorage keys: `personalActivities`, `personalWeeklyTemplate`, `personalDailyPlan` (as defined in the spec).
- Day of week uses JS `Date.getDay()`: 0 = Sunday, 1 = Monday, …, 6 = Saturday.
- On first open of a date's plan, entries are generated from that weekday's template. Subsequent opens load the persisted plan.
- Deleting an activity does not purge historical daily plan entries; those show "Atividade removida" for unresolvable IDs.
- "Esta noite" Home card shows the plan for today, pre-filling from the template if not yet generated.
- Personal chart is placed on the Home screen below the "Esta noite" card, showing done minutes per activity for the current week and last 4 weeks (two separate bar sections or a period toggle).
- Mais menu gains a "Pessoal" section with links to Atividades and Template semanal.
- No live timer for personal activities — only planned duration and done/not-done.

## Tasks

| #   | File                                          | Description                                                                                 |
| --- | --------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 1   | `docs/tasks/006-01-data-layer.md`             | Types and storage helpers for personalActivities, personalWeeklyTemplate, personalDailyPlan |
| 2   | `docs/tasks/006-02-activities-screen.md`      | Personal Activities CRUD screen (create, rename, delete)                                    |
| 3   | `docs/tasks/006-03-weekly-template-screen.md` | Weekly template screen: list 7 days, edit blocks per day (activity + planned duration)      |
| 4   | `docs/tasks/006-04-daily-plan-screen.md`      | Daily plan screen: pre-fill from template, check/uncheck, add/remove/edit entries           |
| 5   | `docs/tasks/006-05-home-tonight-card.md`      | "Esta noite" preview card on Home screen linking to the daily plan                          |
| 6   | `docs/tasks/006-06-personal-chart.md`         | Personal chart: done minutes per activity for current week and last 4 weeks                 |
| 7   | `docs/tasks/006-07-mais-menu-update.md`       | Add Pessoal section to Mais menu (Atividades, Template semanal)                             |
| 8   | `docs/tasks/006-08-validate.md`               | Run `npm run check` and verify all acceptance criteria                                      |

## Sequential Order

Task 1 first. Tasks 2, 3, 4 depend on task 1 (in order). Task 5 depends on task 4. Task 6 depends on tasks 1 and 4. Task 7 depends on tasks 2 and 3. Task 8 is last.

## Validation

```bash
npm run check
```

Coverage in `src/lib/` must stay ≥ 80%.

## Out of Scope

- Live timer for personal activities
- Per-activity time goals or balance alerts
- Integration with Pomodoro session history
- Shared or synced data
