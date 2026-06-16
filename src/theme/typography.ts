import { TextStyle } from 'react-native';

export const typography = {
  screenTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  } satisfies TextStyle,
  sectionLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 1,
  } satisfies TextStyle,
  body: {
    fontSize: 12,
  } satisfies TextStyle,
  metricLarge: {
    fontSize: 44,
    fontWeight: '800',
  } satisfies TextStyle,
  metricMedium: {
    fontSize: 16,
    fontWeight: '800',
  } satisfies TextStyle,
} as const;
