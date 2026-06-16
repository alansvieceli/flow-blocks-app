# Task 007-01 - Theme Constants

## Plan Reference

`docs/plans/007-ui-layout-plan.md`

## Status

Pending

## Description

Create a shared theme module that centralizes all design tokens used across the app.

**Files to create:**

- `src/theme/colors.ts` — all color constants:
  - `background: '#0f0f1a'`
  - `cardFrom: '#1a1a2e'`, `cardTo: '#16213e'` (gradient stops)
  - `cardBorder: '#2a2a4a'`
  - `accentFrom: '#7c3aed'`, `accentTo: '#3b82f6'`
  - `destructiveFrom: '#dc2626'`, `destructiveTo: '#f97316'`
  - `alert: '#f97316'`
  - `success: '#16a34a'`
  - `textPrimary: '#ffffff'`
  - `textSecondary: '#5a5a8a'`
  - `textDisabled: '#2a2a4a'`
  - `chipActiveText: '#ffffff'`
  - `chipInactiveBackground: '#12122a'`
  - `chipInactiveText: '#3a3a6a'`
  - `tabActive: '#7c3aed'`
  - `tabInactive: '#2a2a4a'`
  - `tabBarBackground: '#0f0f1a'`
  - `tabBarBorder: '#1a1a2e'`

- `src/theme/typography.ts` — typography constants:
  - `screenTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 }`
  - `sectionLabel: { fontSize: 9, textTransform: 'uppercase', letterSpacing: 1 }`
  - `body: { fontSize: 12 }`
  - `metricLarge: { fontSize: 44, fontWeight: '800' }`
  - `metricMedium: { fontSize: 16, fontWeight: '800' }`

- `src/theme/index.ts` — re-exports `colors` and `typography`.

No React components, no styles directly — only typed constant objects.

## Acceptance Criteria

- `src/theme/colors.ts`, `src/theme/typography.ts`, and `src/theme/index.ts` exist and export all tokens.
- All tokens are used consistently across subsequent tasks (007-02 through 007-07) instead of inline hex strings.
- `npm run typecheck` passes.
