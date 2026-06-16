import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../src/theme/colors';
import { useActiveSession } from '../../src/lib/useActiveSession';
import { formatDuration } from '../../src/lib/formatDuration';

function ActiveSessionBanner() {
  const { activeSession, elapsed } = useActiveSession();
  const router = useRouter();

  if (!activeSession) return null;

  return (
    <TouchableOpacity style={styles.banner} onPress={() => router.push('/(tabs)/')}>
      <View style={styles.bannerLeft}>
        <View style={styles.recordingDot} />
        <Text style={styles.bannerRecording}>Gravando</Text>
      </View>
      <Text style={styles.bannerTimer}>{formatDuration(elapsed)}</Text>
      <Text style={styles.bannerHint}>▶ Início</Text>
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  return (
    <>
      <ActiveSessionBanner />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.tabBarBackground,
            borderTopColor: colors.tabBarBorder,
            borderTopWidth: 1,
          },
          tabBarActiveTintColor: colors.tabActive,
          tabBarInactiveTintColor: colors.tabInactive,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Início',
            tabBarIcon: ({ color }) => (
              <Ionicons name="home-outline" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="painel"
          options={{
            title: 'Painel',
            tabBarIcon: ({ color }) => (
              <Ionicons name="grid-outline" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="lembretes"
          options={{
            title: 'Lembretes',
            tabBarIcon: ({ color }) => (
              <Ionicons name="notifications-outline" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="mais"
          options={{
            title: 'Mais',
            tabBarIcon: ({ color }) => (
              <Ionicons name="ellipsis-horizontal-outline" size={22} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#1a1228',
    borderBottomColor: colors.cardBorder,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.alert,
  },
  bannerRecording: {
    color: colors.alert,
    fontSize: 12,
    fontWeight: '600',
  },
  bannerTimer: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  bannerHint: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});
