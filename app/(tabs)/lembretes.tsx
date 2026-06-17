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
import { AppHeader } from '../../src/components/AppHeader';
import { Card, EmptyState, FabButton, LoadingState } from '../../src/components/common';
import { ReminderForm } from '../../src/components/reminders/ReminderForm';
import { cancelReminderNotification } from '../../src/lib/notifications';
import { CATEGORIES } from '../../src/lib/categories';
import { useAppData } from '../../src/state/AppDataProvider';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { Reminder, Team } from '../../src/types';

function formatDatetime(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} às ${hh}:${min}`;
}

function ReminderRow({
  reminder,
  teams,
  onDelete,
  onEdit,
}: {
  reminder: Reminder;
  teams: Team[];
  onDelete: (r: Reminder) => void;
  onEdit: (r: Reminder) => void;
}) {
  const team = teams.find((t) => t.id === reminder.teamId);
  const category = CATEGORIES.find((c) => c.id === reminder.categoryId);

  return (
    <TouchableOpacity onPress={() => onEdit(reminder)} activeOpacity={0.8}>
      <Card style={styles.row}>
        <Ionicons
          name="notifications-outline"
          size={18}
          color={colors.accentFrom}
          style={styles.rowIcon}
        />
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {reminder.title}
          </Text>
          {reminder.description && (
            <Text style={styles.rowDesc} numberOfLines={1}>
              {reminder.description}
            </Text>
          )}
          <Text style={styles.rowDatetime}>{formatDatetime(reminder.datetime)}</Text>
          <View style={styles.badgesRow}>
            {category && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{category.label}</Text>
              </View>
            )}
            {team && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{team.name}</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={() => onDelete(reminder)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={18} color={colors.destructiveFrom} />
        </TouchableOpacity>
      </Card>
    </TouchableOpacity>
  );
}

export default function LembretesScreen() {
  const { isLoading, reminders, teams, updateReminders } = useAppData();
  const [formReminderId, setFormReminderId] = useState<string | undefined>();
  const [isFormVisible, setIsFormVisible] = useState(false);

  async function handleDelete(reminder: Reminder) {
    if (reminder.notificationId) {
      await cancelReminderNotification(reminder.notificationId);
    }
    const updated = reminders.filter((r) => r.id !== reminder.id);
    await updateReminders(updated);
  }

  function handleEdit(reminder: Reminder) {
    setFormReminderId(reminder.id);
    setIsFormVisible(true);
  }

  function handleCreate() {
    setFormReminderId(undefined);
    setIsFormVisible(true);
  }

  function handleCloseForm() {
    setIsFormVisible(false);
  }

  const now = new Date();
  const upcoming = reminders
    .filter((r) => new Date(r.datetime) >= now)
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
  const past = reminders
    .filter((r) => new Date(r.datetime) < now)
    .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());

  return (
    <View style={styles.container}>
      <AppHeader title="Lembretes" />

      {isLoading && reminders.length === 0 ? (
        <LoadingState message="Carregando lembretes..." />
      ) : reminders.length === 0 ? (
        <EmptyState
          icon="notifications-outline"
          message="Nenhum lembrete. Toque em + para criar."
        />
      ) : (
        <FlatList
          data={[
            ...upcoming.map((r) => ({ ...r, _section: 'upcoming' as const })),
            ...past.map((r) => ({ ...r, _section: 'past' as const })),
          ]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={item._section === 'past' ? styles.pastItem : undefined}>
              <ReminderRow
                reminder={item}
                teams={teams}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            </View>
          )}
          ListHeaderComponent={() => (
            <>
              {upcoming.length > 0 && <Text style={styles.sectionLabel}>PRÓXIMOS</Text>}
            </>
          )}
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        />
      )}

      <FabButton accessibilityLabel="Criar lembrete" onPress={handleCreate} />

      <Modal
        animationType="slide"
        presentationStyle="overFullScreen"
        transparent
        visible={isFormVisible}
        onRequestClose={handleCloseForm}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Fechar formulário"
            activeOpacity={1}
            onPress={handleCloseForm}
            style={styles.modalBackdrop}
          />
          <ReminderForm reminderId={formReminderId} onClose={handleCloseForm} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 16, paddingTop: 4, paddingBottom: 100 },
  itemSeparator: { height: 8 },
  sectionLabel: {
    ...typography.sectionLabel,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  pastItem: { opacity: 0.45 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    gap: 10,
  },
  rowIcon: { marginTop: 2 },
  rowContent: { flex: 1, gap: 3 },
  rowTitle: { fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  rowDesc: { ...typography.body, color: colors.textSecondary },
  rowDatetime: { fontSize: 12, color: colors.textSecondary },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  badge: {
    backgroundColor: colors.chipInactiveBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 11, color: colors.chipInactiveText },
  deleteBtn: { padding: 4 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
});
