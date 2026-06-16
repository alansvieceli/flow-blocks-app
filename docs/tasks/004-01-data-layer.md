# Task 004-01 - Data Layer

## Plan Reference

`docs/plans/004-reminders-plan.md`

## Status

Pending

## Description

Add the `Reminder` type and storage helpers for the reminders feature.

**Type** (add to `src/types/index.ts`):

```ts
interface Reminder {
  id: string;
  title: string;
  description: string | null;
  datetime: string; // ISO 8601
  categoryId: 'foco_profundo' | 'reunioes' | 'revisao_codigo' | 'admin' | null;
  teamId: string | null;
  notificationId: string | null;
}
```

**Storage helper** (`src/storage/remindersStorage.ts`):

- `getReminders(): Promise<Reminder[]>` — reads from AsyncStorage key `'reminders'`, returns `[]` if absent.
- `saveReminders(reminders: Reminder[]): Promise<void>` — writes the full array.

**Unit tests** (`src/storage/__tests__/remindersStorage.test.ts`):

- `getReminders` returns `[]` when key is absent.
- `getReminders` returns parsed array when key exists.
- `saveReminders` serializes and writes correctly.
- `getReminders` after `saveReminders` returns the same data.

## Acceptance Criteria

- `Reminder` type exported from `src/types/index.ts`.
- Storage helpers exist and are unit-tested.
- `npm run check` passes with coverage ≥ 80% in `src/lib/` and `src/storage/`.
