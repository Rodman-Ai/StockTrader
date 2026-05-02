import { describe, it, expect } from 'vitest';
import { rangeWindow, RANGES } from './ranges';

describe('rangeWindow', () => {
  const NOW = 1_700_000_000_000;

  it('exposes all six ranges', () => {
    expect(RANGES).toEqual(['1D', '1W', '1M', '3M', '1Y', '5Y']);
  });

  it('uses intraday resolution for 1D and 1W', () => {
    expect(rangeWindow('1D', NOW).resolution).toBe('5');
    expect(rangeWindow('1W', NOW).resolution).toBe('60');
  });

  it('uses daily resolution for 1M / 3M / 1Y', () => {
    for (const r of ['1M', '3M', '1Y'] as const) {
      expect(rangeWindow(r, NOW).resolution).toBe('D');
    }
  });

  it('uses weekly resolution for 5Y', () => {
    expect(rangeWindow('5Y', NOW).resolution).toBe('W');
  });

  it('returns from < to with monotonic lookback', () => {
    const prev = { from: NOW + 1, to: NOW };
    let last = prev.from;
    for (const r of RANGES) {
      const w = rangeWindow(r, NOW);
      expect(w.to).toBe(NOW);
      expect(w.from).toBeLessThan(w.to);
      expect(w.from).toBeLessThanOrEqual(last);
      last = w.from;
    }
  });
});
