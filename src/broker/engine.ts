import { applyTrade } from './portfolio';
import type {
  Order,
  PlaceOrderInput,
  PlaceOrderResult,
  Portfolio,
  TimeInForce,
  Trade,
} from './types';

const SLIPPAGE_BPS = 2;
const EPS = 1e-9;

export const newId = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const round2 = (n: number) => Math.round(n * 100) / 100;

export function applySlippage(price: number, side: 'buy' | 'sell'): number {
  const slip = (price * SLIPPAGE_BPS) / 10_000;
  return round2(side === 'buy' ? price + slip : price - slip);
}

function canCrossLimit(side: 'buy' | 'sell', limit: number, last: number): boolean {
  return side === 'buy' ? last <= limit : last >= limit;
}

function marketableLimitPrice(side: 'buy' | 'sell', limit: number, last: number): number {
  return side === 'buy' ? Math.min(last, limit) : Math.max(last, limit);
}

function stopTriggered(side: 'buy' | 'sell', stop: number, last: number): boolean {
  return side === 'buy' ? last >= stop : last <= stop;
}

export function placeOrder(
  portfolio: Portfolio,
  input: PlaceOrderInput,
  lastPrice: number,
  now: number = Date.now(),
): PlaceOrderResult {
  if (!input.symbol) return { ok: false, reason: 'Symbol is required.' };
  if (!Number.isFinite(input.qty) || input.qty <= 0) {
    return { ok: false, reason: 'Quantity must be greater than zero.' };
  }
  if (!Number.isFinite(lastPrice) || lastPrice <= 0) {
    return { ok: false, reason: 'No live price available yet — try again in a moment.' };
  }
  if (input.type === 'limit' || input.type === 'stop_limit') {
    if (!Number.isFinite(input.limitPrice ?? NaN) || (input.limitPrice ?? 0) <= 0) {
      return { ok: false, reason: 'Limit price must be greater than zero.' };
    }
  }
  if (input.type === 'stop' || input.type === 'stop_limit') {
    if (!Number.isFinite(input.stopPrice ?? NaN) || (input.stopPrice ?? 0) <= 0) {
      return { ok: false, reason: 'Stop price must be greater than zero.' };
    }
  }

  const tif: TimeInForce = input.timeInForce ?? 'DAY';
  const order: Order = {
    id: newId(),
    symbol: input.symbol,
    side: input.side,
    type: input.type,
    qty: input.qty,
    limitPrice: input.limitPrice,
    stopPrice: input.stopPrice,
    stopTriggered: false,
    timeInForce: tif,
    status: 'open',
    placedAt: now,
  };

  // Market — fill immediately at last (with slippage)
  if (input.type === 'market') {
    return fillImmediate(portfolio, order, lastPrice, now);
  }

  // Limit — fill if marketable, otherwise rest (or reject for IOC/FOK)
  if (input.type === 'limit') {
    if (canCrossLimit(input.side, input.limitPrice!, lastPrice)) {
      const fillPrice = marketableLimitPrice(input.side, input.limitPrice!, lastPrice);
      return fillImmediate(portfolio, order, fillPrice, now);
    }
    if (tif === 'IOC' || tif === 'FOK') {
      return { ok: false, reason: `${tif} order not immediately marketable — cancelled.` };
    }
    return restingPreflight(portfolio, order);
  }

  // Stop — armed if not yet triggered
  if (input.type === 'stop' || input.type === 'stop_limit') {
    if (stopTriggered(input.side, input.stopPrice!, lastPrice)) {
      // Trigger immediately on placement
      if (input.type === 'stop') {
        return fillImmediate(portfolio, order, lastPrice, now);
      }
      // stop_limit — promote to working limit, attempt cross
      const lp = input.limitPrice!;
      if (canCrossLimit(input.side, lp, lastPrice)) {
        const fillPrice = marketableLimitPrice(input.side, lp, lastPrice);
        return fillImmediate(portfolio, { ...order, stopTriggered: true }, fillPrice, now);
      }
      if (tif === 'IOC' || tif === 'FOK') {
        return { ok: false, reason: `${tif} stop-limit not immediately fillable — cancelled.` };
      }
      return restingPreflight(portfolio, { ...order, stopTriggered: true });
    }
    if (tif === 'IOC' || tif === 'FOK') {
      return { ok: false, reason: `${tif} stop not immediately triggered — cancelled.` };
    }
    return restingPreflight(portfolio, order);
  }

  return { ok: false, reason: 'Unsupported order type.' };
}

function restingPreflight(
  portfolio: Portfolio,
  order: Order,
): PlaceOrderResult {
  if (order.side === 'sell') {
    const held = portfolio.positions[order.symbol]?.qty ?? 0;
    if (held + EPS < order.qty) {
      return { ok: false, reason: `Insufficient shares (have ${held}, need ${order.qty}).` };
    }
  } else {
    const reserve = (order.limitPrice ?? order.stopPrice ?? 0) * order.qty;
    if (portfolio.cash + EPS < reserve) {
      return { ok: false, reason: `Insufficient cash (need ${reserve.toFixed(2)}, have ${portfolio.cash.toFixed(2)}).` };
    }
  }
  return { ok: true, order };
}

function fillImmediate(
  portfolio: Portfolio,
  order: Order,
  refPrice: number,
  now: number,
): PlaceOrderResult {
  const fillPrice = order.type === 'market' ? applySlippage(refPrice, order.side) : refPrice;
  const total = round2(order.qty * fillPrice);

  if (order.side === 'buy') {
    if (portfolio.cash + EPS < total) {
      return {
        ok: false,
        reason: `Insufficient cash (need ${total.toFixed(2)}, have ${portfolio.cash.toFixed(2)}).`,
      };
    }
  } else {
    const held = portfolio.positions[order.symbol]?.qty ?? 0;
    if (held + EPS < order.qty) {
      return { ok: false, reason: `Insufficient shares (have ${held}, need ${order.qty}).` };
    }
  }

  const trade: Trade = {
    id: newId(),
    orderId: order.id,
    symbol: order.symbol,
    side: order.side,
    qty: order.qty,
    price: fillPrice,
    total,
    ts: now,
  };

  return {
    ok: true,
    order: { ...order, status: 'filled' },
    trade,
  };
}

function isSameTradingDay(a: number, b: number): boolean {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function tryFillOpenOrders(
  portfolio: Portfolio,
  lastPrices: Record<string, number>,
  now: number = Date.now(),
): Portfolio {
  if (portfolio.openOrders.length === 0) return portfolio;

  let result = portfolio;
  const remaining: Order[] = [];

  for (const order of portfolio.openOrders) {
    // DAY-TIF expiry: drop on any later calendar day
    if (order.timeInForce === 'DAY' && !isSameTradingDay(order.placedAt, now)) {
      continue;
    }

    const last = lastPrices[order.symbol];
    if (!Number.isFinite(last) || last <= 0) {
      remaining.push(order);
      continue;
    }

    let working = order;

    // Stop arming
    if (
      (working.type === 'stop' || working.type === 'stop_limit') &&
      !working.stopTriggered &&
      stopTriggered(working.side, working.stopPrice!, last)
    ) {
      working = { ...working, stopTriggered: true };
      // Stop-market: fill at last
      if (working.type === 'stop') {
        const fillPrice = applySlippage(last, working.side);
        const total = round2(working.qty * fillPrice);
        if (working.side === 'buy' && result.cash + EPS < total) {
          remaining.push(working);
          continue;
        }
        if (working.side === 'sell') {
          const held = result.positions[working.symbol]?.qty ?? 0;
          if (held + EPS < working.qty) {
            remaining.push(working);
            continue;
          }
        }
        const trade: Trade = {
          id: newId(),
          orderId: working.id,
          symbol: working.symbol,
          side: working.side,
          qty: working.qty,
          price: fillPrice,
          total,
          ts: now,
        };
        result = applyTrade(result, trade);
        continue;
      }
      // stop_limit: now act like a working limit below
    }

    // Limit / triggered stop-limit cross
    if (
      (working.type === 'limit' ||
        (working.type === 'stop_limit' && working.stopTriggered)) &&
      canCrossLimit(working.side, working.limitPrice!, last)
    ) {
      const fillPrice = marketableLimitPrice(working.side, working.limitPrice!, last);
      const total = round2(working.qty * fillPrice);
      if (working.side === 'buy' && result.cash + EPS < total) {
        remaining.push(working);
        continue;
      }
      if (working.side === 'sell') {
        const held = result.positions[working.symbol]?.qty ?? 0;
        if (held + EPS < working.qty) {
          remaining.push(working);
          continue;
        }
      }
      const trade: Trade = {
        id: newId(),
        orderId: working.id,
        symbol: working.symbol,
        side: working.side,
        qty: working.qty,
        price: fillPrice,
        total,
        ts: now,
      };
      result = applyTrade(result, trade);
      continue;
    }

    remaining.push(working);
  }

  return { ...result, openOrders: remaining };
}
