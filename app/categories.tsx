import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { Card, EmptyState, FabButton } from '../src/components/common';
import { isLockedCategory } from '../src/lib/categories';
import { useAppData } from '../src/state/AppDataProvider';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { Category } from '../src/types';

export default function CategoriesScreen() {
  const { categories, sessions, updateCategories } = useAppData();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inputName, setInputName] = useState('');
  const [inputOrder, setInputOrder] = useState('');
  const [inputIsFocus, setInputIsFocus] = useState(false);
  const [inputError, setInputError] = useState('');

  function openCreate() {
    setEditingId(null);
    setInputName('');
    setInputOrder(String(Math.max(0, ...categories.map((c) => c.order)) + 1));
    setInputIsFocus(false);
    setInputError('');
    setModalVisible(true);
  }

  function openEdit(category: Category) {
    setEditingId(category.id);
    setInputName(category.label);
    setInputOrder(String(category.order));
    setInputIsFocus(category.isFocus ?? false);
    setInputError('');
    setModalVisible(true);
  }

  async function handleSave() {
    const label = inputName.trim();
    const order = Number(inputOrder);
    if (!label) {
      setInputError('O nome é obrigatório.');
      return;
    }
    if (!inputOrder || !Number.isInteger(order) || order < 1) {
      setInputError('A ordem deve ser um número maior que zero.');
      return;
    }
    if (order === 1 && editingId !== 'foco') {
      setInputError('A ordem 1 é reservada para a categoria Foco.');
      return;
    }

    const updated = editingId
      ? categories.map((c) =>
          c.id === editingId ? { ...c, label, order, isFocus: inputIsFocus } : c,
        )
      : [
          ...categories,
          { id: Date.now().toString(), label, order, isFocus: inputIsFocus },
        ];

    await updateCategories(updated);
    setModalVisible(false);
  }

  async function handleDelete(id: string) {
    if (isLockedCategory(id)) return;

    const linkedCount = sessions.filter((s) => s.categoryId === id).length;
    if (linkedCount > 0) {
      Alert.alert(
        'Não é possível excluir',
        `${linkedCount} sessão(ões) registrada(s) usam essa categoria. Remova-as no Histórico antes de excluir a categoria.`,
      );
      return;
    }

    Alert.alert('Excluir categoria', 'Deseja remover esta categoria?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await updateCategories(categories.filter((c) => c.id !== id));
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Categorias" backTo="/(tabs)/more" />

      {categories.length === 0 ? (
        <EmptyState
          icon="albums-outline"
          message="Nenhuma categoria. Toque em + para criar."
        />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Card style={styles.row}>
              <Ionicons
                name={item.isFocus ? 'flash-outline' : 'albums-outline'}
                size={18}
                color={item.isFocus ? colors.accentFrom : colors.textSecondary}
              />
              <Text style={styles.rowName} numberOfLines={1}>
                {item.label}
              </Text>
              <Text style={styles.rowOrder}>#{item.order}</Text>
              {!isLockedCategory(item.id) && (
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
              )}
            </Card>
          )}
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        />
      )}

      <FabButton accessibilityLabel="Criar categoria" onPress={openCreate} />

      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {editingId ? 'Renomear categoria' : 'Nova categoria'}
            </Text>
            <TextInput
              style={[styles.input, inputError ? styles.inputError : undefined]}
              placeholder="Nome da categoria"
              placeholderTextColor={colors.textSecondary}
              value={inputName}
              onChangeText={(value) => {
                setInputName(value);
                setInputError('');
              }}
            />
            <TextInput
              style={[styles.input, inputError ? styles.inputError : undefined]}
              placeholder="Ordem"
              placeholderTextColor={colors.textSecondary}
              value={inputOrder}
              keyboardType="number-pad"
              onChangeText={(value) => {
                setInputOrder(value.replace(/\D/g, ''));
                setInputError('');
              }}
            />
            <View style={styles.focusToggleRow}>
              <Text style={styles.focusToggleLabel}>Conta como Foco</Text>
              <Switch
                value={inputIsFocus}
                onValueChange={setInputIsFocus}
                trackColor={{ false: colors.cardBorder, true: colors.accentFrom }}
                thumbColor={inputIsFocus ? colors.textPrimary : colors.textSecondary}
              />
            </View>
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
  rowName: {
    flex: 1,
    ...typography.rowLabel,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  rowOrder: { ...typography.rowLabel, color: colors.textSecondary, fontWeight: '700' },
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
  modalTitle: { ...typography.metricMedium, color: colors.textPrimary },
  input: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...typography.rowLabel,
    color: colors.textPrimary,
    backgroundColor: colors.inputBackground,
  },
  inputError: { borderColor: colors.destructiveFrom },
  focusToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  focusToggleLabel: { ...typography.rowLabel, color: colors.textPrimary },
  errorText: { ...typography.rowLabel, color: colors.destructiveFrom },
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
  saveBtnText: { color: colors.textPrimary, ...typography.metricMedium },
});
