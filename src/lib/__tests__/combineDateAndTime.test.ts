import { combineDateAndTime } from '../combineDateAndTime';

describe('combineDateAndTime', () => {
  it('sets hours and minutes from hhmm on the given date', () => {
    const base = new Date(2024, 2, 15, 0, 0, 0); // 2024-03-15
    const result = combineDateAndTime(base, '14:30');
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(2);
    expect(result.getDate()).toBe(15);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it('handles midnight correctly', () => {
    const base = new Date(2024, 2, 15, 12, 0, 0);
    const result = combineDateAndTime(base, '00:00');
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
  });

  it('does not mutate the original date', () => {
    const base = new Date(2024, 2, 15, 10, 0, 0);
    combineDateAndTime(base, '15:00');
    expect(base.getHours()).toBe(10);
  });

  it('works for yesterday date', () => {
    const yesterday = new Date(2024, 2, 14, 0, 0, 0);
    const result = combineDateAndTime(yesterday, '09:15');
    expect(result.getDate()).toBe(14);
    expect(result.getHours()).toBe(9);
    expect(result.getMinutes()).toBe(15);
  });
});
