import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMarket } from '@/store/useMarket';
import { fmtPct, fmtUsd, colorFor } from '@/utils/format';
import { symbolName } from '@/market/symbols';
import { getProvider } from '@/market/finnhub';
import { RangeBar } from './RangeBar';

export function QuoteHeader({ symbol }: { symbol: string }) {
  const quote = useMarket((s) => s.quotes[symbol]);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!quote) return;
    const id = window.setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(id);
  }, [quote]);
  const stale = quote ? now - quote.ts > 60_000 : false;

  const { data: metrics } = useQuery({
    queryKey: ['metrics', symbol],
    queryFn: async () => {
      const p = getProvider();
      if (!p.getMetrics) throw new Error('no metrics');
      return p.getMetrics(symbol);
    },
    staleTime: 60 * 60 * 1000,
    retry: 0,
  });

  if (!quote) {
    return (
      <div className="px-4 py-3">
        <div className="text-xl font-bold">{symbol}</div>
        <div className="text-text-dim text-sm">{symbolName(symbol)}</div>
        <div className="text-text-dim text-sm mt-2">Loading quote…</div>
      </div>
    );
  }

  const change = quote.price - quote.prevClose;
  const changePct = quote.prevClose > 0 ? change / quote.prevClose : 0;

  return (
    <div className="px-4 py-3 flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="text-xl font-bold">{symbol}</div>
          <div className="text-text-dim text-xs">{symbolName(symbol)}</div>
        </div>
        {stale && (
          <span className="text-xs text-text-dim border border-line rounded px-2 py-0.5">
            stale
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-3">
        <div className="text-3xl font-mono font-semibold tabular-nums">
          {fmtUsd(quote.price)}
        </div>
        <div className={`text-sm font-mono ${colorFor(change)}`}>
          {change >= 0 ? '+' : ''}{fmtUsd(change).replace('-', '')} ({fmtPct(changePct)})
        </div>
      </div>
      {(quote.dayHigh != null || quote.dayLow != null || quote.dayOpen != null) && (
        <div className="text-xs text-text-dim font-mono flex flex-wrap gap-x-4 gap-y-0.5">
          {quote.dayLow != null && quote.dayHigh != null && (
            <span>
              Day: <span className="text-text">{fmtUsd(quote.dayLow)} – {fmtUsd(quote.dayHigh)}</span>
            </span>
          )}
          {quote.dayOpen != null && (
            <span>
              Open: <span className="text-text">{fmtUsd(quote.dayOpen)}</span>
            </span>
          )}
          <span>
            Prev close: <span className="text-text">{fmtUsd(quote.prevClose)}</span>
          </span>
        </div>
      )}
      {metrics?.high52w != null && metrics?.low52w != null && (
        <RangeBar low={metrics.low52w} high={metrics.high52w} current={quote.price} />
      )}
    </div>
  );
}
