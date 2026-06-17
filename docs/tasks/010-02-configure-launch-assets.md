# Task 010-02 - Configure Launch Assets

## Plan Reference

`docs/plans/010-launch-branding-assets-plan.md`

## Status

Done

## Description

Configure Expo to use the generated app icon, Android adaptive icon, favicon, and splash logo.

## Scope

- Update `app.json`.
- Add `expo-splash-screen` plugin configuration with:
  - `image`: `./assets/splash-logo.png`
  - `backgroundColor`: Flow Blocks dark background
  - `resizeMode`: `contain`
  - `imageWidth`: a centered, header-like logo size
- Do not add authentication or unlock-related plugins.

## Acceptance Criteria

- `app.json` points to the generated assets.
- Android adaptive icon uses the Flow Blocks dark background.
- Splash screen uses the logo from `assets/splash-logo.png`.
- App theme remains dark.
