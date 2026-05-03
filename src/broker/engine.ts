import { applyTrade } from './portfolio';
import type {
  Order,
  PlaceOrderInput,
  PlaceOrderResult,
  Portfolio,
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
  if (input.type === 'limit') {
    if (!Number.isFinite(input.limitPrice ?? NaN) || (input.limitPrice ?? 0) <= 0) {
      return { ok: false, reason: 'Limit price must be greater than zero.' };
    }
  }

  const order: Order = {
    id: newId(),
    symbol: input.symbol,
    side: input.side,
    type: input.type,
    qty: input.qty,
    limitPrice: input.limitPrice,
    status: 'open',
    placedAt: now,
  };

  if (input.type === 'market') {
    return fillImmediate(portfolio, order, lastPrice, now);
  }

  if (canCrossLimit(input.side, input.limitPrice!, lastPrice)) {
    const fillPrice = marketableLimitPrice(input.side, input.limitPrice!, lastPrice);
    return fillImmediate(portfolio, order, fillPrice, now);
  }

  if (input.side === 'sell') {
    const held = portfolio.positions[input.symbol]?.qty ?? 0;
    if (held + EPS < input.qty) {
      return { ok: false, reason: `Insufficient shares (have ${held}, need ${input.qty}).` };
    }
  } else {
    const cost = input.qty * input.limitPrice!;
    if (portfolio.cash + EPS < cost) {
      return { ok: false, reason: `Insufficient cash (need ${cost.toFixed(2)}, have ${portfolio.cash.toFixed(2)}).` };
    }
  }

  return {
    ok: true,
    order,
  };
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

function canCrossLimit(side: 'buy' | 'sell', limit: number, last: number): boolean {
  return side === 'buy' ? last <= limit : last >= limit;
}

function marketableLimitPrice(side: 'buy' | 'sell', limit: number, last: number): number {
  return side === 'buy' ? Math.min(last, limit) : Math.max(last, limit);
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
    const last = lastPrices[order.symbol];
    if (
      order.type === 'limit' &&
      Number.isFinite(last) &&
      last > 0 &&
      canCrossLimit(order.side, order.limitPrice!, last)
    ) {
      const fillPrice = marketableLimitPrice(order.side, order.limitPrice!, last);
      const total = round2(order.qty * fillPrice);
      if (order.side === 'buy' && result.cash + EPS < total) {
        remaining.push(order);
        continue;
      }
      if (order.side === 'sell') {
        const held = result.positions[order.symbol]?.qty ?? 0;
        if (held + EPS < order.qty) {
          remaining.push(order);
          continue;
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
      result = applyTrade(result, trade);
    } else {
      remaining.push(order);
    }
  }

  return { ...result, openOrders: remaining };
}
