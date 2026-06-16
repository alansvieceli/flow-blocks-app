import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: Href;
  backLabel?: string;
  onBack?: () => void;
  rightAction?: ReactNode;
}

export function ScreenHeader({
  title,
  subtitle,
  backTo,
  backLabel = 'Voltar',
  onBack,
  rightAction,
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const showBack = onBack || backTo;

  function handleBack() {
    if (onBack) {
      onBack();
      return;
    }
    if (backTo) {
      router.replace(backTo);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) + 4 }]}>
      <View style={styles.topRow}>
        {showBack ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={backLabel}
            activeOpacity={0.75}
            hitSlop={8}
            onPress={handleBack}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={20} color={colors.accentFrom} />
            <Text style={styles.backLabel}>{backLabel}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backSpacer} />
        )}

        {rightAction ? <View style={styles.rightAction}>{rightAction}</View> : null}
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderBottomColor: colors.tabBarBorder,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  topRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    minHeight: 44,
    minWidth: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingRight: 10,
  },
  backSpacer: {
    minHeight: 44,
    minWidth: 44,
  },
  backLabel: {
    color: colors.accentFrom,
    fontSize: 14,
    fontWeight: '700',
  },
  rightAction: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  titleBlock: {
    gap: 2,
  },
  title: {
    ...typography.screenTitle,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.accentFrom,
  },
});
