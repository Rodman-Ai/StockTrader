import { describe, it, expect } from 'vitest';
import { synthesizeCandles } from './synth';

const NOW = 1_700_000_000_000;

describe('synthesizeCandles', () => {
  it('returns empty when anchor is invalid', () => {
    expect(synthesizeCandles('AAPL', 0, '1M', NOW)).toEqual([]);
    expect(synthesizeCandles('AAPL', NaN, '1M', NOW)).toEqual([]);
    expect(synthesizeCandles('AAPL', -1, '1M', NOW)).toEqual([]);
  });

  it('produces a non-empty series for typical ranges', () => {
    for (const r of ['1D', '1W', '1M', '3M', '1Y', '5Y'] as const) {
      const candles = synthesizeCandles('AAPL', 200, r, NOW);
      expect(candles.length).toBeGreaterThan(2);
    }
  });

  it("anchors the last close to anchorPrice", () => {
    const candles = synthesizeCandles('AAPL', 200, '3M', NOW);
    expect(candles[candles.length - 1].c).toBeCloseTo(200, 1);
  });

  it('OHLC invariants hold for every bar', () => {
    const candles = synthesizeCandles('AAPL', 200, '1Y', NOW);
    for (const c of candles) {
      expect(c.h).toBeGreaterThanOrEqual(c.o);
      expect(c.h).toBeGreaterThanOrEqual(c.c);
      expect(c.l).toBeLessThanOrEqual(c.o);
      expect(c.l).toBeLessThanOrEqual(c.c);
      expect(c.v).toBeGreaterThan(0);
      expect(c.t).toBeGreaterThan(0);
    }
  });

  it('is deterministic for the same (symbol, range, anchor, now)', () => {
    const a = synthesizeCandles('AAPL', 200, '3M', NOW);
    const b = synthesizeCandles('AAPL', 200, '3M', NOW);
    expect(a).toEqual(b);
  });

  it('produces different shapes for different symbols', () => {
    const a = synthesizeCandles('AAPL', 200, '3M', NOW);
    const b = synthesizeCandles('NVDA', 200, '3M', NOW);
    expect(a.map((c) => c.c)).not.toEqual(b.map((c) => c.c));
  });

  it('timestamps are strictly increasing', () => {
    const candles = synthesizeCandles('AAPL', 200, '1M', NOW);
    for (let i = 1; i < candles.length; i++) {
      expect(candles[i].t).toBeGreaterThan(candles[i - 1].t);
    }
  });
});
