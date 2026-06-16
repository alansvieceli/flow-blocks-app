import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CATEGORIES } from '../../src/lib/categories';
import { formatDuration } from '../../src/lib/formatDuration';
import {
  clearActiveSession,
  getActiveSession,
  setActiveSession,
} from '../../src/storage/activeSessionStorage';
import { getSessions, saveSessions } from '../../src/storage/sessionsStorage';
import { getTeams } from '../../src/storage/teamsStorage';
import { ActiveSession, CategoryId, Team } from '../../src/types';

function elapsedSeconds(startedAt: string): number {
  return Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
}

export default function TrackerScreen() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [activeSession, setActive] = useState<ActiveSession | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [note, setNote] = useState('');
  const [lastSession, setLastSession] = useState<{
    categoryId: CategoryId;
    teamId: string | null;
  } | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function init() {
      const [t, active] = await Promise.all([getTeams(), getActiveSession()]);
      setTeams(t);
      if (active) {
        setActive(active);
        setSelectedCategory(active.categoryId);
        setSelectedTeamId(active.teamId);
        setElapsed(elapsedSeconds(active.startedAt));
        startTick(active.startedAt);
      }
    }
    void init();
    return () => stopTick();
  }, []);

  function startTick(startedAt: string) {
    stopTick();
    timerRef.current = setInterval(() => {
      setElapsed(elapsedSeconds(startedAt));
    }, 1000);
  }

  function stopTick() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  const teamRequired = teams.length > 0;
  const canStart =
    selectedCategory !== null && (!teamRequired || selectedTeamId !== null);

  async function handleStart() {
    if (!canStart || !selectedCategory) return;
    const session: ActiveSession = {
      id: Date.now().toString(),
      categoryId: selectedCategory,
      teamId: selectedTeamId,
      startedAt: new Date().toISOString(),
    };
    await setActiveSession(session);
    setActive(session);
    setElapsed(0);
    startTick(session.startedAt);
  }

  async function handleStop() {
    if (!activeSession) return;
    stopTick();
    const endedAt = new Date().toISOString();
    const durationSeconds = elapsedSeconds(activeSession.startedAt);
    const sessions = await getSessions();
    const newSession = {
      id: activeSession.id,
      categoryId: activeSession.categoryId,
      teamId: activeSession.teamId,
      startedAt: activeSession.startedAt,
      endedAt,
      durationSeconds,
      note: null,
    };
    await saveSessions([...sessions, newSession]);
    await clearActiveSession();
    setLastSession({
      categoryId: activeSession.categoryId,
      teamId: activeSession.teamId,
    });
    setActive(null);
    setElapsed(0);
    setNoteModalVisible(true);
  }

  async function handleSaveNote(skip: boolean) {
    if (!skip && note.trim()) {
      const sessions = await getSessions();
      const updated = sessions.map((s, i) =>
        i === sessions.length - 1 ? { ...s, note: note.trim() } : s,
      );
      await saveSessions(updated);
    }
    setNote('');
    setNoteModalVisible(false);
  }

  function handleQuickRestart() {
    if (!lastSession) return;
    setSelectedCategory(lastSession.categoryId);
    setSelectedTeamId(lastSession.teamId);
    setLastSession(null);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Tracker</Text>

      {activeSession ? (
        <View style={styles.timerBox}>
          <Text style={styles.timerLabel}>Sessão em andamento</Text>
          <Text style={styles.timer}>{formatDuration(elapsed)}</Text>
          <TouchableOpacity style={styles.btnStop} onPress={handleStop}>
            <Text style={styles.btnStopText}>Parar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.sectionLabel}>Categoria</Text>
          <View style={styles.optionsRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.option,
                  selectedCategory === cat.id && styles.optionSelected,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedCategory === cat.id && styles.optionTextSelected,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {teamRequired && (
            <>
              <Text style={styles.sectionLabel}>Equipe</Text>
              <View style={styles.optionsRow}>
                {teams.map((team) => (
                  <TouchableOpacity
                    key={team.id}
                    style={[
                      styles.option,
                      selectedTeamId === team.id && styles.optionSelected,
                    ]}
                    onPress={() => setSelectedTeamId(team.id)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedTeamId === team.id && styles.optionTextSelected,
                      ]}
                    >
                      {team.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.btnStart, !canStart && styles.btnDisabled]}
            onPress={handleStart}
            disabled={!canStart}
          >
            <Text style={styles.btnStartText}>Iniciar</Text>
          </TouchableOpacity>

          {lastSession && (
            <TouchableOpacity style={styles.btnRestart} onPress={handleQuickRestart}>
              <Text style={styles.btnRestartText}>↩ Reiniciar última sessão</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      <Modal visible={noteModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Adicionar nota</Text>
            <TextInput
              style={styles.input}
              placeholder="Nota opcional..."
              value={note}
              onChangeText={setNote}
              maxLength={200}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.btnSkip}
                onPress={() => handleSaveNote(true)}
              >
                <Text style={styles.btnSkipText}>Pular</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnSaveNote}
                onPress={() => handleSaveNote(false)}
              >
                <Text style={styles.btnSaveNoteText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  sectionLabel: { fontSize: 15, fontWeight: '600', marginTop: 8 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  optionSelected: { borderColor: '#1a73e8', backgroundColor: '#e8f0fe' },
  optionText: { fontSize: 14, color: '#444' },
  optionTextSelected: { color: '#1a73e8', fontWeight: '600' },
  btnStart: {
    marginTop: 16,
    backgroundColor: '#1a73e8',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDisabled: { backgroundColor: '#aaa' },
  btnStartText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnRestart: {
    marginTop: 8,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a73e8',
  },
  btnRestartText: { color: '#1a73e8', fontSize: 15, fontWeight: '600' },
  timerBox: { alignItems: 'center', gap: 12, marginTop: 32 },
  timerLabel: { fontSize: 15, color: '#555' },
  timer: {
    fontSize: 56,
    fontWeight: '700',
    color: '#1a73e8',
    fontVariant: ['tabular-nums'],
  },
  btnStop: {
    backgroundColor: '#d93025',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 8,
  },
  btnStopText: { color: '#fff', fontSize: 16, fontWeight: '700' },
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
    gap: 12,
  },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  modalActions: { flexDirection: 'row', gap: 10 },
  btnSkip: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnSkipText: { color: '#555', fontSize: 15 },
  btnSaveNote: {
    flex: 2,
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnSaveNoteText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
