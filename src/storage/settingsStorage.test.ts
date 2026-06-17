import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSettings, saveSettings } from './settingsStorage';

beforeEach(() => AsyncStorage.clear());

describe('settingsStorage', () => {
  it('returns defaults when nothing stored', async () => {
    const settings = await getSettings();
    expect(settings).toEqual({ notificationsEnabled: true });
  });

  it('saves and retrieves settings', async () => {
    await saveSettings({ notificationsEnabled: false });
    expect(await getSettings()).toEqual({ notificationsEnabled: false });
  });

  it('merges with defaults when stored value is partial', async () => {
    await AsyncStorage.setItem('appSettings', JSON.stringify({}));
    const settings = await getSettings();
    expect(settings.notificationsEnabled).toBe(true);
  });

  it('overwrites previous settings on save', async () => {
    await saveSettings({ notificationsEnabled: true });
    await saveSettings({ notificationsEnabled: false });
    expect((await getSettings()).notificationsEnabled).toBe(false);
  });
});
