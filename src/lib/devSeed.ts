import { Category, PersonalActivity, PersonalDailyPlan, Session, Team } from '../types';
import { isFocusCategory } from './categories';
import { toLocalDateString } from './localDate';

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  return items[randomInt(0, items.length - 1)];
}

export function generateMockTeams(): Team[] {
  return [
    { id: randomId(), name: 'Equipe A', order: 1, maxWeeklyPercent: 60 },
    { id: randomId(), name: 'Equipe B', order: 2, maxWeeklyPercent: null },
  ];
}

export function generateMockSessions(
  categories: Category[],
  teams: Team[],
  options: { days?: number; workStartHour?: number; workEndHour?: number } = {},
): Session[] {
  const days = options.days ?? 4;
  const workStartHour = options.workStartHour ?? 8;
  const workEndHour = options.workEndHour ?? 18;

  const focusCategories = categories.filter((c) => isFocusCategory(c.id, categories));
  const otherCategories = categories.filter((c) => !isFocusCategory(c.id, categories));
  if (focusCategories.length === 0 && otherCategories.length === 0) return [];

  const sessions: Session[] = [];

  for (let dayOffset = days - 1; dayOffset >= 0; dayOffset--) {
    const day = new Date();
    day.setDate(day.getDate() - dayOffset);
    const dow = day.getDay();
    if (dow === 0 || dow === 6) continue;

    let cursorMinutes = workStartHour * 60 + randomInt(0, 30);
    const dayEndMinutes = workEndHour * 60;
    const blockCount = randomInt(3, 5);

    for (let i = 0; i < blockCount && cursorMinutes < dayEndMinutes; i++) {
      const useFocus = focusCategories.length > 0 && Math.random() < 0.65;
      const category = useFocus
        ? pick(focusCategories)
        : (pick(otherCategories) ?? pick(focusCategories));
      if (!category) break;

      const duration = useFocus ? randomInt(40, 90) : randomInt(15, 45);
      if (cursorMinutes + duration > dayEndMinutes) break;

      const start = new Date(day);
      start.setHours(0, cursorMinutes, 0, 0);
      const end = new Date(start.getTime() + duration * 60 * 1000);

      sessions.push({
        id: randomId(),
        categoryId: category.id,
        teamId: pick(teams)?.id ?? null,
        startedAt: start.toISOString(),
        endedAt: end.toISOString(),
        durationSeconds: duration * 60,
        note: null,
      });

      cursorMinutes += duration + randomInt(10, 40);
    }
  }

  return sessions;
}

export function generateMockPersonalDailyPlans(
  activities: PersonalActivity[],
  days = 4,
): PersonalDailyPlan[] {
  if (activities.length === 0) return [];
  const plans: PersonalDailyPlan[] = [];

  for (let dayOffset = days - 1; dayOffset >= 0; dayOffset--) {
    const day = new Date();
    day.setDate(day.getDate() - dayOffset);
    const entryCount = randomInt(1, Math.min(2, activities.length));
    const chosen = [...activities].sort(() => Math.random() - 0.5).slice(0, entryCount);

    plans.push({
      date: toLocalDateString(day),
      entries: chosen.map((a) => {
        const isDone = Math.random() < 0.6;
        return {
          id: randomId(),
          activityId: a.id,
          plannedMinutes: randomInt(15, 60),
          status: isDone ? 'done' : 'pending',
          done: isDone,
        };
      }),
    });
  }

  return plans;
}
