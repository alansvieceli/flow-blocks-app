import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { useAppData } from '../src/state/AppDataProvider';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { Team } from '../src/types';

export default function EquipesScreen() {
  const { teams, updateTeams } = useAppData();
  const [newName, setNewName] = useState('');
  const [newPercent, setNewPercent] = useState('');
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [editName, setEditName] = useState('');
  const [editPercent, setEditPercent] = useState('');

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
    await updateTeams(updated);
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
    await updateTeams(updated);
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
          await updateTeams(updated);
        },
      },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title="Equipes" backTo="/(tabs)/mais" />

      <FlatList
        data={teams}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <LinearGradient
            colors={[colors.cardFrom, colors.cardTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.item}
          >
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              {item.maxWeeklyPercent !== null && (
                <Text style={styles.itemPercent}>Meta: {item.maxWeeklyPercent}%</Text>
              )}
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
          </LinearGradient>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhuma equipe cadastrada.</Text>
        }
      />

      <View style={styles.addSection}>
        <Text style={styles.addSectionLabel}>NOVA EQUIPE</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome"
          placeholderTextColor={colors.textSecondary}
          value={newName}
          onChangeText={setNewName}
        />
        <TextInput
          style={styles.input}
          placeholder="% máx. semanal (opcional)"
          placeholderTextColor={colors.textSecondary}
          value={newPercent}
          onChangeText={setNewPercent}
          keyboardType="numeric"
        />
        <TouchableOpacity onPress={handleAdd} activeOpacity={0.8}>
          <LinearGradient
            colors={[colors.accentFrom, colors.accentTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btnAdd}
          >
            <Text style={styles.btnAddText}>Adicionar equipe</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Modal visible={editTeam !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalBox} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalTitle}>Editar equipe</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome"
              placeholderTextColor={colors.textSecondary}
              value={editName}
              onChangeText={setEditName}
            />
            <TextInput
              style={styles.input}
              placeholder="% máx. semanal (opcional)"
              placeholderTextColor={colors.textSecondary}
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
              <TouchableOpacity
                onPress={handleSaveEdit}
                style={styles.btnSaveWrapper}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.accentFrom, colors.accentTo]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.btnSave}
                >
                  <Text style={styles.btnSaveText}>Salvar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { flex: 1 },
  listContent: { padding: 16, gap: 10 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  itemInfo: { flex: 1, gap: 2 },
  itemName: { fontSize: 15, color: colors.textPrimary, fontWeight: '600' },
  itemPercent: { fontSize: 12, color: colors.textSecondary },
  itemActions: { flexDirection: 'row', gap: 8 },
  btnEdit: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1a1048',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accentFrom,
  },
  btnEditText: { color: colors.accentFrom, fontSize: 13 },
  btnDelete: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2a0a0a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.destructiveFrom,
  },
  btnDeleteText: { color: colors.destructiveFrom, fontSize: 13 },
  empty: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 32,
    ...typography.body,
  },
  addSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    gap: 8,
  },
  addSectionLabel: {
    ...typography.sectionLabel,
    color: colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: '#0a0a14',
  },
  btnAdd: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnAddText: { color: colors.textPrimary, fontWeight: '700', fontSize: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: colors.cardFrom,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
  },
  modalTitle: {
    ...typography.screenTitle,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  modalActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  btnCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnCancelText: { color: colors.textSecondary, fontSize: 15 },
  btnSaveWrapper: { flex: 2 },
  btnSave: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnSaveText: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
});
