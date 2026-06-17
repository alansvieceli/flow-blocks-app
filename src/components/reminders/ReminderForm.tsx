import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CATEGORIES } from '../../lib/categories';
import {
  cancelReminderNotification,
  requestNotificationPermission,
  scheduleReminderNotification,
} from '../../lib/notifications';
import { useAppData } from '../../state/AppDataProvider';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { CategoryId, Reminder } from '../../types';

interface ReminderFormProps {
  reminderId?: string;
  onClose: () => void;
}

function getDefaultDate() {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 60);
  return d;
}

function formatDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function formatTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function ReminderForm({ reminderId, onClose }: ReminderFormProps) {
  const insets = useSafeAreaInsets();
  const { reminders, settings, teams, updateReminders } = useAppData();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(getDefaultDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [categoryId, setCategoryId] = useState<CategoryId | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [existingReminder, setExistingReminder] = useState<Reminder | null>(null);
  const [permissionWarning, setPermissionWarning] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; datetime?: string }>({});

  useEffect(() => {
    if (!reminderId) {
      setExistingReminder(null);
      return;
    }

    const found = reminders.find((r) => r.id === reminderId) ?? null;
    if (!found) return;

    setExistingReminder(found);
    setTitle(found.title);
    setDescription(found.description ?? '');
    setDate(new Date(found.datetime));
    setCategoryId(found.categoryId);
    setTeamId(found.teamId);
  }, [reminderId, reminders]);

  function validate(): boolean {
    const nextErrors: typeof errors = {};
    if (!title.trim()) nextErrors.title = 'O título é obrigatório.';
    if (date.getTime() <= Date.now()) {
      nextErrors.datetime = 'A data/hora deve ser no futuro.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    const reminderIdToSave = existingReminder?.id ?? Date.now().toString();
    let notificationId: string | null = existingReminder?.notificationId ?? null;

    if (settings.notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setPermissionWarning(true);
        notificationId = null;
      } else {
        if (existingReminder?.notificationId) {
          await cancelReminderNotification(existingReminder.notificationId);
        }
        notificationId = await scheduleReminderNotification({
          id: reminderIdToSave,
          title: title.trim(),
          description: description.trim() || null,
          datetime: date.toISOString(),
        });
      }
    } else if (existingReminder?.notificationId) {
      await cancelReminderNotification(existingReminder.notificationId);
      notificationId = null;
    }

    const reminder: Reminder = {
      id: reminderIdToSave,
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

    await updateReminders(updated);
    onClose();
  }

  async function confirmDelete() {
    if (!existingReminder) return;

    if (existingReminder.notificationId) {
      await cancelReminderNotification(existingReminder.notificationId);
    }
    await updateReminders(reminders.filter((r) => r.id !== existingReminder.id));
    onClose();
  }

  function handleDelete() {
    Alert.alert('Excluir lembrete', 'Deseja remover este lembrete?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: confirmDelete },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.grabber, { marginTop: Math.max(insets.top, 8) }]} />
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          hitSlop={8}
          onPress={onClose}
          style={styles.headerButton}
        >
          <Text style={styles.cancelText}>Fechar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {existingReminder ? 'Editar lembrete' : 'Novo lembrete'}
        </Text>
        {existingReminder ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Excluir lembrete"
            hitSlop={8}
            onPress={handleDelete}
            style={styles.headerButton}
          >
            <Text style={styles.deleteText}>Excluir</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerButton} />
        )}
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 16) + 24 },
        ]}
      >
        {permissionWarning && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Notificações desabilitadas. O lembrete foi salvo, mas não disparará uma
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
        {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}

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
        {showDatePicker ? (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onDismiss={() => setShowDatePicker(false)}
            onValueChange={(_event, selectedDate) => {
              setShowDatePicker(false);
              setDate((prev) => {
                const next = new Date(selectedDate);
                next.setHours(prev.getHours(), prev.getMinutes(), 0, 0);
                return next;
              });
            }}
          />
        ) : null}

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
        {showTimePicker ? (
          <DateTimePicker
            value={date}
            mode="time"
            is24Hour
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onDismiss={() => setShowTimePicker(false)}
            onValueChange={(_event, selectedDate) => {
              setShowTimePicker(false);
              setDate((prev) => {
                const next = new Date(prev);
                next.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
                return next;
              });
            }}
          />
        ) : null}
        {errors.datetime ? (
          <Text style={styles.errorText}>{errors.datetime}</Text>
        ) : null}

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

        {teams.length > 0 ? (
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
        ) : null}

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: '96%',
    backgroundColor: colors.background,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  grabber: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.cardBorder,
    marginBottom: 8,
  },
  header: {
    minHeight: 52,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.tabBarBorder,
  },
  headerButton: {
    width: 72,
    minHeight: 44,
    justifyContent: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  cancelText: {
    color: colors.accentFrom,
    fontSize: 14,
    fontWeight: '700',
  },
  deleteText: {
    color: colors.destructiveFrom,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  content: {
    gap: 8,
    paddingTop: 14,
  },
  warningBox: {
    marginHorizontal: 16,
    backgroundColor: '#2a1a0a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.alert,
    padding: 12,
  },
  warningText: {
    ...typography.body,
    color: colors.alert,
  },
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
  inputMultiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.destructiveFrom,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  errorText: {
    fontSize: 12,
    color: colors.destructiveFrom,
    marginHorizontal: 16,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginHorizontal: 16,
  },
  chipGradient: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipActiveText: {
    color: colors.chipActiveText,
    fontWeight: '700',
    fontSize: 13,
  },
  chipInactive: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.chipInactiveBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  chipInactiveText: {
    color: colors.chipInactiveText,
    fontSize: 13,
  },
  saveWrapper: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  saveBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
});
