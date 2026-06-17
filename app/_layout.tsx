import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { AppDataProvider } from '../src/state/AppDataProvider';
import { colors } from '../src/theme/colors';

export default function RootLayout() {
  return (
    <AppDataProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
        translucent={false}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      />
    </AppDataProvider>
  );
}
