export type CategoryId = string;

export interface Category {
  id: CategoryId;
  label: string;
  order: number;
  isFocus?: boolean;
}

export interface Team {
  id: string;
  name: string;
  order: number;
  maxWeeklyPercent: number | null;
}

export interface Session {
  id: string;
  categoryId: CategoryId;
  teamId: string | null;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  note: string | null;
}

export interface ActiveSession {
  id: string;
  categoryId: CategoryId;
  teamId: string | null;
  startedAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  description: string | null;
  datetime: string; // ISO 8601
  categoryId: CategoryId | null;
  teamId: string | null;
  notificationId: string | null;
}

export interface ActiveNudge {
  id: string;
  label: string;
  type: 'personal' | 'work';
  activityId?: string;
  teamId?: string;
  categoryId?: string;
  startedAt: string;
  durationSeconds: number;
  endsAt: string;
  notificationId: string | null;
  extendCount: number;
}

export interface PersonalActivity {
  id: string;
  name: string;
}

export interface PersonalWeeklyTemplateDay {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  entries: { activityId: string; plannedMinutes: number }[];
}

export type PersonalDailyPlanEntryStatus = 'pending' | 'done' | 'not-done';

export interface PersonalDailyPlanEntry {
  id: string;
  activityId: string;
  plannedMinutes: number;
  status?: PersonalDailyPlanEntryStatus;
  done: boolean;
  fromTemplate?: boolean;
}

export interface PersonalDailyPlan {
  date: string; // YYYY-MM-DD
  entries: PersonalDailyPlanEntry[];
}
