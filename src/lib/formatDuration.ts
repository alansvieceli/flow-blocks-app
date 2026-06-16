export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours >= 1) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes >= 1) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}
