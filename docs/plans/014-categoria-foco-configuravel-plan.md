# Categoria Foco Configurável Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the user mark any category as "Foco" via a toggle in the category form, so the Painel's category-split charts (Hoje, Esta Semana) classify custom categories (e.g. "Código") correctly instead of lumping everything non-default into "Reuniões".

**Architecture:** `Category` gains an optional `isFocus?: boolean` field. `isFocusCategory` changes from a hardcoded id comparison to a lookup against the actual categories list, falling back to the legacy id check (`foco`/`foco_profundo`) only when the category isn't found in the list (deleted category, orphaned test/legacy data). `getWeeklyMetricsByCategory` and `getDailyMetrics` gain an optional `categories` parameter (defaulting to `DEFAULT_CATEGORIES`, matching `isFocusCategory`'s own default) and forward it to `isFocusCategory`. The two screens that call these functions (`dashboard.tsx`, `index.tsx`) and the dev mock-data seeder (`devSeed.ts`) start passing the real categories list. The category form screen (`app/categories.tsx`) gets a `Switch` to set `isFocus`, and the list view shows a "Foco" icon for any category with `isFocus: true` (not just the locked default).

**Tech Stack:** React Native, Expo, TypeScript, Jest.

---

## File Map

| Action | Path                                | Responsibility                                                         |
| ------ | ----------------------------------- | ---------------------------------------------------------------------- |
| Modify | `src/types/index.ts`                | Add `isFocus?: boolean` to `Category`                                  |
| Modify | `src/lib/categories.ts`             | `LOCKED_CATEGORY.isFocus = true`, `isFocusCategory` looks up the list  |
| Modify | `src/lib/categories.test.ts`        | Cover list-based lookup + legacy fallback                              |
| Modify | `src/lib/metrics.ts`                | `getWeeklyMetricsByCategory`/`getDailyMetrics` accept `categories`     |
| Modify | `src/lib/__tests__/metrics.test.ts` | Cover custom-category classification via the new param                 |
| Modify | `src/lib/devSeed.ts`                | Pass `categories` into `isFocusCategory` calls                         |
| Modify | `src/lib/__tests__/devSeed.test.ts` | Update fixtures to set `isFocus: true` on the mock "foco" category     |
| Modify | `app/(tabs)/dashboard.tsx`          | Pass `categories` to `getWeeklyMetricsByCategory`/`getDailyMetrics`    |
| Modify | `app/(tabs)/index.tsx`              | Pass `categories` to `getDailyMetrics`                                 |
| Modify | `app/categories.tsx`                | Add "Conta como Foco" `Switch` to the form; update list icon condition |

---

### Task 1: `Category.isFocus` + `isFocusCategory` list lookup

**Files:**

- Modify: `src/types/index.ts:3-7`
- Modify: `src/lib/categories.ts`
- Modify: `src/lib/categories.test.ts`

- [ ] **Step 1: Add the field to `Category`**

In `src/types/index.ts`, replace:

```typescript
export interface Category {
  id: CategoryId;
  label: string;
  order: number;
}
```

With:

```typescript
export interface Category {
  id: CategoryId;
  label: string;
  order: number;
  isFocus?: boolean;
}
```

- [ ] **Step 2: Write the failing tests for the new `isFocusCategory` behavior**

Replace the `describe('DEFAULT_CATEGORIES', ...)` and `describe('isFocusCategory', ...)` blocks in `src/lib/categories.test.ts` with:

```typescript
describe('DEFAULT_CATEGORIES', () => {
  it('has the installation defaults with Foco first and marked as focus', () => {
    expect(DEFAULT_CATEGORIES).toEqual([
      { id: 'foco', label: 'Foco', order: 1, isFocus: true },
      { id: 'reuniao', label: 'Reunião', order: 2 },
    ]);
  });

  it('all entries have id and label', () => {
    DEFAULT_CATEGORIES.forEach((c) => {
      expect(c.id).toBeTruthy();
      expect(c.label).toBeTruthy();
    });
  });
});
```

```typescript
describe('isFocusCategory', () => {
  it('recognizes current and legacy focus category ids via the default list', () => {
    expect(isFocusCategory('foco')).toBe(true);
    expect(isFocusCategory('foco_profundo')).toBe(true);
    expect(isFocusCategory('reuniao')).toBe(false);
  });

  it('returns true for a custom category explicitly marked isFocus', () => {
    const categories = [{ id: 'codigo', label: 'Código', order: 2, isFocus: true }];
    expect(isFocusCategory('codigo', categories)).toBe(true);
  });

  it('returns false for a custom category not marked isFocus', () => {
    const categories = [{ id: 'codigo', label: 'Código', order: 2 }];
    expect(isFocusCategory('codigo', categories)).toBe(false);
  });

  it('falls back to legacy ids when the category is not in the list', () => {
    const categories = [{ id: 'reuniao', label: 'Reunião', order: 2 }];
    expect(isFocusCategory('foco_profundo', categories)).toBe(true);
    expect(isFocusCategory('admin', categories)).toBe(false);
  });
});
```

(Run `npx jest src/lib/categories.test.ts --no-coverage` now if you want to see it fail — `LOCKED_CATEGORY` doesn't have `isFocus: true` yet and `isFocusCategory` doesn't accept a second argument yet.)

- [ ] **Step 3: Update `src/lib/categories.ts`**

Replace the full file with:

```typescript
import { Category, CategoryId } from '../types';

export const LOCKED_CATEGORY: Category = {
  id: 'foco',
  label: 'Foco',
  order: 1,
  isFocus: true,
};

export const DEFAULT_CATEGORIES: Category[] = [
  LOCKED_CATEGORY,
  { id: 'reuniao', label: 'Reunião', order: 2 },
];

export function isLockedCategory(id: CategoryId): boolean {
  return id === LOCKED_CATEGORY.id;
}

const LEGACY_CATEGORY_LABELS: Record<string, string> = {
  admin: 'Admin',
  foco_profundo: 'Foco profundo',
  reunioes: 'Reuniões',
  revisao_codigo: 'Revisão de código',
};

export function getCategoryLabel(
  id: CategoryId,
  categories: Category[] = DEFAULT_CATEGORIES,
): string {
  return categories.find((c) => c.id === id)?.label ?? LEGACY_CATEGORY_LABELS[id] ?? id;
}

export function isFocusCategory(
  id: CategoryId,
  categories: Category[] = DEFAULT_CATEGORIES,
): boolean {
  const found = categories.find((c) => c.id === id);
  if (found) return found.isFocus === true;
  return id === 'foco' || id === 'foco_profundo';
}
```

- [ ] **Step 4: Run the tests**

```bash
npx jest src/lib/categories.test.ts --no-coverage
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/types/index.ts src/lib/categories.ts src/lib/categories.test.ts
git commit -m "feat: make isFocusCategory look up the categories list"
```

---

### Task 2: `metrics.ts` accepts `categories`

**Files:**

- Modify: `src/lib/metrics.ts:1` (import), `src/lib/metrics.ts:58-78` (`getWeeklyMetricsByCategory`), `src/lib/metrics.ts:204-241` (`getDailyMetrics`)
- Modify: `src/lib/__tests__/metrics.test.ts`

- [ ] **Step 1: Write the failing tests**

Add these two tests inside the existing `describe('getWeeklyMetricsByCategory', ...)` block in `src/lib/__tests__/metrics.test.ts` (after the existing tests, before the closing `});`):

```typescript
it('classifies a custom category as deep work when the categories list marks it isFocus', () => {
  const customFocus = makeSession({
    startedAt: '2026-06-15T09:00:00.000Z',
    durationSeconds: 1800, // 30 min
    categoryId: 'codigo',
  });
  const categories = [{ id: 'codigo', label: 'Código', order: 2, isFocus: true }];
  const result = getWeeklyMetricsByCategory([customFocus], TODAY, categories);
  expect(result.deepWorkMinutes).toBe(30);
  expect(result.interruptionMinutes).toBe(0);
});

it('classifies a custom category as interruption when not marked isFocus', () => {
  const customOther = makeSession({
    startedAt: '2026-06-15T09:00:00.000Z',
    durationSeconds: 1800, // 30 min
    categoryId: 'codigo',
  });
  const categories = [{ id: 'codigo', label: 'Código', order: 2 }];
  const result = getWeeklyMetricsByCategory([customOther], TODAY, categories);
  expect(result.deepWorkMinutes).toBe(0);
  expect(result.interruptionMinutes).toBe(30);
});
```

Add this test inside the existing `describe('getDailyMetrics', ...)` block (after the existing tests, before the closing `});`):

```typescript
it('classifies a custom category using the categories param', () => {
  const customFocus = makeSession({
    startedAt: '2026-06-16T09:00:00.000Z',
    durationSeconds: 1800, // 30 min
    categoryId: 'codigo',
  });
  const categories = [{ id: 'codigo', label: 'Código', order: 2, isFocus: true }];
  const result = getDailyMetrics([customFocus], [], TODAY, categories);
  expect(result.deepWorkMinutes).toBe(30);
  expect(result.interruptionMinutes).toBe(0);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx jest src/lib/__tests__/metrics.test.ts --no-coverage
```

Expected: FAIL — `getWeeklyMetricsByCategory`/`getDailyMetrics` don't accept a 3rd/4th argument yet (TypeScript will also complain since the test file is checked by `tsc`).

- [ ] **Step 3: Update `src/lib/metrics.ts`**

Change the import at the top of the file from:

```typescript
import { Session, Team } from '../types';
```

To:

```typescript
import { Category, Session, Team } from '../types';
```

Replace `getWeeklyMetricsByCategory`:

```typescript
export function getWeeklyMetricsByCategory(
  sessions: Session[],
  today: Date,
  categories?: Category[],
): CategoryMetrics {
  const weekly = sessions.filter((s) => isCurrentWeek(s, today));
  let deepWorkMinutes = 0;
  let interruptionMinutes = 0;
  for (const s of weekly) {
    const m = sessionMinutes(s);
    if (isFocusCategory(s.categoryId, categories)) {
      deepWorkMinutes += m;
    } else {
      interruptionMinutes += m;
    }
  }
  return {
    deepWorkMinutes,
    interruptionMinutes,
    totalMinutes: deepWorkMinutes + interruptionMinutes,
  };
}
```

Replace `getDailyMetrics`:

```typescript
export function getDailyMetrics(
  sessions: Session[],
  teams: Team[],
  today: Date,
  categories?: Category[],
): DailyMetrics {
  const todayStr = toLocalDateString(today);
  const todaySessions = sessions.filter(
    (s) => toLocalDateString(new Date(s.startedAt)) === todayStr,
  );

  let deepWorkMinutes = 0;
  let interruptionMinutes = 0;
  const minutesById = new Map<string, number>();
  for (const s of todaySessions) {
    const m = sessionMinutes(s);
    if (isFocusCategory(s.categoryId, categories)) {
      deepWorkMinutes += m;
    } else {
      interruptionMinutes += m;
    }
    if (s.teamId) {
      minutesById.set(s.teamId, (minutesById.get(s.teamId) ?? 0) + m);
    }
  }

  const topTeams = teams
    .filter((t) => minutesById.has(t.id))
    .map((t) => ({ teamName: t.name, minutes: minutesById.get(t.id) ?? 0 }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 2);

  return {
    totalMinutes: deepWorkMinutes + interruptionMinutes,
    deepWorkMinutes,
    interruptionMinutes,
    topTeams,
  };
}
```

Note: `categories` is optional and forwarded as-is to `isFocusCategory`, which defaults to `DEFAULT_CATEGORIES` when its second argument is `undefined`. This means every existing call site that doesn't pass `categories` keeps working exactly as before (legacy id-based classification) — only call sites that explicitly pass a real categories list get the new per-category behavior. Task 3 updates the real call sites to do that.

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx jest src/lib/__tests__/metrics.test.ts --no-coverage
```

Expected: all tests pass (the pre-existing 31 plus the 3 new ones = 34).

- [ ] **Step 5: Verify TypeScript passes**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/metrics.ts "src/lib/__tests__/metrics.test.ts"
git commit -m "feat: let getWeeklyMetricsByCategory and getDailyMetrics use the real categories list"
```

---

### Task 3: Wire `categories` through the real call sites

**Files:**

- Modify: `app/(tabs)/dashboard.tsx:477,480`
- Modify: `app/(tabs)/index.tsx:351`
- Modify: `src/lib/devSeed.ts:27-28`
- Modify: `src/lib/__tests__/devSeed.test.ts`

- [ ] **Step 1: Update `app/(tabs)/dashboard.tsx`**

`categories` is already destructured from `useAppData()` at the top of `DashboardScreen` (used by `HeatmapSection`). Change:

```typescript
const categoryMetrics = getWeeklyMetricsByCategory(sessions, today);
```

To:

```typescript
const categoryMetrics = getWeeklyMetricsByCategory(sessions, today, categories);
```

And change:

```typescript
const dailyMetrics = getDailyMetrics(sessions, teams, today);
```

To:

```typescript
const dailyMetrics = getDailyMetrics(sessions, teams, today, categories);
```

- [ ] **Step 2: Update `app/(tabs)/index.tsx`**

`categories` is already destructured from `useAppData()` at the top of `HomeScreen`. Change:

```typescript
const daily = getDailyMetrics(sessions, teams, new Date());
```

To:

```typescript
const daily = getDailyMetrics(sessions, teams, new Date(), categories);
```

- [ ] **Step 3: Update `src/lib/devSeed.ts`**

Change:

```typescript
const focusCategories = categories.filter((c) => isFocusCategory(c.id));
const otherCategories = categories.filter((c) => !isFocusCategory(c.id));
```

To:

```typescript
const focusCategories = categories.filter((c) => isFocusCategory(c.id, categories));
const otherCategories = categories.filter((c) => !isFocusCategory(c.id, categories));
```

This matters because `generateMockSessions` receives whatever categories list the caller passes in — without this fix it would silently classify against the global `DEFAULT_CATEGORIES` instead of the actual list passed in, which breaks once custom categories with `isFocus` exist.

- [ ] **Step 4: Update `src/lib/__tests__/devSeed.test.ts` fixtures**

The `CATEGORIES` fixture's `'foco'` entry needs `isFocus: true` now that `isFocusCategory` looks it up in the passed list instead of comparing the id directly. Change:

```typescript
const CATEGORIES: Category[] = [
  { id: 'foco', label: 'Foco', order: 1 },
  { id: 'reuniao', label: 'Reunião', order: 2 },
];
```

To:

```typescript
const CATEGORIES: Category[] = [
  { id: 'foco', label: 'Foco', order: 1, isFocus: true },
  { id: 'reuniao', label: 'Reunião', order: 2 },
];
```

And in the `'falls back to focus categories when no non-focus category exists'` test, change:

```typescript
const onlyFocus: Category[] = [{ id: 'foco', label: 'Foco', order: 1 }];
```

To:

```typescript
const onlyFocus: Category[] = [{ id: 'foco', label: 'Foco', order: 1, isFocus: true }];
```

- [ ] **Step 5: Run the full test suite and typecheck**

```bash
npx jest src/lib/__tests__/devSeed.test.ts --no-coverage
npx tsc --noEmit
```

Expected: all `devSeed.test.ts` tests pass, no TypeScript errors anywhere in the project.

- [ ] **Step 6: Commit**

```bash
git add "app/(tabs)/dashboard.tsx" "app/(tabs)/index.tsx" src/lib/devSeed.ts "src/lib/__tests__/devSeed.test.ts"
git commit -m "feat: pass real categories list into focus classification call sites"
```

---

### Task 4: "Conta como Foco" toggle in `app/categories.tsx`

**Files:**

- Modify: `app/categories.tsx`

- [ ] **Step 1: Import `Switch`**

Change the `react-native` import block from:

```tsx
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
```

To:

```tsx
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
```

- [ ] **Step 2: Add `inputIsFocus` state**

Change:

```tsx
const [inputName, setInputName] = useState('');
const [inputOrder, setInputOrder] = useState('');
const [inputError, setInputError] = useState('');
```

To:

```tsx
const [inputName, setInputName] = useState('');
const [inputOrder, setInputOrder] = useState('');
const [inputIsFocus, setInputIsFocus] = useState(false);
const [inputError, setInputError] = useState('');
```

- [ ] **Step 3: Set `inputIsFocus` in `openCreate` and `openEdit`**

Change `openCreate`:

```tsx
function openCreate() {
  setEditingId(null);
  setInputName('');
  setInputOrder(String(Math.max(0, ...categories.map((c) => c.order)) + 1));
  setInputError('');
  setModalVisible(true);
}
```

To:

```tsx
function openCreate() {
  setEditingId(null);
  setInputName('');
  setInputOrder(String(Math.max(0, ...categories.map((c) => c.order)) + 1));
  setInputIsFocus(false);
  setInputError('');
  setModalVisible(true);
}
```

Change `openEdit`:

```tsx
function openEdit(category: Category) {
  setEditingId(category.id);
  setInputName(category.label);
  setInputOrder(String(category.order));
  setInputError('');
  setModalVisible(true);
}
```

To:

```tsx
function openEdit(category: Category) {
  setEditingId(category.id);
  setInputName(category.label);
  setInputOrder(String(category.order));
  setInputIsFocus(category.isFocus ?? false);
  setInputError('');
  setModalVisible(true);
}
```

- [ ] **Step 4: Save `isFocus` in `handleSave`**

Change:

```tsx
const updated = editingId
  ? categories.map((c) => (c.id === editingId ? { ...c, label, order } : c))
  : [...categories, { id: Date.now().toString(), label, order }];
```

To:

```tsx
const updated = editingId
  ? categories.map((c) =>
      c.id === editingId ? { ...c, label, order, isFocus: inputIsFocus } : c,
    )
  : [...categories, { id: Date.now().toString(), label, order, isFocus: inputIsFocus }];
```

- [ ] **Step 5: Add the Switch row to the modal**

Change the modal body from:

```tsx
<TextInput
  style={[styles.input, inputError ? styles.inputError : undefined]}
  placeholder="Ordem"
  placeholderTextColor={colors.textSecondary}
  value={inputOrder}
  keyboardType="number-pad"
  onChangeText={(value) => {
    setInputOrder(value.replace(/\D/g, ''));
    setInputError('');
  }}
/>;
{
  inputError ? <Text style={styles.errorText}>{inputError}</Text> : null;
}
```

To:

```tsx
            <TextInput
              style={[styles.input, inputError ? styles.inputError : undefined]}
              placeholder="Ordem"
              placeholderTextColor={colors.textSecondary}
              value={inputOrder}
              keyboardType="number-pad"
              onChangeText={(value) => {
                setInputOrder(value.replace(/\D/g, ''));
                setInputError('');
              }}
            />
            <View style={styles.focusToggleRow}>
              <Text style={styles.focusToggleLabel}>Conta como Foco</Text>
              <Switch
                value={inputIsFocus}
                onValueChange={setInputIsFocus}
                trackColor={{ false: colors.cardBorder, true: colors.accentFrom }}
                thumbColor={inputIsFocus ? colors.textPrimary : colors.textSecondary}
              />
            </View>
            {inputError ? <Text style={styles.errorText}>{inputError}</Text> : null}
```

- [ ] **Step 6: Add the new styles**

In the `StyleSheet.create({...})` block, add (e.g. right after `inputError`):

```tsx
  focusToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  focusToggleLabel: { ...typography.rowLabel, color: colors.textPrimary },
```

- [ ] **Step 7: Update the list icon to reflect `isFocus` instead of only the locked category**

Change:

```tsx
<Ionicons
  name={isLockedCategory(item.id) ? 'flash-outline' : 'albums-outline'}
  size={18}
  color={isLockedCategory(item.id) ? colors.accentFrom : colors.textSecondary}
/>
```

To:

```tsx
<Ionicons
  name={item.isFocus ? 'flash-outline' : 'albums-outline'}
  size={18}
  color={item.isFocus ? colors.accentFrom : colors.textSecondary}
/>
```

`isLockedCategory` stays imported and used elsewhere in the file (the delete/edit icon visibility check) — don't remove the import.

- [ ] **Step 8: Verify TypeScript passes**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add app/categories.tsx
git commit -m "feat: add Conta como Foco toggle to the category form"
```

---

### Task 5: Final validation

- [ ] **Step 1: Run the full check**

```bash
npm run check
```

Expected: lint, format, typecheck, and all tests pass with no errors, coverage above the 80% global threshold.

- [ ] **Step 2: If lint/format errors appear, fix them**

```bash
npm run lint:fix
npm run format
```

Re-run `npm run check` until clean.

- [ ] **Step 3: Commit fixes if any**

```bash
git add -p
git commit -m "fix: address lint and format issues in categoria foco configurável"
```

---

## Self-Review

### Spec coverage (Spec 014)

| Requirement                                                                            | Task                                                                   |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `Category` gains `isFocus?: boolean`; `LOCKED_CATEGORY` has `isFocus: true`            | Task 1                                                                 |
| `isFocusCategory(id, categories)` looks up the list, falls back to legacy ids          | Task 1                                                                 |
| `getWeeklyMetricsByCategory`/`getDailyMetrics` accept `categories`                     | Task 2                                                                 |
| `dashboard.tsx`/`index.tsx` pass `categories` into those calls                         | Task 3                                                                 |
| `devSeed.ts` uses the passed-in categories list, not the global default                | Task 3                                                                 |
| Modal "Conta como Foco" `Switch` saves `isFocus`                                       | Task 4                                                                 |
| List icon reflects `isFocus` for any category, not just the locked one                 | Task 4                                                                 |
| Toggling a category retroactively reclassifies existing sessions (no migration needed) | Task 1, 2 (computed at read time, no stored classification to migrate) |
| `npm run check` passes                                                                 | Task 5                                                                 |

### Potential issues to watch

1. **Optional `categories` param defaults, not required** — the plan makes `categories` optional on `getWeeklyMetricsByCategory`/`getDailyMetrics` (defaulting through to `isFocusCategory`'s own `DEFAULT_CATEGORIES` default) rather than mandatory. This was a deliberate scope-reduction: it satisfies every acceptance criterion (real call sites pass real data, classification is correct) while avoiding a forced rewrite of every pre-existing test call site that doesn't care about custom categories. If a future reviewer expects a required parameter, this is the rationale to point to.
2. **`devSeed.test.ts` `'foco'` fixture must include `isFocus: true`** — easy to miss; without it, mock-data generation tests would silently start classifying the seeded "foco" sessions as non-focus once `devSeed.ts` is updated in Task 3, since the category now needs to be found-and-flagged rather than id-matched.
3. **`isLockedCategory` import in `app/categories.tsx`** — still needed for the edit/delete icon visibility logic; Task 4 only changes the _icon name/color_ condition, not the lock-based affordance logic.
