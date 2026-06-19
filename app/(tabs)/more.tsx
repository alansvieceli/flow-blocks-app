import { useRouter } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';
import { AppHeader } from '../../src/components/AppHeader';
import { ListRow, ScreenScaffold, SectionHeader } from '../../src/components/common';
import {
  generateMockPersonalDailyPlans,
  generateMockSessions,
  generateMockTeams,
} from '../../src/lib/devSeed';
import { useAppData } from '../../src/state/AppDataProvider';

export default function MoreScreen() {
  const router = useRouter();
  const {
    categories,
    teams,
    personalActivities,
    personalDailyPlans,
    sessions,
    updatePersonalDailyPlans,
    updateSessions,
    updateTeams,
  } = useAppData();

  async function handleSeedMockData() {
    const seedTeams = teams.length === 0 ? generateMockTeams() : teams;
    if (teams.length === 0) {
      await updateTeams(seedTeams);
    }

    const mockSessions = generateMockSessions(categories, seedTeams);
    const mockPlans = generateMockPersonalDailyPlans(personalActivities);

    await updateSessions([...sessions, ...mockSessions]);

    const mockDates = new Set(mockPlans.map((p) => p.date));
    const keptPlans = personalDailyPlans.filter((p) => !mockDates.has(p.date));
    await updatePersonalDailyPlans([...keptPlans, ...mockPlans]);

    Alert.alert(
      'Dados de teste gerados',
      `${mockSessions.length} sessões, ${seedTeams.length} equipes e ${mockPlans.length} dias de atividades pessoais adicionados.`,
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Mais" />
      <ScreenScaffold>
        <SectionHeader title="TRABALHO" />
        <ListRow
          icon="people-outline"
          title="Equipes"
          subtitle="Projetos e metas semanais"
          onPress={() => router.push('/teams')}
        />
        <ListRow
          icon="albums-outline"
          title="Categorias"
          subtitle="Tipos de blocos de trabalho"
          onPress={() => router.push('/categories')}
        />
        <ListRow
          icon="time-outline"
          title="Histórico"
          subtitle="Sessões registradas"
          onPress={() => router.push('/history')}
        />

        <SectionHeader title="PESSOAL" />
        <ListRow
          icon="sparkles-outline"
          title="Atividades"
          subtitle="Lista de atividades pessoais"
          onPress={() => router.push('/activities')}
        />
        <ListRow
          icon="calendar-outline"
          title="Template semanal"
          subtitle="Planejamento recorrente por dia"
          onPress={() => router.push('/weekly-template')}
        />

        <SectionHeader title="APP" />
        <ListRow
          icon="settings-outline"
          title="Configurações"
          subtitle="Preferências e notificações"
          onPress={() => router.push('/settings')}
        />
        {__DEV__ && (
          <ListRow
            icon="flask-outline"
            title="Gerar dados de teste"
            subtitle="Preenche os últimos 4 dias com sessões e atividades (dev)"
            onPress={handleSeedMockData}
          />
        )}
      </ScreenScaffold>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
