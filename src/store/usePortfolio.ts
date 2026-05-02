import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { placeOrder, tryFillOpenOrders } from '@/broker/engine';
import { applyTrade } from '@/broker/portfolio';
import { buildSeedPortfolio, SEED_VERSION } from '@/broker/seed';
import type { PlaceOrderInput, PlaceOrderResult, Portfolio } from '@/broker/types';
import { useReplay } from './useReplay';

function nowOrSim(explicit: number | undefined): number {
  if (explicit != null) return explicit;
  const r = useReplay.getState();
  if (r.mode === 'playing' || r.mode === 'paused' || r.mode === 'ended') return r.clock;
  return Date.now();
}

type PortfolioState = {
  seedVersion: number;
  portfolio: Portfolio;
  reset: () => void;
  submitOrder: (input: PlaceOrderInput, lastPrice: number, now?: number) => PlaceOrderResult;
  cancelOrder: (orderId: string) => void;
  onTick: (lastPrices: Record<string, number>, now?: number) => void;
};

export const usePortfolio = create<PortfolioState>()(
  persist(
    (set, get) => ({
      seedVersion: SEED_VERSION,
      portfolio: buildSeedPortfolio(),
      reset: () =>
        set({ seedVersion: SEED_VERSION, portfolio: buildSeedPortfolio() }),
      submitOrder: (input, lastPrice, now) => {
        const result = placeOrder(get().portfolio, input, lastPrice, nowOrSim(now));
        if (!result.ok) return result;
        let next = get().portfolio;
        if (result.trade) {
          next = applyTrade(next, result.trade);
        } else {
          next = { ...next, openOrders: [...next.openOrders, result.order] };
        }
        set({ portfolio: next });
        return result;
      },
      cancelOrder: (orderId) =>
        set((s) => ({
          portfolio: {
            ...s.portfolio,
            openOrders: s.portfolio.openOrders.filter((o) => o.id !== orderId),
          },
        })),
      onTick: (lastPrices, now) => {
        const cur = get().portfolio;
        if (cur.openOrders.length === 0) return;
        const next = tryFillOpenOrders(cur, lastPrices, now);
        if (next !== cur) set({ portfolio: next });
      },
    }),
    {
      name: 'stocktrader-portfolio',
      version: 1,
    },
  ),
);
