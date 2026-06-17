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

export default function ConfiguracoesScreen() {
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
      <ScreenHeader title="Configurações" backTo="/(tabs)/mais" />
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
});
