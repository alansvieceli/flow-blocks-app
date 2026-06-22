import {
  getDailyMetrics,
  getContextSwitches,
  getHeatmapData,
  getTeamBalanceAlerts,
  getWeeklyMetricsByCategory,
  getWeeklyMetricsByTeam,
  WorkSchedule,
  getDayAvailableMinutes,
  getWorkEfficiency,
} from '../metrics';
import { Session, Team } from '../../types';

// Monday 2026-06-15 at noon UTC
const TODAY = new Date('2026-06-16T12:00:00.000Z'); // Tuesday

function makeSession(
  overrides: Partial<Session> & { startedAt: string; durationSeconds: number },
): Session {
  return {
    id: Math.random().toString(),
    categoryId: 'foco_profundo',
    teamId: null,
    endedAt: overrides.startedAt, // same day by default
    note: null,
    ...overrides,
  };
}

const TEAM_A: Team = {
  id: 'teamA',
  name: 'Team A',
  order: 1,
  maxWeeklyPercent: 40,
};
const TEAM_B: Team = {
  id: 'teamB',
  name: 'Team B',
  order: 2,
  maxWeeklyPercent: null,
};

// This week sessions (week of 2026-06-15 Mon .. 2026-06-21 Sun)
const SESSION_MON_FOCUS = makeSession({
  startedAt: '2026-06-15T09:00:00.000Z',
  endedAt: '2026-06-15T10:00:00.000Z',
  durationSeconds: 3600, // 60 min
  categoryId: 'foco_profundo',
  teamId: 'teamA',
});

const SESSION_TUE_MEETING = makeSession({
  startedAt: '2026-06-16T14:00:00.000Z',
  endedAt: '2026-06-16T14:30:00.000Z',
  durationSeconds: 1800, // 30 min
  categoryId: 'reunioes',
  teamId: 'teamB',
});

const SESSION_LAST_WEEK = makeSession({
  startedAt: '2026-06-08T09:00:00.000Z',
  endedAt: '2026-06-08T10:00:00.000Z',
  durationSeconds: 3600,
  categoryId: 'foco_profundo',
  teamId: 'teamA',
});

// ── getWeeklyMetricsByCategory ──────────────────────────────────────────────

describe('getWeeklyMetricsByCategory', () => {
  it('returns zeros when no sessions', () => {
    const result = getWeeklyMetricsByCategory([], TODAY);
    expect(result).toEqual({
      deepWorkMinutes: 0,
      interruptionMinutes: 0,
      totalMinutes: 0,
    });
  });

  it('excludes sessions outside the current week', () => {
    const result = getWeeklyMetricsByCategory([SESSION_LAST_WEEK], TODAY);
    expect(result.totalMinutes).toBe(0);
  });

  it('sums deep work and interruption sessions for the current week', () => {
    const result = getWeeklyMetricsByCategory(
      [SESSION_MON_FOCUS, SESSION_TUE_MEETING, SESSION_LAST_WEEK],
      TODAY,
    );
    expect(result.deepWorkMinutes).toBe(60);
    expect(result.interruptionMinutes).toBe(30);
    expect(result.totalMinutes).toBe(90);
  });

  it('classifies a custom category as deep work when the categories list marks it isFocus', () => {
    const customFocus = makeSession({
      startedAt: '2026-06-15T09:00:00.000Z',
      durationSeconds: 1800, // 30 min
      categoryId: 'codigo',
    });
    const categories = [{ id: 'codigo', label: 'Código', order: 2, isFocus: true }];
    const result = getWeeklyMetricsByCategory([customFocus], TODAY, categories);
    expect(result.deepWorkMinutes).toBe(30);
    expect(result.interruptionMinutes).toBe(0);
  });

  it('classifies a custom category as interruption when not marked isFocus', () => {
    const customOther = makeSession({
      startedAt: '2026-06-15T09:00:00.000Z',
      durationSeconds: 1800, // 30 min
      categoryId: 'codigo',
    });
    const categories = [{ id: 'codigo', label: 'Código', order: 2 }];
    const result = getWeeklyMetricsByCategory([customOther], TODAY, categories);
    expect(result.deepWorkMinutes).toBe(0);
    expect(result.interruptionMinutes).toBe(30);
  });
});

// ── getWeeklyMetricsByTeam ──────────────────────────────────────────────────

describe('getWeeklyMetricsByTeam', () => {
  it('returns empty array when no sessions', () => {
    expect(getWeeklyMetricsByTeam([], [TEAM_A], TODAY)).toEqual([]);
  });

  it('omits teams with no sessions this week', () => {
    const result = getWeeklyMetricsByTeam([SESSION_LAST_WEEK], [TEAM_A], TODAY);
    expect(result).toHaveLength(0);
  });

  it('calculates minutes and percentage per team sorted by minutes desc', () => {
    const result = getWeeklyMetricsByTeam(
      [SESSION_MON_FOCUS, SESSION_TUE_MEETING],
      [TEAM_A, TEAM_B],
      TODAY,
    );
    expect(result).toHaveLength(2);
    expect(result[0].teamId).toBe('teamA');
    expect(result[0].minutes).toBe(60);
    expect(result[0].percentage).toBe(67); // 60/90
    expect(result[1].teamId).toBe('teamB');
    expect(result[1].minutes).toBe(30);
    expect(result[1].percentage).toBe(33);
  });

  it('skips sessions without a teamId', () => {
    const noTeam = makeSession({
      startedAt: '2026-06-16T10:00:00.000Z',
      durationSeconds: 600,
    });
    const result = getWeeklyMetricsByTeam([noTeam], [TEAM_A], TODAY);
    expect(result).toHaveLength(0);
  });
});

// ── getHeatmapData ──────────────────────────────────────────────────────────

describe('getHeatmapData', () => {
  it('returns 7x24 matrix of zeros for empty sessions', () => {
    const m = getHeatmapData([], TODAY);
    expect(m).toHaveLength(7);
    expect(m[0]).toHaveLength(24);
    expect(m.flat().every((v) => v === 0)).toBe(true);
  });

  it('places session in correct day/hour cell (Mon=0)', () => {
    // SESSION_MON_FOCUS starts 2026-06-15 09:00 UTC — 06:00 in America/Sao_Paulo
    const m = getHeatmapData([SESSION_MON_FOCUS], TODAY);
    expect(m[0][6]).toBe(60); // Mon, 06h local
  });

  it('filters by teamId when provided', () => {
    const m = getHeatmapData([SESSION_MON_FOCUS, SESSION_TUE_MEETING], TODAY, {
      teamId: 'teamB',
    });
    expect(m[0][6]).toBe(0); // teamA excluded
    // Tue is day 1 (Mon=0, Tue=1), hour 11 local
    expect(m[1][11]).toBe(30);
  });

  it('filters by categoryId when provided', () => {
    const m = getHeatmapData([SESSION_MON_FOCUS, SESSION_TUE_MEETING], TODAY, {
      categoryId: 'foco_profundo',
    });
    expect(m[0][6]).toBe(60);
    expect(m[1][11]).toBe(0); // reunioes excluded
  });

  it('excludes sessions from last week', () => {
    const m = getHeatmapData([SESSION_LAST_WEEK], TODAY);
    expect(m.flat().every((v) => v === 0)).toBe(true);
  });
});

// ── getContextSwitches ──────────────────────────────────────────────────────

describe('getContextSwitches', () => {
  it('returns 0/0 for empty sessions', () => {
    expect(getContextSwitches([], TODAY)).toEqual({ today: 0, week: 0 });
  });

  it('counts switches when team changes during the day', () => {
    const s1 = makeSession({
      startedAt: '2026-06-16T09:00:00.000Z',
      durationSeconds: 60,
      teamId: 'teamA',
      categoryId: 'foco_profundo',
    });
    const s2 = makeSession({
      startedAt: '2026-06-16T10:00:00.000Z',
      durationSeconds: 60,
      teamId: 'teamB',
      categoryId: 'foco_profundo',
    });
    const result = getContextSwitches([s1, s2], TODAY);
    expect(result.today).toBe(1);
  });

  it('does not count switch when same team and category', () => {
    const s1 = makeSession({
      startedAt: '2026-06-16T09:00:00.000Z',
      durationSeconds: 60,
      teamId: 'teamA',
      categoryId: 'foco_profundo',
    });
    const s2 = makeSession({
      startedAt: '2026-06-16T10:00:00.000Z',
      durationSeconds: 60,
      teamId: 'teamA',
      categoryId: 'foco_profundo',
    });
    const result = getContextSwitches([s1, s2], TODAY);
    expect(result.today).toBe(0);
  });

  it('counts week switches across multiple days', () => {
    const s1 = makeSession({
      startedAt: '2026-06-15T09:00:00.000Z',
      durationSeconds: 60,
      teamId: 'teamA',
    });
    const s2 = makeSession({
      startedAt: '2026-06-16T09:00:00.000Z',
      durationSeconds: 60,
      teamId: 'teamB',
    });
    const result = getContextSwitches([s1, s2], TODAY);
    expect(result.week).toBe(1);
  });
});

// ── getTeamBalanceAlerts ────────────────────────────────────────────────────

describe('getTeamBalanceAlerts', () => {
  it('returns empty array when no sessions', () => {
    expect(getTeamBalanceAlerts([], [TEAM_A], TODAY)).toEqual([]);
  });

  it('returns empty when no team exceeds maxWeeklyPercent', () => {
    // teamA has 60min out of 60 total = 100% but maxWeeklyPercent=40
    // Actually this SHOULD alert. Let me make a case where it does NOT alert:
    const small = makeSession({
      startedAt: '2026-06-16T09:00:00.000Z',
      durationSeconds: 600, // 10 min, teamA
      teamId: 'teamA',
    });
    const big = makeSession({
      startedAt: '2026-06-16T10:00:00.000Z',
      durationSeconds: 6000, // 100 min, no team
      teamId: null,
    });
    // total minutes = 110, teamA = 10, 10/110 = 9% < 40% → no alert
    const result = getTeamBalanceAlerts([small, big], [TEAM_A], TODAY);
    expect(result).toHaveLength(0);
  });

  it('alerts when team exceeds maxWeeklyPercent', () => {
    // teamA 60min, teamB 30min, total 90, teamA = 67% > 40%
    const result = getTeamBalanceAlerts(
      [SESSION_MON_FOCUS, SESSION_TUE_MEETING],
      [TEAM_A, TEAM_B],
      TODAY,
    );
    expect(result).toHaveLength(1);
    expect(result[0].teamId).toBe('teamA');
    expect(result[0].actualPercent).toBe(67);
    expect(result[0].maxWeeklyPercent).toBe(40);
  });

  it('ignores teams with no maxWeeklyPercent', () => {
    const s = makeSession({
      startedAt: '2026-06-16T09:00:00.000Z',
      durationSeconds: 3600,
      teamId: 'teamB',
    });
    const result = getTeamBalanceAlerts([s], [TEAM_B], TODAY);
    expect(result).toHaveLength(0);
  });
});

// ── getDailyMetrics ─────────────────────────────────────────────────────────

describe('getDailyMetrics', () => {
  it('returns zeros and empty topTeams for no sessions today', () => {
    const result = getDailyMetrics([SESSION_MON_FOCUS], [TEAM_A], TODAY);
    // SESSION_MON_FOCUS is on Mon 15, TODAY is Tue 16 → no sessions today
    expect(result.totalMinutes).toBe(0);
    expect(result.deepWorkMinutes).toBe(0);
    expect(result.interruptionMinutes).toBe(0);
    expect(result.topTeams).toEqual([]);
  });

  it('sums minutes for sessions today and picks top 2 teams', () => {
    const s1 = makeSession({
      startedAt: '2026-06-16T09:00:00.000Z',
      durationSeconds: 3600, // 60 min teamA
      teamId: 'teamA',
    });
    const s2 = makeSession({
      startedAt: '2026-06-16T10:00:00.000Z',
      durationSeconds: 1800, // 30 min teamB
      teamId: 'teamB',
    });
    const result = getDailyMetrics([s1, s2], [TEAM_A, TEAM_B], TODAY);
    expect(result.totalMinutes).toBe(90);
    expect(result.topTeams).toHaveLength(2);
    expect(result.topTeams[0]).toEqual({ teamName: 'Team A', minutes: 60 });
    expect(result.topTeams[1]).toEqual({ teamName: 'Team B', minutes: 30 });
  });

  it('splits today minutes into deepWork and interruption by category', () => {
    const focus = makeSession({
      startedAt: '2026-06-16T09:00:00.000Z',
      durationSeconds: 3600, // 60 min
      categoryId: 'foco_profundo',
    });
    const meeting = makeSession({
      startedAt: '2026-06-16T11:00:00.000Z',
      durationSeconds: 1200, // 20 min
      categoryId: 'reunioes',
    });
    const result = getDailyMetrics([focus, meeting], [], TODAY);
    expect(result.deepWorkMinutes).toBe(60);
    expect(result.interruptionMinutes).toBe(20);
    expect(result.totalMinutes).toBe(80);
  });

  it('uses local date for late-night sessions', () => {
    const lateNight = makeSession({
      startedAt: '2026-06-17T01:00:00.000Z',
      durationSeconds: 1800,
      teamId: 'teamA',
    });
    const result = getDailyMetrics([lateNight], [TEAM_A], TODAY);
    expect(result.totalMinutes).toBe(30);
  });

  it('limits topTeams to 2', () => {
    const TEAM_C: Team = {
      id: 'teamC',
      name: 'Team C',
      order: 3,
      maxWeeklyPercent: null,
    };
    const s1 = makeSession({
      startedAt: '2026-06-16T09:00:00.000Z',
      durationSeconds: 3600,
      teamId: 'teamA',
    });
    const s2 = makeSession({
      startedAt: '2026-06-16T10:00:00.000Z',
      durationSeconds: 1200,
      teamId: 'teamB',
    });
    const s3 = makeSession({
      startedAt: '2026-06-16T11:00:00.000Z',
      durationSeconds: 600,
      teamId: 'teamC',
    });
    const result = getDailyMetrics([s1, s2, s3], [TEAM_A, TEAM_B, TEAM_C], TODAY);
    expect(result.topTeams).toHaveLength(2);
  });

  it('classifies a custom category using the categories param', () => {
    const customFocus = makeSession({
      startedAt: '2026-06-16T09:00:00.000Z',
      durationSeconds: 1800, // 30 min
      categoryId: 'codigo',
    });
    const categories = [{ id: 'codigo', label: 'Código', order: 2, isFocus: true }];
    const result = getDailyMetrics([customFocus], [], TODAY, categories);
    expect(result.deepWorkMinutes).toBe(30);
    expect(result.interruptionMinutes).toBe(0);
  });
});

// ── WorkSchedule helpers ────────────────────────────────────────────────────

const SCHEDULE: WorkSchedule = {
  workStartHour: 8,
  workEndHour: 18,
  lunchDurationMinutes: 60,
};

describe('getDayAvailableMinutes', () => {
  it('returns (end - start) * 60 - lunch', () => {
    expect(getDayAvailableMinutes(SCHEDULE)).toBe(540); // (18-8)*60 - 60
  });

  it('handles short schedule', () => {
    expect(
      getDayAvailableMinutes({
        workStartHour: 9,
        workEndHour: 13,
        lunchDurationMinutes: 0,
      }),
    ).toBe(240);
  });
});

describe('getWorkEfficiency', () => {
  it('returns zero worked and full available when no sessions on a weekday', () => {
    const result = getWorkEfficiency([], SCHEDULE, TODAY);
    expect(result.todayWorkedMinutes).toBe(0);
    expect(result.todayAvailableMinutes).toBe(540);
    expect(result.todayIdleMinutes).toBe(540);
  });

  it('returns zero available when today is a weekend', () => {
    const saturday = new Date('2026-06-20T12:00:00.000Z');
    const result = getWorkEfficiency([], SCHEDULE, saturday);
    expect(result.todayAvailableMinutes).toBe(0);
    expect(result.todayIdleMinutes).toBe(0);
  });

  it('clamps idle to 0 when sessions exceed available', () => {
    const longSession = makeSession({
      startedAt: '2026-06-16T06:00:00.000Z',
      durationSeconds: 600 * 60,
    });
    const result = getWorkEfficiency([longSession], SCHEDULE, TODAY);
    expect(result.todayIdleMinutes).toBe(0);
  });

  it('correctly counts week available only for weekdays up to today', () => {
    // TODAY = Tuesday 2026-06-16. Week started Monday 2026-06-15.
    // 2 weekdays: Mon + Tue = 2 * 540 = 1080 min available.
    const result = getWorkEfficiency([], SCHEDULE, TODAY);
    expect(result.weekAvailableMinutes).toBe(1080);
  });

  it('subtracts worked minutes from weekly idle', () => {
    // SESSION_MON_FOCUS: 60 min on Monday 2026-06-15
    const result = getWorkEfficiency([SESSION_MON_FOCUS], SCHEDULE, TODAY);
    expect(result.weekWorkedMinutes).toBe(60);
    expect(result.weekIdleMinutes).toBe(1020); // 1080 - 60
  });
});
