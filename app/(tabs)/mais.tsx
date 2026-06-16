import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';

interface MenuRowProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}

function MenuRow({ label, onPress, disabled = false }: MenuRowProps) {
  return (
    <TouchableOpacity
      style={[styles.row, disabled && styles.rowDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.rowLabel, disabled && styles.rowLabelDisabled]}>
        {label}
      </Text>
      <Ionicons
        name="chevron-forward"
        size={16}
        color={disabled ? colors.textDisabled : colors.textSecondary}
      />
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function MaisScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Mais</Text>

      <SectionHeader title="TRABALHO" />
      <View style={styles.section}>
        <MenuRow label="Equipes" onPress={() => router.push('/equipes')} />
        <View style={styles.separator} />
        <MenuRow label="Histórico" onPress={() => router.push('/historico')} />
      </View>

      <SectionHeader title="PESSOAL" />
      <View style={styles.section}>
        <MenuRow label="Atividades" onPress={() => router.push('/atividades')} />
        <View style={styles.separator} />
        <MenuRow
          label="Template semanal"
          onPress={() => router.push('/template-semanal')}
        />
      </View>

      <SectionHeader title="APP" />
      <View style={styles.section}>
        <MenuRow label="Lembretes" disabled />
        <View style={styles.separator} />
        <MenuRow label="Configurações" onPress={() => router.push('/configuracoes')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingTop: 20,
    gap: 4,
  },
  title: {
    ...typography.screenTitle,
    color: colors.textPrimary,
    marginBottom: 20,
  },
  sectionHeader: {
    ...typography.sectionLabel,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 6,
    marginLeft: 4,
  },
  section: {
    backgroundColor: colors.cardFrom,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowDisabled: {
    opacity: 0.4,
  },
  rowLabel: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  rowLabelDisabled: {
    color: colors.textDisabled,
  },
  separator: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginLeft: 16,
  },
});
