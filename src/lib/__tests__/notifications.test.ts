import {
  cancelReminderNotification,
  requestNotificationPermission,
  scheduleNudgeNotification,
  scheduleReminderNotification,
} from '../notifications';

jest.mock('expo-notifications', () => ({
  AndroidImportance: { MAX: 5 },
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ExpoNotifications = require('expo-notifications') as {
  setNotificationChannelAsync: jest.Mock;
  requestPermissionsAsync: jest.Mock;
  scheduleNotificationAsync: jest.Mock;
  cancelScheduledNotificationAsync: jest.Mock;
};

const futureDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();

const reminder = {
  id: 'r1',
  title: 'Test reminder',
  description: 'Some description',
  datetime: futureDate,
};

describe('requestNotificationPermission', () => {
  it('returns true when granted', async () => {
    ExpoNotifications.setNotificationChannelAsync.mockResolvedValue(undefined);
    ExpoNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
    expect(await requestNotificationPermission()).toBe(true);
  });

  it('returns false when denied', async () => {
    ExpoNotifications.setNotificationChannelAsync.mockResolvedValue(undefined);
    ExpoNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' });
    expect(await requestNotificationPermission()).toBe(false);
  });
});

describe('scheduleReminderNotification', () => {
  it('schedules and returns notification id', async () => {
    ExpoNotifications.setNotificationChannelAsync.mockResolvedValue(undefined);
    ExpoNotifications.scheduleNotificationAsync.mockResolvedValue('notif-123');
    const result = await scheduleReminderNotification(reminder);
    expect(result).toBe('notif-123');
    expect(ExpoNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ title: 'Test reminder' }),
      }),
    );
  });

  it('returns null when scheduling throws', async () => {
    ExpoNotifications.scheduleNotificationAsync.mockRejectedValue(new Error('fail'));
    const result = await scheduleReminderNotification(reminder);
    expect(result).toBeNull();
  });

  it('returns null when datetime is in the past', async () => {
    const pastReminder = {
      ...reminder,
      datetime: new Date(Date.now() - 1000).toISOString(),
    };
    const result = await scheduleReminderNotification(pastReminder);
    expect(result).toBeNull();
  });
});

describe('scheduleNudgeNotification', () => {
  const futureEndsAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  it('schedules and returns notification id', async () => {
    ExpoNotifications.setNotificationChannelAsync.mockResolvedValue(undefined);
    ExpoNotifications.scheduleNotificationAsync.mockResolvedValue('nudge-notif-1');
    const result = await scheduleNudgeNotification({
      id: 'n1',
      label: 'Video Game',
      endsAt: futureEndsAt,
    });
    expect(result).toBe('nudge-notif-1');
    expect(ExpoNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ title: 'Video Game' }),
      }),
    );
  });

  it('returns null when endsAt is in the past', async () => {
    const result = await scheduleNudgeNotification({
      id: 'n1',
      label: 'Video Game',
      endsAt: new Date(Date.now() - 1000).toISOString(),
    });
    expect(result).toBeNull();
  });

  it('returns null when scheduling throws', async () => {
    ExpoNotifications.scheduleNotificationAsync.mockRejectedValue(new Error('fail'));
    const result = await scheduleNudgeNotification({
      id: 'n1',
      label: 'Video Game',
      endsAt: futureEndsAt,
    });
    expect(result).toBeNull();
  });
});

describe('cancelReminderNotification', () => {
  it('calls cancelScheduledNotificationAsync with the id', async () => {
    ExpoNotifications.cancelScheduledNotificationAsync.mockResolvedValue(undefined);
    await cancelReminderNotification('notif-123');
    expect(ExpoNotifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      'notif-123',
    );
  });
});
