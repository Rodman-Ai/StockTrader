import { Link, useParams } from 'react-router-dom';
import { useMarket } from '@/store/useMarket';
import { fmtPct, fmtUsd, colorFor } from '@/utils/format';
import { SEED_WATCHLIST } from '@/broker/seed';

export function Watchlist() {
  const params = useParams();
  const active = params.symbol;
  const quotes = useMarket((s) => s.quotes);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-line flex items-center justify-between">
        <h3 className="font-semibold">Watchlist</h3>
        <span className="text-xs text-text-dim">{SEED_WATCHLIST.length}</span>
      </div>
      <ul className="flex-1 overflow-y-auto">
        {SEED_WATCHLIST.map((sym) => {
          const q = quotes[sym];
          const change = q ? q.price - q.prevClose : 0;
          const changePct = q && q.prevClose > 0 ? change / q.prevClose : 0;
          return (
            <li key={sym}>
              <Link
                to={`/ticker/${sym}`}
                className={`flex items-center justify-between px-4 py-3 border-b border-line hover:bg-bg-subtle ${
                  active === sym ? 'bg-bg-subtle' : ''
                }`}
              >
                <div>
                  <div className="font-medium">{sym}</div>
                  <div className="text-xs text-text-dim">
                    {q ? fmtUsd(q.price) : '—'}
                  </div>
                </div>
                <div className={`text-sm font-mono text-right ${colorFor(change)}`}>
                  {q ? fmtPct(changePct) : '—'}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
