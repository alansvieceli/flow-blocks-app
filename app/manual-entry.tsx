import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

function formatDateLabel(date: Date): string {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const months = [
    'jan',
    'fev',
    'mar',
    'abr',
    'mai',
    'jun',
    'jul',
    'ago',
    'set',
    'out',
    'nov',
    'dez',
  ];
  return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]}`;
}

export default function ManualEntryScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const {
    appendSession,
    categories,
    personalActivities,
    personalDailyPlans,
    replaceSession,
    sessions,
    teams,
    updatePersonalDailyPlans,
  } = useAppData();

  const isEditing = !!sessionId;
  const editSession = isEditing
    ? (sessions.find((s) => s.id === sessionId) ?? null)
    : null;

  const editMinutes = editSession ? Math.round(editSession.durationSeconds / 60) : null;
  const editIsPreset =
    editMinutes !== null && DURATION_PRESETS.some((p) => p.minutes === editMinutes);

  const [entryType, setEntryType] = useState<'work' | 'personal'>('work');
  const [day, setDay] = useState<'today' | 'yesterday'>(() => {
    if (!editSession) return 'today';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const sessionDay = new Date(editSession.startedAt);
    sessionDay.setHours(0, 0, 0, 0);
    return sessionDay.getTime() === yesterday.getTime() ? 'yesterday' : 'today';
  });
  const [resolvedDate, setResolvedDate] = useState<Date>(() => {
    if (editSession) {
      const d = new Date(editSession.startedAt);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [startTime, setStartTime] = useState<string>(() =>
    editSession ? dateToHHMM(new Date(editSession.startedAt)) : dateToHHMM(new Date()),
  );
  const [userEditedTime, setUserEditedTime] = useState(isEditing);
  const [durationMinutes, setDurationMinutes] = useState<number | null>(editMinutes);
  const [isCustom, setIsCustom] = useState(!editIsPreset && editMinutes !== null);
  const [customInput, setCustomInput] = useState(
    !editIsPreset && editMinutes !== null ? String(editMinutes) : '',
  );
  const [categoryId, setCategoryId] = useState<string | null>(
    editSession?.categoryId ?? null,
  );
  const [teamId, setTeamId] = useState<string | null>(editSession?.teamId ?? null);
  const [activityId, setActivityId] = useState<string | null>(null);
  const [note, setNote] = useState(editSession?.note ?? '');
  const [showTimePicker, setShowTimePicker] = useState(false);

  const teamRequired = teams.length > 0;

  const canSave =
    durationMinutes !== null &&
    durationMinutes > 0 &&
    startTime.length === 5 &&
    (isEditing || entryType === 'work'
      ? categoryId !== null && (!teamRequired || teamId !== null)
      : activityId !== null);

  const estimatedEnd =
    durationMinutes !== null && durationMinutes > 0
      ? addMinutesToHHMM(startTime, durationMinutes)
      : '--';

  function handleDayChange(newDay: 'today' | 'yesterday') {
    setDay(newDay);
    const d = new Date();
    if (newDay === 'yesterday') d.setDate(d.getDate() - 1);
    d.setHours(0, 0, 0, 0);
    setResolvedDate(d);
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
    const dateStr = toLocalDateString(resolvedDate);
    const startedAt = combineDateAndTime(resolvedDate, startTime).toISOString();
    const durationSeconds = durationMinutes! * 60;
    const endedAt = new Date(
      new Date(startedAt).getTime() + durationSeconds * 1000,
    ).toISOString();

    try {
      if (isEditing && editSession) {
        await replaceSession({
          id: editSession.id,
          categoryId: categoryId!,
          teamId: teamId,
          startedAt,
          endedAt,
          durationSeconds,
          note: note.trim() || null,
        });
      } else if (entryType === 'work') {
        const newSession: Session = {
          id: Date.now().toString(),
          categoryId: categoryId!,
          teamId: teamId,
          startedAt,
          endedAt,
          durationSeconds,
          note: note.trim() || null,
        };
        await appendSession(newSession);
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
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o registro.');
    }
  }

  const categoryItems = categories.map((c) => ({ id: c.id, label: c.label }));
  const teamItems = teams.map((t) => ({ id: t.id, label: t.name }));
  const activityItems = personalActivities.map((a) => ({ id: a.id, label: a.name }));

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={isEditing ? 'Editar registro' : 'Registrar tempo'}
        onBack={() => router.back()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Tipo — oculto no modo edição (sempre trabalho) */}
        {!isEditing && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TIPO</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  entryType === 'work' && styles.toggleBtnActive,
                ]}
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
        )}

        {/* Quando */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>QUANDO</Text>
          {isEditing ? (
            <Text style={styles.dateLabel}>{formatDateLabel(resolvedDate)}</Text>
          ) : (
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, day === 'today' && styles.toggleBtnActive]}
                onPress={() => handleDayChange('today')}
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
                style={[
                  styles.toggleBtn,
                  day === 'yesterday' && styles.toggleBtnActive,
                ]}
                onPress={() => handleDayChange('yesterday')}
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
          )}
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
              value={combineDateAndTime(resolvedDate, startTime)}
              mode="time"
              is24Hour
              display="spinner"
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
        {(isEditing || entryType === 'work') && (
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
        {!isEditing && entryType === 'personal' && (
          <OptionPicker
            label="Atividade"
            placeholder="Selecionar atividade"
            emptyMessage="Cadastre uma atividade em Mais > Atividades."
            items={activityItems}
            selectedId={activityId}
            onSelect={setActivityId}
          />
        )}

        {/* Comentário */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>COMENTÁRIO</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Opcional"
            placeholderTextColor={colors.textSecondary}
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={300}
          />
        </View>

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
  dateLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    paddingVertical: 4,
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
  noteInput: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.inputBackground,
    minHeight: 72,
    textAlignVertical: 'top',
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
