import Constants from 'expo-constants';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { OptionPicker, SectionHeader } from '../src/components/common';
import { useAppData } from '../src/state/AppDataProvider';
import { AppSettings } from '../src/storage/settingsStorage';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';

const HISTORY_MONTHS_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  label: i === 0 ? '1 mês' : `${i + 1} meses`,
}));

const NUDGE_ABANDON_OPTIONS = [
  { id: '1', label: '1 hora' },
  { id: '2', label: '2 horas' },
  { id: '4', label: '4 horas' },
  { id: '8', label: '8 horas' },
  { id: '12', label: '12 horas' },
  { id: '24', label: '24 horas' },
];

function halfHourOptions(startHour: number, endHour: number) {
  const options = [];
  for (let h = startHour; h <= endHour; h += 0.5) {
    const hh = String(Math.floor(h)).padStart(2, '0');
    const mm = h % 1 === 0 ? '00' : '30';
    options.push({ id: String(h), label: `${hh}:${mm}` });
  }
  return options;
}

const WORK_START_OPTIONS = halfHourOptions(6, 10);

const WORK_END_OPTIONS = halfHourOptions(15, 20);

const LUNCH_OPTIONS = [
  { id: '30', label: '30 min' },
  { id: '45', label: '45 min' },
  { id: '60', label: '60 min' },
  { id: '90', label: '90 min' },
];

const SESSION_REMINDER_INTERVAL_OPTIONS = [
  { id: 'disabled', label: 'Desativado' },
  { id: '30', label: '30 min' },
  { id: '60', label: '1 hora' },
  { id: '120', label: '2 horas' },
  { id: '180', label: '3 horas' },
];

const SESSION_REMINDER_COUNT_OPTIONS = [
  { id: '1', label: '1' },
  { id: '2', label: '2' },
  { id: '3', label: '3' },
  { id: '6', label: '6' },
  { id: '12', label: '12' },
  { id: '24', label: '24' },
];

function ToggleRow({
  label,
  sublabel,
  value,
  onToggle,
}: {
  label: string;
  sublabel?: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sublabel ? <Text style={styles.rowSublabel}>{sublabel}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.cardBorder, true: colors.accentFrom }}
        thumbColor={value ? colors.textPrimary : colors.textSecondary}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const { settings, updateSettings, resetAll } = useAppData();

  async function update(patch: Partial<AppSettings>) {
    const updated = { ...settings, ...patch };
    await updateSettings(updated);
  }

  function confirmReset() {
    Alert.alert(
      'Restaurar padrão',
      'Todos os dados serão apagados permanentemente: equipes, sessões, categorias, lembretes e atividades pessoais. Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: async () => {
            await resetAll();
            Alert.alert(
              'Pronto',
              'O app foi restaurado para as configurações originais.',
            );
          },
        },
      ],
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Configurações" backTo="/(tabs)/more" />
      <ScrollView contentContainerStyle={styles.content}>
        <SectionHeader title="NOTIFICAÇÕES" style={styles.sectionHeader} />
        <View style={styles.section}>
          <ToggleRow
            label="Ativar notificações"
            sublabel="Recebe alertas nos horários dos lembretes"
            value={settings.notificationsEnabled}
            onToggle={(v) => update({ notificationsEnabled: v })}
          />
        </View>

        <SectionHeader title="DADOS" style={styles.sectionHeader} />
        <OptionPicker
          label="Manter histórico de"
          items={HISTORY_MONTHS_OPTIONS}
          onSelect={(id) => update({ historyMonths: Number(id) })}
          placeholder="Selecionar período"
          selectedId={String(settings.historyMonths)}
        />
        <OptionPicker
          label="Descartar nudge abandonado após"
          items={NUDGE_ABANDON_OPTIONS}
          onSelect={(id) => update({ nudgeAbandonHours: Number(id) })}
          placeholder="Selecionar tempo"
          selectedId={String(settings.nudgeAbandonHours ?? 8)}
        />

        <SectionHeader title="JORNADA DE TRABALHO" style={styles.sectionHeader} />
        <OptionPicker
          label="Início do expediente"
          items={WORK_START_OPTIONS}
          onSelect={(id) => update({ workStartHour: Number(id) })}
          placeholder="Selecionar hora"
          selectedId={String(settings.workStartHour ?? 8)}
        />
        <OptionPicker
          label="Fim do expediente"
          items={WORK_END_OPTIONS}
          onSelect={(id) => update({ workEndHour: Number(id) })}
          placeholder="Selecionar hora"
          selectedId={String(settings.workEndHour ?? 18)}
        />
        <OptionPicker
          label="Duração do almoço"
          items={LUNCH_OPTIONS}
          onSelect={(id) => update({ lunchDurationMinutes: Number(id) })}
          placeholder="Selecionar duração"
          selectedId={String(settings.lunchDurationMinutes ?? 60)}
        />

        <SectionHeader title="SESSÃO ATIVA" style={styles.sectionHeader} />
        <OptionPicker
          label="Lembrete de sessão"
          items={SESSION_REMINDER_INTERVAL_OPTIONS}
          onSelect={(id) =>
            update({
              sessionReminderIntervalMinutes: id === 'disabled' ? null : Number(id),
            })
          }
          placeholder="Selecionar intervalo"
          selectedId={
            settings.sessionReminderIntervalMinutes === null
              ? 'disabled'
              : String(settings.sessionReminderIntervalMinutes)
          }
        />
        {settings.sessionReminderIntervalMinutes !== null && (
          <OptionPicker
            label="Quantidade de lembretes"
            items={SESSION_REMINDER_COUNT_OPTIONS}
            onSelect={(id) => update({ sessionReminderCount: Number(id) })}
            placeholder="Selecionar quantidade"
            selectedId={String(settings.sessionReminderCount)}
          />
        )}

        <View style={[styles.section, styles.sectionSpaced]}>
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={confirmReset}
          >
            <View style={styles.rowText}>
              <Text style={styles.dangerLabel}>Restaurar padrão</Text>
              <Text style={styles.rowSublabel}>
                Apaga todos os dados e volta ao estado inicial
              </Text>
            </View>
          </Pressable>
        </View>
        <Text style={styles.versionLabel}>
          Flow Blocks v{Constants.expoConfig?.version ?? '—'}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingTop: 12, gap: 4 },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 6,
  },
  section: {
    backgroundColor: colors.cardFrom,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  sectionSpaced: { marginTop: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowPressed: { opacity: 0.6 },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { ...typography.rowLabel, color: colors.textPrimary },
  dangerLabel: { ...typography.rowLabel, color: colors.destructiveFrom },
  rowSublabel: { fontSize: 11, color: colors.textSecondary },
  versionLabel: {
    fontSize: 11,
    color: colors.textDisabled,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
});
