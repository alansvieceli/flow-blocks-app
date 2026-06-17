import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
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
import { ScreenHeader } from '../src/components/ScreenHeader';
import { Card, EmptyState, FabButton } from '../src/components/common';
import { useAppData } from '../src/state/AppDataProvider';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { PersonalActivity } from '../src/types';

export default function AtividadesScreen() {
  const { personalActivities: activities, updatePersonalActivities } = useAppData();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inputName, setInputName] = useState('');
  const [inputError, setInputError] = useState('');

  function openCreate() {
    setEditingId(null);
    setInputName('');
    setInputError('');
    setModalVisible(true);
  }

  function openEdit(activity: PersonalActivity) {
    setEditingId(activity.id);
    setInputName(activity.name);
    setInputError('');
    setModalVisible(true);
  }

  async function handleSave() {
    const name = inputName.trim();
    if (!name) {
      setInputError('O nome é obrigatório.');
      return;
    }
    let updated: PersonalActivity[];
    if (editingId) {
      updated = activities.map((a) => (a.id === editingId ? { ...a, name } : a));
    } else {
      updated = [...activities, { id: Date.now().toString(), name }];
    }
    await updatePersonalActivities(updated);
    setModalVisible(false);
  }

  async function handleDelete(id: string) {
    Alert.alert('Excluir atividade', 'Deseja remover esta atividade?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          const updated = activities.filter((a) => a.id !== id);
          await updatePersonalActivities(updated);
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Atividades pessoais" backTo="/(tabs)/mais" />

      {activities.length === 0 ? (
        <EmptyState
          icon="list-outline"
          message="Nenhuma atividade. Toque em + para criar."
        />
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Card style={styles.row}>
              <Ionicons name="sparkles-outline" size={18} color={colors.accentFrom} />
              <Text style={styles.rowName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.rowActions}>
                <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}>
                  <Ionicons name="pencil-outline" size={18} color={colors.accentFrom} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(item.id)}
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
          )}
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        />
      )}

      <FabButton accessibilityLabel="Criar atividade" onPress={openCreate} />

      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {editingId ? 'Renomear atividade' : 'Nova atividade'}
            </Text>
            <TextInput
              style={[styles.input, inputError ? styles.inputError : undefined]}
              placeholder="Nome da atividade"
              placeholderTextColor={colors.textSecondary}
              value={inputName}
              onChangeText={(t) => {
                setInputName(t);
                setInputError('');
              }}
            />
            {inputError ? <Text style={styles.errorText}>{inputError}</Text> : null}
            <View style={styles.modalBtns}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                activeOpacity={0.8}
                style={styles.saveWrapper}
              >
                <View style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>Salvar</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 16, paddingTop: 4, paddingBottom: 32 },
  itemSeparator: { height: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    gap: 8,
  },
  rowName: { flex: 1, fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  rowActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    backgroundColor: colors.cardFrom,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
    gap: 12,
  },
  modalTitle: { ...typography.screenTitle, color: colors.textPrimary, fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.inputBackground,
  },
  inputError: { borderColor: colors.destructiveFrom },
  errorText: { fontSize: 12, color: colors.destructiveFrom },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cancelBtnText: { color: colors.textSecondary, fontWeight: '600' },
  saveWrapper: { flex: 1 },
  saveBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.accentFrom,
  },
  saveBtnText: { color: colors.textPrimary, fontWeight: '800', fontSize: 14 },
});
