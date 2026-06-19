import {
  generateMockPersonalDailyPlans,
  generateMockSessions,
  generateMockTeams,
} from '../devSeed';
import { Category, PersonalActivity, Team } from '../../types';

const CATEGORIES: Category[] = [
  { id: 'foco', label: 'Foco', order: 1, isFocus: true },
  { id: 'reuniao', label: 'Reunião', order: 2 },
];

const TEAMS: Team[] = [
  { id: 'teamA', name: 'Team A', order: 1, maxWeeklyPercent: 40 },
  { id: 'teamB', name: 'Team B', order: 2, maxWeeklyPercent: null },
];

const ACTIVITIES: PersonalActivity[] = [
  { id: 'video_game', name: 'Video Game' },
  { id: 'estudo', name: 'Estudo' },
];

describe('generateMockTeams', () => {
  it('returns 2 teams with distinct ids and names', () => {
    const result = generateMockTeams();
    expect(result).toHaveLength(2);
    expect(result[0].id).not.toBe(result[1].id);
    expect(result.map((t) => t.name)).toEqual(['Equipe A', 'Equipe B']);
  });
});

describe('generateMockSessions', () => {
  it('returns an empty array when there are no categories', () => {
    expect(generateMockSessions([], TEAMS)).toEqual([]);
  });

  it('returns an empty array when there are no teams (sessions still generated)', () => {
    const result = generateMockSessions(CATEGORIES, []);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((s) => s.teamId === null)).toBe(true);
  });

  it('generates sessions only for weekdays within the requested range', () => {
    const result = generateMockSessions(CATEGORIES, TEAMS, { days: 7 });
    for (const s of result) {
      const dow = new Date(s.startedAt).getDay();
      expect(dow).not.toBe(0);
      expect(dow).not.toBe(6);
    }
  });

  it('produces valid session shapes referencing known categories and teams', () => {
    const result = generateMockSessions(CATEGORIES, TEAMS, { days: 4 });
    expect(result.length).toBeGreaterThan(0);
    for (const s of result) {
      expect(CATEGORIES.some((c) => c.id === s.categoryId)).toBe(true);
      expect(s.teamId === null || TEAMS.some((t) => t.id === s.teamId)).toBe(true);
      expect(new Date(s.endedAt).getTime()).toBeGreaterThan(
        new Date(s.startedAt).getTime(),
      );
      expect(s.durationSeconds).toBeGreaterThan(0);
      expect(s.note).toBeNull();
    }
  });

  it('keeps sessions within the configured work hours', () => {
    const result = generateMockSessions(CATEGORIES, TEAMS, {
      days: 4,
      workStartHour: 9,
      workEndHour: 12,
    });
    for (const s of result) {
      const start = new Date(s.startedAt);
      const end = new Date(s.endedAt);
      expect(start.getHours()).toBeGreaterThanOrEqual(9);
      expect(end.getHours()).toBeLessThanOrEqual(12);
    }
  });

  it('falls back to focus categories when no non-focus category exists', () => {
    const onlyFocus: Category[] = [
      { id: 'foco', label: 'Foco', order: 1, isFocus: true },
    ];
    const result = generateMockSessions(onlyFocus, TEAMS, { days: 4 });
    expect(result.every((s) => s.categoryId === 'foco')).toBe(true);
  });
});

describe('generateMockPersonalDailyPlans', () => {
  it('returns an empty array when there are no activities', () => {
    expect(generateMockPersonalDailyPlans([])).toEqual([]);
  });

  it('generates one plan per requested day with valid entries', () => {
    const result = generateMockPersonalDailyPlans(ACTIVITIES, 4);
    expect(result).toHaveLength(4);
    for (const plan of result) {
      expect(plan.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(plan.entries.length).toBeGreaterThan(0);
      for (const entry of plan.entries) {
        expect(ACTIVITIES.some((a) => a.id === entry.activityId)).toBe(true);
        expect(entry.plannedMinutes).toBeGreaterThan(0);
        expect(entry.done).toBe(entry.status === 'done');
      }
    }
  });

  it('limits entries per day to the number of available activities', () => {
    const single: PersonalActivity[] = [{ id: 'estudo', name: 'Estudo' }];
    const result = generateMockPersonalDailyPlans(single, 2);
    for (const plan of result) {
      expect(plan.entries).toHaveLength(1);
    }
  });
});
