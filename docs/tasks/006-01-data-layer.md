# Task 006-01 - Data Layer

## Plan Reference

`docs/plans/006-personal-time-planner-plan.md`

## Status

Pending

## Description

Add types and storage helpers for the personal time planner feature.

**Types** (add to `src/types/index.ts`):

```ts
interface PersonalActivity {
  id: string;
  name: string;
}

interface PersonalWeeklyTemplateDay {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sunday, 1=Monday, ..., 6=Saturday
  entries: { activityId: string; plannedMinutes: number }[];
}

interface PersonalDailyPlanEntry {
  id: string;
  activityId: string;
  plannedMinutes: number;
  done: boolean;
}

interface PersonalDailyPlan {
  date: string; // YYYY-MM-DD
  entries: PersonalDailyPlanEntry[];
}
```

**Storage helpers** (`src/storage/personalStorage.ts`):

- `getPersonalActivities(): Promise<PersonalActivity[]>`
- `savePersonalActivities(activities: PersonalActivity[]): Promise<void>`
- `getPersonalWeeklyTemplate(): Promise<PersonalWeeklyTemplateDay[]>`
- `savePersonalWeeklyTemplate(template: PersonalWeeklyTemplateDay[]): Promise<void>`
- `getPersonalDailyPlans(): Promise<PersonalDailyPlan[]>`
- `savePersonalDailyPlans(plans: PersonalDailyPlan[]): Promise<void>`

AsyncStorage keys: `'personalActivities'`, `'personalWeeklyTemplate'`, `'personalDailyPlan'`.

**Unit tests** (`src/storage/__tests__/personalStorage.test.ts`):

- Each getter returns empty array/default when key is absent.
- Each saver persists correctly and getter retrieves the same data.

## Acceptance Criteria

- All types exported from `src/types/index.ts`.
- Storage helpers exist and are unit-tested.
- `npm run check` passes with coverage ≥ 80% in `src/storage/`.
