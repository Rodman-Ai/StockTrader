import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useMarket } from '@/store/useMarket';
import { useSubscribeMany } from '@/hooks/useMarketStream';
import { POPULAR_SYMBOLS, symbolName } from '@/market/symbols';
import { fmtPct, fmtUsd, colorFor } from '@/utils/format';

const TOP_N = 6;

export function MoversList() {
  useSubscribeMany(POPULAR_SYMBOLS);
  const quotes = useMarket((s) => s.quotes);

  const ranked = useMemo(() => {
    const rows = POPULAR_SYMBOLS.map((sym) => {
      const q = quotes[sym];
      if (!q || !(q.prevClose > 0)) return null;
      const change = q.price - q.prevClose;
      const changePct = change / q.prevClose;
      return { sym, price: q.price, change, changePct };
    }).filter((x): x is NonNullable<typeof x> => x !== null);
    rows.sort((a, b) => b.changePct - a.changePct);
    const gainers = rows.slice(0, TOP_N);
    const losers = [...rows].sort((a, b) => a.changePct - b.changePct).slice(0, TOP_N);
    return { gainers, losers };
  }, [quotes]);

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <MoverCard title="Top gainers" rows={ranked.gainers} accent="text-up" />
      <MoverCard title="Top losers" rows={ranked.losers} accent="text-down" />
    </div>
  );
}

type Row = { sym: string; price: number; change: number; changePct: number };

function MoverCard({ title, rows, accent }: { title: string; rows: Row[]; accent: string }) {
  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-line flex items-center justify-between">
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className={`text-xs font-mono ${accent}`}>{rows.length}</span>
      </div>
      {rows.length === 0 ? (
        <div className="px-4 py-6 text-sm text-text-dim">Waiting for live quotes…</div>
      ) : (
        <ul className="divide-y divide-line">
          {rows.map((r) => (
            <li key={r.sym}>
              <Link
                to={`/ticker/${r.sym}`}
                className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-bg-subtle"
              >
                <div className="min-w-0">
                  <div className="font-medium">{r.sym}</div>
                  <div className="text-xs text-text-dim truncate">{symbolName(r.sym)}</div>
                </div>
                <div className="text-right font-mono">
                  <div>{fmtUsd(r.price)}</div>
                  <div className={`text-xs ${colorFor(r.change)}`}>{fmtPct(r.changePct)}</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
