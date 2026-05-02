import { Link } from 'react-router-dom';
import { useMarket } from '@/store/useMarket';
import { usePortfolio } from '@/store/usePortfolio';
import { positionValue } from '@/broker/portfolio';
import { fmtPct, fmtUsd, colorFor } from '@/utils/format';

export function PositionsTable() {
  const positions = usePortfolio((s) => s.portfolio.positions);
  const quotes = useMarket((s) => s.quotes);
  const rows = Object.values(positions);

  if (rows.length === 0) {
    return (
      <div className="text-sm text-text-dim p-4">
        No positions yet. Open a ticker and place a market order to see it here.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-text-dim text-xs uppercase tracking-wider">
            <th className="text-left px-3 py-2 font-medium">Symbol</th>
            <th className="text-right px-3 py-2 font-medium">Qty</th>
            <th className="text-right px-3 py-2 font-medium">Avg cost</th>
            <th className="text-right px-3 py-2 font-medium">Last</th>
            <th className="text-right px-3 py-2 font-medium">Mkt value</th>
            <th className="text-right px-3 py-2 font-medium">P/L</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => {
            const last = quotes[p.symbol]?.price ?? p.avgCost;
            const v = positionValue(p, last);
            return (
              <tr key={p.symbol} className="border-t border-line hover:bg-bg-subtle">
                <td className="px-3 py-2 font-medium">
                  <Link to={`/ticker/${p.symbol}`} className="hover:text-accent">
                    {p.symbol}
                  </Link>
                </td>
                <td className="px-3 py-2 text-right font-mono">{p.qty}</td>
                <td className="px-3 py-2 text-right font-mono">{fmtUsd(p.avgCost)}</td>
                <td className="px-3 py-2 text-right font-mono">{fmtUsd(last)}</td>
                <td className="px-3 py-2 text-right font-mono">{fmtUsd(v.market)}</td>
                <td className={`px-3 py-2 text-right font-mono ${colorFor(v.pl)}`}>
                  {v.pl >= 0 ? '+' : ''}{fmtUsd(v.pl).replace('-', '')}
                  <span className="text-text-dim ml-1">({fmtPct(v.plPct)})</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
