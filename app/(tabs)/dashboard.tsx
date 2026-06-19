import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppHeader } from '../../src/components/AppHeader';
import {
  CategoryMetrics,
  DailyMetrics,
  TeamMetrics,
  WorkEfficiency,
  WorkSchedule,
  getDailyMetrics,
  getHeatmapData,
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
const dashboardBarColors = {
  focus: '#A78BFA',
  meetings: '#60A5FA',
  idle: '#64748B',
  teams: '#8B7AD8',
  track: '#25263A',
  personal: '#34D399',
  personalTrack: '#1F3433',
} as const;

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

function formatMetricValue(minutes: number): string {
  return minutes === 0 ? 'Sem registros' : formatMinutes(minutes);
}

function pct(worked: number, available: number): string {
  if (available === 0) return '—';
  return `${Math.round((worked / available) * 100)}%`;
}

function MetricBar({
  value,
  total,
  accent,
}: {
  value: number;
  total: number;
  accent: 'primary' | 'secondary' | 'disabled' | 'team';
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  const fillColor =
    accent === 'primary'
      ? dashboardBarColors.focus
      : accent === 'secondary'
        ? dashboardBarColors.meetings
        : accent === 'team'
          ? dashboardBarColors.teams
          : dashboardBarColors.idle;
  return (
    <View style={styles.barTrack}>
      <View
        style={[styles.barFill, { width: `${pct}%`, backgroundColor: fillColor }]}
      />
    </View>
  );
}

function WeeklySection({
  categoryMetrics,
  teamMetrics,
  weekIdleMinutes,
  weekWorkedMinutes,
  weekAvailableMinutes,
}: {
  categoryMetrics: CategoryMetrics;
  teamMetrics: TeamMetrics[];
  weekIdleMinutes: number;
  weekWorkedMinutes: number;
  weekAvailableMinutes: number;
}) {
  const total = categoryMetrics.totalMinutes;

  return (
    <>
      <SectionTitle icon="calendar-outline" label="ESTA SEMANA" />

      <View style={styles.card}>
        <View style={styles.todayHeaderRow}>
          <Text style={styles.todayHeaderValue}>
            {formatMinutes(weekWorkedMinutes)}
          </Text>
          <Text style={styles.todayHeaderUnit}>
            / {formatMinutes(weekAvailableMinutes)} (
            {pct(weekWorkedMinutes, weekAvailableMinutes)})
          </Text>
        </View>
        <View style={styles.headerBarRow}>
          <MetricBar
            value={weekWorkedMinutes}
            total={weekAvailableMinutes}
            accent="primary"
          />
        </View>
        <View style={styles.metricRow}>
          <View style={styles.metricLabelRow}>
            <Ionicons name="flash-outline" size={12} color={dashboardBarColors.focus} />
            <Text style={styles.metricLabel}>Foco</Text>
          </View>
          <MetricBar
            value={categoryMetrics.deepWorkMinutes}
            total={total}
            accent="primary"
          />
          <Text style={styles.metricValue}>
            {formatMetricValue(categoryMetrics.deepWorkMinutes)}
          </Text>
        </View>
        <View style={[styles.metricRow, styles.metricRowSpaced]}>
          <View style={styles.metricLabelRow}>
            <Ionicons
              name="shuffle-outline"
              size={12}
              color={dashboardBarColors.meetings}
            />
            <Text style={styles.metricLabel}>Reuniões</Text>
          </View>
          <MetricBar
            value={categoryMetrics.interruptionMinutes}
            total={total}
            accent="secondary"
          />
          <Text style={styles.metricValue}>
            {formatMetricValue(categoryMetrics.interruptionMinutes)}
          </Text>
        </View>
        <View style={[styles.metricRow, styles.metricRowSpaced]}>
          <View style={styles.metricLabelRow}>
            <Ionicons name="time-outline" size={12} color={dashboardBarColors.idle} />
            <Text style={styles.metricLabel}>Sem sessão</Text>
          </View>
          <MetricBar
            value={weekIdleMinutes}
            total={categoryMetrics.totalMinutes + weekIdleMinutes}
            accent="disabled"
          />
          <Text style={styles.metricValue}>{formatMetricValue(weekIdleMinutes)}</Text>
        </View>
        <View style={styles.cardDivider} />
        <Text style={styles.cardSubsectionLabel}>POR EQUIPE</Text>
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
              <MetricBar value={tm.minutes} total={total} accent="team" />
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
                <Text style={styles.chipActiveText}>Todas</Text>
              </View>
            ) : (
              <View style={styles.chipInactive}>
                <Text style={styles.chipInactiveText}>Todas</Text>
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
                <Text style={styles.chipActiveText}>Todas</Text>
              </View>
            ) : (
              <View style={styles.chipInactive}>
                <Text style={styles.chipInactiveText}>Todas</Text>
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
                  <Text style={styles.heatmapHourLabel}>
                    {String(h).padStart(2, '0')}
                  </Text>
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

function TodaySection({
  dailyMetrics,
  efficiency,
}: {
  dailyMetrics: DailyMetrics;
  efficiency: WorkEfficiency;
}) {
  return (
    <>
      <SectionTitle icon="today-outline" label="HOJE" />
      <View style={styles.card}>
        <View style={styles.todayHeaderRow}>
          <Text style={styles.todayHeaderValue}>
            {formatMinutes(efficiency.todayWorkedMinutes)}
          </Text>
          <Text style={styles.todayHeaderUnit}>
            / {formatMinutes(efficiency.todayAvailableMinutes)} (
            {pct(efficiency.todayWorkedMinutes, efficiency.todayAvailableMinutes)})
          </Text>
        </View>
        <View style={styles.headerBarRow}>
          <MetricBar
            value={efficiency.todayWorkedMinutes}
            total={efficiency.todayAvailableMinutes}
            accent="primary"
          />
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metricLabelRow}>
            <Ionicons name="flash-outline" size={12} color={dashboardBarColors.focus} />
            <Text style={styles.metricLabel}>Foco</Text>
          </View>
          <MetricBar
            value={dailyMetrics.deepWorkMinutes}
            total={dailyMetrics.totalMinutes}
            accent="primary"
          />
          <Text style={styles.metricValue}>
            {formatMetricValue(dailyMetrics.deepWorkMinutes)}
          </Text>
        </View>
        <View style={[styles.metricRow, styles.metricRowSpaced]}>
          <View style={styles.metricLabelRow}>
            <Ionicons
              name="shuffle-outline"
              size={12}
              color={dashboardBarColors.meetings}
            />
            <Text style={styles.metricLabel}>Reuniões</Text>
          </View>
          <MetricBar
            value={dailyMetrics.interruptionMinutes}
            total={dailyMetrics.totalMinutes}
            accent="secondary"
          />
          <Text style={styles.metricValue}>
            {formatMetricValue(dailyMetrics.interruptionMinutes)}
          </Text>
        </View>
        <View style={[styles.metricRow, styles.metricRowSpaced]}>
          <View style={styles.metricLabelRow}>
            <Ionicons name="time-outline" size={12} color={dashboardBarColors.idle} />
            <Text style={styles.metricLabel}>Sem sessão</Text>
          </View>
          <MetricBar
            value={efficiency.todayIdleMinutes}
            total={efficiency.todayAvailableMinutes}
            accent="disabled"
          />
          <Text style={styles.metricValue}>
            {formatMetricValue(efficiency.todayIdleMinutes)}
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

  const categoryMetrics = getWeeklyMetricsByCategory(sessions, today, categories);
  const teamMetrics = getWeeklyMetricsByTeam(sessions, teams, today);
  const efficiency = getWorkEfficiency(sessions, schedule, today);
  const dailyMetrics = getDailyMetrics(sessions, teams, today, categories);

  return (
    <View style={styles.container}>
      <AppHeader title="Painel" />
      <ScrollView contentContainerStyle={styles.content}>
        <TodaySection dailyMetrics={dailyMetrics} efficiency={efficiency} />

        <WeeklySection
          categoryMetrics={categoryMetrics}
          teamMetrics={teamMetrics}
          weekIdleMinutes={efficiency.weekIdleMinutes}
          weekWorkedMinutes={efficiency.weekWorkedMinutes}
          weekAvailableMinutes={efficiency.weekAvailableMinutes}
        />

        <HeatmapSection
          categories={categories}
          sessions={sessions}
          teams={teams}
          schedule={schedule}
        />

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
    color: colors.chipInactiveText,
  },
  card: {
    borderRadius: 20,
    backgroundColor: colors.cardFrom,
    padding: 16,
  },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metricRowSpaced: { marginTop: 12 },
  metricRowBottom: { marginBottom: 8 },
  teamLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 3, width: 92 },
  teamLabel: { flexShrink: 1, ...typography.rowLabel, color: colors.chipInactiveText },
  metricLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 92,
  },
  metricLabel: {
    ...typography.rowLabel,
    color: colors.chipInactiveText,
  },
  metricValue: {
    fontSize: 11,
    color: colors.textPrimary,
    minWidth: 72,
    textAlign: 'right',
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: dashboardBarColors.track,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: { height: 6, borderRadius: 3 },
  emptyText: { ...typography.rowLabel, color: colors.textSecondary },
  cardDivider: {
    height: 1,
    backgroundColor: '#2A2D42',
    marginVertical: 16,
  },
  cardSubsectionLabel: {
    ...typography.sectionLabel,
    color: colors.chipInactiveText,
    marginBottom: 10,
  },
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
  chipActiveText: {
    color: colors.chipActiveText,
    ...typography.rowLabel,
    fontWeight: '700',
  },
  chipInactive: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.chipInactiveBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  chipInactiveText: { color: colors.chipInactiveText, ...typography.rowLabel },
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
    color: colors.textPrimary,
    fontWeight: '700',
  },
  todayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 8,
  },
  todayHeaderValue: {
    ...typography.screenTitle,
    color: colors.textPrimary,
  },
  todayHeaderUnit: {
    fontSize: 12,
    color: colors.chipInactiveText,
  },
  headerBarRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  chartRow: { gap: 4, marginTop: 8 },
  chartLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  chartLabel: { ...typography.rowLabel, color: colors.textPrimary, flex: 1 },
  chartValue: { fontSize: 11, color: colors.textSecondary },
  chartBarTrack: {
    height: 6,
    backgroundColor: dashboardBarColors.personalTrack,
    borderRadius: 3,
    overflow: 'hidden',
  },
  chartBarFill: {
    height: 6,
    backgroundColor: dashboardBarColors.personal,
    borderRadius: 3,
  },
});
