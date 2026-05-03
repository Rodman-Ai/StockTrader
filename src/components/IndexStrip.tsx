import { Link } from 'react-router-dom';
import { useMarket } from '@/store/useMarket';
import { useSubscribeMany } from '@/hooks/useMarketStream';
import { fmtPct, fmtUsd, colorFor } from '@/utils/format';
import { Sparkline } from './Sparkline';

const INDICES = [
  { sym: 'SPY', label: 'S&P 500' },
  { sym: 'QQQ', label: 'Nasdaq 100' },
  { sym: 'DIA', label: 'Dow 30' },
  { sym: 'IWM', label: 'Russell 2000' },
];

export function IndexStrip() {
  useSubscribeMany(INDICES.map((x) => x.sym));
  const quotes = useMarket((s) => s.quotes);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {INDICES.map((idx) => {
        const q = quotes[idx.sym];
        const change = q ? q.price - q.prevClose : 0;
        const changePct = q && q.prevClose > 0 ? change / q.prevClose : 0;
        return (
          <Link
            key={idx.sym}
            to={`/ticker/${idx.sym}`}
            className="card p-3 flex items-center justify-between gap-3 hover:bg-bg-subtle transition-colors"
          >
            <div className="min-w-0 flex flex-col gap-0.5">
              <span className="text-[10px] uppercase tracking-wider text-text-dim">
                {idx.label}
              </span>
              <span className="font-mono text-sm font-semibold tabular-nums">
                {q ? fmtUsd(q.price) : '—'}
              </span>
              <span className={`text-xs font-mono ${colorFor(change)}`}>
                {q ? fmtPct(changePct) : '—'}
              </span>
            </div>
            <Sparkline symbol={idx.sym} width={64} height={32} />
          </Link>
        );
      })}
    </div>
  );
}
