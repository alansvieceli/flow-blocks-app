# Task 009-07 - Transition and Loading Polish

## Plan Reference

`docs/plans/009-ux-navigation-refactor-plan.md`

## Status

Done

## Follow-up Fixes

- Moved the reminder create/edit flow into an in-place modal from the reminders tab to avoid full-screen route flicker while saving.
- Updated reminder date/time pickers to use `onValueChange` and `onDismiss` instead of deprecated `onChange`.
- Adjusted active-session banner and floating action button offsets to respect bottom safe area and avoid overlapping Android navigation controls.
- Added an explicit root status bar configuration so content does not render underneath the device date/time/battery area.

## Description

Remove visible flicker, abrupt layout shifts, and inconsistent stack transitions after the screen restructuring is complete.

## Scope

Review and polish:

- Tab switching.
- Active-session banner layout.
- List-to-form stack navigation.
- Empty/loading states.
- Back navigation from secondary screens.

## Requirements

- Do not add animation dependencies.
- Prefer stable layout dimensions and retained previous data.
- Avoid conditionally mounting large layout sections in a way that causes jarring jumps.
- Use common loading/empty states.

## Acceptance Criteria

- Switching between the 4 tabs after initial load does not flash incorrect empty states.
- Active-session banner appears/disappears without breaking tab layout.
- Stack screens feel consistent when opened from tabs.
- Manual Android verification is documented in task 009-08.
- `npm run typecheck` passes.
