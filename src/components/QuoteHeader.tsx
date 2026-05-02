import { useMarket } from '@/store/useMarket';
import { fmtPct, fmtUsd, colorFor } from '@/utils/format';
import { symbolName } from '@/market/symbols';

export function QuoteHeader({ symbol }: { symbol: string }) {
  const quote = useMarket((s) => s.quotes[symbol]);
  const stale = quote ? Date.now() - quote.ts > 60_000 : false;

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
    <div className="px-4 py-3 flex flex-col gap-1">
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
      <div className="flex items-baseline gap-3 mt-1">
        <div className="text-3xl font-mono font-semibold tabular-nums">
          {fmtUsd(quote.price)}
        </div>
        <div className={`text-sm font-mono ${colorFor(change)}`}>
          {change >= 0 ? '+' : ''}{fmtUsd(change).replace('-', '')} ({fmtPct(changePct)})
        </div>
      </div>
    </div>
  );
}
