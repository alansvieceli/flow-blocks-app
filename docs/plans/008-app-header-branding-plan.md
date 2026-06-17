# Plan 008 - App Header & Branding

## Spec Reference

`docs/specs/008-app-header-branding.md`

## Objective

Create the Flow Blocks logo and a single unified `AppHeader` (logo + settings gear on top; greeting or tab title below), then apply it to all four tabs, removing the inconsistent ad-hoc headers. UI-only, no new dependencies.

## Assumptions

- `expo-linear-gradient` and `@expo/vector-icons` (Ionicons) are already available — used for the logo gradient and the gear icon. No `react-native-svg`.
- Existing theme tokens (`src/theme/colors.ts`, `src/theme/typography.ts`) are reused; `accentFrom`/`accentTo` drive the logo gradient.
- The date helper currently inside `AppHeader` is kept; only the name is dropped from the greeting (`Aloha :)`).
- `/configuracoes` route already exists (linked today from the Mais menu) and is the gear's target.
- `ScreenHeader` (stack/back header) is untouched.

## Tasks

| #   | File                                        | Description                                                                                           |
| --- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 1   | `docs/tasks/008-01-logo-component.md`       | Create reusable `FlowBlocksLogo` component (cascading-blocks icon + `Flow`+`Blocks` wordmark)         |
| 2   | `docs/tasks/008-02-app-header.md`           | Rewrite `AppHeader`: logo + settings gear top row; `greeting` mode (Aloha :) + date) and `title` mode |
| 3   | `docs/tasks/008-03-apply-header-to-tabs.md` | Use `AppHeader` in all four tab screens; remove old pill, bare titles, and chart icon                 |
| 4   | `docs/tasks/008-04-validate.md`             | Run `npm run check` and verify all acceptance criteria                                                |

## Sequential Order

Execute in order. Task 2 depends on the logo from task 1. Task 3 depends on the rewritten header from task 2. Task 4 validates everything.

## Validation

```bash
npm run check
```

Expected result: no lint, format, TypeScript, or test errors.

## Out of Scope

- New features or data computation.
- App icon / splash native wiring.
- Changes to `ScreenHeader`.
- New dependencies, light theme, animations, i18n.
