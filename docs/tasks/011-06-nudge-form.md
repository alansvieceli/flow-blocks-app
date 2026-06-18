# Task 011-06 - Nudge Form Screen

## Plan Reference

`docs/plans/011-activity-nudge-plan.md`

## Status

Pending

## Description

Create `app/nudge-form.tsx` — the modal screen for creating a new nudge. Accessed via `router.push('/nudge-form')` from the home screen dashed button.

The screen has three steps rendered on a single scroll: type selection → activity or team+category selection → duration selection → Start button.

---

- [ ] **Step 1: Create `app/nudge-form.tsx`**

```tsx
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { OptionPicker } from '../src/components/common';
import { scheduleNudgeNotification } from '../src/lib/notifications';
import { useAppData } from '../src/state/AppDataProvider';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { ActiveNudge } from '../src/types';

const DURATION_OPTIONS = [
  { label: '15 min', seconds: 15 * 60 },
  { label: '30 min', seconds: 30 * 60 },
  { label: '45 min', seconds: 45 * 60 },
  { label: '60 min', seconds: 60 * 60 },
  { label: '90 min', seconds: 90 * 60 },
  { label: '2 horas', seconds: 120 * 60 },
];

export default function NudgeFormScreen() {
  const router = useRouter();
  const { categories, personalActivities, setActiveNudge, teams } = useAppData();

  const [type, setType] = useState<'personal' | 'work' | null>(null);
  const [activityId, setActivityId] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);

  const activityItems = personalActivities.map((a) => ({
    id: a.id,
    label: a.name,
  }));
  const teamItems = teams.map((t) => ({
    id: t.id,
    label: t.name,
  }));
  const categoryItems = categories.map((c) => ({
    id: c.id,
    label: c.label,
  }));

  const canStart =
    type !== null &&
    durationSeconds !== null &&
    (type === 'personal'
      ? activityId !== null
      : teamId !== null && categoryId !== null);

  function buildLabel(): string {
    if (type === 'personal') {
      return personalActivities.find((a) => a.id === activityId)?.name ?? 'Atividade';
    }
    const teamName = teams.find((t) => t.id === teamId)?.name ?? 'Equipe';
    const catLabel = categories.find((c) => c.id === categoryId)?.label ?? '';
    return `${catLabel} · ${teamName}`;
  }

  async function handleStart() {
    if (!canStart || !type || !durationSeconds) return;
    const now = new Date();
    const nudge: ActiveNudge = {
      id: Date.now().toString(),
      label: buildLabel(),
      type,
      activityId: type === 'personal' ? (activityId ?? undefined) : undefined,
      teamId: type === 'work' ? (teamId ?? undefined) : undefined,
      categoryId: type === 'work' ? (categoryId ?? undefined) : undefined,
      startedAt: now.toISOString(),
      durationSeconds,
      endsAt: new Date(now.getTime() + durationSeconds * 1000).toISOString(),
      notificationId: null,
      extendCount: 0,
    };
    const notifId = await scheduleNudgeNotification(nudge);
    await setActiveNudge({ ...nudge, notificationId: notifId });
    router.back();
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Novo Nudge" backTo="/(tabs)/" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Type */}
        <Text style={styles.sectionLabel}>TIPO</Text>
        <View style={styles.chipRow}>
          {(['personal', 'work'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => {
                setType(t);
                setActivityId(null);
                setTeamId(null);
                setCategoryId(null);
              }}
              style={[styles.chip, type === t && styles.chipActive]}
            >
              <Text style={[styles.chipText, type === t && styles.chipActiveText]}>
                {t === 'personal' ? '🎮 Pessoal' : '💼 Trabalho'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Activity or Team + Category */}
        {type === 'personal' && (
          <>
            <Text style={styles.sectionLabel}>ATIVIDADE</Text>
            <OptionPicker
              label="Atividade"
              items={activityItems}
              selectedId={activityId}
              onSelect={setActivityId}
              placeholder="Selecionar atividade"
              emptyMessage="Cadastre atividades em Mais > Atividades."
            />
          </>
        )}
        {type === 'work' && (
          <>
            <Text style={styles.sectionLabel}>EQUIPE E CATEGORIA</Text>
            <OptionPicker
              label="Equipe"
              items={teamItems}
              selectedId={teamId}
              onSelect={setTeamId}
              placeholder="Selecionar equipe"
              emptyMessage="Cadastre equipes em Mais > Equipes."
            />
            <OptionPicker
              label="Categoria"
              items={categoryItems}
              selectedId={categoryId}
              onSelect={setCategoryId}
              placeholder="Selecionar categoria"
              emptyMessage="Cadastre categorias em Mais > Categorias."
            />
          </>
        )}

        {/* Duration */}
        {type !== null && (
          <>
            <Text style={styles.sectionLabel}>AVISAR EM</Text>
            <View style={styles.durationGrid}>
              {DURATION_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.seconds}
                  onPress={() => setDurationSeconds(opt.seconds)}
                  style={[
                    styles.durationBtn,
                    durationSeconds === opt.seconds && styles.durationBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.durationText,
                      durationSeconds === opt.seconds && styles.durationTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Start */}
        <TouchableOpacity
          onPress={handleStart}
          disabled={!canStart}
          activeOpacity={0.8}
          style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
        >
          <Text style={styles.startBtnText}>▶ Iniciar Nudge</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  sectionLabel: {
    ...typography.sectionLabel,
    color: colors.textSecondary,
    marginTop: 4,
  },
  chipRow: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.chipInactiveBackground,
  },
  chipActive: {
    backgroundColor: colors.amberCard,
    borderColor: colors.amberDim,
  },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.chipInactiveText },
  chipActiveText: { color: colors.amberText },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationBtn: {
    width: '30%',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.chipInactiveBackground,
    alignItems: 'center',
  },
  durationBtnActive: {
    backgroundColor: colors.amberCard,
    borderColor: colors.amber,
  },
  durationText: { fontSize: 13, fontWeight: '600', color: colors.chipInactiveText },
  durationTextActive: { color: colors.amberText },
  startBtn: {
    backgroundColor: colors.amber,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  startBtnDisabled: { opacity: 0.35 },
  startBtnText: { fontSize: 16, fontWeight: '800', color: '#1a1000' },
});
```

- [ ] **Step 2: Run check**

```bash
npm run check
```

Expected: no TypeScript errors.

## Acceptance Criteria

- Tapping the dashed button on the home screen opens the nudge form.
- Selecting "Pessoal" shows only the activity picker.
- Selecting "Trabalho" shows team + category pickers.
- Start button is disabled until all required fields are filled.
- Tapping Start saves `ActiveNudge`, schedules notification, navigates back to home.
- Nudge card appears on home immediately after starting.
- `npm run check` passes.
