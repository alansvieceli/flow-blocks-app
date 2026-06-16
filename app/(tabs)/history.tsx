import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { getCategoryLabel } from '../../src/lib/categories';
import { formatDuration } from '../../src/lib/formatDuration';
import { getSessions } from '../../src/storage/sessionsStorage';
import { getTeams } from '../../src/storage/teamsStorage';
import { Session, Team } from '../../src/types';

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

interface SessionItemProps {
  session: Session;
  teams: Team[];
}

function SessionItem({ session, teams }: SessionItemProps) {
  const team = teams.find((t) => t.id === session.teamId);
  const teamName = session.teamId ? (team?.name ?? 'Equipe removida') : 'Sem equipe';

  return (
    <View style={styles.item}>
      <View style={styles.itemHeader}>
        <Text style={styles.date}>{formatDate(session.startedAt)}</Text>
        <Text style={styles.duration}>{formatDuration(session.durationSeconds)}</Text>
      </View>
      <Text style={styles.time}>
        {formatTime(session.startedAt)} → {formatTime(session.endedAt)}
      </Text>
      <Text style={styles.category}>{getCategoryLabel(session.categoryId)}</Text>
      <Text style={styles.team}>{teamName}</Text>
      {session.note ? <Text style={styles.note}>{session.note}</Text> : null}
    </View>
  );
}

export default function HistoryScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    async function load() {
      const [s, t] = await Promise.all([getSessions(), getTeams()]);
      const sorted = [...s].sort(
        (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
      );
      setSessions(sorted);
      setTeams(t);
    }
    void load();
  }, []);

  if (sessions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhuma sessão registrada ainda.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      data={sessions}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <SessionItem session={item} teams={teams} />}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  listContent: { padding: 16, gap: 12 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, color: '#888' },
  item: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: { fontSize: 14, fontWeight: '600', color: '#222' },
  duration: { fontSize: 14, fontWeight: '600', color: '#555' },
  time: { fontSize: 13, color: '#555' },
  category: { fontSize: 13, color: '#444' },
  team: { fontSize: 13, color: '#666' },
  note: { fontSize: 12, color: '#888', fontStyle: 'italic' },
});
