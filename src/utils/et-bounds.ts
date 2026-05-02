function nyOffsetHours(d: Date): number {
  const tz = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    timeZoneName: 'short',
  })
    .formatToParts(d)
    .find((p) => p.type === 'timeZoneName')?.value;
  return tz === 'EST' ? 5 : 4;
}

export function etMarketBounds(dateStr: string): { open: number; close: number } {
  const [y, m, d] = dateStr.split('-').map(Number);
  const probe = new Date(Date.UTC(y, m - 1, d, 17, 0, 0));
  const off = nyOffsetHours(probe);
  const open = Date.UTC(y, m - 1, d, 9 + off, 30, 0);
  const close = Date.UTC(y, m - 1, d, 16 + off, 0, 0);
  return { open, close };
}

export function lastWeekdayDateStr(now: Date = new Date()): string {
  const d = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() - 1);
  }
  return formatDateStr(d);
}

export function formatDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
