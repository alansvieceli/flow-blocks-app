# Task 005-04 - Dashboard Streak, Context Switches, and Balance Alerts

## Plan Reference

`docs/plans/005-time-visibility-dashboard-plan.md`

## Status

Pending

## Description

Add the remaining metric cards to the Dashboard screen (`app/(tabs)/painel.tsx`).

**Streak card:**

- Section label: "SEQUÊNCIA" in `sectionLabel` typography.
- Card showing: large number (streak days) in `metricLarge` typography in `colors.accentFrom` + label "dias consecutivos".
- Sub-label: "Inclui hoje" if today has a session, "Até ontem" if today has no session yet.
- 0 days shown as "0" — no streak icon, no special styling.

**Context switches card:**

- Section label: "TROCAS DE CONTEXTO" in `sectionLabel` typography.
- Card with two rows:
  - "Hoje": count + label "trocas"
  - "Esta semana": count + label "trocas"
- Values computed with `getContextSwitches` from `src/lib/metrics.ts`.

**Team balance alert list (if any):**

- Shown only if `getTeamBalanceAlerts` returns at least one alert.
- Section label: "ALERTAS DE EQUIPE" in `sectionLabel` typography.
- Each alert row (card style, orange-tinted border `colors.alert`): "⚠️ [Team name]: X% (meta: Y%)" in `colors.alert`.
- If no alerts: section is hidden entirely.

**Data:** all three sections read the same sessions/teams already loaded on mount for the weekly section (pass as props or use shared state). No additional storage reads.

## Acceptance Criteria

- Streak shows correct consecutive day count.
- Context switch counts are correct for today and current week.
- Team balance alerts appear only for teams with `maxWeeklyPercent` set and only when exceeded.
- No alert section shown if no teams are over their target.
- `npm run typecheck` and `npm run lint` pass.
