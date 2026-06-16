import { getPersonalDoneMinutesByActivity } from '../personalMetrics';
import { PersonalActivity, PersonalDailyPlan } from '../../types';

const TODAY = new Date('2026-06-16T12:00:00.000Z'); // Tuesday

const ACT_A: PersonalActivity = { id: 'a1', name: 'Leitura' };
const ACT_B: PersonalActivity = { id: 'a2', name: 'Exercício' };

function makePlan(
  date: string,
  entries: { activityId: string; done: boolean; plannedMinutes: number }[],
): PersonalDailyPlan {
  return {
    date,
    entries: entries.map((e, i) => ({ id: `${date}-${i}`, ...e })),
  };
}

describe('getPersonalDoneMinutesByActivity', () => {
  it('returns empty array when no plans', () => {
    const result = getPersonalDoneMinutesByActivity([], [ACT_A], {
      period: 'currentWeek',
      today: TODAY,
    });
    expect(result).toEqual([]);
  });

  it('returns empty array when no done entries', () => {
    const plan = makePlan('2026-06-16', [
      { activityId: 'a1', done: false, plannedMinutes: 30 },
    ]);
    const result = getPersonalDoneMinutesByActivity([plan], [ACT_A], {
      period: 'currentWeek',
      today: TODAY,
    });
    expect(result).toEqual([]);
  });

  it('sums done minutes for a single activity', () => {
    const plan1 = makePlan('2026-06-15', [
      { activityId: 'a1', done: true, plannedMinutes: 30 },
    ]);
    const plan2 = makePlan('2026-06-16', [
      { activityId: 'a1', done: true, plannedMinutes: 20 },
    ]);
    const result = getPersonalDoneMinutesByActivity([plan1, plan2], [ACT_A], {
      period: 'currentWeek',
      today: TODAY,
    });
    expect(result).toEqual([{ activityName: 'Leitura', minutes: 50 }]);
  });

  it('returns multiple activities sorted by minutes desc', () => {
    const plan = makePlan('2026-06-16', [
      { activityId: 'a1', done: true, plannedMinutes: 20 },
      { activityId: 'a2', done: true, plannedMinutes: 45 },
    ]);
    const result = getPersonalDoneMinutesByActivity([plan], [ACT_A, ACT_B], {
      period: 'currentWeek',
      today: TODAY,
    });
    expect(result[0]).toEqual({ activityName: 'Exercício', minutes: 45 });
    expect(result[1]).toEqual({ activityName: 'Leitura', minutes: 20 });
  });

  it('excludes plans outside current week', () => {
    // SESSION_LAST_WEEK: 2026-06-08 is in previous week
    const old = makePlan('2026-06-08', [
      { activityId: 'a1', done: true, plannedMinutes: 60 },
    ]);
    const current = makePlan('2026-06-15', [
      { activityId: 'a1', done: true, plannedMinutes: 30 },
    ]);
    const result = getPersonalDoneMinutesByActivity([old, current], [ACT_A], {
      period: 'currentWeek',
      today: TODAY,
    });
    expect(result).toEqual([{ activityName: 'Leitura', minutes: 30 }]);
  });

  it('includes last 4 weeks for last4Weeks period', () => {
    // 28 days back from 2026-06-16 = 2026-05-20
    const old = makePlan('2026-05-20', [
      { activityId: 'a1', done: true, plannedMinutes: 60 },
    ]);
    const current = makePlan('2026-06-16', [
      { activityId: 'a1', done: true, plannedMinutes: 30 },
    ]);
    const result = getPersonalDoneMinutesByActivity([old, current], [ACT_A], {
      period: 'last4Weeks',
      today: TODAY,
    });
    expect(result).toEqual([{ activityName: 'Leitura', minutes: 90 }]);
  });

  it('excludes plans before last4Weeks start', () => {
    const tooOld = makePlan('2026-05-19', [
      { activityId: 'a1', done: true, plannedMinutes: 60 },
    ]);
    const result = getPersonalDoneMinutesByActivity([tooOld], [ACT_A], {
      period: 'last4Weeks',
      today: TODAY,
    });
    expect(result).toEqual([]);
  });
});
