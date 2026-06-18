import { ActiveNudge, PersonalDailyPlan } from '../types';

export function getPersonalNudgeMinutes(nudge: Pick<ActiveNudge, 'durationSeconds'>) {
  return Math.max(1, Math.round(nudge.durationSeconds / 60));
}

export function applyPersonalNudgeToDailyPlans(
  plans: PersonalDailyPlan[],
  nudge: Pick<ActiveNudge, 'activityId' | 'durationSeconds'>,
  date: string,
): PersonalDailyPlan[] {
  if (!nudge.activityId) return plans;

  const minutesToAdd = getPersonalNudgeMinutes(nudge);
  const existingPlan = plans.find((plan) => plan.date === date);

  if (!existingPlan) {
    return [
      ...plans,
      {
        date,
        entries: [
          {
            id: `${date}-${nudge.activityId}-nudge`,
            activityId: nudge.activityId,
            plannedMinutes: minutesToAdd,
            done: true,
            status: 'done',
          },
        ],
      },
    ];
  }

  return plans.map((plan) => {
    if (plan.date !== date) return plan;

    const existingEntry = plan.entries.find(
      (entry) => entry.activityId === nudge.activityId,
    );

    if (!existingEntry) {
      return {
        ...plan,
        entries: [
          ...plan.entries,
          {
            id: `${date}-${nudge.activityId}-nudge`,
            activityId: nudge.activityId!,
            plannedMinutes: minutesToAdd,
            done: true,
            status: 'done' as const,
          },
        ],
      };
    }

    return {
      ...plan,
      entries: plan.entries.map((entry) =>
        entry.id === existingEntry.id
          ? {
              ...entry,
              plannedMinutes: entry.plannedMinutes + minutesToAdd,
              done: true,
              status: 'done' as const,
            }
          : entry,
      ),
    };
  });
}
