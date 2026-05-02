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
  it('crosses immediately when buy limit is at or above last', () => {
    const p = empty(10_000);
    const r = placeOrder(
      p,
      { symbol: 'AAPL', side: 'buy', type: 'limit', qty: 5, limitPrice: 210 },
      200,
    );
    expect(r.ok).toBe(true);
    if (!r.ok || !r.trade) throw new Error('expected fill');
    expect(r.trade.price).toBe(210);
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
  it('fills a resting buy limit when price drops to limit', () => {
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
    expect(next.history[0].price).toBe(190);
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
