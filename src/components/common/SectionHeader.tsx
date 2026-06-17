import { StyleSheet, Text, TextStyle, StyleProp } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface SectionHeaderProps {
  title: string;
  style?: StyleProp<TextStyle>;
}

export function SectionHeader({ title, style }: SectionHeaderProps) {
  return <Text style={[styles.header, style]}>{title}</Text>;
}

const styles = StyleSheet.create({
  header: {
    ...typography.sectionLabel,
    color: colors.textSecondary,
    marginTop: 8,
    marginLeft: 4,
  },
});
