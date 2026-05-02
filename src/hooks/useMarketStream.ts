import { useEffect } from 'react';
import { getProvider } from '@/market/finnhub';
import { useMarket } from '@/store/useMarket';
import { usePortfolio } from '@/store/usePortfolio';

let started = false;

export function useMarketStream() {
  useEffect(() => {
    if (started) return;
    started = true;

    const provider = getProvider();
    const setTick = useMarket.getState().setTick;
    const onTick = usePortfolio.getState().onTick;

    const unsub = provider.onTick((symbol, price, ts) => {
      setTick(symbol, price, ts);
      onTick({ ...useMarket.getState().prices(), [symbol]: price });
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
  useEffect(() => {
    if (!symbol) return;
    const provider = getProvider();
    provider.subscribe(symbol);
    provider
      .getQuote(symbol)
      .then((q) => useMarket.getState().setSeed(symbol, q.prevClose, q.price, q.ts))
      .catch((err) => console.warn(`Initial quote for ${symbol} failed:`, err));
    return () => {
      provider.unsubscribe(symbol);
    };
  }, [symbol]);
}

export function useSubscribeMany(symbols: string[]) {
  const key = symbols.join(',');
  useEffect(() => {
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
  }, [key]);
}
