import { describe, it, expect } from 'vitest';
import { etMarketBounds, lastWeekdayDateStr, formatDateStr } from './et-bounds';

describe('etMarketBounds', () => {
  it('returns 9:30 ET open and 4:00 ET close in EDT', () => {
    const { open, close } = etMarketBounds('2024-08-05');
    expect(new Date(open).toISOString()).toBe('2024-08-05T13:30:00.000Z');
    expect(new Date(close).toISOString()).toBe('2024-08-05T20:00:00.000Z');
    expect(close - open).toBe(6.5 * 60 * 60 * 1000);
  });

  it('returns 9:30 ET open and 4:00 ET close in EST', () => {
    const { open, close } = etMarketBounds('2024-01-08');
    expect(new Date(open).toISOString()).toBe('2024-01-08T14:30:00.000Z');
    expect(new Date(close).toISOString()).toBe('2024-01-08T21:00:00.000Z');
  });
});

describe('lastWeekdayDateStr', () => {
  it('returns Friday when called on Saturday', () => {
    const sat = new Date('2024-08-10T12:00:00Z');
    expect(lastWeekdayDateStr(sat)).toBe('2024-08-09');
  });

  it('returns Friday when called on Sunday', () => {
    const sun = new Date('2024-08-11T12:00:00Z');
    expect(lastWeekdayDateStr(sun)).toBe('2024-08-09');
  });

  it('returns prior weekday when called mid-week', () => {
    const wed = new Date('2024-08-07T12:00:00Z');
    expect(lastWeekdayDateStr(wed)).toBe('2024-08-06');
  });
});

describe('formatDateStr', () => {
  it('zero-pads month and day', () => {
    expect(formatDateStr(new Date('2024-03-05T00:00:00'))).toBe('2024-03-05');
  });
});
