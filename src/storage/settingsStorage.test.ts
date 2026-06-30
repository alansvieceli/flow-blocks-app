import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSettings, saveSettings } from './settingsStorage';

const BASE: Parameters<typeof saveSettings>[0] = {
  notificationsEnabled: true,
  historyMonths: 4,
  nudgeAbandonHours: 8,
  workStartHour: 8,
  workEndHour: 18,
  lunchDurationMinutes: 60,
  sessionReminderIntervalMinutes: 60,
  sessionReminderCount: 12,
};

beforeEach(() => AsyncStorage.clear());

describe('settingsStorage', () => {
  it('returns defaults when nothing stored', async () => {
    const settings = await getSettings();
    expect(settings).toEqual(BASE);
  });

  it('saves and retrieves settings', async () => {
    await saveSettings({ ...BASE, notificationsEnabled: false, historyMonths: 6 });
    expect(await getSettings()).toEqual({
      ...BASE,
      notificationsEnabled: false,
      historyMonths: 6,
    });
  });

  it('merges with defaults when stored value is partial', async () => {
    await AsyncStorage.setItem('appSettings', JSON.stringify({}));
    const settings = await getSettings();
    expect(settings.notificationsEnabled).toBe(true);
    expect(settings.historyMonths).toBe(4);
    expect(settings.nudgeAbandonHours).toBe(8);
  });

  it('overwrites previous settings on save', async () => {
    await saveSettings(BASE);
    await saveSettings({
      ...BASE,
      notificationsEnabled: false,
      historyMonths: 12,
      nudgeAbandonHours: 4,
    });
    const settings = await getSettings();
    expect(settings.notificationsEnabled).toBe(false);
    expect(settings.historyMonths).toBe(12);
    expect(settings.nudgeAbandonHours).toBe(4);
  });

  it('returns default workStartHour of 8', async () => {
    expect((await getSettings()).workStartHour).toBe(8);
  });

  it('returns default workEndHour of 18', async () => {
    expect((await getSettings()).workEndHour).toBe(18);
  });

  it('returns default lunchDurationMinutes of 60', async () => {
    expect((await getSettings()).lunchDurationMinutes).toBe(60);
  });

  it('merges new fields with defaults when stored value is partial (old format)', async () => {
    await AsyncStorage.setItem(
      'appSettings',
      JSON.stringify({
        notificationsEnabled: false,
        historyMonths: 6,
        nudgeAbandonHours: 8,
      }),
    );
    const settings = await getSettings();
    expect(settings.workStartHour).toBe(8);
    expect(settings.workEndHour).toBe(18);
    expect(settings.lunchDurationMinutes).toBe(60);
  });

  it('saves and retrieves custom work schedule fields', async () => {
    await saveSettings({
      ...BASE,
      workStartHour: 9,
      workEndHour: 17,
      lunchDurationMinutes: 30,
    });
    const settings = await getSettings();
    expect(settings.workStartHour).toBe(9);
    expect(settings.workEndHour).toBe(17);
    expect(settings.lunchDurationMinutes).toBe(30);
  });

  it('returns default sessionReminderIntervalMinutes of 60', async () => {
    expect((await getSettings()).sessionReminderIntervalMinutes).toBe(60);
  });

  it('returns default sessionReminderCount of 12', async () => {
    expect((await getSettings()).sessionReminderCount).toBe(12);
  });

  it('merges session reminder fields from old stored format', async () => {
    await AsyncStorage.setItem(
      'appSettings',
      JSON.stringify({ notificationsEnabled: false, historyMonths: 3 }),
    );
    const settings = await getSettings();
    expect(settings.sessionReminderIntervalMinutes).toBe(60);
    expect(settings.sessionReminderCount).toBe(12);
  });

  it('saves and retrieves sessionReminderIntervalMinutes as null (disabled)', async () => {
    await saveSettings({
      ...BASE,
      sessionReminderIntervalMinutes: null,
      sessionReminderCount: 6,
    });
    const settings = await getSettings();
    expect(settings.sessionReminderIntervalMinutes).toBeNull();
    expect(settings.sessionReminderCount).toBe(6);
  });
});
