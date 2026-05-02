import type { Portfolio, Trade } from './types';
import { newId } from './engine';

const DAY = 24 * 60 * 60 * 1000;

type SeedHolding = {
  symbol: string;
  qty: number;
  avgCost: number;
  daysAgo: number;
};

const HOLDINGS: SeedHolding[] = [
  { symbol: 'AAPL', qty: 50, avgCost: 178.42, daysAgo: 180 },
  { symbol: 'MSFT', qty: 20, avgCost: 392.15, daysAgo: 150 },
  { symbol: 'NVDA', qty: 15, avgCost: 624.30, daysAgo: 120 },
  { symbol: 'VOO', qty: 30, avgCost: 461.22, daysAgo: 200 },
  { symbol: 'TSLA', qty: 10, avgCost: 218.55, daysAgo: 90 },
];

const EXTRA_TRADES: Array<{
  symbol: string;
  side: 'buy' | 'sell';
  qty: number;
  price: number;
  daysAgo: number;
}> = [
  { symbol: 'AAPL', side: 'buy',  qty: 10, price: 192.10, daysAgo: 75 },
  { symbol: 'AAPL', side: 'sell', qty: 5,  price: 211.40, daysAgo: 40 },
  { symbol: 'NVDA', side: 'buy',  qty: 5,  price: 870.20, daysAgo: 60 },
  { symbol: 'AMD',  side: 'buy',  qty: 8,  price: 158.90, daysAgo: 55 },
  { symbol: 'AMD',  side: 'sell', qty: 8,  price: 172.25, daysAgo: 30 },
  { symbol: 'META', side: 'buy',  qty: 4,  price: 482.30, daysAgo: 70 },
  { symbol: 'META', side: 'sell', qty: 4,  price: 519.80, daysAgo: 25 },
  { symbol: 'GOOGL', side: 'buy', qty: 6,  price: 142.60, daysAgo: 50 },
  { symbol: 'GOOGL', side: 'sell', qty: 6, price: 168.45, daysAgo: 12 },
  { symbol: 'SPY',  side: 'buy',  qty: 5,  price: 502.10, daysAgo: 45 },
  { symbol: 'SPY',  side: 'sell', qty: 5,  price: 538.20, daysAgo: 18 },
  { symbol: 'TSLA', side: 'buy',  qty: 3,  price: 245.80, daysAgo: 33 },
  { symbol: 'MSFT', side: 'buy',  qty: 2,  price: 421.30, daysAgo: 22 },
  { symbol: 'AAPL', side: 'buy',  qty: 5,  price: 224.10, daysAgo: 8 },
  { symbol: 'NFLX', side: 'buy',  qty: 2,  price: 612.40, daysAgo: 15 },
];

export const SEED_VERSION = 1;
export const STARTING_CASH = 100_000;

export function buildSeedPortfolio(now: number = Date.now()): Portfolio {
  const history: Trade[] = [];

  for (const h of HOLDINGS) {
    history.push({
      id: newId(),
      orderId: newId(),
      symbol: h.symbol,
      side: 'buy',
      qty: h.qty,
      price: h.avgCost,
      total: Math.round(h.qty * h.avgCost * 100) / 100,
      ts: now - h.daysAgo * DAY,
    });
  }

  for (const t of EXTRA_TRADES) {
    history.push({
      id: newId(),
      orderId: newId(),
      symbol: t.symbol,
      side: t.side,
      qty: t.qty,
      price: t.price,
      total: Math.round(t.qty * t.price * 100) / 100,
      ts: now - t.daysAgo * DAY,
    });
  }

  history.sort((a, b) => b.ts - a.ts);

  const positions: Portfolio['positions'] = {};
  for (const h of HOLDINGS) {
    positions[h.symbol] = {
      symbol: h.symbol,
      qty: h.qty,
      avgCost: h.avgCost,
    };
  }

  return {
    cash: STARTING_CASH,
    positions,
    history,
    openOrders: [],
  };
}

export const SEED_WATCHLIST = [
  'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'TSLA', 'META', 'AMD', 'SPY', 'QQQ',
];
