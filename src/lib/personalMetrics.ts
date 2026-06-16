import { PersonalActivity, PersonalDailyPlan } from '../types';

function toDateString(iso: string): string {
  return iso.slice(0, 10);
}

function getWeekStartStr(today: Date): string {
  const d = new Date(today);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return toDateString(d.toISOString());
}

export function getPersonalDoneMinutesByActivity(
  plans: PersonalDailyPlan[],
  activities: PersonalActivity[],
  options: { period: 'currentWeek' | 'last4Weeks'; today: Date },
): { activityName: string; minutes: number }[] {
  const today = options.today;
  const todayStr = toDateString(today.toISOString());

  let startStr: string;
  if (options.period === 'currentWeek') {
    startStr = getWeekStartStr(today);
  } else {
    const start = new Date(today);
    start.setUTCDate(start.getUTCDate() - 27);
    startStr = toDateString(start.toISOString());
  }

  const minutesById = new Map<string, number>();

  for (const plan of plans) {
    if (plan.date < startStr || plan.date > todayStr) continue;
    for (const entry of plan.entries) {
      if (!entry.done) continue;
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
