# Task 005-03 - Dashboard Heatmap Section

## Plan Reference

`docs/plans/005-time-visibility-dashboard-plan.md`

## Status

Pending

## Description

Add the heatmap section to the Dashboard screen (`app/(tabs)/painel.tsx`).

**Heatmap grid:**

- 7 rows (Mon–Sun) × 24 columns (hours 0–23).
- Each cell is a small square (~12×12px) with a background color scaled from `colors.background` (0 minutes) to `colors.accentFrom` (max minutes in any cell). Cells with 0 minutes show `colors.cardBorder`.
- Row labels on the left: abbreviated day names (Seg, Ter, Qua, Qui, Sex, Sáb, Dom) in `sectionLabel` typography.
- Column labels at the top or bottom: hours 0, 6, 12, 18 only (skip intermediate to avoid crowding).
- Grid is scrollable horizontally if needed on small screens.

**Filter chips above the grid:**

- "Todas as equipes" chip + one chip per team (from `teamsStorage`).
- "Todas as categorias" chip + one chip per category (from `CATEGORIES`).
- Selecting a team or category filters the heatmap by calling `getHeatmapData` with the selected filter.
- Multiple filters (one team AND one category) are applied together.
- Active chip: primary gradient. Inactive chip: `chipInactiveBackground`.

**Data:** computed with `getHeatmapData` from `src/lib/metrics.ts`. Recalculates when filter selection changes.

## Acceptance Criteria

- Heatmap renders 7×24 cells with intensity reflecting accumulated focus minutes.
- Cells with 0 minutes render distinctly (border color, no fill).
- Team and category filter chips update the heatmap.
- "All" (no filter) shows total unfiltered data.
- Empty data case renders without errors (all cells at minimum intensity).
- `npm run typecheck` and `npm run lint` pass.
