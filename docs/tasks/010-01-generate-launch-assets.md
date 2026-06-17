# Task 010-01 - Generate Launch Assets

## Plan Reference

`docs/plans/010-launch-branding-assets-plan.md`

## Status

Done

## Description

Generate Flow Blocks PNG launch assets using the existing cascading-blocks logo geometry and theme colors.

## Scope

- Replace `assets/icon.png` with a 1024x1024 app icon.
- Replace Android adaptive icon assets:
  - `assets/android-icon-foreground.png`
  - `assets/android-icon-background.png`
  - `assets/android-icon-monochrome.png`
- Replace `assets/favicon.png`.
- Add `assets/splash-logo.png` using the icon plus `FlowBlocks` wordmark.
- Keep or replace `assets/splash-icon.png` only if useful for compatibility.

## Acceptance Criteria

- All generated assets use the Flow Blocks cascading-blocks mark.
- Splash logo includes the wordmark matching the header.
- App/adaptive/fav icons use the icon mark without wordmark for clarity.
- No new dependency is added.
