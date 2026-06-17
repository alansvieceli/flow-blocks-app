import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSettings, saveSettings } from './settingsStorage';

beforeEach(() => AsyncStorage.clear());

describe('settingsStorage', () => {
  it('returns defaults when nothing stored', async () => {
    const settings = await getSettings();
    expect(settings).toEqual({ notificationsEnabled: true, historyMonths: 4 });
  });

  it('saves and retrieves settings', async () => {
    await saveSettings({ notificationsEnabled: false, historyMonths: 6 });
    expect(await getSettings()).toEqual({
      notificationsEnabled: false,
      historyMonths: 6,
    });
  });

  it('merges with defaults when stored value is partial', async () => {
    await AsyncStorage.setItem('appSettings', JSON.stringify({}));
    const settings = await getSettings();
    expect(settings.notificationsEnabled).toBe(true);
    expect(settings.historyMonths).toBe(4);
  });

  it('overwrites previous settings on save', async () => {
    await saveSettings({ notificationsEnabled: true, historyMonths: 4 });
    await saveSettings({ notificationsEnabled: false, historyMonths: 12 });
    const settings = await getSettings();
    expect(settings.notificationsEnabled).toBe(false);
    expect(settings.historyMonths).toBe(12);
  });
});
