import { describe, it, expect } from 'vitest';
import { sma } from './indicators';

describe('sma', () => {
  it('returns nulls for indices before period - 1', () => {
    const out = sma([1, 2, 3, 4, 5], 3);
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
    expect(out[2]).not.toBeNull();
  });

  it('computes the rolling average correctly', () => {
    const out = sma([1, 2, 3, 4, 5], 3);
    expect(out).toEqual([null, null, 2, 3, 4]);
  });

  it('returns all nulls when input is shorter than period', () => {
    expect(sma([1, 2], 5)).toEqual([null, null]);
  });

  it('returns all values for period=1 (identity)', () => {
    expect(sma([10, 20, 30], 1)).toEqual([10, 20, 30]);
  });

  it('handles empty input', () => {
    expect(sma([], 5)).toEqual([]);
  });

  it('throws on non-positive period', () => {
    expect(() => sma([1, 2], 0)).toThrow();
    expect(() => sma([1, 2], -1)).toThrow();
  });

  it('handles a long monotonic series', () => {
    const xs = Array.from({ length: 250 }, (_, i) => i + 1);
    const out = sma(xs, 200);
    expect(out[198]).toBeNull();
    expect(out[199]).toBeCloseTo((1 + 200) / 2);
    expect(out[249]).toBeCloseTo((51 + 250) / 2);
  });
});
