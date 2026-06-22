import { Category, Session, Team } from '../types';
import { isFocusCategory } from './categories';
import { getLocalWeekEnd, getLocalWeekStart, toLocalDateString } from './localDate';

export interface WorkSchedule {
  workStartHour: number;
  workEndHour: number;
  lunchDurationMinutes: number;
}

export interface WorkEfficiency {
  todayWorkedMinutes: number;
  todayAvailableMinutes: number;
  todayIdleMinutes: number;
  weekWorkedMinutes: number;
  weekAvailableMinutes: number;
  weekIdleMinutes: number;
}

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
  deepWorkMinutes: number;
  interruptionMinutes: number;
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
  categories?: Category[],
): CategoryMetrics {
  const weekly = sessions.filter((s) => isCurrentWeek(s, today));
  let deepWorkMinutes = 0;
  let interruptionMinutes = 0;
  for (const s of weekly) {
    const m = sessionMinutes(s);
    if (isFocusCategory(s.categoryId, categories)) {
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
// Only includes sessions from the current week (Mon-Sun).
export function getHeatmapData(
  sessions: Session[],
  today: Date,
  options?: { teamId?: string; categoryId?: string },
): number[][] {
  const matrix: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0));
  const teamId = options?.teamId;
  const categoryId = options?.categoryId;
  const weekStart = getLocalWeekStart(today);
  const weekEnd = getLocalWeekEnd(today);

  for (const s of sessions) {
    if (teamId && s.teamId !== teamId) continue;
    if (categoryId && s.categoryId !== categoryId) continue;
    const sessionTime = new Date(s.startedAt).getTime();
    if (sessionTime < weekStart.getTime() || sessionTime > weekEnd.getTime()) continue;
    const d = new Date(s.startedAt);
    const jsDay = d.getDay(); // 0=Sun
    const displayDay = jsDay === 0 ? 6 : jsDay - 1; // Mon=0, Sun=6
    const hour = d.getHours();
    matrix[displayDay][hour] += sessionMinutes(s);
  }
  return matrix;
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
  categories?: Category[],
): DailyMetrics {
  const todayStr = toLocalDateString(today);
  const todaySessions = sessions.filter(
    (s) => toLocalDateString(new Date(s.startedAt)) === todayStr,
  );

  let deepWorkMinutes = 0;
  let interruptionMinutes = 0;
  const minutesById = new Map<string, number>();
  for (const s of todaySessions) {
    const m = sessionMinutes(s);
    if (isFocusCategory(s.categoryId, categories)) {
      deepWorkMinutes += m;
    } else {
      interruptionMinutes += m;
    }
    if (s.teamId) {
      minutesById.set(s.teamId, (minutesById.get(s.teamId) ?? 0) + m);
    }
  }

  const topTeams = teams
    .filter((t) => minutesById.has(t.id))
    .map((t) => ({ teamName: t.name, minutes: minutesById.get(t.id) ?? 0 }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 2);

  return {
    totalMinutes: deepWorkMinutes + interruptionMinutes,
    deepWorkMinutes,
    interruptionMinutes,
    topTeams,
  };
}

export function getDayAvailableMinutes(schedule: WorkSchedule): number {
  return (
    (schedule.workEndHour - schedule.workStartHour) * 60 - schedule.lunchDurationMinutes
  );
}

function getDayWorkedMinutes(sessions: Session[], dateStr: string): number {
  return sessions
    .filter((s) => toLocalDateString(new Date(s.startedAt)) === dateStr)
    .reduce((acc, s) => acc + sessionMinutes(s), 0);
}

export function getWorkEfficiency(
  sessions: Session[],
  schedule: WorkSchedule,
  today: Date,
): WorkEfficiency {
  const todayStr = toLocalDateString(today);
  const todayDow = today.getDay();
  const isTodayWeekday = todayDow !== 0 && todayDow !== 6;
  const todayAvailableMinutes = isTodayWeekday ? getDayAvailableMinutes(schedule) : 0;
  const todayWorkedMinutes = getDayWorkedMinutes(sessions, todayStr);
  const todayIdleMinutes = Math.max(0, todayAvailableMinutes - todayWorkedMinutes);

  const weekStart = getLocalWeekStart(today);
  let weekWorkedMinutes = 0;
  let weekAvailableMinutes = 0;
  const cursor = new Date(weekStart);
  while (cursor <= today) {
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) {
      weekAvailableMinutes += getDayAvailableMinutes(schedule);
      weekWorkedMinutes += getDayWorkedMinutes(sessions, toLocalDateString(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  const weekIdleMinutes = Math.max(0, weekAvailableMinutes - weekWorkedMinutes);

  return {
    todayWorkedMinutes,
    todayAvailableMinutes,
    todayIdleMinutes,
    weekWorkedMinutes,
    weekAvailableMinutes,
    weekIdleMinutes,
  };
}
