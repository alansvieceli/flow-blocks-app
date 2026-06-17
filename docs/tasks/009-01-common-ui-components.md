# Task 009-01 - Common UI Components

## Plan Reference

`docs/plans/009-ux-navigation-refactor-plan.md`

## Status

Done

## Description

Create shared UI components that establish one consistent screen/action pattern across the app.

## Scope

Create or consolidate components under `src/components/common/`:

- `ScreenScaffold`
- `SectionHeader`
- `Card`
- `ListRow`
- `FabButton`
- `EmptyState`
- `LoadingState`

Reuse existing `ScreenHeader` where appropriate, or move/adapt it if that improves consistency without expanding scope.

## Requirements

- Use existing theme tokens from `src/theme/`.
- Avoid nested cards.
- Keep components typed with TypeScript.
- Do not change screen behavior yet, except as needed to verify the new components compile.
- Do not add dependencies.

## Acceptance Criteria

- Common components exist and export from a shared index file.
- Components are generic enough for Lembretes, Atividades, Equipes, Histórico, and Mais.
- `FabButton` matches the current Atividades FAB geometry and gradient.
- `npm run typecheck` passes.
