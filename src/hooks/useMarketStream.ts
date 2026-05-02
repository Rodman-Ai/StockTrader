import { useEffect } from 'react';
import { getProvider } from '@/market/finnhub';
import { useMarket } from '@/store/useMarket';
import { usePortfolio } from '@/store/usePortfolio';
import { useReplay } from '@/store/useReplay';
import { replayEngine } from '@/replay/engine';

let started = false;

export function useMarketStream() {
  useEffect(() => {
    if (started) return;
    started = true;

    const provider = getProvider();

    const unsub = provider.onTick((symbol, price, ts) => {
      if (replayEngine.isActive()) return;
      useMarket.getState().setTick(symbol, price, ts);
      usePortfolio.getState().onTick({
        ...useMarket.getState().prices(),
        [symbol]: price,
      });
    });

    provider.connect().catch((err) => {
      console.warn('Market stream connect failed:', err);
    });

    return () => {
      unsub();
    };
  }, []);
}

export function useSubscribeSymbol(symbol: string | undefined) {
  const replayActive = useReplay((s) => s.mode !== 'off');
  useEffect(() => {
    if (!symbol) return;
    if (replayActive) {
      replayEngine.subscribe(symbol);
      return () => replayEngine.unsubscribe(symbol);
    }
    const provider = getProvider();
    provider.subscribe(symbol);
    provider
      .getQuote(symbol)
      .then((q) => useMarket.getState().setSeed(symbol, q.prevClose, q.price, q.ts))
      .catch((err) => console.warn(`Initial quote for ${symbol} failed:`, err));
    return () => {
      provider.unsubscribe(symbol);
    };
  }, [symbol, replayActive]);
}

export function useSubscribeMany(symbols: string[]) {
  const key = symbols.join(',');
  const replayActive = useReplay((s) => s.mode !== 'off');
  useEffect(() => {
    if (replayActive) {
      for (const s of symbols) replayEngine.subscribe(s);
      return () => {
        for (const s of symbols) replayEngine.unsubscribe(s);
      };
    }
    const provider = getProvider();
    for (const s of symbols) {
      provider.subscribe(s);
      provider
        .getQuote(s)
        .then((q) => useMarket.getState().setSeed(s, q.prevClose, q.price, q.ts))
        .catch(() => {});
    }
    return () => {
      for (const s of symbols) provider.unsubscribe(s);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, replayActive]);
}
