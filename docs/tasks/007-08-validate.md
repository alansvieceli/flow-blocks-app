# Task 007-08 - Validate

## Plan Reference

`docs/plans/007-ui-layout-plan.md`

## Status

Pending

## Description

Run the full quality gate and verify all spec 007 acceptance criteria.

```bash
npm run check
```

**Manual verification checklist:**

- [ ] App opens on the Home tab with correct background (`#0f0f1a`).
- [ ] Greeting on Home changes by time of day (Bom dia / Boa tarde / Boa noite).
- [ ] Daily metrics placeholder card is visible.
- [ ] Category chips and team chips render correctly on Home.
- [ ] Iniciar button is disabled until category is selected.
- [ ] Starting a session switches to the active session card on Home.
- [ ] Active session banner appears above the tab bar on Painel, Lembretes, and Mais tabs.
- [ ] Banner timer matches the Home screen timer.
- [ ] Tapping the banner navigates back to Home.
- [ ] Stopping a session from Home clears the banner.
- [ ] Mais menu shows Trabalho (Equipes, Histórico) and App (Lembretes disabled) sections.
- [ ] Navigating to Equipes from Mais shows the restyled dark-theme Teams screen.
- [ ] Navigating to Histórico from Mais shows the restyled dark-theme History screen.
- [ ] Painel tab shows "Em breve" placeholder.
- [ ] Lembretes tab shows "Em breve" placeholder.
- [ ] Tab bar shows 4 tabs with correct icons and colors.

## Acceptance Criteria

- `npm run check` passes with no errors.
- Coverage in `src/lib/` and `src/storage/` stays at or above 80%.
- All manual checklist items verified.
