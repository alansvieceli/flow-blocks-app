# Task 003-05 - History Screen

## Plan Reference

`docs/plans/003-time-tracker-plan.md`

## Status

Done

## Description

Build the History screen, replacing the placeholder from task 003-01.

**Features:**

- List of all past sessions, most recent first.
- Each row shows: date, start time, end time, duration (formatted as `Xh Ym` or `Ym Xs`), category label, team name (or "Equipe removida" when `teamId` no longer resolves), and note (hidden when null).
- Empty state message when no sessions exist yet.
- Read-only — no editing or deleting of records.

## Acceptance Criteria

- Sessions are listed most-recent-first.
- Unresolvable `teamId` shows "Equipe removida".
- Duration is human-readable.
- Empty state is shown when no sessions exist.
- `npm run typecheck` and `npm run lint` pass.

## Result

`app/(tabs)/history.tsx` implementado com FlatList ordenada mais recente primeiro, mostrando data, horário, duração, categoria, equipe ("Equipe removida" quando id não resolve) e nota. `src/lib/formatDuration.ts` criado com testes.
