import { Ionicons } from '@expo/vector-icons';
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
import { Card, EmptyState, FabButton } from '../src/components/common';
import { useAppData } from '../src/state/AppDataProvider';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { Team } from '../src/types';

export default function EquipesScreen() {
  const { isLoading, teams, updateTeams } = useAppData();
  const [formVisible, setFormVisible] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formName, setFormName] = useState('');
  const [formOrder, setFormOrder] = useState('');
  const [formPercent, setFormPercent] = useState('');
  const [formError, setFormError] = useState('');

  function nextOrder(): string {
    return String(Math.max(0, ...teams.map((t) => t.order)) + 1);
  }

  function openCreate() {
    setEditingTeam(null);
    setFormName('');
    setFormOrder(nextOrder());
    setFormPercent('');
    setFormError('');
    setFormVisible(true);
  }

  function openEdit(team: Team) {
    setEditingTeam(team);
    setFormName(team.name);
    setFormOrder(String(team.order));
    setFormPercent(team.maxWeeklyPercent !== null ? String(team.maxWeeklyPercent) : '');
    setFormError('');
    setFormVisible(true);
  }

  function closeForm() {
    setFormVisible(false);
  }

  function parsePercent(value: string): number | null | 'invalid' {
    const trimmed = value.trim();
    if (trimmed === '') return null;
    const num = Number(trimmed);
    if (isNaN(num) || num < 0 || num > 100) return 'invalid';
    return num;
  }

  async function handleSave() {
    const name = formName.trim();
    const order = Number(formOrder);
    if (!name) {
      setFormError('O nome não pode ser vazio.');
      return;
    }
    if (!formOrder || !Number.isInteger(order) || order < 1) {
      setFormError('A ordem deve ser um número maior que zero.');
      return;
    }
    const percent = parsePercent(formPercent);
    if (percent === 'invalid') {
      setFormError('O percentual deve ser um número entre 0 e 100.');
      return;
    }

    if (editingTeam) {
      const updated = teams.map((t) =>
        t.id === editingTeam.id ? { ...t, name, order, maxWeeklyPercent: percent } : t,
      );
      await updateTeams(updated);
    } else {
      const team: Team = {
        id: Date.now().toString(),
        name,
        order,
        maxWeeklyPercent: percent,
      };
      await updateTeams([...teams, team]);
    }
    closeForm();
  }

  function handleDelete(team: Team) {
    Alert.alert('Confirmar exclusão', `Deseja remover a equipe "${team.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          await updateTeams(teams.filter((t) => t.id !== team.id));
          if (editingTeam?.id === team.id) closeForm();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Equipes" backTo="/(tabs)/mais" />

      {!isLoading && teams.length === 0 ? (
        <EmptyState
          icon="people-outline"
          message="Nenhuma equipe. Toque em + para criar."
        />
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.8} onPress={() => openEdit(item)}>
              <Card style={styles.row}>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowName}>{item.name}</Text>
                  {item.maxWeeklyPercent !== null && (
                    <Text style={styles.rowMeta}>Meta: {item.maxWeeklyPercent}%</Text>
                  )}
                </View>
                <Text style={styles.rowOrder}>#{item.order}</Text>
                <View style={styles.rowActions}>
                  <TouchableOpacity
                    onPress={() => openEdit(item)}
                    style={styles.iconBtn}
                  >
                    <Ionicons
                      name="pencil-outline"
                      size={18}
                      color={colors.accentFrom}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(item)}
                    style={styles.iconBtn}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={colors.destructiveFrom}
                    />
                  </TouchableOpacity>
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}

      <FabButton accessibilityLabel="Nova equipe" onPress={openCreate} />

      <Modal
        animationType="slide"
        presentationStyle="overFullScreen"
        transparent
        visible={formVisible}
        onRequestClose={closeForm}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Fechar formulário"
            activeOpacity={1}
            onPress={closeForm}
            style={StyleSheet.absoluteFill}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.sheet}
          >
            <View style={styles.grabber} />
            <View style={styles.sheetHeader}>
              <TouchableOpacity
                hitSlop={8}
                onPress={closeForm}
                style={styles.sheetHeaderBtn}
              >
                <Text style={styles.cancelText}>Fechar</Text>
              </TouchableOpacity>
              <Text style={styles.sheetTitle}>
                {editingTeam ? 'Editar equipe' : 'Nova equipe'}
              </Text>
              {editingTeam ? (
                <TouchableOpacity
                  hitSlop={8}
                  onPress={() => handleDelete(editingTeam)}
                  style={styles.sheetHeaderBtn}
                >
                  <Text style={styles.deleteText}>Excluir</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.sheetHeaderBtn} />
              )}
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.sheetContent}
            >
              {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

              <Text style={styles.label}>Nome *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome da equipe"
                placeholderTextColor={colors.textSecondary}
                value={formName}
                onChangeText={(v) => {
                  setFormName(v);
                  setFormError('');
                }}
              />

              <Text style={styles.label}>Ordem *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ordem"
                placeholderTextColor={colors.textSecondary}
                value={formOrder}
                onChangeText={(v) => {
                  setFormOrder(v.replace(/\D/g, ''));
                  setFormError('');
                }}
                keyboardType="number-pad"
              />

              <Text style={styles.label}>% máx. semanal (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="ex: 40"
                placeholderTextColor={colors.textSecondary}
                value={formPercent}
                onChangeText={(v) => {
                  setFormPercent(v);
                  setFormError('');
                }}
                keyboardType="numeric"
              />

              <TouchableOpacity
                onPress={handleSave}
                activeOpacity={0.8}
                style={styles.saveWrapper}
              >
                <LinearGradient
                  colors={[colors.accentFrom, colors.accentTo]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveBtn}
                >
                  <Text style={styles.saveBtnText}>Salvar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 16, paddingTop: 4, paddingBottom: 100 },
  separator: { height: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    gap: 8,
  },
  rowInfo: { flex: 1, gap: 2 },
  rowName: { fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  rowMeta: { fontSize: 12, color: colors.textSecondary },
  rowOrder: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'center',
  },
  rowActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 4 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  sheet: {
    maxHeight: '90%',
    backgroundColor: colors.background,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  grabber: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.cardBorder,
    marginTop: 10,
    marginBottom: 6,
  },
  sheetHeader: {
    minHeight: 52,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.tabBarBorder,
  },
  sheetHeaderBtn: {
    width: 72,
    minHeight: 44,
    justifyContent: 'center',
  },
  sheetTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  cancelText: {
    color: colors.accentFrom,
    fontSize: 14,
    fontWeight: '700',
  },
  deleteText: {
    color: colors.destructiveFrom,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  sheetContent: {
    gap: 8,
    paddingTop: 14,
    paddingBottom: 32,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    marginHorizontal: 16,
    marginTop: 4,
  },
  input: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: '#0a0a14',
  },
  errorText: {
    fontSize: 12,
    color: colors.destructiveFrom,
    marginHorizontal: 16,
  },
  saveWrapper: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  saveBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
});
