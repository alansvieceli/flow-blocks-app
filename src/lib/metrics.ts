import { Session, Team } from '../types';

export interface CategoryMetrics {
  deepWorkMinutes: number;
  interruptionMinutes: number;
  totalMinutes: number;
}

export interface TeamMetrics {
  teamId: string;
  teamName: string;
  minutes: number;
  percentage: number;
}

export interface TeamBalanceAlert {
  teamId: string;
  teamName: string;
  actualPercent: number;
  maxWeeklyPercent: number;
}

export interface DailyMetrics {
  totalMinutes: number;
  topTeams: { teamName: string; minutes: number }[];
}

function toDateString(iso: string): string {
  return iso.slice(0, 10); // YYYY-MM-DD (UTC)
}

function getWeekStart(today: Date): Date {
  const d = new Date(today);
  const day = d.getUTCDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // Mon = start
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function getWeekEnd(today: Date): Date {
  const start = getWeekStart(today);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);
  return end;
}

function isCurrentWeek(session: Session, today: Date): boolean {
  const start = getWeekStart(today);
  const end = getWeekEnd(today);
  const t = new Date(session.startedAt).getTime();
  return t >= start.getTime() && t <= end.getTime();
}

function sessionMinutes(s: Session): number {
  return Math.floor(s.durationSeconds / 60);
}

export function getWeeklyMetricsByCategory(
  sessions: Session[],
  today: Date,
): CategoryMetrics {
  const weekly = sessions.filter((s) => isCurrentWeek(s, today));
  let deepWorkMinutes = 0;
  let interruptionMinutes = 0;
  for (const s of weekly) {
    const m = sessionMinutes(s);
    if (s.categoryId === 'foco_profundo') {
      deepWorkMinutes += m;
    } else {
      interruptionMinutes += m;
    }
  }
  return {
    deepWorkMinutes,
    interruptionMinutes,
    totalMinutes: deepWorkMinutes + interruptionMinutes,
  };
}

export function getWeeklyMetricsByTeam(
  sessions: Session[],
  teams: Team[],
  today: Date,
): TeamMetrics[] {
  const weekly = sessions.filter((s) => isCurrentWeek(s, today));
  const minutesById = new Map<string, number>();
  let total = 0;
  for (const s of weekly) {
    if (!s.teamId) continue;
    const m = sessionMinutes(s);
    minutesById.set(s.teamId, (minutesById.get(s.teamId) ?? 0) + m);
    total += m;
  }
  return teams
    .filter((t) => minutesById.has(t.id))
    .map((t) => {
      const minutes = minutesById.get(t.id) ?? 0;
      return {
        teamId: t.id,
        teamName: t.name,
        minutes,
        percentage: total > 0 ? Math.round((minutes / total) * 100) : 0,
      };
    })
    .sort((a, b) => b.minutes - a.minutes);
}

// Returns 7x24 matrix: rows = Mon(0)..Sun(6), cols = hour 0..23
export function getHeatmapData(
  sessions: Session[],
  options?: { teamId?: string; categoryId?: string },
): number[][] {
  const matrix: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0));
  const teamId = options?.teamId;
  const categoryId = options?.categoryId;

  for (const s of sessions) {
    if (teamId && s.teamId !== teamId) continue;
    if (categoryId && s.categoryId !== categoryId) continue;
    const d = new Date(s.startedAt);
    const jsDay = d.getUTCDay(); // 0=Sun
    const displayDay = jsDay === 0 ? 6 : jsDay - 1; // Mon=0, Sun=6
    const hour = d.getUTCHours();
    matrix[displayDay][hour] += sessionMinutes(s);
  }
  return matrix;
}

export function getStreak(sessions: Session[], today: Date): number {
  const todayStr = toDateString(today.toISOString());
  const sessionDates = new Set(sessions.map((s) => toDateString(s.endedAt)));

  // Check if today has a session; if not, start counting from yesterday
  const startStr = sessionDates.has(todayStr)
    ? todayStr
    : (() => {
        const y = new Date(today);
        y.setUTCDate(y.getUTCDate() - 1);
        return toDateString(y.toISOString());
      })();

  if (!sessionDates.has(startStr)) return 0;

  let streak = 0;
  const cursor = new Date(startStr + 'T12:00:00.000Z');
  while (sessionDates.has(toDateString(cursor.toISOString()))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export function getContextSwitches(
  sessions: Session[],
  today: Date,
): { today: number; week: number } {
  const sorted = [...sessions].sort(
    (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
  );

  const todayStr = toDateString(today.toISOString());
  const weekStart = getWeekStart(today);

  let todaySwitches = 0;
  let weekSwitches = 0;
  let prevToday: Session | null = null;
  let prevWeek: Session | null = null;

  for (const s of sorted) {
    const sDate = toDateString(new Date(s.startedAt).toISOString());
    const sTime = new Date(s.startedAt).getTime();

    if (sDate === todayStr) {
      if (
        prevToday &&
        (prevToday.teamId !== s.teamId || prevToday.categoryId !== s.categoryId)
      ) {
        todaySwitches++;
      }
      prevToday = s;
    }

    if (sTime >= weekStart.getTime() && sTime <= getWeekEnd(today).getTime()) {
      if (
        prevWeek &&
        (prevWeek.teamId !== s.teamId || prevWeek.categoryId !== s.categoryId)
      ) {
        weekSwitches++;
      }
      prevWeek = s;
    }
  }

  return { today: todaySwitches, week: weekSwitches };
}

export function getTeamBalanceAlerts(
  sessions: Session[],
  teams: Team[],
  today: Date,
): TeamBalanceAlert[] {
  const weekly = sessions.filter((s) => isCurrentWeek(s, today));
  const totalMinutes = weekly.reduce((acc, s) => acc + sessionMinutes(s), 0);
  if (totalMinutes === 0) return [];

  const minutesById = new Map<string, number>();
  for (const s of weekly) {
    if (!s.teamId) continue;
    minutesById.set(s.teamId, (minutesById.get(s.teamId) ?? 0) + sessionMinutes(s));
  }

  return teams
    .filter((t) => t.maxWeeklyPercent !== null && minutesById.has(t.id))
    .map((t) => {
      const minutes = minutesById.get(t.id) ?? 0;
      const actualPercent = Math.round((minutes / totalMinutes) * 100);
      return {
        teamId: t.id,
        teamName: t.name,
        actualPercent,
        maxWeeklyPercent: t.maxWeeklyPercent!,
      };
    })
    .filter((a) => a.actualPercent > a.maxWeeklyPercent);
}

export function getDailyMetrics(
  sessions: Session[],
  teams: Team[],
  today: Date,
): DailyMetrics {
  const todayStr = toDateString(today.toISOString());
  const todaySessions = sessions.filter((s) => toDateString(s.startedAt) === todayStr);

  const totalMinutes = todaySessions.reduce((acc, s) => acc + sessionMinutes(s), 0);
  const minutesById = new Map<string, number>();
  for (const s of todaySessions) {
    if (!s.teamId) continue;
    minutesById.set(s.teamId, (minutesById.get(s.teamId) ?? 0) + sessionMinutes(s));
  }

  const topTeams = teams
    .filter((t) => minutesById.has(t.id))
    .map((t) => ({ teamName: t.name, minutes: minutesById.get(t.id) ?? 0 }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 2);

  return { totalMinutes, topTeams };
}
