export function isUsMarketOpen(now: Date = new Date()): boolean {
  const ny = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = ny.getDay();
  if (day === 0 || day === 6) return false;
  const minutes = ny.getHours() * 60 + ny.getMinutes();
  return minutes >= 9 * 60 + 30 && minutes < 16 * 60;
}
