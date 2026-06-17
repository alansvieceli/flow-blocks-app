import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { FabButton } from '../src/components/common';
import { useAppData } from '../src/state/AppDataProvider';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { PersonalWeeklyTemplateDay } from '../src/types';

const DAY_NAMES = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
];

// dayOfWeek: 0=Sun in JS, but our template uses 1=Mon..0=Sun
// We display Mon(1)..Sun(0) in order [1,2,3,4,5,6,0]
const DISPLAY_ORDER: (0 | 1 | 2 | 3 | 4 | 5 | 6)[] = [1, 2, 3, 4, 5, 6, 0];

function getDayEntries(
  template: PersonalWeeklyTemplateDay[],
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6,
) {
  return template.find((d) => d.dayOfWeek === dayOfWeek)?.entries ?? [];
}

export default function TemplateSemanalScreen() {
  const {
    personalActivities: activities,
    personalWeeklyTemplate: template,
    updatePersonalWeeklyTemplate,
  } = useAppData();
  const [editingDay, setEditingDay] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6 | null>(null);

  // mini-form state
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editBlockIdx, setEditBlockIdx] = useState<number | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [durationStr, setDurationStr] = useState('');
  const [formError, setFormError] = useState('');

  function resolveActivity(activityId: string): string {
    return activities.find((a) => a.id === activityId)?.name ?? 'Atividade removida';
  }

  async function updateTemplate(updated: PersonalWeeklyTemplateDay[]) {
    await updatePersonalWeeklyTemplate(updated);
  }

  function openAddBlock() {
    setEditBlockIdx(null);
    setSelectedActivityId(null);
    setDurationStr('');
    setFormError('');
    setAddModalVisible(true);
  }

  function openEditBlock(idx: number, activityId: string, plannedMinutes: number) {
    setEditBlockIdx(idx);
    setSelectedActivityId(activityId);
    setDurationStr(String(plannedMinutes));
    setFormError('');
    setAddModalVisible(true);
  }

  async function handleSaveBlock() {
    if (!selectedActivityId) {
      setFormError('Selecione uma atividade.');
      return;
    }
    const mins = parseInt(durationStr, 10);
    if (isNaN(mins) || mins <= 0) {
      setFormError('Duração inválida (mínimo 1 min).');
      return;
    }
    if (editingDay === null) return;

    const dayOfWeek = editingDay;
    const currentDay = template.find((d) => d.dayOfWeek === dayOfWeek);
    const currentEntries = currentDay?.entries ?? [];

    let newEntries: { activityId: string; plannedMinutes: number }[];
    if (editBlockIdx !== null) {
      newEntries = currentEntries.map((e, i) =>
        i === editBlockIdx
          ? { activityId: selectedActivityId, plannedMinutes: mins }
          : e,
      );
    } else {
      newEntries = [
        ...currentEntries,
        { activityId: selectedActivityId, plannedMinutes: mins },
      ];
    }

    const updated = template.filter((d) => d.dayOfWeek !== dayOfWeek);
    updated.push({ dayOfWeek, entries: newEntries });
    await updateTemplate(updated);
    setAddModalVisible(false);
  }

  async function handleDeleteBlock(dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6, idx: number) {
    Alert.alert('Remover bloco', 'Remover este bloco do template?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          const currentEntries = getDayEntries(template, dayOfWeek);
          const newEntries = currentEntries.filter((_, i) => i !== idx);
          const updated = template.filter((d) => d.dayOfWeek !== dayOfWeek);
          if (newEntries.length > 0) updated.push({ dayOfWeek, entries: newEntries });
          await updateTemplate(updated);
        },
      },
    ]);
  }

  if (editingDay !== null) {
    const dayEntries = getDayEntries(template, editingDay);
    const dayName = DAY_NAMES[DISPLAY_ORDER.indexOf(editingDay)];

    return (
      <View style={styles.container}>
        <ScreenHeader
          title={`Template — ${dayName}`}
          backLabel="Dias"
          onBack={() => setEditingDay(null)}
        />

        <ScrollView contentContainerStyle={styles.listContent}>
          {dayEntries.length === 0 ? (
            <Text style={styles.emptyText}>
              Nenhum bloco. Toque em + para adicionar.
            </Text>
          ) : (
            dayEntries.map((entry, idx) => {
              const name = resolveActivity(entry.activityId);
              const isRemoved = !activities.find((a) => a.id === entry.activityId);
              return (
                <View key={idx} style={[styles.row, styles.rowSpaced]}>
                  <View style={styles.rowContent}>
                    <Text
                      style={[styles.rowName, isRemoved && styles.removedText]}
                      numberOfLines={1}
                    >
                      {name}
                    </Text>
                    <Text style={styles.rowDuration}>{entry.plannedMinutes} min</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      openEditBlock(idx, entry.activityId, entry.plannedMinutes)
                    }
                    style={styles.iconBtn}
                  >
                    <Ionicons
                      name="pencil-outline"
                      size={16}
                      color={colors.accentFrom}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteBlock(editingDay, idx)}
                    style={styles.iconBtn}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={16}
                      color={colors.destructiveFrom}
                    />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </ScrollView>

        <FabButton accessibilityLabel="Adicionar bloco" onPress={openAddBlock} />

        {/* Add/Edit block modal */}
        <Modal visible={addModalVisible} transparent animationType="fade">
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>
                {editBlockIdx !== null ? 'Editar bloco' : '+ Adicionar bloco'}
              </Text>

              <Text style={styles.formLabel}>Atividade</Text>
              <ScrollView style={styles.activityPicker} nestedScrollEnabled>
                {activities.length === 0 ? (
                  <Text style={styles.emptyText}>
                    Nenhuma atividade. Crie em Atividades pessoais.
                  </Text>
                ) : (
                  activities.map((a) => (
                    <TouchableOpacity
                      key={a.id}
                      onPress={() => {
                        setSelectedActivityId(a.id);
                        setFormError('');
                      }}
                      style={[
                        styles.activityOption,
                        selectedActivityId === a.id && styles.activityOptionSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.activityOptionText,
                          selectedActivityId === a.id &&
                            styles.activityOptionTextSelected,
                        ]}
                      >
                        {a.name}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>

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
                  onPress={handleSaveBlock}
                  activeOpacity={0.8}
                  style={styles.saveWrapper}
                >
                  <View style={styles.saveBtn}>
                    <Text style={styles.saveBtnText}>Salvar</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    );
  }

  // Day list view
  return (
    <View style={styles.container}>
      <ScreenHeader title="Template semanal" backTo="/(tabs)/mais" />
      <ScrollView contentContainerStyle={styles.listContent}>
        {DISPLAY_ORDER.map((dayOfWeek, displayIdx) => {
          const entries = getDayEntries(template, dayOfWeek);
          const hasEntries = entries.length > 0;
          const preview = entries.map((e) => resolveActivity(e.activityId)).join(' · ');
          return (
            <TouchableOpacity
              key={dayOfWeek}
              onPress={() => setEditingDay(dayOfWeek)}
              activeOpacity={0.8}
            >
              <View style={[styles.row, styles.rowSpaced]}>
                <View
                  style={[
                    styles.dayDot,
                    {
                      backgroundColor: hasEntries
                        ? colors.accentFrom
                        : colors.tabInactive,
                    },
                  ]}
                />
                <View style={styles.rowContent}>
                  <Text style={styles.dayName}>{DAY_NAMES[displayIdx]}</Text>
                  {hasEntries ? (
                    <Text style={styles.dayPreview} numberOfLines={1}>
                      {preview}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.editLink}>
                  {hasEntries ? 'Editar' : 'Adicionar'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 16, paddingTop: 4, paddingBottom: 32 },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardFrom,
    padding: 14,
    gap: 10,
  },
  rowSpaced: { marginBottom: 8 },
  rowContent: { flex: 1 },
  dayDot: { width: 8, height: 8, borderRadius: 4 },
  dayName: { fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  dayPreview: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  editLink: { fontSize: 13, color: colors.accentFrom, fontWeight: '600' },
  rowName: { fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  removedText: { color: colors.textDisabled },
  rowDuration: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  iconBtn: { padding: 4 },
  formLabel: { fontSize: 12, color: colors.textSecondary },
  activityPicker: {
    maxHeight: 140,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  activityOption: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  activityOptionSelected: { backgroundColor: colors.accentFrom + '33' },
  activityOptionText: { fontSize: 13, color: colors.textSecondary },
  activityOptionTextSelected: { color: colors.textPrimary, fontWeight: '700' },
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
