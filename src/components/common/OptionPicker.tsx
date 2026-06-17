import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export interface OptionPickerItem {
  id: string;
  label: string;
  detail?: string;
}

interface OptionPickerProps {
  emptyMessage?: string;
  label: string;
  items: OptionPickerItem[];
  onClear?: () => void;
  onSelect: (id: string) => void;
  placeholder: string;
  selectedId: string | null;
}

export function OptionPicker({
  emptyMessage = 'Nenhum item cadastrado.',
  label,
  items,
  onClear,
  onSelect,
  placeholder,
  selectedId,
}: OptionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = items.find((item) => item.id === selectedId) ?? null;

  function handleSelect(id: string) {
    onSelect(id);
    setIsOpen(false);
  }

  function handleClear() {
    onClear?.();
    setIsOpen(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.8}
        onPress={() => setIsOpen(true)}
        style={styles.field}
      >
        <Text style={selected ? styles.value : styles.placeholder} numberOfLines={1}>
          {selected?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade">
        <View style={styles.overlay}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Fechar seleção"
            activeOpacity={1}
            onPress={() => setIsOpen(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Fechar"
                hitSlop={8}
                onPress={() => setIsOpen(false)}
              >
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {onClear ? (
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={handleClear}
                style={styles.clearRow}
              >
                <Text style={styles.clearText}>Sem seleção</Text>
              </TouchableOpacity>
            ) : null}

            {items.length === 0 ? (
              <Text style={styles.emptyText}>{emptyMessage}</Text>
            ) : (
              <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                style={styles.list}
                renderItem={({ item }) => {
                  const isSelected = item.id === selectedId;
                  return (
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => handleSelect(item.id)}
                      style={[styles.row, isSelected && styles.rowSelected]}
                    >
                      <View style={styles.rowText}>
                        <Text style={styles.rowLabel} numberOfLines={1}>
                          {item.label}
                        </Text>
                        {item.detail ? (
                          <Text style={styles.rowDetail} numberOfLines={1}>
                            {item.detail}
                          </Text>
                        ) : null}
                      </View>
                      {isSelected ? (
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color={colors.accentFrom}
                        />
                      ) : null}
                    </TouchableOpacity>
                  );
                }}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  field: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.chipInactiveBackground,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  value: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  placeholder: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 14,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.58)',
  },
  sheet: {
    maxHeight: '72%',
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingBottom: 12,
  },
  sheetHeader: {
    minHeight: 54,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.tabBarBorder,
  },
  sheetTitle: {
    ...typography.screenTitle,
    color: colors.textPrimary,
    fontSize: 16,
  },
  clearRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.tabBarBorder,
  },
  clearText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    padding: 20,
    textAlign: 'center',
  },
  list: {
    maxHeight: 420,
  },
  row: {
    minHeight: 54,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowSelected: {
    backgroundColor: colors.accentSubtle,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  rowDetail: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  separator: {
    height: 1,
    backgroundColor: colors.tabBarBorder,
  },
});
