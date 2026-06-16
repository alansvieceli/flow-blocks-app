import { formatDuration } from './formatDuration';

describe('formatDuration', () => {
  it('formats seconds only when less than 60', () => {
    expect(formatDuration(45)).toBe('45s');
    expect(formatDuration(1)).toBe('1s');
    expect(formatDuration(59)).toBe('59s');
  });

  it('formats minutes and seconds when less than 1 hour', () => {
    expect(formatDuration(90)).toBe('1m 30s');
    expect(formatDuration(60)).toBe('1m 0s');
    expect(formatDuration(3599)).toBe('59m 59s');
  });

  it('formats hours and minutes when 1 hour or more', () => {
    expect(formatDuration(3600)).toBe('1h 0m');
    expect(formatDuration(3661)).toBe('1h 1m');
    expect(formatDuration(5400)).toBe('1h 30m');
    expect(formatDuration(7200)).toBe('2h 0m');
  });

  it('handles zero', () => {
    expect(formatDuration(0)).toBe('0s');
  });
});
