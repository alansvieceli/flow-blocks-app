import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppHeader } from '../../src/components/AppHeader';
import { ListRow, ScreenScaffold, SectionHeader } from '../../src/components/common';

export default function MoreScreen() {
  const router = useRouter();

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
      </ScreenScaffold>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
