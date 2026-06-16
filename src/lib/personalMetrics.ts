import { PersonalActivity, PersonalDailyPlan } from '../types';
import { getLocalWeekStart, toLocalDateString } from './localDate';

function getWeekStartStr(today: Date): string {
  return toLocalDateString(getLocalWeekStart(today));
}

function isEntryDone(entry: PersonalDailyPlan['entries'][number]): boolean {
  return entry.status ? entry.status === 'done' : entry.done;
}

export function getPersonalDoneMinutesByActivity(
  plans: PersonalDailyPlan[],
  activities: PersonalActivity[],
  options: { period: 'currentWeek' | 'last4Weeks'; today: Date },
): { activityName: string; minutes: number }[] {
  const today = options.today;
  const todayStr = toLocalDateString(today);

  let startStr: string;
  if (options.period === 'currentWeek') {
    startStr = getWeekStartStr(today);
  } else {
    const start = new Date(today);
    start.setDate(start.getDate() - 27);
    startStr = toLocalDateString(start);
  }

  const minutesById = new Map<string, number>();

  for (const plan of plans) {
    if (plan.date < startStr || plan.date > todayStr) continue;
    for (const entry of plan.entries) {
      if (!isEntryDone(entry)) continue;
      minutesById.set(
        entry.activityId,
        (minutesById.get(entry.activityId) ?? 0) + entry.plannedMinutes,
      );
    }
  }

  return activities
    .filter((a) => minutesById.has(a.id))
    .map((a) => ({ activityName: a.name, minutes: minutesById.get(a.id) ?? 0 }))
    .sort((a, b) => b.minutes - a.minutes);
}
