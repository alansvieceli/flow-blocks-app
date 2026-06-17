import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Card } from './Card';

interface ListRowProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  right?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ListRow({
  title,
  subtitle,
  icon,
  right,
  onPress,
  disabled = false,
  style,
}: ListRowProps) {
  const content = (
    <Card style={[styles.card, disabled && styles.disabled, style]}>
      {icon ? (
        <Ionicons
          name={icon}
          size={18}
          color={disabled ? colors.textDisabled : colors.accentFrom}
          style={styles.icon}
        />
      ) : null}
      <View style={styles.content}>
        <Text style={[styles.title, disabled && styles.disabledText]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[styles.subtitle, disabled && styles.disabledText]}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={disabled ? colors.textDisabled : colors.textSecondary}
        />
      )}
    </Card>
  );

  if (!onPress) return content;

  return (
    <TouchableOpacity activeOpacity={0.8} disabled={disabled} onPress={onPress}>
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
  },
  disabled: {
    opacity: 0.45,
  },
  icon: {
    marginTop: 1,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  disabledText: {
    color: colors.textDisabled,
  },
});
