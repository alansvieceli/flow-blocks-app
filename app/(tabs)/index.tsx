import { AppHeader } from '../../src/components/AppHeader';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
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
import { toLocalDateString } from '../../src/lib/localDate';
import { getDailyMetrics } from '../../src/lib/metrics';
import { useAppData } from '../../src/state/AppDataProvider';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { ActiveSession, CategoryId, PersonalDailyPlan } from '../../src/types';

function elapsedSeconds(startedAt: string): number {
  return Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
}

function formatMinutes(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h}h ${min}m`;
}

export default function HomeScreen() {
  const router = useRouter();
  const {
    activeSession,
    isLoading,
    personalActivities,
    personalDailyPlans,
    personalWeeklyTemplate,
    sessions,
    setActiveSession,
    teams,
    clearActiveSession,
    updatePersonalDailyPlans,
    updateSessions,
  } = useAppData();
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [note, setNote] = useState('');
  const [noteSessionId, setNoteSessionId] = useState<string | null>(null);
  const [lastSession, setLastSession] = useState<{
    categoryId: CategoryId;
    teamId: string | null;
  } | null>(null);
  const [todayPlan, setTodayPlan] = useState<PersonalDailyPlan | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTick = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTick = useCallback(
    (startedAt: string) => {
      stopTick();
      timerRef.current = setInterval(() => {
        setElapsed(elapsedSeconds(startedAt));
      }, 1000);
    },
    [stopTick],
  );

  useEffect(() => {
    if (!activeSession) {
      stopTick();
      setElapsed(0);
      return;
    }
    setSelectedCategory(activeSession.categoryId);
    setSelectedTeamId(activeSession.teamId);
    setElapsed(elapsedSeconds(activeSession.startedAt));
    startTick(activeSession.startedAt);
    return () => stopTick();
  }, [activeSession, startTick, stopTick]);

  useEffect(() => {
    if (isLoading) return;
    const today = new Date();
    const todayStr = toLocalDateString(today);
    const existing = personalDailyPlans.find((p) => p.date === todayStr);
    if (existing) {
      setTodayPlan(existing);
      return;
    }

    const jsDay = today.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
    const dayTemplate = personalWeeklyTemplate.find((d) => d.dayOfWeek === jsDay);
    const entries: PersonalDailyPlan['entries'] = (dayTemplate?.entries ?? []).map(
      (e, i) => ({
        id: `${todayStr}-${e.activityId}-${i}`,
        activityId: e.activityId,
        plannedMinutes: e.plannedMinutes,
        done: false,
        status: 'pending',
      }),
    );
    const newPlan: PersonalDailyPlan = { date: todayStr, entries };
    setTodayPlan(newPlan);
    void updatePersonalDailyPlans([...personalDailyPlans, newPlan]);
  }, [isLoading, personalDailyPlans, personalWeeklyTemplate, updatePersonalDailyPlans]);

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
    setElapsed(0);
    startTick(session.startedAt);
  }

  async function handleStop() {
    if (!activeSession) return;
    stopTick();
    const endedAt = new Date().toISOString();
    const durationSeconds = elapsedSeconds(activeSession.startedAt);
    const newSession = {
      id: activeSession.id,
      categoryId: activeSession.categoryId,
      teamId: activeSession.teamId,
      startedAt: activeSession.startedAt,
      endedAt,
      durationSeconds,
      note: null,
    };
    await updateSessions([...sessions, newSession]);
    await clearActiveSession();
    setLastSession({
      categoryId: activeSession.categoryId,
      teamId: activeSession.teamId,
    });
    setElapsed(0);
    setNoteSessionId(newSession.id);
    setNoteModalVisible(true);
  }

  async function handleSaveNote(skip: boolean) {
    if (!skip && note.trim() && noteSessionId) {
      const updated = sessions.map((s) =>
        s.id === noteSessionId ? { ...s, note: note.trim() } : s,
      );
      await updateSessions(updated);
    }
    setNote('');
    setNoteSessionId(null);
    setNoteModalVisible(false);
  }

  function handleQuickRestart() {
    if (!lastSession) return;
    setSelectedCategory(lastSession.categoryId);
    setSelectedTeamId(lastSession.teamId);
    setLastSession(null);
  }

  const startedAtLabel = activeSession
    ? (() => {
        const d = new Date(activeSession.startedAt);
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `Iniciado às ${hh}:${mm}`;
      })()
    : '';

  return (
    <View style={styles.container}>
      <AppHeader greeting />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Daily metrics */}
        {(() => {
          const daily = getDailyMetrics(sessions, teams, new Date());
          const cols = [
            {
              label: 'TOTAL HOJE',
              value: daily.totalMinutes > 0 ? formatMinutes(daily.totalMinutes) : '--',
            },
            {
              label: 'TOP EQUIPE',
              value: daily.topTeams[0] ? daily.topTeams[0].teamName : '--',
            },
            {
              label: '2ª EQUIPE',
              value: daily.topTeams[1] ? daily.topTeams[1].teamName : '--',
            },
          ];
          return (
            <LinearGradient
              colors={[colors.cardFrom, colors.cardTo]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.metricsCard}
            >
              <View style={styles.metricsRow}>
                {cols.map((m) => (
                  <View key={m.label} style={styles.metricCol}>
                    <Text style={styles.metricValue}>{m.value}</Text>
                    <Text style={styles.metricLabel}>{m.label}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          );
        })()}

        {/* Active session card */}
        {activeSession ? (
          <LinearGradient
            colors={[colors.cardFrom, colors.cardTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <View style={styles.recordingRow}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingLabel}>Gravando</Text>
            </View>
            <Text style={styles.timerText}>{formatDuration(elapsed)}</Text>
            <View style={styles.chipsRow}>
              {CATEGORIES.filter((c) => c.id === selectedCategory).map((c) => (
                <View key={c.id} style={styles.chipActive}>
                  <LinearGradient
                    colors={[colors.accentFrom, colors.accentTo]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.chipGradient}
                  >
                    <Text style={styles.chipActiveText}>{c.label}</Text>
                  </LinearGradient>
                </View>
              ))}
              {selectedTeamId &&
                teams
                  .filter((t) => t.id === selectedTeamId)
                  .map((t) => (
                    <View key={t.id} style={styles.chipActive}>
                      <LinearGradient
                        colors={[colors.accentFrom, colors.accentTo]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.chipGradient}
                      >
                        <Text style={styles.chipActiveText}>{t.name}</Text>
                      </LinearGradient>
                    </View>
                  ))}
            </View>
            <Text style={styles.startedAtLabel}>{startedAtLabel}</Text>
            <TouchableOpacity onPress={handleStop}>
              <LinearGradient
                colors={[colors.destructiveFrom, colors.destructiveTo]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btn}
              >
                <Text style={styles.btnText}>Parar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        ) : (
          /* Novo bloco card */
          <LinearGradient
            colors={[colors.cardFrom, colors.cardTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <Text style={styles.cardSectionLabel}>NOVO BLOCO</Text>

            <Text style={styles.chipGroupLabel}>Categoria</Text>
            <View style={styles.chipsRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.8}
                >
                  {selectedCategory === cat.id ? (
                    <LinearGradient
                      colors={[colors.accentFrom, colors.accentTo]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.chipGradient}
                    >
                      <Text style={styles.chipActiveText}>{cat.label}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.chipInactive}>
                      <Text style={styles.chipInactiveText}>{cat.label}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {teamRequired && (
              <>
                <Text style={styles.chipGroupLabel}>Equipe</Text>
                <View style={styles.chipsRow}>
                  {teams.map((team) => (
                    <TouchableOpacity
                      key={team.id}
                      onPress={() => setSelectedTeamId(team.id)}
                      activeOpacity={0.8}
                    >
                      {selectedTeamId === team.id ? (
                        <LinearGradient
                          colors={[colors.accentFrom, colors.accentTo]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.chipGradient}
                        >
                          <Text style={styles.chipActiveText}>{team.name}</Text>
                        </LinearGradient>
                      ) : (
                        <View style={styles.chipInactive}>
                          <Text style={styles.chipInactiveText}>{team.name}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <TouchableOpacity
              onPress={handleStart}
              disabled={!canStart}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.accentFrom, colors.accentTo]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.btn, !canStart && styles.btnDisabled]}
              >
                <Text style={styles.btnText}>Iniciar</Text>
              </LinearGradient>
            </TouchableOpacity>

            {lastSession && (
              <TouchableOpacity style={styles.btnRestart} onPress={handleQuickRestart}>
                <Text style={styles.btnRestartText}>↩ Reiniciar última sessão</Text>
              </TouchableOpacity>
            )}
          </LinearGradient>
        )}

        {/* Esta noite card */}
        {(() => {
          const todayStr = toLocalDateString(new Date());
          const entries = todayPlan?.entries ?? [];
          const doneCount = entries.filter((e) => e.done).length;
          const preview = entries.slice(0, 3);
          const extra = entries.length - 3;
          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                router.push({ pathname: '/plano-dia', params: { date: todayStr } })
              }
            >
              <LinearGradient
                colors={['#0d2b1a', '#0a1f12']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tonightCard}
              >
                <Text style={styles.tonightHeader}>🌙 Esta noite</Text>
                {entries.length === 0 ? (
                  <Text style={styles.tonightEmpty}>
                    Nenhuma atividade planejada para hoje.
                  </Text>
                ) : (
                  <>
                    {preview.map((e) => {
                      const name =
                        personalActivities.find((a) => a.id === e.activityId)?.name ??
                        'Atividade removida';
                      return (
                        <Text key={e.id} style={styles.tonightEntry} numberOfLines={1}>
                          {e.done ? '✓ ' : '• '}
                          {name} — {e.plannedMinutes} min
                        </Text>
                      );
                    })}
                    {extra > 0 && (
                      <Text style={styles.tonightExtra}>+ {extra} mais</Text>
                    )}
                  </>
                )}
                <Text style={styles.tonightSummary}>
                  {doneCount} feito de {entries.length} planejados
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        })()}

        {/* Note modal */}
        <Modal visible={noteModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Adicionar nota</Text>
              <TextInput
                style={styles.input}
                placeholder="Nota opcional..."
                placeholderTextColor={colors.textSecondary}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  metricsCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricCol: {
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    ...typography.metricMedium,
    color: colors.accentFrom,
  },
  metricLabel: {
    ...typography.sectionLabel,
    color: colors.textSecondary,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    gap: 12,
  },
  cardSectionLabel: {
    ...typography.sectionLabel,
    color: colors.textSecondary,
  },
  chipGroupLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: -4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipGradient: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipActive: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  chipActiveText: {
    color: colors.chipActiveText,
    fontWeight: '700',
    fontSize: 13,
  },
  chipInactive: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.chipInactiveBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  chipInactiveText: {
    color: colors.chipInactiveText,
    fontSize: 13,
  },
  btn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  btnRestart: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accentFrom,
  },
  btnRestartText: {
    color: colors.accentFrom,
    fontSize: 14,
    fontWeight: '600',
  },
  recordingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.alert,
  },
  recordingLabel: {
    color: colors.alert,
    fontSize: 13,
    fontWeight: '600',
  },
  timerText: {
    ...typography.metricLarge,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  startedAtLabel: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
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
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    ...typography.screenTitle,
    color: colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: '#0a0a14',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  btnSkip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnSkipText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  btnSaveNote: {
    flex: 2,
    backgroundColor: colors.accentFrom,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnSaveNoteText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  tonightCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.success + '4d',
    padding: 14,
    gap: 6,
  },
  tonightHeader: {
    fontSize: 13,
    color: colors.success,
    fontWeight: '700',
    marginBottom: 2,
  },
  tonightEntry: { fontSize: 12, color: colors.textPrimary },
  tonightExtra: { fontSize: 11, color: colors.textSecondary },
  tonightEmpty: { fontSize: 12, color: colors.textSecondary },
  tonightSummary: {
    ...typography.sectionLabel,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
