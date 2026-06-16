# Task 005-06 - Validate

## Plan Reference

`docs/plans/005-time-visibility-dashboard-plan.md`

## Status

Pending

## Description

Run the full quality gate and verify all spec 005 acceptance criteria.

```bash
npm run check
```

**Manual verification checklist:**

- [ ] Dashboard tab (Painel) shows weekly metrics section with category and team breakdowns.
- [ ] Bar widths in weekly metrics are proportional to share of total.
- [ ] Teams with `maxWeeklyPercent` exceeded show ⚠️ alert in weekly metrics bars.
- [ ] Heatmap renders a 7×24 grid with visible intensity differences.
- [ ] Filtering heatmap by team updates the grid.
- [ ] Filtering heatmap by category updates the grid.
- [ ] "All" filter restores unfiltered heatmap.
- [ ] Streak card shows correct consecutive day count (record a session today, check it shows 1+).
- [ ] Context switch count increases when sessions alternate between teams/categories.
- [ ] Team balance alert section appears only when at least one team exceeds its target.
- [ ] Home screen daily metrics card shows today's real focus time and top teams.
- [ ] All empty states (no sessions) render without errors and show 0/-- values.

## Acceptance Criteria

- `npm run check` passes with no errors.
- Coverage in `src/lib/` stays at or above 80%.
- All manual checklist items verified.
