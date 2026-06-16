# Task 003-02 - Data Layer

## Plan Reference

`docs/plans/003-time-tracker-plan.md`

## Status

Done

## Description

Define all shared types, constants, and AsyncStorage helpers used across the spec.

**Types** (`src/types/`):

```ts
type CategoryId = 'foco_profundo' | 'reunioes' | 'revisao_codigo' | 'admin';

interface Team {
  id: string;
  name: string;
  maxWeeklyPercent: number | null;
}

interface Session {
  id: string;
  categoryId: CategoryId;
  teamId: string | null;
  startedAt: string; // ISO 8601
  endedAt: string; // ISO 8601
  durationSeconds: number;
  note: string | null;
}
```

**Constants** (`src/lib/categories.ts`): fixed category list with `id` and display label.

**Storage helpers** (`src/storage/`):

- `teamsStorage.ts`: `getTeams`, `saveTeams`
- `sessionsStorage.ts`: `getSessions`, `saveSessions`
- `activeSessionStorage.ts`: `getActiveSession`, `setActiveSession`, `clearActiveSession`

**Unit tests** for all storage helpers using mocked AsyncStorage.

## Acceptance Criteria

- All types are exported from `src/types/index.ts`.
- Storage helpers read and write correctly (verified by unit tests).
- `npm run check` passes with coverage ≥ 80% in `src/lib/`.

## Result

Tipos em `src/types/index.ts`. Constantes de categorias em `src/lib/categories.ts`. Helpers AsyncStorage em `src/storage/`. Mock manual em `__mocks__/`. Todos os testes passam com 100% de cobertura no storage.
