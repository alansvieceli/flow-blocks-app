# Manual Time Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated screen (`/manual-entry`) that lets the user retroactively log a time block (work session or personal activity) without having started the timer.

**Architecture:** A new route `app/manual-entry.tsx` handles all form state and save logic. A helper `src/lib/combineDateAndTime.ts` converts a local date + "HH:MM" string into a `Date`. The entry point is a always-visible button added to the Home screen below the nudge area. No new dependencies are introduced.

**Tech Stack:** React Native, Expo Router, TypeScript, `@react-native-community/datetimepicker` (already installed), existing `applyPersonalNudgeToDailyPlans` / `updateSessions` from AppDataProvider.

---

## File Map

| Action | Path                                           | Responsibility                                    |
| ------ | ---------------------------------------------- | ------------------------------------------------- |
| Create | `src/lib/combineDateAndTime.ts`                | Combine a local `Date` with an `"HH:MM"` string   |
| Create | `src/lib/__tests__/combineDateAndTime.test.ts` | Unit tests for the helper                         |
| Create | `app/manual-entry.tsx`                         | Full manual-entry screen (form + save logic)      |
| Modify | `app/(tabs)/index.tsx`                         | Add "Registrar tempo manualmente" button + styles |

---

### Task 1: `combineDateAndTime` helper

**Files:**

- Create: `src/lib/combineDateAndTime.ts`
- Create: `src/lib/__tests__/combineDateAndTime.test.ts`

- [ ] **Step 1: Create the helper**

```typescript
// src/lib/combineDateAndTime.ts
export function combineDateAndTime(date: Date, hhmm: string): Date {
  const [hh, mm] = hhmm.split(':').map(Number);
  const result = new Date(date);
  result.setHours(hh, mm, 0, 0);
  return result;
}
```

- [ ] **Step 2: Write the tests**

```typescript
// src/lib/__tests__/combineDateAndTime.test.ts
import { combineDateAndTime } from '../combineDateAndTime';

describe('combineDateAndTime', () => {
  it('sets hours and minutes from hhmm on the given date', () => {
    const base = new Date(2024, 2, 15, 0, 0, 0); // 2024-03-15
    const result = combineDateAndTime(base, '14:30');
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(2);
    expect(result.getDate()).toBe(15);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it('handles midnight correctly', () => {
    const base = new Date(2024, 2, 15, 12, 0, 0);
    const result = combineDateAndTime(base, '00:00');
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
  });

  it('does not mutate the original date', () => {
    const base = new Date(2024, 2, 15, 10, 0, 0);
    combineDateAndTime(base, '15:00');
    expect(base.getHours()).toBe(10);
  });

  it('works for yesterday date', () => {
    const yesterday = new Date(2024, 2, 14, 0, 0, 0);
    const result = combineDateAndTime(yesterday, '09:15');
    expect(result.getDate()).toBe(14);
    expect(result.getHours()).toBe(9);
    expect(result.getMinutes()).toBe(15);
  });
});
```

- [ ] **Step 3: Run the tests**

```bash
npx jest src/lib/__tests__/combineDateAndTime.test.ts --no-coverage
```

Expected: 4 tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/lib/combineDateAndTime.ts src/lib/__tests__/combineDateAndTime.test.ts
git commit -m "feat: add combineDateAndTime helper"
```

---

### Task 2: Manual entry screen — scaffold, toggles, and time picker

**Files:**

- Create: `app/manual-entry.tsx`

- [ ] **Step 1: Create the screen with type/day toggles and time picker**

```tsx
// app/manual-entry.tsx
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { OptionPicker } from '../src/components/common';
import { combineDateAndTime } from '../src/lib/combineDateAndTime';
import { toLocalDateString } from '../src/lib/localDate';
import { applyPersonalNudgeToDailyPlans } from '../src/lib/personalNudge';
import { useAppData } from '../src/state/AppDataProvider';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { Session } from '../src/types';

const DURATION_PRESETS = [
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '45m', minutes: 45 },
  { label: '1h', minutes: 60 },
];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function dateToHHMM(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function addMinutesToHHMM(hhmm: string, minutes: number): string {
  const [hh, mm] = hhmm.split(':').map(Number);
  const total = hh * 60 + mm + minutes;
  return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;
}

export default function ManualEntryScreen() {
  const router = useRouter();
  const {
    categories,
    personalActivities,
    personalDailyPlans,
    sessions,
    teams,
    updatePersonalDailyPlans,
    updateSessions,
  } = useAppData();

  const [entryType, setEntryType] = useState<'work' | 'personal'>('work');
  const [day, setDay] = useState<'today' | 'yesterday'>('today');
  const [startTime, setStartTime] = useState<string>(() => dateToHHMM(new Date()));
  const [userEditedTime, setUserEditedTime] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [activityId, setActivityId] = useState<string | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const teamRequired = teams.length > 0;

  const canSave =
    durationMinutes !== null &&
    durationMinutes > 0 &&
    startTime.length === 5 &&
    (entryType === 'work'
      ? categoryId !== null && (!teamRequired || teamId !== null)
      : activityId !== null);

  const estimatedEnd =
    durationMinutes !== null && durationMinutes > 0
      ? addMinutesToHHMM(startTime, durationMinutes)
      : '--';

  function selectedDate(): Date {
    const d = new Date();
    if (day === 'yesterday') d.setDate(d.getDate() - 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function handlePresetSelect(minutes: number) {
    setIsCustom(false);
    setCustomInput('');
    setDurationMinutes(minutes);
    if (!userEditedTime) {
      const now = new Date();
      const t = new Date(now.getTime() - minutes * 60 * 1000);
      setStartTime(dateToHHMM(t));
    }
  }

  function handleCustomSelect() {
    setDurationMinutes(null);
    setIsCustom(true);
  }

  function handleCustomChange(text: string) {
    setCustomInput(text);
    const n = parseInt(text, 10);
    setDurationMinutes(!isNaN(n) && n > 0 ? n : null);
  }

  async function handleSave() {
    if (!canSave) return;
    const date = selectedDate();
    const dateStr = toLocalDateString(date);
    const startedAt = combineDateAndTime(date, startTime).toISOString();
    const durationSeconds = durationMinutes! * 60;

    if (entryType === 'work') {
      const endedAt = new Date(
        new Date(startedAt).getTime() + durationSeconds * 1000,
      ).toISOString();
      const newSession: Session = {
        id: Date.now().toString(),
        categoryId: categoryId!,
        teamId: teamId,
        startedAt,
        endedAt,
        durationSeconds,
        note: null,
      };
      await updateSessions([...sessions, newSession]);
    } else {
      await updatePersonalDailyPlans(
        applyPersonalNudgeToDailyPlans(
          personalDailyPlans,
          { activityId: activityId!, durationSeconds },
          dateStr,
        ),
      );
    }
    router.back();
  }

  const categoryItems = categories.map((c) => ({ id: c.id, label: c.label }));
  const teamItems = teams.map((t) => ({ id: t.id, label: t.name }));
  const activityItems = personalActivities.map((a) => ({ id: a.id, label: a.name }));

  return (
    <View style={styles.container}>
      <ScreenHeader title="Registrar tempo" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Tipo */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TIPO</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, entryType === 'work' && styles.toggleBtnActive]}
              onPress={() => setEntryType('work')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  entryType === 'work' && styles.toggleBtnTextActive,
                ]}
              >
                Trabalho
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                entryType === 'personal' && styles.toggleBtnActive,
              ]}
              onPress={() => setEntryType('personal')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  entryType === 'personal' && styles.toggleBtnTextActive,
                ]}
              >
                Pessoal
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quando */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>QUANDO</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, day === 'today' && styles.toggleBtnActive]}
              onPress={() => setDay('today')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  day === 'today' && styles.toggleBtnTextActive,
                ]}
              >
                Hoje
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, day === 'yesterday' && styles.toggleBtnActive]}
              onPress={() => setDay('yesterday')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  day === 'yesterday' && styles.toggleBtnTextActive,
                ]}
              >
                Ontem
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Horário de início */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>HORÁRIO DE INÍCIO</Text>
          <TouchableOpacity
            style={styles.timePickerBtn}
            onPress={() => setShowTimePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.timePickerText}>{startTime}</Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={combineDateAndTime(new Date(), startTime)}
              mode="time"
              is24Hour
              display={Platform.OS === 'android' ? 'spinner' : 'spinner'}
              onChange={(_, date) => {
                setShowTimePicker(false);
                if (date) {
                  setStartTime(dateToHHMM(date));
                  setUserEditedTime(true);
                }
              }}
            />
          )}
        </View>

        {/* Duração */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DURAÇÃO</Text>
          <View style={styles.presetsRow}>
            {DURATION_PRESETS.map((p) => (
              <TouchableOpacity
                key={p.minutes}
                style={[
                  styles.presetBtn,
                  !isCustom && durationMinutes === p.minutes && styles.presetBtnActive,
                ]}
                onPress={() => handlePresetSelect(p.minutes)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.presetBtnText,
                    !isCustom &&
                      durationMinutes === p.minutes &&
                      styles.presetBtnTextActive,
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.presetBtn, isCustom && styles.presetBtnActive]}
              onPress={handleCustomSelect}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.presetBtnText, isCustom && styles.presetBtnTextActive]}
              >
                outro...
              </Text>
            </TouchableOpacity>
          </View>
          {isCustom && (
            <View style={styles.customRow}>
              <TextInput
                style={styles.customInput}
                placeholder="Minutos"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                value={customInput}
                onChangeText={handleCustomChange}
                maxLength={4}
              />
              <Text style={styles.customLabel}>min</Text>
            </View>
          )}
        </View>

        {/* Término estimado */}
        <View style={styles.estimatedRow}>
          <Text style={styles.estimatedLabel}>Término estimado:</Text>
          <Text style={styles.estimatedValue}>{estimatedEnd}</Text>
        </View>

        {/* Categoria / Equipe (Trabalho) */}
        {entryType === 'work' && (
          <>
            <OptionPicker
              label="Categoria"
              placeholder="Selecionar categoria"
              emptyMessage="Cadastre uma categoria em Mais > Categorias."
              items={categoryItems}
              selectedId={categoryId}
              onSelect={setCategoryId}
            />
            {teamRequired && (
              <OptionPicker
                label="Equipe"
                placeholder="Selecionar equipe"
                emptyMessage="Cadastre uma equipe em Mais > Equipes."
                items={teamItems}
                selectedId={teamId}
                onSelect={setTeamId}
              />
            )}
          </>
        )}

        {/* Atividade (Pessoal) */}
        {entryType === 'personal' && (
          <OptionPicker
            label="Atividade"
            placeholder="Selecionar atividade"
            emptyMessage="Cadastre uma atividade em Mais > Atividades."
            items={activityItems}
            selectedId={activityId}
            onSelect={setActivityId}
          />
        )}

        {/* Salvar */}
        <TouchableOpacity onPress={handleSave} disabled={!canSave} activeOpacity={0.8}>
          <View style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}>
            <Text style={styles.saveBtnText}>Salvar</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    ...typography.sectionLabel,
    color: colors.textSecondary,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: colors.cardFrom,
  },
  toggleBtnActive: {
    borderColor: colors.accentFrom,
    backgroundColor: colors.accentSubtle,
  },
  toggleBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  toggleBtnTextActive: {
    color: colors.textPrimary,
  },
  timePickerBtn: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.cardFrom,
    alignSelf: 'flex-start',
    minWidth: 100,
    alignItems: 'center',
  },
  timePickerText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  presetBtn: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.cardFrom,
  },
  presetBtnActive: {
    borderColor: colors.accentFrom,
    backgroundColor: colors.accentSubtle,
  },
  presetBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  presetBtnTextActive: {
    color: colors.textPrimary,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  customInput: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.inputBackground,
    width: 100,
  },
  customLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  estimatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  estimatedLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  estimatedValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  saveBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.accentFrom,
    marginTop: 8,
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
});
```

> **Note:** `TextInput` needs to be imported from `react-native`. The import list at the top already includes it implicitly — make sure to add it: `import { ..., TextInput } from 'react-native';`

- [ ] **Step 2: Verify TypeScript passes**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/manual-entry.tsx src/lib/combineDateAndTime.ts src/lib/__tests__/combineDateAndTime.test.ts
git commit -m "feat: add manual time entry screen"
```

---

### Task 3: Entry point button in Home screen

**Files:**

- Modify: `app/(tabs)/index.tsx`

- [ ] **Step 1: Add the button below the nudge section**

In `app/(tabs)/index.tsx`, find the nudge section block (around line 489 — the `TouchableOpacity` that navigates to `/nudge-form`, or the `nudgeCard` View). Add the manual entry button immediately after the closing `)}` of that ternary, before the "Esta noite" section:

```tsx
{
  /* Manual time entry shortcut */
}
<TouchableOpacity onPress={() => router.push('/manual-entry')} activeOpacity={0.7}>
  <View style={styles.manualEntryBtn}>
    <Text style={styles.manualEntryText}>✏️ Registrar tempo manualmente</Text>
  </View>
</TouchableOpacity>;
```

- [ ] **Step 2: Add the styles**

In the `StyleSheet.create({...})` block at the bottom of `app/(tabs)/index.tsx`, add:

```tsx
  manualEntryBtn: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.textDisabled,
    backgroundColor: colors.cardFrom,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualEntryText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
```

- [ ] **Step 3: Verify TypeScript passes**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/(tabs)/index.tsx
git commit -m "feat: add manual time entry shortcut to Home screen"
```

---

### Task 4: Final validation

- [ ] **Step 1: Run full check**

```bash
npm run check
```

Expected: lint, format, typecheck, and all tests pass with no errors.

- [ ] **Step 2: If lint errors, fix them**

Run `npm run lint:fix` and re-check. Common issues:

- Missing import (e.g. `TextInput` not imported in `manual-entry.tsx`)
- Unused variables

- [ ] **Step 3: Commit fixes if any**

```bash
git add -p
git commit -m "fix: address lint and type issues in manual entry screen"
```

---

## Self-Review

### Spec coverage

| Requirement                                                    | Task   |
| -------------------------------------------------------------- | ------ |
| Botão "✏️ Registrar tempo manualmente" abaixo da área de nudge | Task 3 |
| Navega para `/manual-entry`                                    | Task 3 |
| Toggle Tipo Trabalho/Pessoal                                   | Task 2 |
| Toggle Quando Hoje/Ontem                                       | Task 2 |
| Time picker nativo                                             | Task 2 |
| Presets 15m/30m/45m/1h + "outro..."                            | Task 2 |
| Campo livre para custom duration                               | Task 2 |
| Exibir término estimado em tempo real                          | Task 2 |
| Campos categoria/equipe visíveis só no modo Trabalho           | Task 2 |
| Campo atividade visível só no modo Pessoal                     | Task 2 |
| Equipe obrigatória se `teams.length > 0`                       | Task 2 |
| Botão Salvar desabilitado até validação                        | Task 2 |
| Salvar Trabalho → cria `Session` via `updateSessions`          | Task 2 |
| Salvar Pessoal → `applyPersonalNudgeToDailyPlans`              | Task 2 |
| Após salvar → volta para Início                                | Task 2 |
| `combineDateAndTime` helper com testes                         | Task 1 |
| `npm run check` passa                                          | Task 4 |

### Potential issues to watch

1. **`TextInput` import** — Task 2 adds a `TextInput` to the custom-duration row. The import list must include it; the note in the task flags this.
2. **`router.push('/manual-entry')` type** — Expo Router v3+ requires typed routes. If the project uses strict typed routes, the string `'/manual-entry'` may need to be cast `as any` or the route typed. Run `npx tsc --noEmit` to verify.
3. **DateTimePicker on Android** — On Android, `onChange` fires twice (once with `undefined`, once with the selected date). The guard `if (date)` in the handler handles this correctly.
4. **`combineDateAndTime` used in both the time picker value and save logic** — consistent: both use the helper. The `addMinutesToHHMM` utility is purely string-based and avoids Date timezone issues for the display-only "Término estimado" field.
