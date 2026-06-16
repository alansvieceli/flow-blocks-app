# Task 006-05 - Home Screen "Esta noite" Card

## Plan Reference

`docs/plans/006-personal-time-planner-plan.md`

## Status

Pending

## Description

Add the "Esta noite" preview card to the Home screen (`app/(tabs)/index.tsx`), below the Novo bloco / active session card.

**Card content:**

- Card header: "🌙 Esta noite" label in `sectionLabel` typography + `colors.success` accent.
- If today's daily plan exists and has entries: list up to 3 entries (activity name + planned duration), each on one line. If more than 3, show "+ X mais" in `textSecondary`.
- If the daily plan has no entries (no template for today's weekday and no manual additions): show "Nenhuma atividade planejada para hoje." in `textSecondary`.
- Summary line at the bottom: "X feito de Y planejados" in `textSecondary`.
- Card background: dark green gradient (`#0d2b1a` → `#0a1f12`), `borderRadius: 18`, border `colors.success` at 30% opacity.

**Navigation:** tapping anywhere on the card navigates to `app/plano-dia.tsx` with today's date as the `date` param.

**Data loading:** load `personalDailyPlans` and `personalActivities` on `useFocusEffect` in the Home screen (or generate today's plan if not yet created, using the same logic as `app/plano-dia.tsx`).

## Acceptance Criteria

- "Esta noite" card appears on Home below the tracker card.
- Shows today's activities with done/total count.
- Tapping navigates to today's daily plan screen.
- Empty state shown when no entries planned.
- `npm run typecheck` and `npm run lint` pass.
