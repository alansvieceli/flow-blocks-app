export type CategoryId = 'foco_profundo' | 'reunioes' | 'revisao_codigo' | 'admin';

export interface Team {
  id: string;
  name: string;
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
}

export interface PersonalDailyPlan {
  date: string; // YYYY-MM-DD
  entries: PersonalDailyPlanEntry[];
}
