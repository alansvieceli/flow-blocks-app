import { Session, Team } from '../types';
import { getLocalWeekEnd, getLocalWeekStart, toLocalDateString } from './localDate';

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

function isCurrentWeek(session: Session, today: Date): boolean {
  const start = getLocalWeekStart(today);
  const end = getLocalWeekEnd(today);
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
    const jsDay = d.getDay(); // 0=Sun
    const displayDay = jsDay === 0 ? 6 : jsDay - 1; // Mon=0, Sun=6
    const hour = d.getHours();
    matrix[displayDay][hour] += sessionMinutes(s);
  }
  return matrix;
}

export function getStreak(sessions: Session[], today: Date): number {
  const todayStr = toLocalDateString(today);
  const sessionDates = new Set(
    sessions.map((s) => toLocalDateString(new Date(s.endedAt))),
  );

  // Check if today has a session; if not, start counting from yesterday
  const startStr = sessionDates.has(todayStr)
    ? todayStr
    : (() => {
        const y = new Date(today);
        y.setDate(y.getDate() - 1);
        return toLocalDateString(y);
      })();

  if (!sessionDates.has(startStr)) return 0;

  let streak = 0;
  const [year, month, day] = startStr.split('-').map(Number);
  const cursor = new Date(year, month - 1, day, 12);
  while (sessionDates.has(toLocalDateString(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
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

  const todayStr = toLocalDateString(today);
  const weekStart = getLocalWeekStart(today);
  const weekEnd = getLocalWeekEnd(today);

  let todaySwitches = 0;
  let weekSwitches = 0;
  let prevToday: Session | null = null;
  let prevWeek: Session | null = null;

  for (const s of sorted) {
    const sDate = toLocalDateString(new Date(s.startedAt));
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

    if (sTime >= weekStart.getTime() && sTime <= weekEnd.getTime()) {
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
  const todayStr = toLocalDateString(today);
  const todaySessions = sessions.filter(
    (s) => toLocalDateString(new Date(s.startedAt)) === todayStr,
  );

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
