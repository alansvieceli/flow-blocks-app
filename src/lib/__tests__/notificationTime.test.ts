import { normalizeNotificationDateToMinute } from '../notificationTime';

describe('normalizeNotificationDateToMinute', () => {
  it('keeps the selected minute and clears seconds and milliseconds', () => {
    const normalized = normalizeNotificationDateToMinute(
      new Date('2026-06-17T23:52:37.456Z'),
    );

    expect(normalized.toISOString()).toBe('2026-06-17T23:52:00.000Z');
  });

  it('does not mutate the original date', () => {
    const original = new Date('2026-06-17T23:52:37.456Z');

    normalizeNotificationDateToMinute(original);

    expect(original.toISOString()).toBe('2026-06-17T23:52:37.456Z');
  });
});
