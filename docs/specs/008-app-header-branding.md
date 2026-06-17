# Spec 008 - App Header & Branding

## Objective

Give the app a real visual identity in the header. Create a Flow Blocks logo (icon + wordmark) and a single unified header used across all four tabs, replacing the inconsistent ad-hoc headers each tab builds today. This spec is UI-only — no business logic, no new features.

## Context

Today each tab renders its own header differently:

- **Início** uses `AppHeader` (a gradient "Flow Blocks" pill + greeting + date).
- **Painel** renders a bare `Painel` title with a decorative chart icon.
- **Lembretes** renders only a bare `Lembretes` title.
- **Mais** renders only a bare `Mais` title.

The result feels unfinished and inconsistent. The user wants a header in the style of the reference app "Cycle12 Finance": a logo (icon + name) on top, with a greeting/context line below — and an actual logo, which does not exist yet.

## Branding

### Logo

A new logo built from the existing accent gradient (`accentFrom #7c3aed → accentTo #3b82f6`). No new dependencies — the icon is composed from `View`s + `expo-linear-gradient` (already in the project), not `react-native-svg`.

- **Icon — "cascading blocks":** three rounded rectangles stacked with a horizontal offset and decreasing opacity (100% / 78% / 55%), suggesting both "blocks" and "flow"/motion.
- **Wordmark:** the icon followed by `Flow` (white, `textPrimary`) + `Blocks` (purple, `accentFrom`), single weight.

The logo lives in a reusable component so it can be reused later (splash, app icon) without duplication.

### Greeting

The Início greeting drops the name and uses the friendly fixed style from the reference: `Aloha :)`, with the date below it (`ter, 16 de jun`). The date keeps the existing `dia, DD de mês` format already implemented in `AppHeader`.

## Header Behavior

A single `AppHeader` component is used by all four tabs.

- **Top row (all tabs):** logo on the left, a settings gear button on the right. The gear navigates to `/configuracoes`, giving the settings entry point a consistent home in every tab (it is also still reachable from the Mais menu).
- **Bottom row:**
  - **Início:** greeting `Aloha :)` with the date below.
  - **Painel / Lembretes / Mais:** the tab title (`Painel`, `Lembretes`, `Mais`).

Proposed API:

```tsx
// Início
<AppHeader greeting />
// Other tabs
<AppHeader title="Painel" />
```

`greeting` mode shows `Aloha :)` + date; `title` mode shows the provided title. The top row (logo + gear) is identical in both.

## Cleanup

- Rewrite `src/components/AppHeader.tsx` to the unified design; remove the old gradient brand pill.
- Remove the ad-hoc header markup from `app/(tabs)/painel.tsx` (including the decorative `stats-chart-outline` icon), `app/(tabs)/lembretes.tsx`, and `app/(tabs)/mais.tsx`; each renders `AppHeader` instead.
- `app/(tabs)/index.tsx` keeps using `AppHeader`, now in `greeting` mode.

## Non-goals

- New features or data computation.
- Changing `ScreenHeader` (the back-navigation header used by non-tab stack screens like Equipes, Histórico, etc.).
- Animations or transitions.
- App icon / splash screen assets (the logo component is built reusably, but wiring it into native icon/splash is out of scope).
- Adding `react-native-svg` or any other dependency.
- Light theme / internationalization.

## Acceptance Criteria

- A reusable `FlowBlocksLogo` component renders the cascading-blocks icon and the `Flow`+`Blocks` wordmark using existing theme tokens and no new dependencies.
- All four tabs (Início, Painel, Lembretes, Mais) render the same `AppHeader` with the logo on the left and a settings gear on the right.
- Tapping the gear navigates to `/configuracoes` from any tab.
- Início shows `Aloha :)` with the date below; Painel/Lembretes/Mais show their tab title in the bottom row.
- The old gradient "Flow Blocks" pill, the bare per-tab titles, and the decorative chart icon on Painel are removed.
- `npm run check` passes.

## Validation Commands

```bash
npm run check
```
