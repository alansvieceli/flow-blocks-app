# Task 005-02 - Dashboard Weekly Metrics Section

## Plan Reference

`docs/plans/005-time-visibility-dashboard-plan.md`

## Status

Pending

## Description

Replace the Painel placeholder screen with the Dashboard screen and implement the weekly metrics section.

**File:** `app/(tabs)/painel.tsx`

**Weekly metrics section (top of screen):**

- Section label: "ESTA SEMANA" in `sectionLabel` typography.
- **By category card**: two rows — "Foco Profundo" (deepWorkMinutes) and "Interrupções" (meetings + code review + admin). Each row: label + bar (filled portion proportional to share of total) + minutes formatted as "Xh Ym". Bars use primary gradient for Foco, `colors.alert` color for Interrupções.
- **By team card**: one row per team, showing team name + bar + percentage + hours. Bar uses primary gradient. Alert icon (⚠️) beside team name when the team has a `TeamBalanceAlert` entry. "Nenhuma equipe" empty state if no teams.
- Both cards use card style (gradient background, `borderRadius: 18`, border `colors.cardBorder`).

**Data loading:** read sessions from `sessionsStorage` and teams from `teamsStorage` on mount and refresh on `useFocusEffect`. Compute with `getWeeklyMetricsByCategory` and `getWeeklyMetricsByTeam` from `src/lib/metrics.ts`.

**Empty state:** when no sessions exist, bars show at 0 width and values show "0h 0m".

## Acceptance Criteria

- Dashboard screen renders weekly metrics by category and by team.
- Bar widths are proportional to share.
- Team balance alerts show ⚠️ icon for exceeding teams.
- Empty state handled (no errors).
- `npm run typecheck` and `npm run lint` pass.
