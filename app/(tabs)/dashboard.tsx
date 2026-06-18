import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppHeader } from '../../src/components/AppHeader';
import { toLocalDateString } from '../../src/lib/localDate';
import {
  CategoryMetrics,
  TeamMetrics,
  WorkEfficiency,
  WorkSchedule,
  getDailyMetrics,
  getHeatmapData,
  getStreak,
  getWeeklyMetricsByCategory,
  getWeeklyMetricsByTeam,
  getWorkEfficiency,
} from '../../src/lib/metrics';
import { getPersonalDoneMinutesByActivity } from '../../src/lib/personalMetrics';
import { useAppData } from '../../src/state/AppDataProvider';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { Category, Session, Team } from '../../src/types';

const DAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const HOUR_LABELS = [0, 6, 12, 18];

function SectionTitle({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <Ionicons name={icon} size={12} color={colors.textSecondary} />
      <Text style={styles.sectionLabel}>{label}</Text>
    </View>
  );
}

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
        <View
          style={[
            styles.barFill,
            { width: `${pct}%`, backgroundColor: colors.accentFrom },
          ]}
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
  weekIdleMinutes,
}: {
  categoryMetrics: CategoryMetrics;
  teamMetrics: TeamMetrics[];
  weekIdleMinutes: number;
}) {
  const total = categoryMetrics.totalMinutes;

  return (
    <>
      <SectionTitle icon="calendar-outline" label="ESTA SEMANA" />

      <View style={styles.card}>
        <View style={styles.metricRow}>
          <View style={styles.metricLabelRow}>
            <Ionicons name="flash-outline" size={11} color={colors.textSecondary} />
            <Text style={styles.metricLabel}>Foco Profundo</Text>
          </View>
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
          <View style={styles.metricLabelRow}>
            <Ionicons name="shuffle-outline" size={11} color={colors.textSecondary} />
            <Text style={styles.metricLabel}>Interrupções</Text>
          </View>
          <MetricBar
            value={categoryMetrics.interruptionMinutes}
            total={total}
            accent="alert"
          />
          <Text style={styles.metricValue}>
            {formatMinutes(categoryMetrics.interruptionMinutes)}
          </Text>
        </View>
        <View style={[styles.metricRow, styles.metricRowSpaced]}>
          <View style={styles.metricLabelRow}>
            <Ionicons name="time-outline" size={11} color={colors.textSecondary} />
            <Text style={styles.metricLabel}>Ocioso</Text>
          </View>
          <MetricBar
            value={weekIdleMinutes}
            total={categoryMetrics.totalMinutes + weekIdleMinutes}
            accent="primary"
          />
          <Text style={styles.metricValue}>{formatMinutes(weekIdleMinutes)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        {teamMetrics.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma equipe registrada esta semana.</Text>
        ) : (
          teamMetrics.map((tm) => (
            <View key={tm.teamId} style={[styles.metricRow, styles.metricRowBottom]}>
              <View style={styles.teamLabelRow}>
                <Text style={styles.teamLabel} numberOfLines={1}>
                  {tm.teamName}
                </Text>
              </View>
              <MetricBar value={tm.minutes} total={total} accent="primary" />
              <Text style={styles.metricValue}>
                {tm.percentage}% · {formatMinutes(tm.minutes)}
              </Text>
            </View>
          ))
        )}
      </View>
    </>
  );
}

function HeatmapSection({
  categories,
  sessions,
  teams,
  schedule,
}: {
  categories: Category[];
  sessions: Session[];
  teams: Team[];
  schedule: WorkSchedule;
}) {
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

  function isWorkCell(dayIdx: number, hourIdx: number): boolean {
    return (
      dayIdx <= 4 && hourIdx >= schedule.workStartHour && hourIdx < schedule.workEndHour
    );
  }

  function cellColor(val: number, dayIdx: number, hourIdx: number): string {
    if (val > 0) {
      const intensity = Math.min(val / maxVal, 1);
      const r = Math.round(124 + (124 - 124) * intensity);
      const g = Math.round(58 * (1 - intensity));
      const b = Math.round(237 * intensity);
      const hex = (n: number) => n.toString(16).padStart(2, '0');
      return `#${hex(r)}${hex(g)}${hex(b)}`;
    }
    if (isWorkCell(dayIdx, hourIdx)) return '#1e1e2e';
    return colors.cardBorder;
  }

  return (
    <>
      <SectionTitle icon="grid-outline" label="MAPA DE CALOR" />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
      >
        <View style={styles.chipsRow}>
          <TouchableOpacity onPress={() => setSelectedTeamId(null)} activeOpacity={0.8}>
            {selectedTeamId === null ? (
              <View style={styles.chip}>
                <Text style={styles.chipActiveText}>Todas as equipes</Text>
              </View>
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
                <View style={styles.chip}>
                  <Text style={styles.chipActiveText}>{t.name}</Text>
                </View>
              ) : (
                <View style={styles.chipInactive}>
                  <Text style={styles.chipInactiveText}>{t.name}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

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
              <View style={styles.chip}>
                <Text style={styles.chipActiveText}>Todas as categorias</Text>
              </View>
            ) : (
              <View style={styles.chipInactive}>
                <Text style={styles.chipInactiveText}>Todas as categorias</Text>
              </View>
            )}
          </TouchableOpacity>
          {categories.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() =>
                setSelectedCategoryId(selectedCategoryId === c.id ? null : c.id)
              }
              activeOpacity={0.8}
            >
              {selectedCategoryId === c.id ? (
                <View style={styles.chip}>
                  <Text style={styles.chipActiveText}>{c.label}</Text>
                </View>
              ) : (
                <View style={styles.chipInactive}>
                  <Text style={styles.chipInactiveText}>{c.label}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
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
                  style={[
                    styles.heatmapCell,
                    { backgroundColor: cellColor(val, dayIdx, hourIdx) },
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

function ExtrasSection({
  sessions,
  teams,
  today,
}: {
  sessions: Session[];
  teams: Team[];
  today: Date;
}) {
  const streak = getStreak(sessions, today);
  const dailyMetrics = getDailyMetrics(sessions, teams, today);
  const todayStr = toLocalDateString(today);
  const hasTodaySession = sessions.some(
    (s) => toLocalDateString(new Date(s.endedAt)) === todayStr,
  );

  return (
    <>
      <SectionTitle icon="flame-outline" label="SEQUÊNCIA" />
      <View style={styles.card}>
        <View style={styles.streakRow}>
          <Text style={styles.streakNumber}>{streak}</Text>
          <View style={styles.streakLabels}>
            <Text style={styles.streakLabel}>dias consecutivos</Text>
            <Text style={styles.streakSub}>
              {hasTodaySession ? 'Inclui hoje' : 'Até ontem'}
            </Text>
          </View>
        </View>
      </View>

      {dailyMetrics.totalMinutes > 0 && (
        <>
          <SectionTitle icon="today-outline" label="HOJE" />
          <View style={styles.card}>
            <Text style={styles.dailyTotal}>
              {formatMinutes(dailyMetrics.totalMinutes)}
            </Text>
            {dailyMetrics.topTeams.map((t) => (
              <Text key={t.teamName} style={styles.dailyTeam}>
                {t.teamName}: {formatMinutes(t.minutes)}
              </Text>
            ))}
          </View>
        </>
      )}
    </>
  );
}

function EfficiencySection({ efficiency }: { efficiency: WorkEfficiency }) {
  function pct(worked: number, available: number): string {
    if (available === 0) return '—';
    return `${Math.round((worked / available) * 100)}%`;
  }

  return (
    <>
      <SectionTitle icon="speedometer-outline" label="APROVEITAMENTO" />
      <View style={styles.card}>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Hoje</Text>
          <Text style={styles.switchValue}>
            {formatMinutes(efficiency.todayWorkedMinutes)}
          </Text>
          <Text style={styles.switchUnit}>
            / {formatMinutes(efficiency.todayAvailableMinutes)} (
            {pct(efficiency.todayWorkedMinutes, efficiency.todayAvailableMinutes)})
          </Text>
        </View>
        <View style={[styles.switchRow, styles.switchRowSpaced]}>
          <Text style={styles.switchLabel}>Esta semana</Text>
          <Text style={styles.switchValue}>
            {formatMinutes(efficiency.weekWorkedMinutes)}
          </Text>
          <Text style={styles.switchUnit}>
            / {formatMinutes(efficiency.weekAvailableMinutes)} (
            {pct(efficiency.weekWorkedMinutes, efficiency.weekAvailableMinutes)})
          </Text>
        </View>
      </View>
    </>
  );
}

function PersonalChartSection() {
  const { personalActivities, personalDailyPlans } = useAppData();
  const [chartPeriod, setChartPeriod] = useState<'currentWeek' | 'last4Weeks'>(
    'currentWeek',
  );
  const chartData = getPersonalDoneMinutesByActivity(
    personalDailyPlans,
    personalActivities,
    {
      period: chartPeriod,
      today: new Date(),
    },
  );
  const total = chartData.reduce((acc, d) => acc + d.minutes, 0);

  return (
    <>
      <SectionTitle icon="leaf-outline" label="ATIVIDADES PESSOAIS" />
      <View style={styles.card}>
        <View style={styles.chipsRowWrap}>
          {(['currentWeek', 'last4Weeks'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setChartPeriod(p)}
              activeOpacity={0.8}
            >
              {chartPeriod === p ? (
                <View style={styles.chip}>
                  <Text style={styles.chipActiveText}>
                    {p === 'currentWeek' ? 'Esta semana' : 'Últimas 4 sem'}
                  </Text>
                </View>
              ) : (
                <View style={styles.chipInactive}>
                  <Text style={styles.chipInactiveText}>
                    {p === 'currentWeek' ? 'Esta semana' : 'Últimas 4 sem'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {chartData.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma atividade concluída no período.</Text>
        ) : (
          chartData.map((d) => {
            const pct = total > 0 ? (d.minutes / total) * 100 : 0;
            const h = Math.floor(d.minutes / 60);
            const m = d.minutes % 60;
            return (
              <View key={d.activityName} style={styles.chartRow}>
                <View style={styles.chartLabelRow}>
                  <Text style={styles.chartLabel} numberOfLines={1}>
                    {d.activityName}
                  </Text>
                  <Text style={styles.chartValue}>
                    {h}h {m}m
                  </Text>
                </View>
                <View style={styles.chartBarTrack}>
                  <View style={[styles.chartBarFill, { width: `${pct}%` }]} />
                </View>
              </View>
            );
          })
        )}
      </View>
    </>
  );
}

export default function DashboardScreen() {
  const { categories, sessions, settings, teams } = useAppData();

  const today = new Date();
  const schedule: WorkSchedule = {
    workStartHour: settings.workStartHour,
    workEndHour: settings.workEndHour,
    lunchDurationMinutes: settings.lunchDurationMinutes,
  };

  const categoryMetrics = getWeeklyMetricsByCategory(sessions, today);
  const teamMetrics = getWeeklyMetricsByTeam(sessions, teams, today);
  const efficiency = getWorkEfficiency(sessions, schedule, today);

  return (
    <View style={styles.container}>
      <AppHeader title="Painel" />
      <ScrollView contentContainerStyle={styles.content}>
        <WeeklySection
          categoryMetrics={categoryMetrics}
          teamMetrics={teamMetrics}
          weekIdleMinutes={efficiency.weekIdleMinutes}
        />

        <HeatmapSection
          categories={categories}
          sessions={sessions}
          teams={teams}
          schedule={schedule}
        />

        <ExtrasSection sessions={sessions} teams={teams} today={today} />

        <EfficiencySection efficiency={efficiency} />

        <PersonalChartSection />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  sectionLabel: {
    ...typography.sectionLabel,
    color: colors.textSecondary,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardFrom,
    padding: 14,
  },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metricRowSpaced: { marginTop: 10 },
  metricRowBottom: { marginBottom: 8 },
  teamLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 3, width: 80 },
  teamLabel: { flexShrink: 1, fontSize: 12, color: colors.textSecondary },
  metricLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 80,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
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
  emptyText: { ...typography.body, color: colors.textSecondary },
  chipsScroll: { marginVertical: 4 },
  chipsRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  chipsRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.accentFrom,
  },
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
  dailyTotal: {
    ...typography.metricMedium,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  dailyTeam: { fontSize: 12, color: colors.textSecondary },
  chartRow: { gap: 4, marginTop: 8 },
  chartLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  chartLabel: { fontSize: 12, color: colors.textPrimary, flex: 1 },
  chartValue: { fontSize: 11, color: colors.textSecondary },
  chartBarTrack: {
    height: 6,
    backgroundColor: colors.chipInactiveBackground,
    borderRadius: 3,
    overflow: 'hidden',
  },
  chartBarFill: {
    height: 6,
    backgroundColor: colors.success,
    borderRadius: 3,
  },
});
