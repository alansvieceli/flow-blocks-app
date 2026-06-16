import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getTeams, saveTeams } from '../../src/storage/teamsStorage';
import { Team } from '../../src/types';

export default function TeamsScreen() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [newName, setNewName] = useState('');
  const [newPercent, setNewPercent] = useState('');

  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [editName, setEditName] = useState('');
  const [editPercent, setEditPercent] = useState('');

  useEffect(() => {
    getTeams().then(setTeams);
  }, []);

  function parsePercent(value: string): number | null | 'invalid' {
    const trimmed = value.trim();
    if (trimmed === '') return null;
    const num = Number(trimmed);
    if (isNaN(num) || num < 0 || num > 100) return 'invalid';
    return num;
  }

  async function handleAdd() {
    const name = newName.trim();
    if (!name) {
      Alert.alert('Erro', 'O nome não pode ser vazio.');
      return;
    }
    const percent = parsePercent(newPercent);
    if (percent === 'invalid') {
      Alert.alert('Erro', 'O percentual deve ser um número entre 0 e 100.');
      return;
    }
    const team: Team = {
      id: Date.now().toString(),
      name,
      maxWeeklyPercent: percent,
    };
    const updated = [...teams, team];
    setTeams(updated);
    await saveTeams(updated);
    setNewName('');
    setNewPercent('');
  }

  function openEdit(team: Team) {
    setEditTeam(team);
    setEditName(team.name);
    setEditPercent(team.maxWeeklyPercent !== null ? String(team.maxWeeklyPercent) : '');
  }

  async function handleSaveEdit() {
    if (!editTeam) return;
    const name = editName.trim();
    if (!name) {
      Alert.alert('Erro', 'O nome não pode ser vazio.');
      return;
    }
    const percent = parsePercent(editPercent);
    if (percent === 'invalid') {
      Alert.alert('Erro', 'O percentual deve ser um número entre 0 e 100.');
      return;
    }
    const updated = teams.map((t) =>
      t.id === editTeam.id ? { ...t, name, maxWeeklyPercent: percent } : t,
    );
    setTeams(updated);
    await saveTeams(updated);
    setEditTeam(null);
  }

  function handleDelete(team: Team) {
    Alert.alert('Confirmar exclusão', `Deseja remover a equipe "${team.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          const updated = teams.filter((t) => t.id !== team.id);
          setTeams(updated);
          await saveTeams(updated);
        },
      },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Equipes</Text>

      <FlatList
        data={teams}
        keyExtractor={(item) => item.id}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPercent}>
                {item.maxWeeklyPercent !== null ? `${item.maxWeeklyPercent}%` : '—'}
              </Text>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity style={styles.btnEdit} onPress={() => openEdit(item)}>
                <Text style={styles.btnEditText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnDelete}
                onPress={() => handleDelete(item)}
              >
                <Text style={styles.btnDeleteText}>Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhuma equipe cadastrada.</Text>
        }
      />

      <View style={styles.addSection}>
        <Text style={styles.sectionLabel}>Nova equipe</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome"
          value={newName}
          onChangeText={setNewName}
        />
        <TextInput
          style={styles.input}
          placeholder="% máx. semanal (opcional)"
          value={newPercent}
          onChangeText={setNewPercent}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.btnAdd} onPress={handleAdd}>
          <Text style={styles.btnAddText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={editTeam !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Editar equipe</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome"
              value={editName}
              onChangeText={setEditName}
            />
            <TextInput
              style={styles.input}
              placeholder="% máx. semanal (opcional)"
              value={editPercent}
              onChangeText={setEditPercent}
              keyboardType="numeric"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setEditTeam(null)}
              >
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnAdd} onPress={handleSaveEdit}>
                <Text style={styles.btnAddText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', padding: 16 },
  list: { flex: 1 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16 },
  itemPercent: { fontSize: 13, color: '#666', marginTop: 2 },
  itemActions: { flexDirection: 'row', gap: 8 },
  btnEdit: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#e8f0fe',
    borderRadius: 6,
  },
  btnEditText: { color: '#1a73e8', fontSize: 13 },
  btnDelete: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#fce8e6',
    borderRadius: 6,
  },
  btnDeleteText: { color: '#d93025', fontSize: 13 },
  empty: { textAlign: 'center', color: '#999', marginTop: 32 },
  addSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionLabel: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    fontSize: 15,
  },
  btnAdd: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnAddText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  modalActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  btnCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnCancelText: { color: '#333', fontSize: 15 },
});
