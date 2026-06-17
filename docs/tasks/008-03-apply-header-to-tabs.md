# Task 008-03 - Apply Header To Tabs

## Plan Reference

`docs/plans/008-app-header-branding-plan.md`

## Status

Done

## Description

Use the unified `AppHeader` (task 008-02) in all four tab screens and remove each tab's ad-hoc header markup.

**Files to edit:**

- `app/(tabs)/index.tsx` — replace `<AppHeader />` with `<AppHeader greeting />`.
- `app/(tabs)/painel.tsx` — remove the `headerRow` (the `Painel` title and the `stats-chart-outline` icon) and render `<AppHeader title="Painel" />` at the top. Remove now-unused styles (`headerRow`, `screenTitle`) and the now-unused `Ionicons` import if no longer referenced.
- `app/(tabs)/lembretes.tsx` — remove the bare `header`/`title` markup and render `<AppHeader title="Lembretes" />`. Remove now-unused styles.
- `app/(tabs)/mais.tsx` — remove the bare `Mais` title and render `<AppHeader title="Mais" />`. Remove now-unused styles.

**Requirements:**

- The header must sit above each screen's scrollable content (outside the `ScrollView`), matching how Início already renders `AppHeader` above its `ScrollView`.
- Do not change any business logic, data loading, list rendering, or the floating "+" button on Lembretes.
- Keep the active-session banner (tabs `_layout.tsx`) untouched.

## Acceptance Criteria

- All four tabs render `AppHeader` with the logo + settings gear.
- Início shows `Aloha :)` + date; Painel/Lembretes/Mais show their title.
- The old per-tab titles, the Painel chart icon, and unused styles/imports are removed.
- No regressions in existing screen behavior (lists, buttons, navigation).
- `npm run check` passes.
