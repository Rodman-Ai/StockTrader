import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SEED_WATCHLIST } from '@/broker/seed';

type WatchlistState = {
  symbols: string[];
  add: (symbol: string) => boolean;
  remove: (symbol: string) => void;
  reset: () => void;
};

const normalize = (s: string) => s.trim().toUpperCase();

export const useWatchlist = create<WatchlistState>()(
  persist(
    (set, get) => ({
      symbols: SEED_WATCHLIST,
      add: (symbol) => {
        const sym = normalize(symbol);
        if (!sym || !/^[A-Z][A-Z0-9.\-]{0,9}$/.test(sym)) return false;
        if (get().symbols.includes(sym)) return false;
        set((s) => ({ symbols: [...s.symbols, sym] }));
        return true;
      },
      remove: (symbol) => {
        const sym = normalize(symbol);
        set((s) => ({ symbols: s.symbols.filter((x) => x !== sym) }));
      },
      reset: () => set({ symbols: SEED_WATCHLIST }),
    }),
    { name: 'stocktrader-watchlist', version: 1 },
  ),
);
