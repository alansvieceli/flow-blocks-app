# Task 008-01 - Logo Component

## Plan Reference

`docs/plans/008-app-header-branding-plan.md`

## Status

Done

## Description

Create a reusable Flow Blocks logo component. No new dependencies — compose the icon from `View`s and `expo-linear-gradient`.

**File to create:**

- `src/components/FlowBlocksLogo.tsx`

**Requirements:**

- Export `FlowBlocksLogo`.
- Props:
  - `size?: number` — icon edge size in px (default e.g. `28`).
  - `showWordmark?: boolean` — when `true` (default), render the wordmark next to the icon; when `false`, render only the icon (for future splash/app-icon reuse).
- **Icon — cascading blocks:** three rounded rectangles using a `LinearGradient` fill (`colors.accentFrom → colors.accentTo`, `start {0,0} → end {1,1}`), stacked bottom-to-top with a horizontal offset and decreasing opacity (bottom 1.0 / middle ~0.78 / top ~0.55). The composition scales relative to `size`.
- **Wordmark:** `Flow` in `colors.textPrimary` + `Blocks` in `colors.accentFrom`, in a single `Text` (two `Text` spans), `fontWeight: '700'`, sized to sit next to the icon (≈18px).
- Use theme tokens from `src/theme` — no inline hex strings.

## Acceptance Criteria

- `src/components/FlowBlocksLogo.tsx` exists and exports `FlowBlocksLogo`.
- Renders icon-only when `showWordmark={false}` and icon + wordmark by default.
- Uses `expo-linear-gradient` and theme tokens only; no new dependency added.
- `npm run typecheck` passes.
