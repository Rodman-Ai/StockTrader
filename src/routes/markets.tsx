import { Link } from 'react-router-dom';
import { useMarket } from '@/store/useMarket';
import { useSubscribeMany } from '@/hooks/useMarketStream';
import { SEEDED_SYMBOLS, symbolName } from '@/market/symbols';
import { fmtPct, fmtUsd, colorFor } from '@/utils/format';

export default function MarketsRoute() {
  useSubscribeMany(SEEDED_SYMBOLS);
  const quotes = useMarket((s) => s.quotes);

  return (
    <div className="p-4">
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-line flex items-center justify-between">
          <h2 className="font-semibold">Markets</h2>
          <span className="text-xs text-text-dim">{SEEDED_SYMBOLS.length} symbols</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-dim text-xs uppercase tracking-wider">
                <th className="text-left px-3 py-2 font-medium">Symbol</th>
                <th className="text-left px-3 py-2 font-medium">Name</th>
                <th className="text-right px-3 py-2 font-medium">Last</th>
                <th className="text-right px-3 py-2 font-medium">Change</th>
              </tr>
            </thead>
            <tbody>
              {SEEDED_SYMBOLS.map((sym) => {
                const q = quotes[sym];
                const change = q ? q.price - q.prevClose : 0;
                const changePct = q && q.prevClose > 0 ? change / q.prevClose : 0;
                return (
                  <tr key={sym} className="border-t border-line hover:bg-bg-subtle">
                    <td className="px-3 py-2 font-medium">
                      <Link to={`/ticker/${sym}`} className="hover:text-accent">
                        {sym}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-text-dim truncate max-w-[200px]">
                      {symbolName(sym)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {q ? fmtUsd(q.price) : '—'}
                    </td>
                    <td className={`px-3 py-2 text-right font-mono ${colorFor(change)}`}>
                      {q ? fmtPct(changePct) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
