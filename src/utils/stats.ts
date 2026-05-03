import type { Trade } from '@/broker/types';

const DAY_MS = 24 * 60 * 60 * 1000;

export type EquityPoint = { t: number; v: number };

export type DrawdownInfo = {
  max: number;
  current: number;
  durationDays: number;
  series: EquityPoint[];
};

export function computeDrawdowns(series: EquityPoint[]): DrawdownInfo {
  if (series.length === 0) {
    return { max: 0, current: 0, durationDays: 0, series: [] };
  }
  let peak = series[0].v;
  let peakAt = series[0].t;
  let maxDD = 0;
  let curDD = 0;
  let curDDStart = peakAt;
  const ddSeries: EquityPoint[] = new Array(series.length);

  for (let i = 0; i < series.length; i++) {
    const p = series[i];
    if (p.v >= peak) {
      peak = p.v;
      peakAt = p.t;
      curDDStart = p.t;
    }
    const dd = peak > 0 ? (p.v - peak) / peak : 0;
    ddSeries[i] = { t: p.t, v: dd };
    if (dd < maxDD) maxDD = dd;
    curDD = dd;
  }

  const last = series[series.length - 1];
  const durationDays = curDD < 0 ? Math.max(0, Math.round((last.t - curDDStart) / DAY_MS)) : 0;

  return { max: maxDD, current: curDD, durationDays, series: ddSeries };
}

export type RealizedSummary = {
  total: number;
  trades: number;
  wins: number;
  losses: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
};

type Lot = { qty: number; cost: number };

export function realizedPL(history: Trade[]): RealizedSummary {
  const sorted = [...history].sort((a, b) => a.ts - b.ts);
  const lots = new Map<string, Lot[]>();
  const realized: number[] = [];

  for (const t of sorted) {
    const queue = lots.get(t.symbol) ?? [];
    if (t.side === 'buy') {
      queue.push({ qty: t.qty, cost: t.price });
      lots.set(t.symbol, queue);
      continue;
    }
    let remaining = t.qty;
    let pl = 0;
    while (remaining > 1e-9 && queue.length > 0) {
      const lot = queue[0];
      const take = Math.min(lot.qty, remaining);
      pl += take * (t.price - lot.cost);
      lot.qty -= take;
      remaining -= take;
      if (lot.qty <= 1e-9) queue.shift();
    }
    if (remaining > 1e-9) {
      pl += remaining * t.price;
    }
    lots.set(t.symbol, queue);
    realized.push(pl);
  }

  const wins = realized.filter((p) => p > 0);
  const losses = realized.filter((p) => p < 0);
  const total = realized.reduce((s, x) => s + x, 0);
  const winSum = wins.reduce((s, x) => s + x, 0);
  const lossSum = losses.reduce((s, x) => s + x, 0);

  return {
    total,
    trades: realized.length,
    wins: wins.length,
    losses: losses.length,
    winRate: realized.length > 0 ? wins.length / realized.length : 0,
    avgWin: wins.length > 0 ? winSum / wins.length : 0,
    avgLoss: losses.length > 0 ? lossSum / losses.length : 0,
    profitFactor: lossSum < 0 ? winSum / -lossSum : wins.length > 0 ? Infinity : 0,
  };
}
