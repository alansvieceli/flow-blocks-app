import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';

interface FabButtonProps {
  accessibilityLabel: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export function FabButton({
  accessibilityLabel,
  icon = 'add',
  onPress,
}: FabButtonProps) {
  const insets = useSafeAreaInsets();
  // 80px above safe area keeps the button above the tab bar (~49-56px) on all screens
  const bottom = Math.max(insets.bottom, 16) + 80;

  return (
    <TouchableOpacity
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.fab, { bottom }]}
    >
      <LinearGradient
        colors={[colors.accentFrom, colors.accentTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Ionicons name={icon} size={28} color={colors.textPrimary} />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 24,
    borderRadius: 32,
    elevation: 6,
    shadowColor: colors.accentFrom,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  gradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
