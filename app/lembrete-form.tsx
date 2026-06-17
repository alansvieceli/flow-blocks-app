import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { ReminderForm } from '../src/components/reminders/ReminderForm';
import { colors } from '../src/theme/colors';

export default function LembreteFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  return (
    <View style={styles.container}>
      <ReminderForm
        reminderId={id}
        onClose={() => router.replace('/(tabs)/lembretes')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
