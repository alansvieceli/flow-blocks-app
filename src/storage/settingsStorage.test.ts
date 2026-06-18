import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSettings, saveSettings } from './settingsStorage';

beforeEach(() => AsyncStorage.clear());

describe('settingsStorage', () => {
  it('returns defaults when nothing stored', async () => {
    const settings = await getSettings();
    expect(settings).toEqual({
      notificationsEnabled: true,
      historyMonths: 4,
      nudgeAbandonHours: 8,
      workStartHour: 8,
      workEndHour: 18,
      lunchDurationMinutes: 60,
    });
  });

  it('saves and retrieves settings', async () => {
    await saveSettings({
      notificationsEnabled: false,
      historyMonths: 6,
      nudgeAbandonHours: 8,
      workStartHour: 8,
      workEndHour: 18,
      lunchDurationMinutes: 60,
    });
    expect(await getSettings()).toEqual({
      notificationsEnabled: false,
      historyMonths: 6,
      nudgeAbandonHours: 8,
      workStartHour: 8,
      workEndHour: 18,
      lunchDurationMinutes: 60,
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
    await saveSettings({
      notificationsEnabled: true,
      historyMonths: 4,
      nudgeAbandonHours: 8,
      workStartHour: 8,
      workEndHour: 18,
      lunchDurationMinutes: 60,
    });
    await saveSettings({
      notificationsEnabled: false,
      historyMonths: 12,
      nudgeAbandonHours: 4,
      workStartHour: 8,
      workEndHour: 18,
      lunchDurationMinutes: 60,
    });
    const settings = await getSettings();
    expect(settings.notificationsEnabled).toBe(false);
    expect(settings.historyMonths).toBe(12);
    expect(settings.nudgeAbandonHours).toBe(4);
  });

  it('returns default workStartHour of 8', async () => {
    const settings = await getSettings();
    expect(settings.workStartHour).toBe(8);
  });

  it('returns default workEndHour of 18', async () => {
    const settings = await getSettings();
    expect(settings.workEndHour).toBe(18);
  });

  it('returns default lunchDurationMinutes of 60', async () => {
    const settings = await getSettings();
    expect(settings.lunchDurationMinutes).toBe(60);
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
      notificationsEnabled: true,
      historyMonths: 4,
      nudgeAbandonHours: 8,
      workStartHour: 9,
      workEndHour: 17,
      lunchDurationMinutes: 30,
    });
    const settings = await getSettings();
    expect(settings.workStartHour).toBe(9);
    expect(settings.workEndHour).toBe(17);
    expect(settings.lunchDurationMinutes).toBe(30);
  });
});
