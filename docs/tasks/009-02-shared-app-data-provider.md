# Task 009-02 - Shared App Data Provider

## Plan Reference

`docs/plans/009-ux-navigation-refactor-plan.md`

## Status

Done

## Description

Add a shared app data layer to reduce repeated independent AsyncStorage loading and prevent tabs from flashing incorrect empty states.

## Scope

Create a provider and hooks under `src/lib/` or `src/state/` for:

- teams
- sessions
- active session
- reminders
- settings
- personal activities
- personal weekly template
- personal daily plans

## Requirements

- Use React Context/hooks; do not add dependencies.
- Keep AsyncStorage adapters as the persistence layer.
- Load core datasets once near the app root.
- Expose refresh and mutation helpers where useful.
- Keep previous data visible while refreshing.
- Provide explicit loading and error states.
- Preserve existing tests and storage behavior.

## Acceptance Criteria

- Tabs can consume shared data without independently rendering an empty state first.
- Existing storage tests still pass.
- Add focused tests for provider/helper behavior where practical.
- `npm run typecheck` and relevant tests pass.
