import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CATEGORIES } from '../../src/lib/categories';
import {
  CategoryMetrics,
  TeamBalanceAlert,
  TeamMetrics,
  getDailyMetrics,
  getContextSwitches,
  getHeatmapData,
  getStreak,
  getTeamBalanceAlerts,
  getWeeklyMetricsByCategory,
  getWeeklyMetricsByTeam,
} from '../../src/lib/metrics';
import { getSessions } from '../../src/storage/sessionsStorage';
import { getTeams } from '../../src/storage/teamsStorage';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { Session, Team } from '../../src/types';

const DAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const HOUR_LABELS = [0, 6, 12, 18];

function formatMinutes(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h}h ${min}m`;
}

function MetricBar({
  value,
  total,
  accent,
}: {
  value: number;
  total: number;
  accent: 'primary' | 'alert';
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  if (accent === 'primary') {
    return (
      <View style={styles.barTrack}>
        <LinearGradient
          colors={[colors.accentFrom, colors.accentTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.barFill, { width: `${pct}%` }]}
        />
      </View>
    );
  }
  return (
    <View style={styles.barTrack}>
      <View
        style={[styles.barFill, { width: `${pct}%`, backgroundColor: colors.alert }]}
      />
    </View>
  );
}

function WeeklySection({
  categoryMetrics,
  teamMetrics,
  alerts,
}: {
  categoryMetrics: CategoryMetrics;
  teamMetrics: TeamMetrics[];
  alerts: TeamBalanceAlert[];
}) {
  const total = categoryMetrics.totalMinutes;
  const alertIds = new Set(alerts.map((a) => a.teamId));

  return (
    <>
      <Text style={styles.sectionLabel}>ESTA SEMANA</Text>

      {/* Category card */}
      <LinearGradient
        colors={[colors.cardFrom, colors.cardTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Foco Profundo</Text>
          <MetricBar
            value={categoryMetrics.deepWorkMinutes}
            total={total}
            accent="primary"
          />
          <Text style={styles.metricValue}>
            {formatMinutes(categoryMetrics.deepWorkMinutes)}
          </Text>
        </View>
        <View style={[styles.metricRow, styles.metricRowSpaced]}>
          <Text style={styles.metricLabel}>Interrupções</Text>
          <MetricBar
            value={categoryMetrics.interruptionMinutes}
            total={total}
            accent="alert"
          />
          <Text style={styles.metricValue}>
            {formatMinutes(categoryMetrics.interruptionMinutes)}
          </Text>
        </View>
      </LinearGradient>

      {/* Team card */}
      <LinearGradient
        colors={[colors.cardFrom, colors.cardTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {teamMetrics.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma equipe registrada esta semana.</Text>
        ) : (
          teamMetrics.map((tm) => (
            <View key={tm.teamId} style={[styles.metricRow, styles.metricRowBottom]}>
              <View style={styles.teamLabelRow}>
                <Text style={styles.metricLabel} numberOfLines={1}>
                  {tm.teamName}
                </Text>
                {alertIds.has(tm.teamId) && <Text style={styles.alertIcon}> ⚠️</Text>}
              </View>
              <MetricBar value={tm.minutes} total={total} accent="primary" />
              <Text style={styles.metricValue}>
                {tm.percentage}% · {formatMinutes(tm.minutes)}
              </Text>
            </View>
          ))
        )}
      </LinearGradient>
    </>
  );
}

function HeatmapSection({ sessions, teams }: { sessions: Session[]; teams: Team[] }) {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const matrix = useMemo(
    () =>
      getHeatmapData(sessions, {
        teamId: selectedTeamId ?? undefined,
        categoryId: selectedCategoryId ?? undefined,
      }),
    [sessions, selectedTeamId, selectedCategoryId],
  );

  const maxVal = useMemo(() => Math.max(...matrix.flat(), 1), [matrix]);

  function cellColor(val: number): string {
    if (val === 0) return colors.cardBorder;
    const intensity = Math.min(val / maxVal, 1);
    const r = Math.round(124 + (124 - 124) * intensity); // accentFrom #7c3aed → keep purple
    const g = Math.round(58 * (1 - intensity));
    const b = Math.round(237 * intensity);
    const hex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${hex(r)}${hex(g)}${hex(b)}`;
  }

  return (
    <>
      <Text style={styles.sectionLabel}>MAPA DE CALOR</Text>

      {/* Team filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
      >
        <View style={styles.chipsRow}>
          <TouchableOpacity onPress={() => setSelectedTeamId(null)} activeOpacity={0.8}>
            {selectedTeamId === null ? (
              <LinearGradient
                colors={[colors.accentFrom, colors.accentTo]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.chip}
              >
                <Text style={styles.chipActiveText}>Todas as equipes</Text>
              </LinearGradient>
            ) : (
              <View style={styles.chipInactive}>
                <Text style={styles.chipInactiveText}>Todas as equipes</Text>
              </View>
            )}
          </TouchableOpacity>
          {teams.map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => setSelectedTeamId(selectedTeamId === t.id ? null : t.id)}
              activeOpacity={0.8}
            >
              {selectedTeamId === t.id ? (
                <LinearGradient
                  colors={[colors.accentFrom, colors.accentTo]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.chip}
                >
                  <Text style={styles.chipActiveText}>{t.name}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.chipInactive}>
                  <Text style={styles.chipInactiveText}>{t.name}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Category filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
      >
        <View style={styles.chipsRow}>
          <TouchableOpacity
            onPress={() => setSelectedCategoryId(null)}
            activeOpacity={0.8}
          >
            {selectedCategoryId === null ? (
              <LinearGradient
                colors={[colors.accentFrom, colors.accentTo]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.chip}
              >
                <Text style={styles.chipActiveText}>Todas as categorias</Text>
              </LinearGradient>
            ) : (
              <View style={styles.chipInactive}>
                <Text style={styles.chipInactiveText}>Todas as categorias</Text>
              </View>
            )}
          </TouchableOpacity>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() =>
                setSelectedCategoryId(selectedCategoryId === c.id ? null : c.id)
              }
              activeOpacity={0.8}
            >
              {selectedCategoryId === c.id ? (
                <LinearGradient
                  colors={[colors.accentFrom, colors.accentTo]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.chip}
                >
                  <Text style={styles.chipActiveText}>{c.label}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.chipInactive}>
                  <Text style={styles.chipInactiveText}>{c.label}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Heatmap grid */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Hour labels */}
          <View style={styles.heatmapHourRow}>
            <View style={styles.heatmapDayLabel} />
            {Array.from({ length: 24 }, (_, h) => (
              <View key={h} style={styles.heatmapCell}>
                {HOUR_LABELS.includes(h) ? (
                  <Text style={styles.heatmapHourLabel}>{h}</Text>
                ) : null}
              </View>
            ))}
          </View>
          {matrix.map((row, dayIdx) => (
            <View key={dayIdx} style={styles.heatmapRow}>
              <Text style={styles.heatmapDayLabel}>{DAY_LABELS[dayIdx]}</Text>
              {row.map((val, hourIdx) => (
                <View
                  key={hourIdx}
                  style={[styles.heatmapCell, { backgroundColor: cellColor(val) }]}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

function ExtrasSection({ sessions, teams }: { sessions: Session[]; teams: Team[] }) {
  const today = new Date();
  const streak = getStreak(sessions, today);
  const contextSwitches = getContextSwitches(sessions, today);
  const alerts = getTeamBalanceAlerts(sessions, teams, today);
  const dailyMetrics = getDailyMetrics(sessions, teams, today);
  const todayStr = today.toISOString().slice(0, 10);
  const hasTodaySession = sessions.some((s) => s.endedAt.slice(0, 10) === todayStr);

  return (
    <>
      {/* Streak */}
      <Text style={styles.sectionLabel}>SEQUÊNCIA</Text>
      <LinearGradient
        colors={[colors.cardFrom, colors.cardTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.streakRow}>
          <Text style={styles.streakNumber}>{streak}</Text>
          <View style={styles.streakLabels}>
            <Text style={styles.streakLabel}>dias consecutivos</Text>
            <Text style={styles.streakSub}>
              {hasTodaySession ? 'Inclui hoje' : 'Até ontem'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Context switches */}
      <Text style={styles.sectionLabel}>TROCAS DE CONTEXTO</Text>
      <LinearGradient
        colors={[colors.cardFrom, colors.cardTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Hoje</Text>
          <Text style={styles.switchValue}>{contextSwitches.today}</Text>
          <Text style={styles.switchUnit}>trocas</Text>
        </View>
        <View style={[styles.switchRow, styles.switchRowSpaced]}>
          <Text style={styles.switchLabel}>Esta semana</Text>
          <Text style={styles.switchValue}>{contextSwitches.week}</Text>
          <Text style={styles.switchUnit}>trocas</Text>
        </View>
      </LinearGradient>

      {/* Team balance alerts */}
      {alerts.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>ALERTAS DE EQUIPE</Text>
          {alerts.map((alert) => (
            <View key={alert.teamId} style={styles.alertCard}>
              <Text style={styles.alertText}>
                ⚠️ {alert.teamName}: {alert.actualPercent}% (meta:{' '}
                {alert.maxWeeklyPercent}%)
              </Text>
            </View>
          ))}
        </>
      )}

      {/* Daily summary */}
      {dailyMetrics.totalMinutes > 0 && (
        <>
          <Text style={styles.sectionLabel}>HOJE</Text>
          <LinearGradient
            colors={[colors.cardFrom, colors.cardTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <Text style={styles.dailyTotal}>
              {formatMinutes(dailyMetrics.totalMinutes)}
            </Text>
            {dailyMetrics.topTeams.map((t) => (
              <Text key={t.teamName} style={styles.dailyTeam}>
                {t.teamName}: {formatMinutes(t.minutes)}
              </Text>
            ))}
          </LinearGradient>
        </>
      )}
    </>
  );
}

export default function PainelScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const [s, t] = await Promise.all([getSessions(), getTeams()]);
        setSessions(s);
        setTeams(t);
      }
      void load();
    }, []),
  );

  const today = new Date();
  const categoryMetrics = getWeeklyMetricsByCategory(sessions, today);
  const teamMetrics = getWeeklyMetricsByTeam(sessions, teams, today);
  const alerts = getTeamBalanceAlerts(sessions, teams, today);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.screenTitle}>Painel</Text>
        <Ionicons name="stats-chart-outline" size={20} color={colors.accentFrom} />
      </View>

      <WeeklySection
        categoryMetrics={categoryMetrics}
        teamMetrics={teamMetrics}
        alerts={alerts}
      />

      <HeatmapSection sessions={sessions} teams={teams} />

      <ExtrasSection sessions={sessions} teams={teams} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  screenTitle: { ...typography.screenTitle, color: colors.textPrimary },
  sectionLabel: {
    ...typography.sectionLabel,
    color: colors.textSecondary,
    marginTop: 4,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
  },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metricRowSpaced: { marginTop: 10 },
  metricRowBottom: { marginBottom: 8 },
  teamLabelRow: { flexDirection: 'row', alignItems: 'center', width: 80 },
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    width: 80,
  },
  metricValue: {
    fontSize: 11,
    color: colors.textSecondary,
    minWidth: 60,
    textAlign: 'right',
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.chipInactiveBackground,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: { height: 6, borderRadius: 3 },
  alertIcon: { fontSize: 12 },
  emptyText: { ...typography.body, color: colors.textSecondary },
  chipsScroll: { marginVertical: 4 },
  chipsRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  chipActiveText: { color: colors.chipActiveText, fontSize: 12, fontWeight: '700' },
  chipInactive: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.chipInactiveBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  chipInactiveText: { color: colors.chipInactiveText, fontSize: 12 },
  heatmapHourRow: { flexDirection: 'row', marginBottom: 2 },
  heatmapRow: { flexDirection: 'row', marginBottom: 2, alignItems: 'center' },
  heatmapDayLabel: {
    width: 28,
    fontSize: 9,
    color: colors.textSecondary,
    textAlign: 'right',
    marginRight: 4,
  },
  heatmapCell: {
    width: 12,
    height: 12,
    marginHorizontal: 1,
    borderRadius: 2,
    backgroundColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heatmapHourLabel: {
    fontSize: 7,
    color: colors.textSecondary,
  },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  streakNumber: { ...typography.metricLarge, color: colors.accentFrom },
  streakLabels: { gap: 2 },
  streakLabel: { fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  streakSub: { fontSize: 11, color: colors.textSecondary },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  switchRowSpaced: { marginTop: 8 },
  switchLabel: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  switchValue: { ...typography.metricMedium, color: colors.textPrimary },
  switchUnit: { fontSize: 11, color: colors.textSecondary },
  alertCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.alert,
    padding: 12,
    backgroundColor: '#1a0e00',
  },
  alertText: { color: colors.alert, fontSize: 13, fontWeight: '600' },
  dailyTotal: {
    ...typography.metricMedium,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  dailyTeam: { fontSize: 12, color: colors.textSecondary },
});
