import { StyleSheet, Text, View } from 'react-native';

export default function TeamsScreen() {
  return (
    <View style={styles.container}>
      <Text>Equipes</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
