import {
  getDailyMetrics,
  getContextSwitches,
  getHeatmapData,
  getStreak,
  getTeamBalanceAlerts,
  getWeeklyMetricsByCategory,
  getWeeklyMetricsByTeam,
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

const TEAM_A: Team = { id: 'teamA', name: 'Team A', maxWeeklyPercent: 40 };
const TEAM_B: Team = { id: 'teamB', name: 'Team B', maxWeeklyPercent: null };

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
    const m = getHeatmapData([]);
    expect(m).toHaveLength(7);
    expect(m[0]).toHaveLength(24);
    expect(m.flat().every((v) => v === 0)).toBe(true);
  });

  it('places session in correct day/hour cell (Mon=0)', () => {
    // SESSION_MON_FOCUS starts 2026-06-15 09:00 UTC — Monday, hour 9
    const m = getHeatmapData([SESSION_MON_FOCUS]);
    expect(m[0][9]).toBe(60); // Mon, 09h
  });

  it('filters by teamId when provided', () => {
    const m = getHeatmapData([SESSION_MON_FOCUS, SESSION_TUE_MEETING], {
      teamId: 'teamB',
    });
    expect(m[0][9]).toBe(0); // teamA excluded
    // Tue is day 1 (Mon=0, Tue=1), hour 14
    expect(m[1][14]).toBe(30);
  });

  it('filters by categoryId when provided', () => {
    const m = getHeatmapData([SESSION_MON_FOCUS, SESSION_TUE_MEETING], {
      categoryId: 'foco_profundo',
    });
    expect(m[0][9]).toBe(60);
    expect(m[1][14]).toBe(0); // reunioes excluded
  });
});

// ── getStreak ───────────────────────────────────────────────────────────────

describe('getStreak', () => {
  it('returns 0 when no sessions', () => {
    expect(getStreak([], TODAY)).toBe(0);
  });

  it('returns 0 when no session yesterday and none today', () => {
    const old = makeSession({
      startedAt: '2026-06-10T10:00:00.000Z',
      durationSeconds: 60,
    });
    expect(getStreak([old], TODAY)).toBe(0);
  });

  it('counts consecutive days ending today', () => {
    const s1 = makeSession({
      startedAt: '2026-06-14T10:00:00.000Z',
      endedAt: '2026-06-14T10:00:00.000Z',
      durationSeconds: 60,
    });
    const s2 = makeSession({
      startedAt: '2026-06-15T10:00:00.000Z',
      endedAt: '2026-06-15T10:00:00.000Z',
      durationSeconds: 60,
    });
    const s3 = makeSession({
      startedAt: '2026-06-16T10:00:00.000Z',
      endedAt: '2026-06-16T10:00:00.000Z',
      durationSeconds: 60,
    });
    expect(getStreak([s1, s2, s3], TODAY)).toBe(3);
  });

  it('counts consecutive days ending yesterday when no session today', () => {
    const s1 = makeSession({
      startedAt: '2026-06-14T10:00:00.000Z',
      endedAt: '2026-06-14T10:00:00.000Z',
      durationSeconds: 60,
    });
    const s2 = makeSession({
      startedAt: '2026-06-15T10:00:00.000Z',
      endedAt: '2026-06-15T10:00:00.000Z',
      durationSeconds: 60,
    });
    expect(getStreak([s1, s2], TODAY)).toBe(2);
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

  it('limits topTeams to 2', () => {
    const TEAM_C: Team = { id: 'teamC', name: 'Team C', maxWeeklyPercent: null };
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
});
