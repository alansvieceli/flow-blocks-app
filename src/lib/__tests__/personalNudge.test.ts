import {
  applyPersonalNudgeToDailyPlans,
  getPersonalNudgeMinutes,
} from '../personalNudge';
import { PersonalDailyPlan } from '../../types';

describe('getPersonalNudgeMinutes', () => {
  it('converts seconds to minutes, rounding to nearest minute', () => {
    expect(getPersonalNudgeMinutes({ durationSeconds: 15 * 60 })).toBe(15);
  });

  it('keeps at least one minute for very short durations', () => {
    expect(getPersonalNudgeMinutes({ durationSeconds: 30 })).toBe(1);
  });
});

describe('applyPersonalNudgeToDailyPlans', () => {
  const date = '2026-06-17';

  it('adds a done entry when the day has no plan yet', () => {
    const result = applyPersonalNudgeToDailyPlans(
      [],
      { activityId: 'video-game', durationSeconds: 15 * 60 },
      date,
    );

    expect(result).toEqual([
      {
        date,
        entries: [
          {
            id: `${date}-video-game-nudge`,
            activityId: 'video-game',
            plannedMinutes: 15,
            done: true,
            status: 'done',
          },
        ],
      },
    ]);
  });

  it('adds a done entry when the day exists without that activity', () => {
    const plans: PersonalDailyPlan[] = [
      {
        date,
        entries: [
          {
            id: 'reading',
            activityId: 'reading',
            plannedMinutes: 20,
            done: false,
            status: 'pending',
          },
        ],
      },
    ];

    const result = applyPersonalNudgeToDailyPlans(
      plans,
      { activityId: 'video-game', durationSeconds: 15 * 60 },
      date,
    );

    expect(result[0].entries).toEqual([
      plans[0].entries[0],
      {
        id: `${date}-video-game-nudge`,
        activityId: 'video-game',
        plannedMinutes: 15,
        done: true,
        status: 'done',
      },
    ]);
  });

  it('sums the nudge duration into an existing activity', () => {
    const plans: PersonalDailyPlan[] = [
      {
        date,
        entries: [
          {
            id: 'video-game-existing',
            activityId: 'video-game',
            plannedMinutes: 30,
            done: false,
            status: 'pending',
          },
        ],
      },
    ];

    const result = applyPersonalNudgeToDailyPlans(
      plans,
      { activityId: 'video-game', durationSeconds: 15 * 60 },
      date,
    );

    expect(result[0].entries[0]).toEqual({
      id: 'video-game-existing',
      activityId: 'video-game',
      plannedMinutes: 45,
      done: true,
      status: 'done',
    });
  });

  it('leaves plans unchanged when the nudge has no personal activity', () => {
    const plans: PersonalDailyPlan[] = [{ date, entries: [] }];

    expect(
      applyPersonalNudgeToDailyPlans(plans, { durationSeconds: 15 * 60 }, date),
    ).toBe(plans);
  });
});
