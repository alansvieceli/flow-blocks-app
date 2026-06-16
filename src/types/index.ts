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
