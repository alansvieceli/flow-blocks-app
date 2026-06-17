import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_PERSONAL_ACTIVITIES,
  getPersonalActivities,
  getPersonalDailyPlans,
  getPersonalWeeklyTemplate,
  savePersonalActivities,
  savePersonalDailyPlans,
  savePersonalWeeklyTemplate,
} from '../personalStorage';
import {
  PersonalActivity,
  PersonalDailyPlan,
  PersonalWeeklyTemplateDay,
} from '../../types';

const activity: PersonalActivity = { id: '1', name: 'Leitura' };
const templateDay: PersonalWeeklyTemplateDay = {
  dayOfWeek: 1,
  entries: [{ activityId: '1', plannedMinutes: 30 }],
};
const dailyPlan: PersonalDailyPlan = {
  date: '2026-06-16',
  entries: [{ id: 'e1', activityId: '1', plannedMinutes: 30, done: false }],
};

describe('personalStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('personalActivities', () => {
    it('returns installation defaults when absent', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      expect(await getPersonalActivities()).toEqual(DEFAULT_PERSONAL_ACTIVITIES);
    });

    it('saves and retrieves', async () => {
      let stored: string | null = null;
      (AsyncStorage.setItem as jest.Mock).mockImplementation(
        (_k: string, v: string) => {
          stored = v;
          return Promise.resolve();
        },
      );
      (AsyncStorage.getItem as jest.Mock).mockImplementation(() =>
        Promise.resolve(stored),
      );
      await savePersonalActivities([activity]);
      expect(await getPersonalActivities()).toEqual([activity]);
    });
  });

  describe('personalWeeklyTemplate', () => {
    it('returns [] when absent', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      expect(await getPersonalWeeklyTemplate()).toEqual([]);
    });

    it('saves and retrieves', async () => {
      let stored: string | null = null;
      (AsyncStorage.setItem as jest.Mock).mockImplementation(
        (_k: string, v: string) => {
          stored = v;
          return Promise.resolve();
        },
      );
      (AsyncStorage.getItem as jest.Mock).mockImplementation(() =>
        Promise.resolve(stored),
      );
      await savePersonalWeeklyTemplate([templateDay]);
      expect(await getPersonalWeeklyTemplate()).toEqual([templateDay]);
    });
  });

  describe('personalDailyPlans', () => {
    it('returns [] when absent', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      expect(await getPersonalDailyPlans()).toEqual([]);
    });

    it('saves and retrieves', async () => {
      let stored: string | null = null;
      (AsyncStorage.setItem as jest.Mock).mockImplementation(
        (_k: string, v: string) => {
          stored = v;
          return Promise.resolve();
        },
      );
      (AsyncStorage.getItem as jest.Mock).mockImplementation(() =>
        Promise.resolve(stored),
      );
      await savePersonalDailyPlans([dailyPlan]);
      expect(await getPersonalDailyPlans()).toEqual([dailyPlan]);
    });
  });
});
