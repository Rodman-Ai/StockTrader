import type { Portfolio, Position, Trade } from './types';

const round2 = (n: number) => Math.round(n * 100) / 100;

export function applyTrade(portfolio: Portfolio, trade: Trade): Portfolio {
  const positions = { ...portfolio.positions };
  const existing = positions[trade.symbol];

  let cash = portfolio.cash;
  if (trade.side === 'buy') {
    cash = round2(cash - trade.total);
    if (existing) {
      const newQty = existing.qty + trade.qty;
      const newCost = (existing.qty * existing.avgCost + trade.qty * trade.price) / newQty;
      positions[trade.symbol] = {
        symbol: trade.symbol,
        qty: newQty,
        avgCost: newCost,
      };
    } else {
      positions[trade.symbol] = {
        symbol: trade.symbol,
        qty: trade.qty,
        avgCost: trade.price,
      };
    }
  } else {
    cash = round2(cash + trade.total);
    if (existing) {
      const newQty = existing.qty - trade.qty;
      if (newQty <= 1e-9) {
        delete positions[trade.symbol];
      } else {
        positions[trade.symbol] = {
          symbol: trade.symbol,
          qty: newQty,
          avgCost: existing.avgCost,
        };
      }
    }
  }

  return {
    ...portfolio,
    cash,
    positions,
    history: [trade, ...portfolio.history],
  };
}

export function positionValue(p: Position, lastPrice: number) {
  const market = p.qty * lastPrice;
  const cost = p.qty * p.avgCost;
  const pl = market - cost;
  const plPct = cost > 0 ? pl / cost : 0;
  return { market, cost, pl, plPct };
}

export function portfolioEquity(portfolio: Portfolio, prices: Record<string, number>) {
  let positionsValue = 0;
  let totalCost = 0;
  for (const sym of Object.keys(portfolio.positions)) {
    const p = portfolio.positions[sym];
    const last = prices[sym] ?? p.avgCost;
    positionsValue += p.qty * last;
    totalCost += p.qty * p.avgCost;
  }
  const equity = portfolio.cash + positionsValue;
  const dayPl = positionsValue - totalCost;
  return { equity, positionsValue, totalCost, dayPl };
}
