export function combineDateAndTime(date: Date, hhmm: string): Date {
  const [hh, mm] = hhmm.split(':').map(Number);
  const result = new Date(date);
  result.setHours(hh, mm, 0, 0);
  return result;
}
