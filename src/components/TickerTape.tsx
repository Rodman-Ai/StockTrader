import { Link } from 'react-router-dom';
import { useMarket } from '@/store/useMarket';
import { useSubscribeMany } from '@/hooks/useMarketStream';
import { fmtPct, fmtUsd, colorFor } from '@/utils/format';

const TAPE_SYMBOLS = [
  'SPY', 'QQQ', 'DIA', 'IWM',
  'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA', 'AMD',
  'JPM', 'V', 'WMT', 'XOM',
];

export function TickerTape() {
  useSubscribeMany(TAPE_SYMBOLS);
  const quotes = useMarket((s) => s.quotes);

  const items = TAPE_SYMBOLS.map((sym) => {
    const q = quotes[sym];
    const change = q ? q.price - q.prevClose : 0;
    const changePct = q && q.prevClose > 0 ? change / q.prevClose : 0;
    return { sym, price: q?.price, change, changePct };
  });

  return (
    <div
      className="ticker-tape group bg-bg-elevated border-y border-line overflow-hidden"
      role="region"
      aria-label="Market ticker"
    >
      <div className="ticker-track flex">
        <TapeRow items={items} />
        <TapeRow items={items} aria-hidden />
      </div>
    </div>
  );
}

function TapeRow({
  items,
}: {
  items: { sym: string; price?: number; change: number; changePct: number }[];
  'aria-hidden'?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-6 px-4 py-1.5 text-xs font-mono whitespace-nowrap">
      {items.map((it) => (
        <Link
          key={it.sym}
          to={`/ticker/${it.sym}`}
          className="inline-flex items-center gap-2 hover:opacity-100 opacity-90"
        >
          <span className="font-semibold text-text">{it.sym}</span>
          <span className="text-text">{it.price ? fmtUsd(it.price) : '—'}</span>
          <span className={colorFor(it.change)}>
            {it.price ? fmtPct(it.changePct) : '—'}
          </span>
        </Link>
      ))}
    </div>
  );
}
