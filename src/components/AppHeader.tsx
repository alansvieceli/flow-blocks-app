import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Bom dia, Alan 👋';
  if (h >= 12 && h < 18) return 'Boa tarde, Alan 👋';
  return 'Boa noite, Alan 👋';
}

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
  action?: ReactNode;
}

export function AppHeader({ action }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) + 4 }]}>
      <LinearGradient
        colors={[colors.accentFrom, colors.accentTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.brand}
      >
        <Ionicons name="flash" size={12} color="#fff" />
        <Text style={styles.brandText}>Flow Blocks</Text>
      </LinearGradient>

      <View style={styles.greetingRow}>
        <View style={styles.greetingLeft}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.date}>{formatDate()}</Text>
        </View>
        {action != null ? <View style={styles.actionSlot}>{action}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
  },
  brandText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingLeft: {
    flex: 1,
    gap: 2,
  },
  greeting: {
    ...typography.screenTitle,
    fontSize: 22,
    color: colors.textPrimary,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  actionSlot: {
    marginLeft: 12,
  },
});
