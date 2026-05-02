import { create } from 'zustand';

type LiveQuote = {
  price: number;
  prevClose: number;
  ts: number;
};

type MarketState = {
  quotes: Record<string, LiveQuote>;
  setSeed: (symbol: string, prevClose: number, price: number, ts: number) => void;
  setTick: (symbol: string, price: number, ts: number) => void;
  setReplayTick: (symbol: string, price: number, prevClose: number, ts: number) => void;
  clearAll: () => void;
  prices: () => Record<string, number>;
};

export const useMarket = create<MarketState>((set, get) => ({
  quotes: {},
  setSeed: (symbol, prevClose, price, ts) =>
    set((s) => {
      const existing = s.quotes[symbol];
      if (existing && existing.ts >= ts) return s;
      return {
        quotes: {
          ...s.quotes,
          [symbol]: { price, prevClose, ts },
        },
      };
    }),
  setTick: (symbol, price, ts) =>
    set((s) => {
      const existing = s.quotes[symbol];
      const prevClose = existing?.prevClose ?? price;
      if (existing && existing.ts >= ts) {
        return {
          quotes: {
            ...s.quotes,
            [symbol]: { price, prevClose, ts: existing.ts },
          },
        };
      }
      return {
        quotes: {
          ...s.quotes,
          [symbol]: { price, prevClose, ts },
        },
      };
    }),
  setReplayTick: (symbol, price, prevClose, ts) =>
    set((s) => ({
      quotes: {
        ...s.quotes,
        [symbol]: { price, prevClose, ts },
      },
    })),
  clearAll: () => set({ quotes: {} }),
  prices: () => {
    const out: Record<string, number> = {};
    for (const [s, q] of Object.entries(get().quotes)) out[s] = q.price;
    return out;
  },
}));
