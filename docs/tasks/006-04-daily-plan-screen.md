# Task 006-04 - Daily Plan Screen

## Plan Reference

`docs/plans/006-personal-time-planner-plan.md`

## Status

Pending

## Description

Build the daily plan screen (`app/plano-dia.tsx`). Accepts a `date` param (ISO `YYYY-MM-DD`); defaults to today when not provided.

**On mount:**

1. Load `personalDailyPlans` from storage.
2. Find the plan for the given date.
3. If not found: generate a new plan from that weekday's template entries (each template entry becomes a `PersonalDailyPlanEntry` with `done: false` and a generated `id`). Save the new plan immediately. Show badge "Pré-preenchido do template" in the header.
4. If found: load the persisted plan (possibly edited from the template).

**Layout:**

- Screen background: `colors.background`.
- Header: "🌙 Esta noite" or the formatted date + badge if pre-filled.
- "+ Adicionar" button in header to add a one-off entry (picks activity from list + planned duration).
- List of entries: each in a card row:
  - Checkbox (pressable) on the left.
  - Activity name in `textPrimary`; "Atividade removida" in `textDisabled` for unresolvable IDs.
  - Planned duration "X min" in `textSecondary`.
  - Done state: green background + checkmark icon. Not-done state (explicitly marked): strikethrough text, reduced opacity. Pending (not yet interacted): normal style.
  - Swipe or trash icon to remove the entry from this day's plan (does not affect the template).
- Footer summary card: "X feito · X não rolou · X pendentes" in `sectionLabel` style.

**Marking done:** pressing the checkbox cycles through: pending → done → not-done → pending. Save state immediately.

## Acceptance Criteria

- First open of a date pre-fills from template; subsequent opens show persisted plan.
- Adding entries to the daily plan does not affect the weekly template.
- Checkbox cycles through done/not-done/pending and persists.
- Summary footer counts are correct.
- Empty template → empty plan (no pre-fill, no errors).
- `npm run typecheck` and `npm run lint` pass.
