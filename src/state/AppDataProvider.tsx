import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  clearActiveSession,
  getActiveSession,
  setActiveSession as persistActiveSession,
  subscribeActiveSession,
} from '../storage/activeSessionStorage';
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
import {
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
  clearActiveSession: () => Promise<void>;
  refreshAll: () => Promise<void>;
  setActiveSession: (session: ActiveSession) => Promise<void>;
  updateCategories: (categories: Category[]) => Promise<void>;
  updatePersonalActivities: (activities: PersonalActivity[]) => Promise<void>;
  updatePersonalDailyPlans: (plans: PersonalDailyPlan[]) => Promise<void>;
  updatePersonalWeeklyTemplate: (
    template: PersonalWeeklyTemplateDay[],
  ) => Promise<void>;
  updateReminders: (reminders: Reminder[]) => Promise<void>;
  updateSessions: (sessions: Session[]) => Promise<void>;
  updateSettings: (settings: AppSettings) => Promise<void>;
  updateTeams: (teams: Team[]) => Promise<void>;
}

const DEFAULT_SETTINGS: AppSettings = { notificationsEnabled: true };

const AppDataContext = createContext<AppDataContextValue | null>(null);

async function loadAppData(): Promise<
  Omit<AppDataState, 'error' | 'isLoading' | 'isRefreshing'>
> {
  const [
    teams,
    sessions,
    activeSession,
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
    getCategories(),
    getReminders(),
    getSettings(),
    getPersonalActivities(),
    getPersonalWeeklyTemplate(),
    getPersonalDailyPlans(),
  ]);

  return {
    activeSession,
    categories,
    personalActivities,
    personalDailyPlans,
    personalWeeklyTemplate,
    reminders,
    sessions,
    settings,
    teams,
  };
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppDataState>({
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
    const unsubscribe = subscribeActiveSession((activeSession) => {
      setState((current) => ({ ...current, activeSession }));
    });
    return unsubscribe;
  }, [refreshAll]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      ...state,
      clearActiveSession: async () => {
        setState((current) => ({ ...current, activeSession: null }));
        await clearActiveSession();
      },
      refreshAll,
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
        setState((current) => ({ ...current, personalDailyPlans }));
        await savePersonalDailyPlans(personalDailyPlans);
      },
      updatePersonalWeeklyTemplate: async (personalWeeklyTemplate) => {
        setState((current) => ({ ...current, personalWeeklyTemplate }));
        await savePersonalWeeklyTemplate(personalWeeklyTemplate);
      },
      updateReminders: async (reminders) => {
        setState((current) => ({ ...current, reminders }));
        await saveReminders(reminders);
      },
      updateSessions: async (sessions) => {
        setState((current) => ({ ...current, sessions }));
        await saveSessions(sessions);
      },
      updateSettings: async (settings) => {
        setState((current) => ({ ...current, settings }));
        await saveSettings(settings);
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
