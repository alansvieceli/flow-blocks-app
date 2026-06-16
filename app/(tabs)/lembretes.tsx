import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { cancelReminderNotification } from '../../src/lib/notifications';
import { CATEGORIES } from '../../src/lib/categories';
import { getReminders, saveReminders } from '../../src/storage/remindersStorage';
import { getTeams } from '../../src/storage/teamsStorage';
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
      <LinearGradient
        colors={[colors.cardFrom, colors.cardTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.row}
      >
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
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function LembretesScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const [r, t] = await Promise.all([getReminders(), getTeams()]);
        setReminders(r);
        setTeams(t);
      }
      void load();
    }, []),
  );

  async function handleDelete(reminder: Reminder) {
    if (reminder.notificationId) {
      await cancelReminderNotification(reminder.notificationId);
    }
    const updated = reminders.filter((r) => r.id !== reminder.id);
    await saveReminders(updated);
    setReminders(updated);
  }

  function handleEdit(reminder: Reminder) {
    router.push({ pathname: '/lembrete-form', params: { id: reminder.id } });
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
      <View style={styles.header}>
        <Text style={styles.title}>Lembretes</Text>
        <TouchableOpacity
          onPress={() => router.push('/lembrete-form')}
          style={styles.addBtn}
        >
          <Text style={styles.addBtnText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      {reminders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-outline" size={48} color={colors.tabInactive} />
          <Text style={styles.emptyText}>
            Nenhum lembrete. Toque em + Novo para criar.
          </Text>
        </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 20,
  },
  title: { ...typography.screenTitle, color: colors.textPrimary },
  addBtn: { padding: 4 },
  addBtnText: { color: colors.accentFrom, fontSize: 15, fontWeight: '700' },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  listContent: { padding: 16, paddingTop: 4, paddingBottom: 32 },
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
});
