# Task 006-07 - Mais Menu Update (Pessoal Section)

## Plan Reference

`docs/plans/006-personal-time-planner-plan.md`

## Status

Pending

## Description

Add a "Pessoal" section to the Mais menu screen (`app/(tabs)/mais.tsx`).

**New section: Pessoal**

| Item             | Navigates to               |
| ---------------- | -------------------------- |
| Atividades       | `app/atividades.tsx`       |
| Template semanal | `app/template-semanal.tsx` |

Add this section between "Trabalho" and "App" in the existing Mais menu layout. Use the same row and section header styles defined in task 007-04.

No changes to the "Trabalho" or "App" sections.

## Acceptance Criteria

- Mais menu shows "Pessoal" section with Atividades and Template semanal.
- Both rows navigate to the correct screens.
- Existing sections (Trabalho, App) are unchanged.
- `npm run typecheck` and `npm run lint` pass.
