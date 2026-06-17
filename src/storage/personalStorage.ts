import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PersonalActivity,
  PersonalDailyPlan,
  PersonalWeeklyTemplateDay,
} from '../types';

export const DEFAULT_PERSONAL_ACTIVITIES: PersonalActivity[] = [
  { id: 'video_game', name: 'Video Game' },
  { id: 'estudo', name: 'Estudo' },
];

const KEYS = {
  activities: 'personalActivities',
  template: 'personalWeeklyTemplate',
  dailyPlans: 'personalDailyPlan',
} as const;

export async function getPersonalActivities(): Promise<PersonalActivity[]> {
  const raw = await AsyncStorage.getItem(KEYS.activities);
  if (raw === null) return DEFAULT_PERSONAL_ACTIVITIES;
  return JSON.parse(raw) as PersonalActivity[];
}

export async function savePersonalActivities(
  activities: PersonalActivity[],
): Promise<void> {
  await AsyncStorage.setItem(KEYS.activities, JSON.stringify(activities));
}

export async function getPersonalWeeklyTemplate(): Promise<
  PersonalWeeklyTemplateDay[]
> {
  const raw = await AsyncStorage.getItem(KEYS.template);
  if (!raw) return [];
  return JSON.parse(raw) as PersonalWeeklyTemplateDay[];
}

export async function savePersonalWeeklyTemplate(
  template: PersonalWeeklyTemplateDay[],
): Promise<void> {
  await AsyncStorage.setItem(KEYS.template, JSON.stringify(template));
}

export async function getPersonalDailyPlans(): Promise<PersonalDailyPlan[]> {
  const raw = await AsyncStorage.getItem(KEYS.dailyPlans);
  if (!raw) return [];
  return JSON.parse(raw) as PersonalDailyPlan[];
}

export async function savePersonalDailyPlans(
  plans: PersonalDailyPlan[],
): Promise<void> {
  await AsyncStorage.setItem(KEYS.dailyPlans, JSON.stringify(plans));
}
