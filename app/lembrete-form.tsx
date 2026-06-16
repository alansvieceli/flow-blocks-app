import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { CATEGORIES } from '../src/lib/categories';
import {
  cancelReminderNotification,
  requestNotificationPermission,
  scheduleReminderNotification,
} from '../src/lib/notifications';
import { getReminders, saveReminders } from '../src/storage/remindersStorage';
import { getSettings } from '../src/storage/settingsStorage';
import { getTeams } from '../src/storage/teamsStorage';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { CategoryId, Reminder, Team } from '../src/types';

export default function LembreteFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 60);
    return d;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [categoryId, setCategoryId] = useState<CategoryId | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [existingReminder, setExistingReminder] = useState<Reminder | null>(null);
  const [permissionWarning, setPermissionWarning] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; datetime?: string }>({});

  useEffect(() => {
    async function init() {
      const [t, reminders] = await Promise.all([getTeams(), getReminders()]);
      setTeams(t);
      if (id) {
        const found = reminders.find((r) => r.id === id) ?? null;
        if (found) {
          setExistingReminder(found);
          setTitle(found.title);
          setDescription(found.description ?? '');
          setDate(new Date(found.datetime));
          setCategoryId(found.categoryId);
          setTeamId(found.teamId);
        }
      }
    }
    void init();
  }, [id]);

  function validate(): boolean {
    const e: typeof errors = {};
    if (!title.trim()) e.title = 'O título é obrigatório.';
    if (date.getTime() <= Date.now()) e.datetime = 'A data/hora deve ser no futuro.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    const { notificationsEnabled } = await getSettings();
    let notificationId: string | null = null;

    if (notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setPermissionWarning(true);
      } else {
        if (existingReminder?.notificationId) {
          await cancelReminderNotification(existingReminder.notificationId);
        }
        notificationId = await scheduleReminderNotification({
          id: existingReminder?.id ?? Date.now().toString(),
          title: title.trim(),
          description: description.trim() || null,
          datetime: date.toISOString(),
        });
      }
    }

    const reminders = await getReminders();
    const reminder: Reminder = {
      id: existingReminder?.id ?? Date.now().toString(),
      title: title.trim(),
      description: description.trim() || null,
      datetime: date.toISOString(),
      categoryId,
      teamId,
      notificationId,
    };

    const updated = existingReminder
      ? reminders.map((r) => (r.id === existingReminder.id ? reminder : r))
      : [...reminders, reminder];
    await saveReminders(updated);
    router.replace('/(tabs)/lembretes');
  }

  async function handleDelete() {
    if (!existingReminder) return;
    Alert.alert('Excluir lembrete', 'Deseja remover este lembrete?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          if (existingReminder.notificationId) {
            await cancelReminderNotification(existingReminder.notificationId);
          }
          const reminders = await getReminders();
          await saveReminders(reminders.filter((r) => r.id !== existingReminder.id));
          router.replace('/(tabs)/lembretes');
        },
      },
    ]);
  }

  function formatDate(d: Date): string {
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }

  function formatTime(d: Date): string {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader
        title={id ? 'Editar lembrete' : 'Novo lembrete'}
        backTo="/(tabs)/lembretes"
        rightAction={
          id ? (
            <TouchableOpacity onPress={handleDelete} style={styles.headerAction}>
              <Text style={styles.deleteText}>Excluir</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {permissionWarning && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            Notificações desabilitadas — o lembrete será salvo mas não disparará uma
            notificação.
          </Text>
        </View>
      )}

      <Text style={styles.label}>Título *</Text>
      <TextInput
        style={[styles.input, errors.title ? styles.inputError : undefined]}
        placeholder="Título do lembrete"
        placeholderTextColor={colors.textSecondary}
        value={title}
        onChangeText={setTitle}
      />
      {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        placeholder="Descrição opcional"
        placeholderTextColor={colors.textSecondary}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Data *</Text>
      <TouchableOpacity
        style={[
          styles.input,
          styles.pickerRow,
          errors.datetime ? styles.inputError : undefined,
        ]}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.pickerText}>{formatDate(date)}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(_e, d) => {
            setShowDatePicker(false);
            if (d) {
              setDate((prev) => {
                const next = new Date(d);
                next.setHours(prev.getHours(), prev.getMinutes(), 0, 0);
                return next;
              });
            }
          }}
        />
      )}

      <Text style={styles.label}>Hora *</Text>
      <TouchableOpacity
        style={[
          styles.input,
          styles.pickerRow,
          errors.datetime ? styles.inputError : undefined,
        ]}
        onPress={() => setShowTimePicker(true)}
      >
        <Text style={styles.pickerText}>{formatTime(date)}</Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={date}
          mode="time"
          is24Hour
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_e, d) => {
            setShowTimePicker(false);
            if (d) {
              setDate((prev) => {
                const next = new Date(prev);
                next.setHours(d.getHours(), d.getMinutes(), 0, 0);
                return next;
              });
            }
          }}
        />
      )}
      {errors.datetime && <Text style={styles.errorText}>{errors.datetime}</Text>}

      <Text style={styles.label}>Categoria (opcional)</Text>
      <View style={styles.chipsRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setCategoryId(categoryId === cat.id ? null : cat.id)}
            activeOpacity={0.8}
          >
            {categoryId === cat.id ? (
              <LinearGradient
                colors={[colors.accentFrom, colors.accentTo]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.chipGradient}
              >
                <Text style={styles.chipActiveText}>{cat.label}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.chipInactive}>
                <Text style={styles.chipInactiveText}>{cat.label}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {teams.length > 0 && (
        <>
          <Text style={styles.label}>Equipe (opcional)</Text>
          <View style={styles.chipsRow}>
            {teams.map((team) => (
              <TouchableOpacity
                key={team.id}
                onPress={() => setTeamId(teamId === team.id ? null : team.id)}
                activeOpacity={0.8}
              >
                {teamId === team.id ? (
                  <LinearGradient
                    colors={[colors.accentFrom, colors.accentTo]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.chipGradient}
                  >
                    <Text style={styles.chipActiveText}>{team.name}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.chipInactive}>
                    <Text style={styles.chipInactiveText}>{team.name}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <TouchableOpacity
        onPress={handleSave}
        activeOpacity={0.8}
        style={styles.saveWrapper}
      >
        <LinearGradient
          colors={[colors.accentFrom, colors.accentTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.saveBtn}
        >
          <Text style={styles.saveBtnText}>Salvar</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { gap: 8, paddingBottom: 40 },
  headerAction: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 },
  deleteText: { color: colors.destructiveFrom, fontSize: 14, fontWeight: '600' },
  warningBox: {
    marginHorizontal: 16,
    backgroundColor: '#2a1a0a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.alert,
    padding: 12,
  },
  warningText: { ...typography.body, color: colors.alert },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginHorizontal: 16,
  },
  input: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: '#0a0a14',
  },
  inputMultiline: { minHeight: 72, textAlignVertical: 'top' },
  inputError: { borderColor: colors.destructiveFrom },
  pickerRow: { flexDirection: 'row', alignItems: 'center' },
  pickerText: { fontSize: 15, color: colors.textPrimary },
  errorText: { fontSize: 12, color: colors.destructiveFrom, marginHorizontal: 16 },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginHorizontal: 16,
  },
  chipGradient: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  chipActiveText: { color: colors.chipActiveText, fontWeight: '700', fontSize: 13 },
  chipInactive: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.chipInactiveBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  chipInactiveText: { color: colors.chipInactiveText, fontSize: 13 },
  saveWrapper: { marginHorizontal: 16, marginTop: 8 },
  saveBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: colors.textPrimary, fontSize: 16, fontWeight: '800' },
});
