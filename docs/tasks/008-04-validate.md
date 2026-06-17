# Task 008-04 - Validate

## Plan Reference

`docs/plans/008-app-header-branding-plan.md`

## Status

Done

## Description

Validate the header & branding changes and confirm all acceptance criteria from the spec.

## Steps

1. Run `npm run check`.
2. Fix any lint, format, TypeScript, or test errors.
3. Manually verify (Android emulator) against the spec acceptance criteria:
   - All four tabs show the Flow Blocks logo + settings gear.
   - Gear opens `/configuracoes` from each tab.
   - Início shows `Aloha :)` + date; Painel/Lembretes/Mais show their title.
   - No leftover brand pill, bare titles, or Painel chart icon.

## Acceptance Criteria

- `npm run check` passes with no errors.
- All acceptance criteria in `docs/specs/008-app-header-branding.md` are met.
