import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../src/components/AppHeader';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  AppStateStatus,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { OptionPicker } from '../../src/components/common';
import { formatDuration } from '../../src/lib/formatDuration';
import { toLocalDateString } from '../../src/lib/localDate';
import { getDailyMetrics } from '../../src/lib/metrics';
import {
  cancelReminderNotification,
  scheduleNudgeNotification,
} from '../../src/lib/notifications';
import { useAppData } from '../../src/state/AppDataProvider';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import {
  ActiveNudge,
  ActiveSession,
  CategoryId,
  PersonalDailyPlan,
  Session,
} from '../../src/types';

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
    activeNudge,
    activeSession,
    categories,
    clearActiveNudge,
    isLoading,
    personalActivities,
    personalDailyPlans,
    personalWeeklyTemplate,
    sessions,
    setActiveNudge,
    setActiveSession,
    settings,
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
  const [todayPlan, setTodayPlan] = useState<PersonalDailyPlan | null>(null);
  const prefilledRef = useRef(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [nudgeElapsed, setNudgeElapsed] = useState(0);
  const [nudgeRemaining, setNudgeRemaining] = useState(0);
  const [showNudgeSheet, setShowNudgeSheet] = useState(false);
  const nudgeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    if (nudgeTimerRef.current) {
      clearInterval(nudgeTimerRef.current);
      nudgeTimerRef.current = null;
    }
    if (!activeNudge) {
      setNudgeElapsed(0);
      setNudgeRemaining(0);
      return;
    }
    function tick() {
      const now = Date.now();
      const elapsed = Math.floor(
        (now - new Date(activeNudge!.startedAt).getTime()) / 1000,
      );
      const remaining = Math.max(
        0,
        Math.floor((new Date(activeNudge!.endsAt).getTime() - now) / 1000),
      );
      setNudgeElapsed(elapsed);
      setNudgeRemaining(remaining);
    }
    tick();
    nudgeTimerRef.current = setInterval(tick, 1000);
    return () => {
      if (nudgeTimerRef.current) clearInterval(nudgeTimerRef.current);
    };
  }, [activeNudge]);

  useEffect(() => {
    function handleAppStateChange(next: AppStateStatus) {
      if (next !== 'active') return;
      if (!activeNudge) return;
      const endsAt = new Date(activeNudge.endsAt);
      if (endsAt > new Date()) return;
      const ageHours = (Date.now() - endsAt.getTime()) / 3_600_000;
      const abandonHours = settings.nudgeAbandonHours ?? 8;
      if (ageHours >= abandonHours) {
        void (async () => {
          if (activeNudge.notificationId) {
            await cancelReminderNotification(activeNudge.notificationId);
          }
          await clearActiveNudge();
        })();
      } else {
        setShowNudgeSheet(true);
      }
    }
    const sub = AppState.addEventListener('change', handleAppStateChange);
    handleAppStateChange('active');
    return () => sub.remove();
  }, [activeNudge, settings.nudgeAbandonHours, clearActiveNudge]);

  useEffect(() => {
    if (isLoading || prefilledRef.current || activeSession) return;
    const last = sessions[sessions.length - 1];
    if (last) {
      setSelectedCategory(last.categoryId);
      setSelectedTeamId(last.teamId);
    }
    prefilledRef.current = true;
  }, [isLoading, sessions, activeSession]);

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
        fromTemplate: true,
      }),
    );
    const newPlan: PersonalDailyPlan = { date: todayStr, entries };
    setTodayPlan(newPlan);
    if (entries.length > 0) {
      void updatePersonalDailyPlans([...personalDailyPlans, newPlan]);
    }
  }, [isLoading, personalDailyPlans, personalWeeklyTemplate, updatePersonalDailyPlans]);

  const teamRequired = teams.length > 0;
  const canStart =
    selectedCategory !== null && (!teamRequired || selectedTeamId !== null);
  const categoryItems = categories.map((category) => ({
    id: category.id,
    label: category.label,
    detail: `Ordem ${category.order}`,
  }));
  const teamItems = teams.map((team) => ({
    id: team.id,
    label: team.name,
    detail:
      team.maxWeeklyPercent !== null
        ? `Ordem ${team.order} · Meta ${team.maxWeeklyPercent}%`
        : `Ordem ${team.order}`,
  }));

  async function endNudge() {
    if (!activeNudge) return;
    if (activeNudge.notificationId) {
      await cancelReminderNotification(activeNudge.notificationId);
    }
    if (activeNudge.type === 'personal' && activeNudge.activityId) {
      const todayStr = toLocalDateString(new Date());
      const actualMinutes = Math.max(
        1,
        Math.round((Date.now() - new Date(activeNudge.startedAt).getTime()) / 60_000),
      );
      const existingPlan = personalDailyPlans.find((p) => p.date === todayStr);
      if (existingPlan) {
        const existing = existingPlan.entries.find(
          (e) => e.activityId === activeNudge.activityId,
        );
        if (existing) {
          await updatePersonalDailyPlans(
            personalDailyPlans.map((p) =>
              p.date === todayStr
                ? {
                    ...p,
                    entries: p.entries.map((e) =>
                      e.id === existing.id
                        ? { ...e, done: true, status: 'done' as const }
                        : e,
                    ),
                  }
                : p,
            ),
          );
        } else {
          await updatePersonalDailyPlans(
            personalDailyPlans.map((p) =>
              p.date === todayStr
                ? {
                    ...p,
                    entries: [
                      ...p.entries,
                      {
                        id: `${todayStr}-${activeNudge.activityId}-nudge`,
                        activityId: activeNudge.activityId!,
                        plannedMinutes: actualMinutes,
                        done: true,
                        status: 'done' as const,
                      },
                    ],
                  }
                : p,
            ),
          );
        }
      } else {
        await updatePersonalDailyPlans([
          ...personalDailyPlans,
          {
            date: todayStr,
            entries: [
              {
                id: `${todayStr}-${activeNudge.activityId}-nudge`,
                activityId: activeNudge.activityId!,
                plannedMinutes: actualMinutes,
                done: true,
                status: 'done' as const,
              },
            ],
          },
        ]);
      }
    } else if (activeNudge.type === 'work' && activeNudge.categoryId) {
      const now = new Date();
      const newSession: Session = {
        id: Date.now().toString(),
        categoryId: activeNudge.categoryId,
        teamId: activeNudge.teamId ?? null,
        startedAt: activeNudge.startedAt,
        endedAt: now.toISOString(),
        durationSeconds: Math.floor(
          (now.getTime() - new Date(activeNudge.startedAt).getTime()) / 1000,
        ),
        note: null,
      };
      await updateSessions([...sessions, newSession]);
    }
    await clearActiveNudge();
    setShowNudgeSheet(false);
  }

  async function extendNudge(extraSeconds: number) {
    if (!activeNudge) return;
    if (activeNudge.notificationId) {
      await cancelReminderNotification(activeNudge.notificationId);
    }
    const newEndsAt = new Date(Date.now() + extraSeconds * 1000).toISOString();
    const updated: ActiveNudge = {
      ...activeNudge,
      endsAt: newEndsAt,
      extendCount: activeNudge.extendCount + 1,
      notificationId: null,
    };
    const newNotifId = await scheduleNudgeNotification(updated);
    await setActiveNudge({ ...updated, notificationId: newNotifId });
    setShowNudgeSheet(false);
  }

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
            <View style={styles.metricsCard}>
              <View style={styles.metricsRow}>
                {cols.map((m) => (
                  <View key={m.label} style={styles.metricCol}>
                    <Text style={styles.metricValue}>{m.value}</Text>
                    <Text style={styles.metricLabel}>{m.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })()}

        {/* Active session card */}
        {activeSession ? (
          <View style={styles.card}>
            <View style={styles.recordingRow}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingLabel}>Gravando</Text>
            </View>
            <Text style={styles.timerText}>{formatDuration(elapsed)}</Text>
            <View style={styles.chipsRow}>
              {categories
                .filter((c) => c.id === selectedCategory)
                .map((c) => (
                  <View key={c.id} style={styles.chipActive}>
                    <Text style={styles.chipActiveText}>{c.label}</Text>
                  </View>
                ))}
              {selectedTeamId &&
                teams
                  .filter((t) => t.id === selectedTeamId)
                  .map((t) => (
                    <View key={t.id} style={styles.chipActive}>
                      <Text style={styles.chipActiveText}>{t.name}</Text>
                    </View>
                  ))}
            </View>
            <Text style={styles.startedAtLabel}>{startedAtLabel}</Text>
            <TouchableOpacity onPress={handleStop}>
              <View style={styles.btnDestructive}>
                <Text style={styles.btnText}>Parar</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          /* Novo bloco card */
          <View style={styles.card}>
            <Text style={styles.cardSectionLabel}>NOVO BLOCO</Text>

            <OptionPicker
              emptyMessage="Cadastre uma categoria em Mais > Categorias."
              items={categoryItems}
              label="Categoria"
              onSelect={setSelectedCategory}
              placeholder="Selecionar categoria"
              selectedId={selectedCategory}
            />

            {teamRequired && (
              <OptionPicker
                emptyMessage="Cadastre uma equipe em Mais > Equipes."
                items={teamItems}
                label="Equipe"
                onSelect={setSelectedTeamId}
                placeholder="Selecionar equipe"
                selectedId={selectedTeamId}
              />
            )}

            <TouchableOpacity
              onPress={handleStart}
              disabled={!canStart}
              activeOpacity={0.8}
            >
              <View style={[styles.btn, !canStart && styles.btnDisabled]}>
                <Text style={styles.btnText}>Iniciar</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Nudge section */}
        {activeNudge ? (
          <View style={styles.nudgeCard}>
            <View style={styles.nudgeTopRow}>
              <Text style={styles.nudgeBadge}>⏱ NUDGE ATIVO</Text>
              <TouchableOpacity onPress={endNudge}>
                <Text style={styles.nudgeStopBtn}>Encerrar</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.nudgeName}>{activeNudge.label}</Text>
            <View style={styles.nudgeTimesRow}>
              <View>
                <Text style={styles.nudgeRemaining}>
                  {formatDuration(nudgeRemaining)}
                </Text>
                <Text style={styles.nudgeRemainingLabel}>restantes</Text>
              </View>
              <View style={styles.nudgeTimesRight}>
                <Text style={styles.nudgeElapsed}>
                  {formatDuration(nudgeElapsed)} passados
                </Text>
                <Text style={styles.nudgeOf}>
                  de {Math.round(activeNudge.durationSeconds / 60)} min
                </Text>
              </View>
            </View>
            <View style={styles.nudgeProgressBg}>
              <View
                style={[
                  styles.nudgeProgressFill,
                  {
                    width: `${Math.min(
                      100,
                      (nudgeElapsed / activeNudge.durationSeconds) * 100,
                    )}%`,
                  },
                ]}
              />
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => router.push('/nudge-form')}
            activeOpacity={0.7}
          >
            <View style={styles.nudgeStartBtn}>
              <Text style={styles.nudgeStartText}>⏱ Iniciar nudge de atividade</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Esta noite */}
        {(() => {
          const todayStr = toLocalDateString(new Date());
          const entries = todayPlan?.entries ?? [];
          const doneCount = entries.filter((e) => e.done).length;
          const goToPlano = () =>
            router.push({ pathname: '/day-plan', params: { date: todayStr } });

          const VISIBLE = 2;
          const overflow = entries.length > VISIBLE ? entries.length - VISIBLE : 0;
          const visibleEntries = overflow > 0 ? entries.slice(0, VISIBLE) : entries;

          function fmtMins(m: number): string {
            const h = Math.floor(m / 60);
            const min = m % 60;
            if (h > 0 && min > 0) return `${h}h ${min}m`;
            if (h > 0) return `${h}h`;
            return `${min}m`;
          }

          return (
            <View style={styles.tonightSection}>
              <TouchableOpacity
                onPress={goToPlano}
                activeOpacity={0.7}
                style={styles.tonightHeaderRow}
              >
                <View style={styles.tonightHeaderLeft}>
                  <Ionicons name="moon-outline" size={14} color={colors.emerald} />
                  <Text style={styles.tonightLabel}>ESTA NOITE — PLANO PESSOAL</Text>
                </View>
                {entries.length > 0 && (
                  <Text style={styles.tonightCount}>
                    {doneCount}/{entries.length}
                  </Text>
                )}
              </TouchableOpacity>

              {entries.length === 0 ? (
                <Text style={styles.tonightEmptyText}>
                  Nenhuma atividade planejada. Toque para adicionar.
                </Text>
              ) : (
                <View style={styles.tonightCardsRow}>
                  {visibleEntries.map((entry) => {
                    const name =
                      personalActivities.find((a) => a.id === entry.activityId)?.name ??
                      'Removida';
                    const done = entry.done;
                    return (
                      <TouchableOpacity
                        key={entry.id}
                        onPress={goToPlano}
                        activeOpacity={0.8}
                        style={[styles.tonightCard, done && styles.tonightCardDone]}
                      >
                        <View style={styles.tonightAvatar}>
                          <Text style={styles.tonightAvatarText}>
                            {(name[0] ?? '?').toUpperCase()}
                          </Text>
                        </View>
                        <Text style={styles.tonightCardName} numberOfLines={1}>
                          {name}
                        </Text>
                        <Text style={styles.tonightCardDuration}>
                          {fmtMins(entry.plannedMinutes)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  {overflow > 0 && (
                    <TouchableOpacity
                      onPress={goToPlano}
                      activeOpacity={0.8}
                      style={styles.tonightCardOverflow}
                    >
                      <Text style={styles.tonightOverflowCount}>+{overflow}</Text>
                      <Text style={styles.tonightOverflowLabel}>{'ver\nplano'}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          );
        })()}

        {/* Nudge extend/end sheet */}
        <Modal visible={showNudgeSheet} transparent animationType="slide">
          <View style={styles.sheetOverlay}>
            <View style={styles.sheet}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>⏱ Tempo encerrado</Text>
                <Text style={styles.sheetSubtitle}>
                  {activeNudge?.label} ·{' '}
                  {Math.round((activeNudge?.durationSeconds ?? 0) / 60)} min
                </Text>
              </View>
              <View style={styles.sheetOptions}>
                <TouchableOpacity onPress={() => extendNudge(15 * 60)}>
                  <View style={styles.sheetOptionExtend}>
                    <Text style={styles.sheetOptionExtendText}>+ 15 minutos</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => extendNudge(30 * 60)}>
                  <View style={styles.sheetOptionExtend}>
                    <Text style={styles.sheetOptionExtendText}>+ 30 minutos</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => extendNudge(60 * 60)}>
                  <View style={styles.sheetOptionExtend}>
                    <Text style={styles.sheetOptionExtendText}>+ 60 minutos</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={endNudge}>
                  <View style={styles.sheetOptionEnd}>
                    <Text style={styles.sheetOptionEndText}>Encerrar atividade</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
    backgroundColor: colors.cardFrom,
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
    color: colors.textPrimary,
  },
  metricLabel: {
    ...typography.sectionLabel,
    color: colors.textSecondary,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardFrom,
    padding: 16,
    gap: 12,
  },
  cardSectionLabel: {
    ...typography.sectionLabel,
    color: colors.textSecondary,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipActive: {
    borderRadius: 20,
    backgroundColor: colors.accentFrom,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActiveText: {
    color: colors.chipActiveText,
    fontWeight: '700',
    fontSize: 13,
  },
  btn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.accentFrom,
  },
  btnDestructive: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.destructiveFrom,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
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
    backgroundColor: colors.inputBackground,
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
  tonightSection: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardFrom,
    padding: 14,
    gap: 12,
  },
  tonightHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tonightHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tonightLabel: {
    ...typography.sectionLabel,
    color: colors.textSecondary,
  },
  tonightCount: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tonightCardsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tonightCard: {
    flex: 1,
    height: 92,
    backgroundColor: colors.emeraldCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.emeraldBorder,
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tonightCardDone: {
    opacity: 0.4,
  },
  tonightAvatar: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: colors.emerald + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tonightAvatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.emerald,
  },
  tonightCardName: {
    fontSize: 12,
    color: colors.emeraldText,
    fontWeight: '600',
    alignSelf: 'stretch',
  },
  tonightCardDuration: {
    fontSize: 11,
    color: colors.emerald,
    fontWeight: '700',
  },
  tonightCardOverflow: {
    flex: 1,
    height: 92,
    backgroundColor: colors.emeraldCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tonightOverflowCount: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.emerald,
  },
  tonightOverflowLabel: {
    fontSize: 9,
    color: colors.emeraldDim,
    textAlign: 'center',
    lineHeight: 13,
  },
  tonightEmptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  nudgeCard: {
    backgroundColor: colors.amberCard,
    borderWidth: 1,
    borderColor: colors.amberBorder,
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  nudgeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nudgeBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.amberDim,
    letterSpacing: 0.6,
  },
  nudgeStopBtn: {
    fontSize: 11,
    color: colors.amberDim,
    borderWidth: 1,
    borderColor: colors.amberBorder,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    fontWeight: '600',
  },
  nudgeName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.amberText,
  },
  nudgeTimesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  nudgeTimesRight: {
    alignItems: 'flex-end',
  },
  nudgeRemaining: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.amberText,
  },
  nudgeRemainingLabel: {
    fontSize: 10,
    color: colors.amberDim,
  },
  nudgeElapsed: {
    fontSize: 11,
    color: colors.amberDim,
  },
  nudgeOf: {
    fontSize: 10,
    color: colors.amberBorder,
  },
  nudgeProgressBg: {
    height: 4,
    backgroundColor: colors.amberBorder,
    borderRadius: 2,
    overflow: 'hidden',
  },
  nudgeProgressFill: {
    height: '100%',
    backgroundColor: colors.amber,
    borderRadius: 2,
  },
  nudgeStartBtn: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.amberDim,
    backgroundColor: colors.amberCard,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nudgeStartText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.amber,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
    padding: 12,
    paddingBottom: 24,
  },
  sheet: {
    backgroundColor: colors.cardFrom,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  sheetHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    alignItems: 'center',
    gap: 4,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sheetOptions: {
    padding: 12,
    gap: 8,
  },
  sheetOptionExtend: {
    backgroundColor: colors.amberCard,
    borderWidth: 1,
    borderColor: colors.amberBorder,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  sheetOptionExtendText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.amberText,
  },
  sheetOptionEnd: {
    backgroundColor: '#1f0a0a',
    borderWidth: 1,
    borderColor: '#3a1010',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  sheetOptionEndText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff7070',
  },
});
