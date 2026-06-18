# Task 011-05 - Home: Nudge Card, Stale Detection, Extend/End Sheet

## Plan Reference

`docs/plans/011-activity-nudge-plan.md`

## Status

Pending

## Description

Add the nudge card (amber, active state), dashed "Iniciar nudge" button (idle state), stale nudge detection on app focus, and the extend/end bottom sheet — all inside `app/(tabs)/index.tsx`.

Amber palette (add to `src/theme/colors.ts` first):

```ts
amber: '#f59e0b',
amberCard: '#1a1000',
amberBorder: '#2a1a00',
amberText: '#ffe8b0',
amberMuted: '#d6a348',
amberDim: '#5a3500',
```

---

- [ ] **Step 1: Add amber colors to `src/theme/colors.ts`**

Add inside the `colors` object (after the `emerald*` entries):

```ts
amber: '#f59e0b',
amberCard: '#1a1000',
amberBorder: '#2a1a00',
amberText: '#ffe8b0',
amberMuted: '#d6a348',
amberDim: '#5a3500',
```

- [ ] **Step 2: Add `nudge-form` route to `app/_layout.tsx`**

The Stack already auto-discovers all files under `app/`. No changes needed — `app/nudge-form.tsx` (created in task 011-06) will be picked up automatically. Skip this step.

- [ ] **Step 3: Add nudge state and helpers to `app/(tabs)/index.tsx`**

Merge these into the existing imports at the top of the file (do not duplicate already-imported symbols):

```ts
import { AppState, AppStateStatus } from 'react-native'; // add AppState, AppStateStatus to the existing RN import
import {
  cancelReminderNotification,
  scheduleNudgeNotification,
} from '../../src/lib/notifications'; // new import
import { ActiveNudge, Session } from '../../src/types'; // add ActiveNudge, Session to the existing types import
// toLocalDateString is already imported — no change needed
```

Add these state variables inside `HomeScreen` (after the existing state declarations):

```ts
const {
  activeNudge,
  setActiveNudge,
  clearActiveNudge,
  updatePersonalDailyPlans, // add to the existing useAppData() destructuring
  // ... existing destructuring unchanged
} = useAppData();

const [nudgeElapsed, setNudgeElapsed] = useState(0);
const [nudgeRemaining, setNudgeRemaining] = useState(0);
const [showNudgeSheet, setShowNudgeSheet] = useState(false);
const nudgeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
```

- [ ] **Step 4: Add nudge countdown tick**

Add this `useEffect` after the existing session timer effects:

```ts
useEffect(() => {
  if (nudgeTimerRef.current) {
    clearInterval(nudgeTimerRef.current);
    nudgeTimerRef.current = null;
  }
  if (!activeNudge) {
    setNudgeElapsed(0);
    setNudgeRemaining(0);
    return;
  }
  function tick() {
    const now = Date.now();
    const elapsed = Math.floor(
      (now - new Date(activeNudge!.startedAt).getTime()) / 1000,
    );
    const remaining = Math.max(
      0,
      Math.floor((new Date(activeNudge!.endsAt).getTime() - now) / 1000),
    );
    setNudgeElapsed(elapsed);
    setNudgeRemaining(remaining);
  }
  tick();
  nudgeTimerRef.current = setInterval(tick, 1000);
  return () => {
    if (nudgeTimerRef.current) clearInterval(nudgeTimerRef.current);
  };
}, [activeNudge]);
```

- [ ] **Step 5: Add stale nudge detection on app focus**

Add this `useEffect` after the nudge tick effect:

```ts
useEffect(() => {
  function handleAppStateChange(next: AppStateStatus) {
    if (next !== 'active') return;
    if (!activeNudge) return;
    const endsAt = new Date(activeNudge.endsAt);
    if (endsAt > new Date()) return;
    const ageHours = (Date.now() - endsAt.getTime()) / 3_600_000;
    const abandonHours = settings.nudgeAbandonHours ?? 8;
    if (ageHours >= abandonHours) {
      void (async () => {
        if (activeNudge.notificationId) {
          await cancelReminderNotification(activeNudge.notificationId);
        }
        await clearActiveNudge();
      })();
    } else {
      setShowNudgeSheet(true);
    }
  }
  const sub = AppState.addEventListener('change', handleAppStateChange);
  // Also check immediately on mount
  handleAppStateChange('active');
  return () => sub.remove();
}, [activeNudge, settings.nudgeAbandonHours, clearActiveNudge]);
```

- [ ] **Step 6: Add `endNudge` and `extendNudge` helpers inside `HomeScreen`**

```ts
async function endNudge() {
  if (!activeNudge) return;
  if (activeNudge.notificationId) {
    await cancelReminderNotification(activeNudge.notificationId);
  }
  if (activeNudge.type === 'personal' && activeNudge.activityId) {
    const todayStr = toLocalDateString(new Date());
    const actualMinutes = Math.max(
      1,
      Math.round((Date.now() - new Date(activeNudge.startedAt).getTime()) / 60_000),
    );
    const existingPlan = personalDailyPlans.find((p) => p.date === todayStr);
    if (existingPlan) {
      const existing = existingPlan.entries.find(
        (e) => e.activityId === activeNudge.activityId,
      );
      if (existing) {
        await updatePersonalDailyPlans(
          personalDailyPlans.map((p) =>
            p.date === todayStr
              ? {
                  ...p,
                  entries: p.entries.map((e) =>
                    e.id === existing.id
                      ? { ...e, done: true, status: 'done' as const }
                      : e,
                  ),
                }
              : p,
          ),
        );
      } else {
        await updatePersonalDailyPlans(
          personalDailyPlans.map((p) =>
            p.date === todayStr
              ? {
                  ...p,
                  entries: [
                    ...p.entries,
                    {
                      id: `${todayStr}-${activeNudge.activityId}-nudge`,
                      activityId: activeNudge.activityId!,
                      plannedMinutes: actualMinutes,
                      done: true,
                      status: 'done' as const,
                    },
                  ],
                }
              : p,
          ),
        );
      }
    } else {
      await updatePersonalDailyPlans([
        ...personalDailyPlans,
        {
          date: todayStr,
          entries: [
            {
              id: `${todayStr}-${activeNudge.activityId}-nudge`,
              activityId: activeNudge.activityId!,
              plannedMinutes: actualMinutes,
              done: true,
              status: 'done' as const,
            },
          ],
        },
      ]);
    }
  } else if (activeNudge.type === 'work' && activeNudge.categoryId) {
    const now = new Date();
    const newSession: Session = {
      id: Date.now().toString(),
      categoryId: activeNudge.categoryId,
      teamId: activeNudge.teamId ?? null,
      startedAt: activeNudge.startedAt,
      endedAt: now.toISOString(),
      durationSeconds: Math.floor(
        (now.getTime() - new Date(activeNudge.startedAt).getTime()) / 1000,
      ),
      note: null,
    };
    await updateSessions([...sessions, newSession]);
  }
  await clearActiveNudge();
  setShowNudgeSheet(false);
}

async function extendNudge(extraSeconds: number) {
  if (!activeNudge) return;
  if (activeNudge.notificationId) {
    await cancelReminderNotification(activeNudge.notificationId);
  }
  const newEndsAt = new Date(Date.now() + extraSeconds * 1000).toISOString();
  const updated: ActiveNudge = {
    ...activeNudge,
    endsAt: newEndsAt,
    extendCount: activeNudge.extendCount + 1,
    notificationId: null,
  };
  const newNotifId = await scheduleNudgeNotification(updated);
  await setActiveNudge({ ...updated, notificationId: newNotifId });
  setShowNudgeSheet(false);
}
```

- [ ] **Step 7: Add nudge card + dashed button to the JSX**

Inside the `<ScrollView>`, add a nudge section between the active-session/novo-bloco card and the "Esta noite" section:

```tsx
{
  /* Nudge section */
}
{
  activeNudge ? (
    <View style={styles.nudgeCard}>
      <View style={styles.nudgeTopRow}>
        <Text style={styles.nudgeBadge}>⏱ NUDGE ATIVO</Text>
        <TouchableOpacity onPress={endNudge}>
          <Text style={styles.nudgeStopBtn}>Encerrar</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.nudgeName}>{activeNudge.label}</Text>
      <View style={styles.nudgeTimesRow}>
        <View>
          <Text style={styles.nudgeRemaining}>{formatDuration(nudgeRemaining)}</Text>
          <Text style={styles.nudgeRemainingLabel}>restantes</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.nudgeElapsed}>
            {formatDuration(nudgeElapsed)} passados
          </Text>
          <Text style={styles.nudgeOf}>
            de {Math.round(activeNudge.durationSeconds / 60)} min
          </Text>
        </View>
      </View>
      <View style={styles.nudgeProgressBg}>
        <View
          style={[
            styles.nudgeProgressFill,
            {
              width: `${Math.min(
                100,
                (nudgeElapsed / activeNudge.durationSeconds) * 100,
              )}%`,
            },
          ]}
        />
      </View>
    </View>
  ) : (
    <TouchableOpacity onPress={() => router.push('/nudge-form')} activeOpacity={0.7}>
      <View style={styles.nudgeStartBtn}>
        <Text style={styles.nudgeStartText}>⏱ Iniciar nudge de atividade</Text>
      </View>
    </TouchableOpacity>
  );
}
```

Add the extend/end sheet Modal before the closing `</ScrollView>`:

```tsx
<Modal visible={showNudgeSheet} transparent animationType="slide">
  <View style={styles.sheetOverlay}>
    <View style={styles.sheet}>
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>⏱ Tempo encerrado</Text>
        <Text style={styles.sheetSubtitle}>
          {activeNudge?.label} · {Math.round((activeNudge?.durationSeconds ?? 0) / 60)}{' '}
          min
        </Text>
      </View>
      <View style={styles.sheetOptions}>
        <TouchableOpacity onPress={() => extendNudge(15 * 60)}>
          <View style={styles.sheetOptionExtend}>
            <Text style={styles.sheetOptionExtendText}>+ 15 minutos</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => extendNudge(30 * 60)}>
          <View style={styles.sheetOptionExtend}>
            <Text style={styles.sheetOptionExtendText}>+ 30 minutos</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => extendNudge(60 * 60)}>
          <View style={styles.sheetOptionExtend}>
            <Text style={styles.sheetOptionExtendText}>+ 60 minutos</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={endNudge}>
          <View style={styles.sheetOptionEnd}>
            <Text style={styles.sheetOptionEndText}>Encerrar atividade</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
```

- [ ] **Step 8: Add StyleSheet entries**

Add to the existing `StyleSheet.create({...})` in `app/(tabs)/index.tsx`:

```ts
// Nudge card
nudgeCard: {
  backgroundColor: colors.amberCard,
  borderWidth: 1,
  borderColor: colors.amberBorder,
  borderRadius: 18,
  padding: 16,
  gap: 10,
},
nudgeTopRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
nudgeBadge: {
  fontSize: 10,
  fontWeight: '600',
  color: colors.amberMuted,
  letterSpacing: 0.6,
},
nudgeStopBtn: {
  fontSize: 11,
  color: colors.amberMuted,
  borderWidth: 1,
  borderColor: colors.amberDim,
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 6,
  fontWeight: '600',
},
nudgeName: {
  fontSize: 16,
  fontWeight: '700',
  color: colors.amberText,
},
nudgeTimesRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
},
nudgeRemaining: {
  fontSize: 28,
  fontWeight: '800',
  color: colors.amberText,
},
nudgeRemainingLabel: {
  fontSize: 10,
  color: colors.amberMuted,
},
nudgeElapsed: {
  fontSize: 11,
  color: colors.amberMuted,
},
nudgeOf: {
  fontSize: 10,
  color: colors.amberMuted,
},
nudgeProgressBg: {
  height: 4,
  backgroundColor: colors.amberBorder,
  borderRadius: 2,
  overflow: 'hidden',
},
nudgeProgressFill: {
  height: '100%',
  backgroundColor: colors.amber,
  borderRadius: 2,
},
// Nudge start button (idle state)
nudgeStartBtn: {
  borderWidth: 1,
  borderStyle: 'dashed',
  borderColor: colors.amberDim,
  backgroundColor: colors.amberCard,
  borderRadius: 14,
  padding: 14,
  alignItems: 'center',
  justifyContent: 'center',
},
nudgeStartText: {
  fontSize: 13,
  fontWeight: '600',
  color: colors.amber,
},
// Extend/end sheet
sheetOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.7)',
  justifyContent: 'flex-end',
  padding: 12,
  paddingBottom: 24,
},
sheet: {
  backgroundColor: colors.cardFrom,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: colors.cardBorder,
  overflow: 'hidden',
},
sheetHeader: {
  padding: 16,
  borderBottomWidth: 1,
  borderBottomColor: colors.cardBorder,
  alignItems: 'center',
  gap: 4,
},
sheetTitle: {
  fontSize: 15,
  fontWeight: '700',
  color: colors.textPrimary,
},
sheetSubtitle: {
  fontSize: 12,
  color: colors.textSecondary,
},
sheetOptions: {
  padding: 12,
  gap: 8,
},
sheetOptionExtend: {
  backgroundColor: colors.amberCard,
  borderWidth: 1,
  borderColor: colors.amberBorder,
  borderRadius: 12,
  padding: 14,
  alignItems: 'center',
},
sheetOptionExtendText: {
  fontSize: 14,
  fontWeight: '600',
  color: colors.amberText,
},
sheetOptionEnd: {
  backgroundColor: '#1f0a0a',
  borderWidth: 1,
  borderColor: '#3a1010',
  borderRadius: 12,
  padding: 14,
  alignItems: 'center',
},
sheetOptionEndText: {
  fontSize: 14,
  fontWeight: '600',
  color: '#ff7070',
},
```

- [ ] **Step 9: Run check**

```bash
npm run check
```

Expected: no TypeScript errors.

## Acceptance Criteria

- Amber card visible on home when nudge is active with countdown updating every second.
- Dashed amber button visible when no nudge is active.
- Tapping "Encerrar" on the card triggers save logic and clears nudge.
- Opening app with stale nudge (< 8h) shows extend/end sheet.
- Opening app with stale nudge (≥ 8h) auto-discards silently.
- Extending reschedules the notification with new `endsAt`.
- `npm run check` passes.
