# Task 013-01 - Typography Standardization

## Status

Done

## Objective

Standardize app text styles to the approved five-level typography scale from `docs/superpowers/specs/2026-06-18-typography-standardization-prompt.md`.

## Scope

- Add `typography.rowLabel`.
- Replace scattered text `fontSize` values in `app/` and `src/components/` with the approved scale.
- Preserve heatmap labels/cells, icon sizes, hero metrics, timer values, and other explicitly documented special cases.

## Validation

```bash
npm run check
```

Result: passed on 2026-06-18.
