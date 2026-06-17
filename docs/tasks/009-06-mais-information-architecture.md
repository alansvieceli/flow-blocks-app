# Task 009-06 - Mais Information Architecture

## Plan Reference

`docs/plans/009-ux-navigation-refactor-plan.md`

## Status

Done

## Description

Rebuild the Mais tab as the home for secondary destinations, settings, and app libraries.

## Scope

Update `app/(tabs)/mais.tsx`.

Sections:

- **Trabalho**: Equipes, Histórico.
- **Pessoal**: Atividades, Template semanal.
- **App**: Configurações.

## Requirements

- Keep the tab named `Mais`.
- Remove disabled rows for implemented screens.
- Use common row and section components.
- Add icons and short descriptions only if they improve scanning without clutter.
- Keep navigation targets unchanged unless a route is obsolete.

## Acceptance Criteria

- Mais clearly separates work, personal, and app/settings areas.
- All rows navigate to implemented destinations.
- Styling matches other list screens.
- `npm run typecheck` passes.
