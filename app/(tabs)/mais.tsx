import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppHeader } from '../../src/components/AppHeader';
import { ListRow, ScreenScaffold, SectionHeader } from '../../src/components/common';

export default function MaisScreen() {
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
          onPress={() => router.push('/equipes')}
        />
        <ListRow
          icon="time-outline"
          title="Histórico"
          subtitle="Sessões registradas"
          onPress={() => router.push('/historico')}
        />

        <SectionHeader title="PESSOAL" />
        <ListRow
          icon="sparkles-outline"
          title="Atividades"
          subtitle="Lista de atividades pessoais"
          onPress={() => router.push('/atividades')}
        />
        <ListRow
          icon="calendar-outline"
          title="Template semanal"
          subtitle="Planejamento recorrente por dia"
          onPress={() => router.push('/template-semanal')}
        />

        <SectionHeader title="APP" />
        <ListRow
          icon="settings-outline"
          title="Configurações"
          subtitle="Preferências e notificações"
          onPress={() => router.push('/configuracoes')}
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
