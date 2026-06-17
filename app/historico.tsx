import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { getCategoryLabel } from '../src/lib/categories';
import { formatDuration } from '../src/lib/formatDuration';
import { useAppData } from '../src/state/AppDataProvider';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { Session, Team } from '../src/types';

type FilterType = 'hoje' | 'semana' | 'mes';

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatDateGroup(iso: string): string {
  const d = new Date(iso);
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const months = [
    'jan',
    'fev',
    'mar',
    'abr',
    'mai',
    'jun',
    'jul',
    'ago',
    'set',
    'out',
    'nov',
    'dez',
  ];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function filterSessions(sessions: Session[], filter: FilterType): Session[] {
  const now = new Date();
  return sessions.filter((s) => {
    const d = new Date(s.startedAt);
    if (filter === 'hoje') return isSameDay(d, now);
    if (filter === 'semana') {
      return (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) <= 7;
    }
    return (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) <= 30;
  });
}

interface GroupedDay {
  dateKey: string;
  dateLabel: string;
  totalSeconds: number;
  sessions: Session[];
}

function groupByDay(sessions: Session[]): GroupedDay[] {
  const map = new Map<string, GroupedDay>();
  for (const s of sessions) {
    const d = new Date(s.startedAt);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!map.has(key)) {
      map.set(key, {
        dateKey: key,
        dateLabel: formatDateGroup(s.startedAt),
        totalSeconds: 0,
        sessions: [],
      });
    }
    const group = map.get(key)!;
    group.sessions.push(s);
    group.totalSeconds += s.durationSeconds;
  }
  return Array.from(map.values());
}

function SessionCard({ session, teams }: { session: Session; teams: Team[] }) {
  const team = teams.find((t) => t.id === session.teamId);
  const teamName = session.teamId ? (team?.name ?? 'Equipe removida') : 'Sem equipe';
  const teamRemoved = !team && !!session.teamId;

  return (
    <LinearGradient
      colors={[colors.cardFrom, colors.cardTo]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.sessionCard}
    >
      <View style={styles.sessionRow}>
        <Text style={styles.categoryName}>{getCategoryLabel(session.categoryId)}</Text>
        <Text style={styles.durationText}>
          {formatDuration(session.durationSeconds)}
        </Text>
      </View>
      <Text style={teamRemoved ? styles.teamRemoved : styles.teamName}>{teamName}</Text>
      <Text style={styles.timeRange}>
        {formatTime(session.startedAt)} → {formatTime(session.endedAt)}
      </Text>
      {session.note && <Text style={styles.note}>{session.note}</Text>}
    </LinearGradient>
  );
}

export default function HistoricoScreen() {
  const { sessions, teams } = useAppData();
  const [filter, setFilter] = useState<FilterType>('hoje');
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );

  const filtered = filterSessions(sortedSessions, filter);
  const groups = groupByDay(filtered);

  const filterOptions: { key: FilterType; label: string }[] = [
    { key: 'hoje', label: 'Hoje' },
    { key: 'semana', label: 'Semana' },
    { key: 'mes', label: 'Mês' },
  ];

  return (
    <View style={styles.container}>
      <ScreenHeader title="Histórico" backTo="/(tabs)/mais" />

      <View style={styles.filterRow}>
        {filterOptions.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            activeOpacity={0.8}
          >
            {filter === f.key ? (
              <LinearGradient
                colors={[colors.accentFrom, colors.accentTo]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.filterChipActive}
              >
                <Text style={styles.filterChipActiveText}>{f.label}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.filterChipInactive}>
                <Text style={styles.filterChipInactiveText}>{f.label}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {groups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhuma sessão neste período.</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(g) => g.dateKey}
          contentContainerStyle={styles.listContent}
          renderItem={({ item: group }) => (
            <View style={styles.group}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupDate}>{group.dateLabel}</Text>
                <Text style={styles.groupTotal}>
                  {formatDuration(group.totalSeconds)}
                </Text>
              </View>
              {group.sessions.map((s) => (
                <SessionCard key={s.id} session={s} teams={teams} />
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterChipActive: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterChipActiveText: {
    color: colors.chipActiveText,
    fontWeight: '700',
    fontSize: 13,
  },
  filterChipInactive: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.chipInactiveBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  filterChipInactiveText: {
    color: colors.chipInactiveText,
    fontSize: 13,
  },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { ...typography.body, color: colors.textSecondary },
  listContent: { padding: 16, gap: 16, paddingBottom: 32 },
  group: { gap: 8 },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  groupDate: { ...typography.sectionLabel, color: colors.textSecondary },
  groupTotal: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
  sessionCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    gap: 4,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: { fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  durationText: { fontSize: 14, color: colors.accentFrom, fontWeight: '700' },
  teamName: { fontSize: 13, color: colors.textSecondary },
  teamRemoved: { fontSize: 13, color: colors.textDisabled },
  timeRange: { fontSize: 12, color: colors.textSecondary },
  note: { fontSize: 12, color: colors.textSecondary, fontStyle: 'italic' },
});
