import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  clearActiveSession,
  getActiveSession,
  setActiveSession as persistActiveSession,
  subscribeActiveSession,
} from '../storage/activeSessionStorage';
import {
  clearActiveNudge,
  getActiveNudge,
  setActiveNudge as persistActiveNudge,
  subscribeActiveNudge,
} from '../storage/activeNudgeStorage';
import { getCategories, saveCategories } from '../storage/categoriesStorage';
import {
  getPersonalActivities,
  getPersonalDailyPlans,
  getPersonalWeeklyTemplate,
  savePersonalActivities,
  savePersonalDailyPlans,
  savePersonalWeeklyTemplate,
} from '../storage/personalStorage';
import { getReminders, saveReminders } from '../storage/remindersStorage';
import { getSessions, saveSessions } from '../storage/sessionsStorage';
import { AppSettings, getSettings, saveSettings } from '../storage/settingsStorage';
import { getTeams, saveTeams } from '../storage/teamsStorage';
import { cancelAllNotifications } from '../lib/notifications';
import {
  ActiveNudge,
  ActiveSession,
  Category,
  PersonalActivity,
  PersonalDailyPlan,
  PersonalWeeklyTemplateDay,
  Reminder,
  Session,
  Team,
} from '../types';
import { sortByOrder } from '../lib/sortByOrder';

interface AppDataState {
  activeNudge: ActiveNudge | null;
  activeSession: ActiveSession | null;
  categories: Category[];
  error: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  personalActivities: PersonalActivity[];
  personalDailyPlans: PersonalDailyPlan[];
  personalWeeklyTemplate: PersonalWeeklyTemplateDay[];
  reminders: Reminder[];
  sessions: Session[];
  settings: AppSettings;
  teams: Team[];
}

interface AppDataContextValue extends AppDataState {
  clearActiveNudge: () => Promise<void>;
  setActiveNudge: (nudge: ActiveNudge) => Promise<void>;
  clearActiveSession: () => Promise<void>;
  refreshAll: () => Promise<void>;
  resetAll: () => Promise<void>;
  setActiveSession: (session: ActiveSession) => Promise<void>;
  updateCategories: (categories: Category[]) => Promise<void>;
  updatePersonalActivities: (activities: PersonalActivity[]) => Promise<void>;
  updatePersonalDailyPlans: (plans: PersonalDailyPlan[]) => Promise<void>;
  updatePersonalWeeklyTemplate: (
    template: PersonalWeeklyTemplateDay[],
  ) => Promise<void>;
  updateReminders: (reminders: Reminder[]) => Promise<void>;
  appendSession: (session: Session) => Promise<void>;
  replaceSession: (session: Session) => Promise<void>;
  removeSession: (id: string) => Promise<void>;
  updateSessions: (sessions: Session[]) => Promise<void>;
  updateSettings: (settings: AppSettings) => Promise<void>;
  updateTeams: (teams: Team[]) => Promise<void>;
}

const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: true,
  historyMonths: 4,
  nudgeAbandonHours: 8,
};

function cutoffDate(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d;
}

function pruneSessionsByRetention(sessions: Session[], months: number): Session[] {
  const cutoff = cutoffDate(months);
  return sessions.filter((s) => new Date(s.startedAt) >= cutoff);
}

function prunePlansByRetention(
  plans: PersonalDailyPlan[],
  months: number,
): PersonalDailyPlan[] {
  const cutoffStr = cutoffDate(months).toISOString().slice(0, 10);
  return plans.filter((p) => p.date >= cutoffStr);
}

function pruneRemindersByRetention(reminders: Reminder[], months: number): Reminder[] {
  const cutoff = cutoffDate(months);
  return reminders.filter((r) => new Date(r.datetime) >= cutoff);
}

const ALL_STORAGE_KEYS = [
  'active_nudge',
  'teams',
  'sessions',
  'categories',
  'reminders',
  'appSettings',
  'personalActivities',
  'personalWeeklyTemplate',
  'personalDailyPlan',
] as const;

const AppDataContext = createContext<AppDataContextValue | null>(null);

async function loadAppData(): Promise<
  Omit<AppDataState, 'error' | 'isLoading' | 'isRefreshing'>
> {
  const [
    teams,
    sessions,
    activeSession,
    activeNudge,
    categories,
    reminders,
    settings,
    personalActivities,
    personalWeeklyTemplate,
    personalDailyPlans,
  ] = await Promise.all([
    getTeams(),
    getSessions(),
    getActiveSession(),
    getActiveNudge(),
    getCategories(),
    getReminders(),
    getSettings(),
    getPersonalActivities(),
    getPersonalWeeklyTemplate(),
    getPersonalDailyPlans(),
  ]);

  const months = settings.historyMonths;
  const prunedSessions = pruneSessionsByRetention(sessions, months);
  const prunedPlans = prunePlansByRetention(personalDailyPlans, months);
  const prunedReminders = pruneRemindersByRetention(reminders, months);

  const saves: Promise<void>[] = [];
  if (prunedSessions.length < sessions.length) saves.push(saveSessions(prunedSessions));
  if (prunedPlans.length < personalDailyPlans.length)
    saves.push(savePersonalDailyPlans(prunedPlans));
  if (prunedReminders.length < reminders.length)
    saves.push(saveReminders(prunedReminders));
  if (saves.length > 0) await Promise.all(saves);

  return {
    activeNudge,
    activeSession,
    categories,
    personalActivities,
    personalDailyPlans: prunedPlans,
    personalWeeklyTemplate,
    reminders: prunedReminders,
    sessions: prunedSessions,
    settings,
    teams,
  };
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppDataState>({
    activeNudge: null,
    activeSession: null,
    categories: [],
    error: null,
    isLoading: true,
    isRefreshing: false,
    personalActivities: [],
    personalDailyPlans: [],
    personalWeeklyTemplate: [],
    reminders: [],
    sessions: [],
    settings: DEFAULT_SETTINGS,
    teams: [],
  });

  const refreshAll = useCallback(async () => {
    setState((current) => ({
      ...current,
      error: null,
      isRefreshing: !current.isLoading,
    }));
    try {
      const data = await loadAppData();
      setState((current) => ({
        ...current,
        ...data,
        error: null,
        isLoading: false,
        isRefreshing: false,
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        error: error instanceof Error ? error.message : 'Erro ao carregar dados.',
        isLoading: false,
        isRefreshing: false,
      }));
    }
  }, []);

  useEffect(() => {
    void refreshAll();
    const unsubSession = subscribeActiveSession((activeSession) => {
      setState((current) => ({ ...current, activeSession }));
    });
    const unsubNudge = subscribeActiveNudge((activeNudge) => {
      setState((current) => ({ ...current, activeNudge }));
    });
    return () => {
      unsubSession();
      unsubNudge();
    };
  }, [refreshAll]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      ...state,
      clearActiveNudge: async () => {
        setState((current) => ({ ...current, activeNudge: null }));
        await clearActiveNudge();
      },
      setActiveNudge: async (activeNudge) => {
        setState((current) => ({ ...current, activeNudge }));
        await persistActiveNudge(activeNudge);
      },
      clearActiveSession: async () => {
        setState((current) => ({ ...current, activeSession: null }));
        await clearActiveSession();
      },
      refreshAll,
      resetAll: async () => {
        await cancelAllNotifications();
        await clearActiveSession();
        await AsyncStorage.multiRemove([...ALL_STORAGE_KEYS]);
        await refreshAll();
      },
      setActiveSession: async (activeSession) => {
        setState((current) => ({ ...current, activeSession }));
        await persistActiveSession(activeSession);
      },
      updateCategories: async (categories) => {
        const sorted = sortByOrder(categories);
        setState((current) => ({ ...current, categories: sorted }));
        await saveCategories(sorted);
      },
      updatePersonalActivities: async (personalActivities) => {
        setState((current) => ({ ...current, personalActivities }));
        await savePersonalActivities(personalActivities);
      },
      updatePersonalDailyPlans: async (personalDailyPlans) => {
        const pruned = prunePlansByRetention(
          personalDailyPlans,
          state.settings.historyMonths,
        );
        setState((current) => ({ ...current, personalDailyPlans: pruned }));
        await savePersonalDailyPlans(pruned);
      },
      updatePersonalWeeklyTemplate: async (personalWeeklyTemplate) => {
        setState((current) => ({ ...current, personalWeeklyTemplate }));
        await savePersonalWeeklyTemplate(personalWeeklyTemplate);
      },
      updateReminders: async (reminders) => {
        const pruned = pruneRemindersByRetention(
          reminders,
          state.settings.historyMonths,
        );
        setState((current) => ({ ...current, reminders: pruned }));
        await saveReminders(pruned);
      },
      appendSession: async (session) => {
        const months = state.settings.historyMonths;
        const pruned = await new Promise<Session[]>((resolve) => {
          setState((current) => {
            const next = [...current.sessions, session];
            const p = pruneSessionsByRetention(next, months);
            resolve(p);
            return { ...current, sessions: p };
          });
        });
        await saveSessions(pruned);
      },
      replaceSession: async (session) => {
        const months = state.settings.historyMonths;
        const pruned = await new Promise<Session[]>((resolve) => {
          setState((current) => {
            const next = current.sessions.map((s) =>
              s.id === session.id ? session : s,
            );
            const p = pruneSessionsByRetention(next, months);
            resolve(p);
            return { ...current, sessions: p };
          });
        });
        await saveSessions(pruned);
      },
      removeSession: async (id) => {
        const next = await new Promise<Session[]>((resolve) => {
          setState((current) => {
            const filtered = current.sessions.filter((s) => s.id !== id);
            resolve(filtered);
            return { ...current, sessions: filtered };
          });
        });
        await saveSessions(next);
      },
      updateSessions: async (sessions) => {
        const pruned = pruneSessionsByRetention(sessions, state.settings.historyMonths);
        setState((current) => ({ ...current, sessions: pruned }));
        await saveSessions(pruned);
      },
      updateSettings: async (settings) => {
        const months = settings.historyMonths;
        const prunedSessions = pruneSessionsByRetention(state.sessions, months);
        const prunedPlans = prunePlansByRetention(state.personalDailyPlans, months);
        const prunedReminders = pruneRemindersByRetention(state.reminders, months);
        setState((current) => ({
          ...current,
          settings,
          sessions: prunedSessions,
          personalDailyPlans: prunedPlans,
          reminders: prunedReminders,
        }));
        await Promise.all([
          saveSettings(settings),
          saveSessions(prunedSessions),
          savePersonalDailyPlans(prunedPlans),
          saveReminders(prunedReminders),
        ]);
      },
      updateTeams: async (teams) => {
        const sorted = sortByOrder(teams);
        setState((current) => ({ ...current, teams: sorted }));
        await saveTeams(sorted);
      },
    }),
    [refreshAll, state],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return context;
}
