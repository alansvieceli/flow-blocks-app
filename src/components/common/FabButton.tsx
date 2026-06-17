import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
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
  const bottom = Math.max(insets.bottom, 16) + 80;

  return (
    <TouchableOpacity
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.fab, { bottom }]}
    >
      <View style={styles.inner}>
        <Ionicons name={icon} size={28} color={colors.textPrimary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 24,
    borderRadius: 32,
    elevation: 6,
  },
  inner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accentFrom,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
