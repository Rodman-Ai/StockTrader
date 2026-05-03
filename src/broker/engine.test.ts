import { describe, it, expect } from 'vitest';
import { applySlippage, placeOrder, tryFillOpenOrders } from './engine';
import { applyTrade } from './portfolio';
import type { Portfolio } from './types';

const empty = (cash = 10_000): Portfolio => ({
  cash,
  positions: {},
  history: [],
  openOrders: [],
});

const withPosition = (qty: number, avgCost: number, cash = 10_000): Portfolio => ({
  cash,
  positions: { AAPL: { symbol: 'AAPL', qty, avgCost } },
  history: [],
  openOrders: [],
});

describe('applySlippage', () => {
  it('adds slippage on buy', () => {
    expect(applySlippage(100, 'buy')).toBeGreaterThan(100);
  });
  it('subtracts slippage on sell', () => {
    expect(applySlippage(100, 'sell')).toBeLessThan(100);
  });
});

describe('placeOrder market buy', () => {
  it('fills at last price plus slippage', () => {
    const p = empty(10_000);
    const r = placeOrder(p, { symbol: 'AAPL', side: 'buy', type: 'market', qty: 5 }, 200);
    expect(r.ok).toBe(true);
    if (!r.ok || !r.trade) throw new Error('expected fill');
    expect(r.trade.side).toBe('buy');
    expect(r.trade.qty).toBe(5);
    expect(r.trade.price).toBeGreaterThan(200);
    expect(r.trade.total).toBeCloseTo(r.trade.price * 5, 2);
  });

  it('rejects when insufficient cash', () => {
    const p = empty(100);
    const r = placeOrder(p, { symbol: 'AAPL', side: 'buy', type: 'market', qty: 5 }, 200);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.reason).toMatch(/Insufficient cash/);
  });
});

describe('placeOrder market sell', () => {
  it('fills when shares are available', () => {
    const p = withPosition(10, 150);
    const r = placeOrder(p, { symbol: 'AAPL', side: 'sell', type: 'market', qty: 4 }, 200);
    expect(r.ok).toBe(true);
    if (!r.ok || !r.trade) throw new Error('expected fill');
    expect(r.trade.price).toBeLessThan(200);
  });

  it('rejects when shares are insufficient', () => {
    const p = withPosition(2, 150);
    const r = placeOrder(p, { symbol: 'AAPL', side: 'sell', type: 'market', qty: 4 }, 200);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.reason).toMatch(/Insufficient shares/);
  });
});

describe('placeOrder limit', () => {
  it('marketable buy limit fills at last price (better than the limit)', () => {
    const p = empty(10_000);
    const r = placeOrder(
      p,
      { symbol: 'AAPL', side: 'buy', type: 'limit', qty: 5, limitPrice: 210 },
      200,
    );
    expect(r.ok).toBe(true);
    if (!r.ok || !r.trade) throw new Error('expected fill');
    expect(r.trade.price).toBe(200);
  });

  it('marketable sell limit fills at last price (better than the limit)', () => {
    const p = withPosition(10, 100);
    const r = placeOrder(
      p,
      { symbol: 'AAPL', side: 'sell', type: 'limit', qty: 5, limitPrice: 190 },
      200,
    );
    expect(r.ok).toBe(true);
    if (!r.ok || !r.trade) throw new Error('expected fill');
    expect(r.trade.price).toBe(200);
  });

  it('rests when buy limit is below last', () => {
    const p = empty(10_000);
    const r = placeOrder(
      p,
      { symbol: 'AAPL', side: 'buy', type: 'limit', qty: 5, limitPrice: 190 },
      200,
    );
    expect(r.ok).toBe(true);
    if (!r.ok) throw new Error('expected open order');
    expect(r.trade).toBeUndefined();
    expect(r.order.status).toBe('open');
  });

  it('rejects rest when buy limit cost exceeds cash', () => {
    const p = empty(100);
    const r = placeOrder(
      p,
      { symbol: 'AAPL', side: 'buy', type: 'limit', qty: 5, limitPrice: 190 },
      200,
    );
    expect(r.ok).toBe(false);
  });
});

describe('applyTrade', () => {
  it('debits cash and increases position on buy', () => {
    const p = empty(1_000);
    const r = placeOrder(p, { symbol: 'AAPL', side: 'buy', type: 'market', qty: 2 }, 100);
    if (!r.ok || !r.trade) throw new Error('expected fill');
    const next = applyTrade(p, r.trade);
    expect(next.cash).toBeLessThan(1_000);
    expect(next.positions.AAPL.qty).toBe(2);
  });

  it('weighted-average cost on add-on buy', () => {
    let p = empty(10_000);
    const r1 = placeOrder(p, { symbol: 'AAPL', side: 'buy', type: 'market', qty: 10 }, 100);
    if (!r1.ok || !r1.trade) throw new Error('expected fill');
    p = applyTrade(p, r1.trade);
    const r2 = placeOrder(p, { symbol: 'AAPL', side: 'buy', type: 'market', qty: 10 }, 200);
    if (!r2.ok || !r2.trade) throw new Error('expected fill');
    p = applyTrade(p, r2.trade);
    expect(p.positions.AAPL.qty).toBe(20);
    expect(p.positions.AAPL.avgCost).toBeGreaterThan(100);
    expect(p.positions.AAPL.avgCost).toBeLessThan(200);
  });

  it('removes position when fully sold', () => {
    let p = withPosition(5, 100, 1_000);
    const r = placeOrder(p, { symbol: 'AAPL', side: 'sell', type: 'market', qty: 5 }, 150);
    if (!r.ok || !r.trade) throw new Error('expected fill');
    p = applyTrade(p, r.trade);
    expect(p.positions.AAPL).toBeUndefined();
    expect(p.cash).toBeGreaterThan(1_000);
  });
});

describe('tryFillOpenOrders', () => {
  it('fills a resting buy limit at the crossed price when price drops below limit', () => {
    let p = empty(10_000);
    const r = placeOrder(
      p,
      { symbol: 'AAPL', side: 'buy', type: 'limit', qty: 5, limitPrice: 190 },
      200,
    );
    if (!r.ok || r.trade) throw new Error('expected open order');
    p = { ...p, openOrders: [r.order] };
    const next = tryFillOpenOrders(p, { AAPL: 188 });
    expect(next.openOrders.length).toBe(0);
    expect(next.history.length).toBe(1);
    expect(next.history[0].price).toBe(188);
    expect(next.positions.AAPL.qty).toBe(5);
  });

  it('leaves the order resting when price has not crossed', () => {
    let p = empty(10_000);
    const r = placeOrder(
      p,
      { symbol: 'AAPL', side: 'buy', type: 'limit', qty: 5, limitPrice: 190 },
      200,
    );
    if (!r.ok || r.trade) throw new Error('expected open order');
    p = { ...p, openOrders: [r.order] };
    const next = tryFillOpenOrders(p, { AAPL: 195 });
    expect(next.openOrders.length).toBe(1);
    expect(next.history.length).toBe(0);
  });
});

describe('stop orders', () => {
  it('buy stop rests until price crosses up, then fills at last', () => {
    let p = empty(10_000);
    const r = placeOrder(
      p,
      { symbol: 'AAPL', side: 'buy', type: 'stop', qty: 5, stopPrice: 210 },
      200,
    );
    if (!r.ok || r.trade) throw new Error('expected resting stop');
    expect(r.order.stopTriggered).toBe(false);
    p = { ...p, openOrders: [r.order] };

    // Below trigger — still pending
    let next = tryFillOpenOrders(p, { AAPL: 205 });
    expect(next.openOrders.length).toBe(1);
    expect(next.history.length).toBe(0);

    // At/above trigger — fills
    next = tryFillOpenOrders(p, { AAPL: 212 });
    expect(next.openOrders.length).toBe(0);
    expect(next.history.length).toBe(1);
    expect(next.history[0].price).toBeGreaterThanOrEqual(212);
    expect(next.positions.AAPL.qty).toBe(5);
  });

  it('sell stop rests until price crosses down, then fills at last', () => {
    let p = withPosition(10, 100, 1_000);
    const r = placeOrder(
      p,
      { symbol: 'AAPL', side: 'sell', type: 'stop', qty: 5, stopPrice: 90 },
      100,
    );
    if (!r.ok || r.trade) throw new Error('expected resting stop');
    p = { ...p, openOrders: [r.order] };

    let next = tryFillOpenOrders(p, { AAPL: 95 });
    expect(next.openOrders.length).toBe(1);

    next = tryFillOpenOrders(p, { AAPL: 88 });
    expect(next.openOrders.length).toBe(0);
    expect(next.history.length).toBe(1);
    expect(next.history[0].price).toBeLessThanOrEqual(88);
  });

  it('stop-limit triggers and rests when limit not yet crossed', () => {
    let p = empty(10_000);
    const r = placeOrder(
      p,
      { symbol: 'AAPL', side: 'buy', type: 'stop_limit', qty: 5, stopPrice: 210, limitPrice: 211 },
      200,
    );
    if (!r.ok || r.trade) throw new Error('expected resting stop-limit');
    p = { ...p, openOrders: [r.order] };

    // Triggers at 212, but limit is 211 — buy limit can't cross 212; remains open as triggered limit
    const next = tryFillOpenOrders(p, { AAPL: 212 });
    expect(next.openOrders.length).toBe(1);
    expect(next.openOrders[0].stopTriggered).toBe(true);
    expect(next.history.length).toBe(0);
  });

  it('stop-limit triggers and immediately fills when limit also crosses', () => {
    let p = empty(10_000);
    const r = placeOrder(
      p,
      { symbol: 'AAPL', side: 'buy', type: 'stop_limit', qty: 5, stopPrice: 210, limitPrice: 215 },
      200,
    );
    if (!r.ok || r.trade) throw new Error('expected resting stop-limit');
    p = { ...p, openOrders: [r.order] };

    const next = tryFillOpenOrders(p, { AAPL: 212 });
    expect(next.openOrders.length).toBe(0);
    expect(next.history.length).toBe(1);
    expect(next.history[0].price).toBe(212);
  });
});

describe('time-in-force', () => {
  it('IOC limit rejects when not immediately marketable', () => {
    const p = empty(10_000);
    const r = placeOrder(
      p,
      { symbol: 'AAPL', side: 'buy', type: 'limit', qty: 5, limitPrice: 190, timeInForce: 'IOC' },
      200,
    );
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.reason).toMatch(/IOC/);
  });

  it('FOK limit rejects when not immediately marketable', () => {
    const p = empty(10_000);
    const r = placeOrder(
      p,
      { symbol: 'AAPL', side: 'buy', type: 'limit', qty: 5, limitPrice: 190, timeInForce: 'FOK' },
      200,
    );
    expect(r.ok).toBe(false);
  });

  it('GTC limit rests as normal', () => {
    const p = empty(10_000);
    const r = placeOrder(
      p,
      { symbol: 'AAPL', side: 'buy', type: 'limit', qty: 5, limitPrice: 190, timeInForce: 'GTC' },
      200,
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.trade).toBeUndefined();
    expect(r.order.timeInForce).toBe('GTC');
  });

  it('DAY order is dropped on a different trading day', () => {
    const day1 = new Date('2024-08-05T15:00:00Z').getTime();
    const day2 = new Date('2024-08-06T15:00:00Z').getTime();
    let p = empty(10_000);
    const r = placeOrder(
      p,
      { symbol: 'AAPL', side: 'buy', type: 'limit', qty: 5, limitPrice: 190, timeInForce: 'DAY' },
      200,
      day1,
    );
    if (!r.ok || r.trade) throw new Error('expected resting');
    p = { ...p, openOrders: [r.order] };

    const next = tryFillOpenOrders(p, { AAPL: 195 }, day2);
    expect(next.openOrders.length).toBe(0);
    expect(next.history.length).toBe(0);
  });
});
