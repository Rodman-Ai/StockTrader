import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { placeOrder, tryFillOpenOrders } from '@/broker/engine';
import { applyTrade } from '@/broker/portfolio';
import { buildSeedPortfolio, SEED_VERSION } from '@/broker/seed';
import type { PlaceOrderInput, PlaceOrderResult, Portfolio } from '@/broker/types';

type PortfolioState = {
  seedVersion: number;
  portfolio: Portfolio;
  reset: () => void;
  submitOrder: (input: PlaceOrderInput, lastPrice: number) => PlaceOrderResult;
  cancelOrder: (orderId: string) => void;
  onTick: (lastPrices: Record<string, number>) => void;
};

export const usePortfolio = create<PortfolioState>()(
  persist(
    (set, get) => ({
      seedVersion: SEED_VERSION,
      portfolio: buildSeedPortfolio(),
      reset: () =>
        set({ seedVersion: SEED_VERSION, portfolio: buildSeedPortfolio() }),
      submitOrder: (input, lastPrice) => {
        const result = placeOrder(get().portfolio, input, lastPrice);
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
      onTick: (lastPrices) => {
        const cur = get().portfolio;
        if (cur.openOrders.length === 0) return;
        const next = tryFillOpenOrders(cur, lastPrices);
        if (next !== cur) set({ portfolio: next });
      },
    }),
    {
      name: 'stocktrader-portfolio',
      version: 1,
    },
  ),
);
