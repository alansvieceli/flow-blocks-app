import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatDuration } from '../../src/lib/formatDuration';
import { useActiveSession } from '../../src/lib/useActiveSession';
import { getCategoryLabel } from '../../src/lib/categories';

function ActiveSessionBanner() {
  const { activeSession, elapsed } = useActiveSession();
  const router = useRouter();

  if (!activeSession) return null;

  return (
    <TouchableOpacity
      style={styles.banner}
      onPress={() => router.push('/(tabs)/tracker')}
    >
      <View style={styles.bannerLeft}>
        <Text style={styles.bannerLabel}>
          {getCategoryLabel(activeSession.categoryId)}
        </Text>
        <Text style={styles.bannerTimer}>{formatDuration(elapsed)}</Text>
      </View>
      <Text style={styles.bannerHint}>▶ Tracker</Text>
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  return (
    <>
      <ActiveSessionBanner />
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen
          name="tracker"
          options={{
            title: 'Tracker',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="timer-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'Histórico',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="teams"
          options={{
            title: 'Equipes',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLeft: { gap: 2 },
  bannerLabel: { color: '#fff', fontSize: 12, opacity: 0.85 },
  bannerTimer: { color: '#fff', fontSize: 18, fontWeight: '700' },
  bannerHint: { color: '#fff', fontSize: 13, opacity: 0.85 },
});
