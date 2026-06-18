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

const WORK_START_OPTIONS = [
  { id: '6', label: '06:00' },
  { id: '7', label: '07:00' },
  { id: '8', label: '08:00' },
  { id: '9', label: '09:00' },
  { id: '10', label: '10:00' },
];

const WORK_END_OPTIONS = [
  { id: '15', label: '15:00' },
  { id: '16', label: '16:00' },
  { id: '17', label: '17:00' },
  { id: '18', label: '18:00' },
  { id: '19', label: '19:00' },
  { id: '20', label: '20:00' },
];

const LUNCH_OPTIONS = [
  { id: '30', label: '30 min' },
  { id: '45', label: '45 min' },
  { id: '60', label: '60 min' },
  { id: '90', label: '90 min' },
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
  rowLabel: { fontSize: 15, color: colors.textPrimary },
  dangerLabel: { fontSize: 15, color: colors.destructiveFrom },
  rowSublabel: { fontSize: 12, color: colors.textSecondary },
  versionLabel: {
    fontSize: 12,
    color: colors.textDisabled,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
});
