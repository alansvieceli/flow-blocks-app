import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { FabButton, OptionPicker } from '../src/components/common';
import { toLocalDateString } from '../src/lib/localDate';
import { useAppData } from '../src/state/AppDataProvider';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import {
  PersonalDailyPlan,
  PersonalDailyPlanEntry,
  PersonalDailyPlanEntryStatus,
  PersonalWeeklyTemplateDay,
} from '../src/types';

type DoneState = PersonalDailyPlanEntryStatus;

function cycleState(current: DoneState): DoneState {
  if (current === 'pending') return 'done';
  if (current === 'done') return 'not-done';
  return 'pending';
}

function getStateFromEntry(entry: PersonalDailyPlanEntry): DoneState {
  if (entry.status) return entry.status;
  return entry.done ? 'done' : 'pending';
}

function buildFromTemplate(
  template: PersonalWeeklyTemplateDay[],
  jsDay: number,
  date: string,
): PersonalDailyPlan {
  // jsDay: 0=Sun, 1=Mon, ... but template uses 1=Mon, 0=Sun (same as JS)
  const dayOfWeek = jsDay as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  const dayTemplate = template.find((d) => d.dayOfWeek === dayOfWeek);
  const entries: PersonalDailyPlanEntry[] = (dayTemplate?.entries ?? []).map((e) => ({
    id: `${date}-${e.activityId}-${Date.now()}-${Math.random()}`,
    activityId: e.activityId,
    plannedMinutes: e.plannedMinutes,
    done: false,
    status: 'pending',
    fromTemplate: true,
  }));
  return { date, entries };
}

export default function PlanoDiaScreen() {
  const { date: dateParam } = useLocalSearchParams<{ date?: string }>();
  const today = new Date();
  const dateStr = dateParam ?? toLocalDateString(today);
  const {
    personalActivities: activities,
    personalDailyPlans,
    personalWeeklyTemplate,
    updatePersonalDailyPlans,
  } = useAppData();

  const [plan, setPlan] = useState<PersonalDailyPlan>({ date: dateStr, entries: [] });
  const [preFilled, setPreFilled] = useState(false);
  const [entryStates, setEntryStates] = useState<Map<string, DoneState>>(new Map());

  // Add entry modal
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [durationStr, setDurationStr] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const jsDay = new Date(year, month - 1, day, 12).getDay();

    const existing = personalDailyPlans.find((p) => p.date === dateStr);
    const templateHasEntries = personalWeeklyTemplate.some(
      (d) => d.dayOfWeek === jsDay && d.entries.length > 0,
    );

    if (existing && (existing.entries.length > 0 || !templateHasEntries)) {
      setPlan(existing);
      const stateMap = new Map<string, DoneState>();
      for (const e of existing.entries) {
        stateMap.set(e.id, getStateFromEntry(e));
      }
      setEntryStates(stateMap);
      return;
    }

    const newPlan = buildFromTemplate(personalWeeklyTemplate, jsDay, dateStr);
    setPlan(newPlan);
    if (newPlan.entries.length > 0) setPreFilled(true);
    const stateMap = new Map<string, DoneState>();
    for (const e of newPlan.entries) stateMap.set(e.id, 'pending');
    setEntryStates(stateMap);
    if (newPlan.entries.length > 0) {
      void updatePersonalDailyPlans(
        existing
          ? personalDailyPlans.map((p) => (p.date === dateStr ? newPlan : p))
          : [...personalDailyPlans, newPlan],
      );
    }
  }, [dateStr, personalDailyPlans, personalWeeklyTemplate, updatePersonalDailyPlans]);

  async function savePlan(updatedPlan: PersonalDailyPlan) {
    const updated = personalDailyPlans.map((p) =>
      p.date === dateStr ? updatedPlan : p,
    );
    if (!updated.find((p) => p.date === dateStr)) updated.push(updatedPlan);
    await updatePersonalDailyPlans(updated);
    setPlan(updatedPlan);
  }

  async function toggleEntry(id: string) {
    const current = entryStates.get(id) ?? 'pending';
    const next = cycleState(current);
    const newStates = new Map(entryStates);
    newStates.set(id, next);
    setEntryStates(newStates);

    const updatedEntries = plan.entries.map((e) =>
      e.id === id ? { ...e, done: next === 'done', status: next } : e,
    );
    await savePlan({ ...plan, entries: updatedEntries });
  }

  async function removeEntry(id: string) {
    const updatedEntries = plan.entries.filter((e) => e.id !== id);
    const newStates = new Map(entryStates);
    newStates.delete(id);
    setEntryStates(newStates);
    await savePlan({ ...plan, entries: updatedEntries });
  }

  function openAddModal() {
    setSelectedActivityId(null);
    setDurationStr('');
    setFormError('');
    setAddModalVisible(true);
  }

  async function handleAddEntry() {
    if (!selectedActivityId) {
      setFormError('Selecione uma atividade.');
      return;
    }
    const mins = parseInt(durationStr, 10);
    if (isNaN(mins) || mins <= 0) {
      setFormError('Duração inválida.');
      return;
    }

    const existing = plan.entries.find((e) => e.activityId === selectedActivityId);
    const newStates = new Map(entryStates);
    let updatedEntries: PersonalDailyPlanEntry[];

    if (existing) {
      updatedEntries = plan.entries.map((e) =>
        e.id === existing.id ? { ...e, plannedMinutes: e.plannedMinutes + mins } : e,
      );
    } else {
      const newEntry: PersonalDailyPlanEntry = {
        id: `${dateStr}-${selectedActivityId}-${Date.now()}`,
        activityId: selectedActivityId,
        plannedMinutes: mins,
        done: false,
        status: 'pending',
      };
      updatedEntries = [...plan.entries, newEntry];
      newStates.set(newEntry.id, 'pending');
    }

    setEntryStates(newStates);
    await savePlan({ ...plan, entries: updatedEntries });
    setAddModalVisible(false);
  }

  function resolveActivity(activityId: string): string {
    return activities.find((a) => a.id === activityId)?.name ?? 'Atividade removida';
  }

  function isRemoved(activityId: string): boolean {
    return !activities.find((a) => a.id === activityId);
  }

  const doneCount = plan.entries.filter((e) => entryStates.get(e.id) === 'done').length;
  const notDoneCount = plan.entries.filter(
    (e) => entryStates.get(e.id) === 'not-done',
  ).length;
  const pendingCount = plan.entries.length - doneCount - notDoneCount;

  const isToday = dateStr === toLocalDateString(today);
  const displayDate = isToday
    ? 'Esta noite'
    : (() => {
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
      })();

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={displayDate}
        titleIcon={isToday ? 'moon-outline' : undefined}
        subtitle={preFilled ? 'Pré-preenchido do template' : undefined}
        backTo="/(tabs)/"
      />

      <ScrollView contentContainerStyle={styles.listContent}>
        {plan.entries.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma atividade planejada para hoje.</Text>
        ) : (
          plan.entries.map((entry) => {
            const state = entryStates.get(entry.id) ?? 'pending';
            const name = resolveActivity(entry.activityId);
            const removed = isRemoved(entry.activityId);
            return (
              <View
                key={entry.id}
                style={[
                  styles.entryRow,
                  styles.entryRowSpaced,
                  state === 'done' && styles.entryRowDone,
                ]}
              >
                <TouchableOpacity
                  onPress={() => toggleEntry(entry.id)}
                  style={styles.checkbox}
                >
                  {state === 'done' ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={colors.success}
                    />
                  ) : state === 'not-done' ? (
                    <Ionicons
                      name="close-circle-outline"
                      size={22}
                      color={colors.textSecondary}
                    />
                  ) : (
                    <Ionicons
                      name="ellipse-outline"
                      size={22}
                      color={colors.textSecondary}
                    />
                  )}
                </TouchableOpacity>
                <View
                  style={[
                    styles.entryContent,
                    state === 'not-done' && styles.entryContentMuted,
                  ]}
                >
                  <Text
                    style={[
                      styles.entryName,
                      removed && styles.removedText,
                      state === 'not-done' && styles.strikethrough,
                    ]}
                    numberOfLines={1}
                  >
                    {name}
                  </Text>
                  <Text style={styles.entryDuration}>{entry.plannedMinutes} min</Text>
                </View>
                {!entry.fromTemplate && (
                  <TouchableOpacity
                    onPress={() => removeEntry(entry.id)}
                    style={styles.iconBtn}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={16}
                      color={colors.destructiveFrom}
                    />
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {plan.entries.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.footerCounts}>
            <View style={styles.footerItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={14}
                color={colors.success}
              />
              <Text style={styles.footerText}>{doneCount} feito</Text>
            </View>
            <Text style={styles.footerSep}>·</Text>
            <View style={styles.footerItem}>
              <Ionicons
                name="close-circle-outline"
                size={14}
                color={colors.textSecondary}
              />
              <Text style={styles.footerText}>{notDoneCount} não rolou</Text>
            </View>
            <Text style={styles.footerSep}>·</Text>
            <View style={styles.footerItem}>
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.footerText}>{pendingCount} pendentes</Text>
            </View>
          </View>
        </View>
      )}

      <FabButton accessibilityLabel="Adicionar atividade" onPress={openAddModal} />

      {/* Add entry modal */}
      <Modal visible={addModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalTitleRow}>
              <Ionicons name="add-circle-outline" size={18} color={colors.accentFrom} />
              <Text style={styles.modalTitle}>Adicionar atividade</Text>
            </View>

            <OptionPicker
              label="Atividade"
              items={activities.map((a) => ({ id: a.id, label: a.name }))}
              onSelect={(id) => {
                setSelectedActivityId(id);
                setFormError('');
              }}
              placeholder="Selecionar atividade"
              selectedId={selectedActivityId}
              emptyMessage="Nenhuma atividade disponível."
            />

            <Text style={styles.formLabel}>Duração (minutos)</Text>
            <TextInput
              style={styles.input}
              placeholder="ex: 30"
              placeholderTextColor={colors.textSecondary}
              value={durationStr}
              onChangeText={(t) => {
                setDurationStr(t);
                setFormError('');
              }}
              keyboardType="number-pad"
            />

            {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

            <View style={styles.modalBtns}>
              <TouchableOpacity
                onPress={() => setAddModalVisible(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddEntry}
                activeOpacity={0.8}
                style={styles.saveWrapper}
              >
                <View style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>Adicionar</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 16, paddingTop: 4, paddingBottom: 16 },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 16,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardFrom,
    padding: 12,
    gap: 10,
  },
  entryRowDone: {
    backgroundColor: colors.emeraldCard,
    borderColor: colors.emeraldBorder,
  },
  entryRowSpaced: { marginBottom: 8 },
  entryContent: { flex: 1 },
  entryContentMuted: { opacity: 0.4 },
  checkbox: { padding: 2 },
  entryName: { fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  removedText: { color: colors.textDisabled },
  strikethrough: { textDecorationLine: 'line-through' },
  entryDuration: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  iconBtn: { padding: 4 },
  footer: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    padding: 16,
    alignItems: 'center',
  },
  footerCounts: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { ...typography.sectionLabel, color: colors.textSecondary },
  footerSep: { ...typography.sectionLabel, color: colors.textSecondary },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  formLabel: { fontSize: 12, color: colors.textSecondary },
  input: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.inputBackground,
  },
  errorText: { fontSize: 12, color: colors.destructiveFrom },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    backgroundColor: colors.cardFrom,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
    gap: 10,
  },
  modalTitle: { ...typography.screenTitle, color: colors.textPrimary, fontSize: 16 },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cancelBtnText: { color: colors.textSecondary, fontWeight: '600' },
  saveWrapper: { flex: 1 },
  saveBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.accentFrom,
  },
  saveBtnText: { color: colors.textPrimary, fontWeight: '800', fontSize: 14 },
});
