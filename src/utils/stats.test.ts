import { describe, it, expect } from 'vitest';
import { computeDrawdowns, realizedPL } from './stats';
import type { Trade } from '@/broker/types';

const DAY = 24 * 60 * 60 * 1000;

function trade(partial: Partial<Trade> & { side: 'buy' | 'sell'; qty: number; price: number; ts: number; symbol: string }): Trade {
  return {
    id: `t${partial.ts}`,
    orderId: `o${partial.ts}`,
    total: Math.round(partial.qty * partial.price * 100) / 100,
    ...partial,
  };
}

describe('computeDrawdowns', () => {
  it('returns zeros for empty input', () => {
    expect(computeDrawdowns([])).toEqual({ max: 0, current: 0, durationDays: 0, series: [] });
  });

  it('reports zero drawdown for monotonically rising series', () => {
    const r = computeDrawdowns([
      { t: 0, v: 100 },
      { t: DAY, v: 110 },
      { t: 2 * DAY, v: 120 },
    ]);
    expect(r.max).toBe(0);
    expect(r.current).toBe(0);
    expect(r.durationDays).toBe(0);
  });

  it('detects a drawdown that recovers and clears current', () => {
    const r = computeDrawdowns([
      { t: 0, v: 100 },
      { t: DAY, v: 80 },
      { t: 2 * DAY, v: 110 },
    ]);
    expect(r.max).toBeCloseTo(-0.2);
    expect(r.current).toBe(0);
    expect(r.durationDays).toBe(0);
  });

  it('reports current and max for an ongoing drawdown', () => {
    const r = computeDrawdowns([
      { t: 0, v: 100 },
      { t: DAY, v: 120 },
      { t: 2 * DAY, v: 90 },
      { t: 3 * DAY, v: 96 },
    ]);
    expect(r.max).toBeCloseTo(-0.25);
    expect(r.current).toBeCloseTo(-0.2);
    expect(r.durationDays).toBe(2);
  });
});

describe('realizedPL', () => {
  it('returns zero summary for empty history', () => {
    const r = realizedPL([]);
    expect(r.total).toBe(0);
    expect(r.trades).toBe(0);
    expect(r.winRate).toBe(0);
  });

  it('skips lone buys (no realization)', () => {
    const r = realizedPL([trade({ side: 'buy', symbol: 'A', qty: 5, price: 10, ts: 1 })]);
    expect(r.trades).toBe(0);
  });

  it('FIFO-matches a single round-trip for a winning trade', () => {
    const r = realizedPL([
      trade({ side: 'buy', symbol: 'A', qty: 10, price: 100, ts: 1 }),
      trade({ side: 'sell', symbol: 'A', qty: 10, price: 110, ts: 2 }),
    ]);
    expect(r.trades).toBe(1);
    expect(r.wins).toBe(1);
    expect(r.total).toBeCloseTo(100);
    expect(r.winRate).toBe(1);
    expect(r.avgWin).toBeCloseTo(100);
    expect(r.profitFactor).toBe(Infinity);
  });

  it('matches partial sells across multiple lots', () => {
    const r = realizedPL([
      trade({ side: 'buy', symbol: 'A', qty: 10, price: 100, ts: 1 }),
      trade({ side: 'buy', symbol: 'A', qty: 10, price: 200, ts: 2 }),
      trade({ side: 'sell', symbol: 'A', qty: 15, price: 150, ts: 3 }),
    ]);
    expect(r.trades).toBe(1);
    expect(r.total).toBeCloseTo(10 * (150 - 100) + 5 * (150 - 200));
  });

  it('computes profit factor from wins and losses', () => {
    const r = realizedPL([
      trade({ side: 'buy', symbol: 'A', qty: 10, price: 100, ts: 1 }),
      trade({ side: 'sell', symbol: 'A', qty: 10, price: 110, ts: 2 }),
      trade({ side: 'buy', symbol: 'B', qty: 10, price: 100, ts: 3 }),
      trade({ side: 'sell', symbol: 'B', qty: 10, price: 95, ts: 4 }),
    ]);
    expect(r.trades).toBe(2);
    expect(r.wins).toBe(1);
    expect(r.losses).toBe(1);
    expect(r.winRate).toBeCloseTo(0.5);
    expect(r.total).toBeCloseTo(50);
    expect(r.profitFactor).toBeCloseTo(100 / 50);
  });
});
