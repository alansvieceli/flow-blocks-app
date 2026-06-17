import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { FlowBlocksLogo } from './FlowBlocksLogo';

function formatDate(): string {
  const d = new Date();
  const days = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
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
  return `${days[d.getDay()]}, ${d.getDate()} de ${months[d.getMonth()]}`;
}

interface Props {
  greeting?: boolean;
  title?: string;
}

export function AppHeader({ greeting, title }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) + 4 }]}>
      <View style={styles.topRow}>
        <FlowBlocksLogo />
      </View>

      {greeting ? (
        <View style={styles.bottom}>
          <Text style={styles.greeting}>Aloha :)</Text>
          <Text style={styles.date}>{formatDate()}</Text>
        </View>
      ) : title != null ? (
        <View style={styles.bottom}>
          <Text style={styles.title}>{title}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottom: {
    marginTop: 12,
    gap: 2,
  },
  greeting: {
    ...typography.screenTitle,
    fontSize: 24,
    color: colors.textPrimary,
  },
  date: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  title: {
    ...typography.screenTitle,
    fontSize: 24,
    color: colors.textPrimary,
  },
});
