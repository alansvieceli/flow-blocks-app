# Spec 010 - Launch Branding Assets

## Objective

Use the Flow Blocks logo from the header as the native launch identity: app icon, Android adaptive icon, favicon, and splash screen logo. This is a visual/configuration change only.

## Context

Spec 008 created the reusable Flow Blocks logo for the app header and explicitly left app icon and splash wiring out of scope. The app still uses the default Expo generated assets in `assets/` and has no `expo-splash-screen` plugin configuration in `app.json`.

The reference app `cycle12-finance-app` uses a centered splash logo through `expo-splash-screen`. Flow Blocks should use the same simple pattern without adding unlock/authentication behavior.

## Branding Direction

- Reuse the same cascading-blocks geometry from `src/components/FlowBlocksLogo.tsx`.
- Use the existing theme colors:
  - splash background: `#0f0f1a`
  - launcher icon background: `#ffffff`
  - accent gradient: `#7c3aed` to `#3b82f6`
  - text primary: `#ffffff`
- Splash image uses the icon plus `FlowBlocks` wordmark, matching the header.
- Installed app icons use the icon mark without the wordmark for legibility.
- Android adaptive icon uses a white background color and a transparent foreground mark.

## Non-goals

- No authentication, unlock screen, or local-authentication plugin.
- No new dependencies.
- No changes to app navigation or product behavior.
- No redesign of the header logo component.

## Acceptance Criteria

- `assets/icon.png` is replaced with a Flow Blocks app icon.
- `assets/android-icon-foreground.png`, `assets/android-icon-background.png`, and `assets/android-icon-monochrome.png` are replaced with Flow Blocks adaptive icon assets.
- `assets/favicon.png` is replaced with a Flow Blocks favicon.
- A splash logo asset exists and is configured in `app.json` through `expo-splash-screen`.
- `app.json` points to the new launch assets and keeps the app dark-themed.
- README and `docs/app-context.md` mention the implemented launch branding.
- `npm run check` passes.

## Validation Commands

```bash
npm run check
```
