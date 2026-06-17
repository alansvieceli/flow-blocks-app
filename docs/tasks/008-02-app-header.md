# Task 008-02 - App Header

## Plan Reference

`docs/plans/008-app-header-branding-plan.md`

## Status

Done

## Description

Rewrite `src/components/AppHeader.tsx` into the unified header used by all tabs. Depends on `FlowBlocksLogo` (task 008-01).

**File to edit:**

- `src/components/AppHeader.tsx`

**Requirements:**

- Props:
  - `greeting?: boolean` — Início mode.
  - `title?: string` — other-tab mode.
- **Top row (always):** `FlowBlocksLogo` on the left; a settings gear button on the right (`Ionicons name="settings-outline"`, `colors.textSecondary` or similar). The gear is a `TouchableOpacity` (min 44×44 hit area, `accessibilityRole="button"`, `accessibilityLabel="Configurações"`) that calls `router.push('/configuracoes')`.
- **Bottom row:**
  - When `greeting` is set: `Aloha :)` (`typography.screenTitle`, ~24px, `textPrimary`) with the date below (`textSecondary`, ~13px). Reuse the existing `formatDate()` helper.
  - When `title` is set: render `title` (`typography.screenTitle`, `textPrimary`). No date.
- Keep the safe-area top padding logic already present (`useSafeAreaInsets`).
- Remove the old gradient "Flow Blocks" brand pill and the time-based `getGreeting()`/name logic.
- Keep `backgroundColor: colors.background`, horizontal padding consistent with the current header.

## Acceptance Criteria

- `AppHeader` renders the logo + a working settings gear on the top row in both modes.
- `greeting` mode shows `Aloha :)` + date; `title` mode shows the given title with no date.
- Gear navigates to `/configuracoes`.
- Old brand pill and greeting-by-time/name code are removed.
- `npm run typecheck` passes.
