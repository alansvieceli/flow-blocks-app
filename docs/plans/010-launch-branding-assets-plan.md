# Plan 010 - Launch Branding Assets

## Spec Reference

`docs/specs/010-launch-branding-assets.md`

## Objective

Generate Flow Blocks launch assets from the existing logo geometry, configure Expo to use them for app icon and splash, and update documentation.

## Assumptions

- The user wants a splash similar to `cycle12-finance-app`: a centered logo configured through `expo-splash-screen`.
- The "desbloquear" part of the reference is out of scope, so no authentication or unlock plugin is added.
- The installed app icon should favor the icon mark without the wordmark for Android launcher legibility.
- Generated PNGs can be produced locally from the existing logo geometry and theme colors.

## Tasks

| #   | File                                           | Description                                               |
| --- | ---------------------------------------------- | --------------------------------------------------------- |
| 1   | `docs/tasks/010-01-generate-launch-assets.md`  | Generate Flow Blocks icon, adaptive icon, favicon, splash |
| 2   | `docs/tasks/010-02-configure-launch-assets.md` | Configure `app.json` to use the generated launch assets   |
| 3   | `docs/tasks/010-03-docs-and-validation.md`     | Update docs and run validation                            |

## Sequential Order

Execute tasks in order. Task 2 depends on generated asset paths from task 1. Task 3 validates and documents the finished behavior.

## Validation

```bash
npm run check
```

Expected result: no lint, format, TypeScript, or test errors.

## Out of Scope

- Authentication, unlock flows, or local authentication permissions.
- New dependencies.
- Product behavior or navigation changes.
