import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePortfolio } from '@/store/usePortfolio';
import { useMarket } from '@/store/useMarket';
import { useSubscribeMany } from '@/hooks/useMarketStream';
import { portfolioEquity } from '@/broker/portfolio';
import { fmtPct, fmtUsd, colorFor } from '@/utils/format';
import { PositionsTable } from '@/components/PositionsTable';
import { SEED_WATCHLIST } from '@/broker/seed';

export default function PortfolioRoute() {
  const portfolio = usePortfolio((s) => s.portfolio);
  const quotes = useMarket((s) => s.quotes);

  const heldSymbols = useMemo(() => Object.keys(portfolio.positions), [portfolio.positions]);
  const subs = useMemo(
    () => Array.from(new Set([...heldSymbols, ...SEED_WATCHLIST])),
    [heldSymbols],
  );
  useSubscribeMany(subs);

  const prices: Record<string, number> = {};
  for (const [s, q] of Object.entries(quotes)) prices[s] = q.price;

  const { equity, positionsValue, dayPl } = portfolioEquity(portfolio, prices);
  const dayPlPct = positionsValue > 0 ? dayPl / (positionsValue - dayPl) : 0;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="card p-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total equity" value={fmtUsd(equity)} />
        <Stat label="Cash" value={fmtUsd(portfolio.cash)} />
        <Stat label="Positions value" value={fmtUsd(positionsValue)} />
        <Stat
          label="Unrealized P/L"
          value={`${dayPl >= 0 ? '+' : ''}${fmtUsd(dayPl).replace('-', '')}`}
          sub={fmtPct(dayPlPct)}
          color={colorFor(dayPl)}
        />
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-line flex items-center justify-between">
          <h2 className="font-semibold">Positions</h2>
          <span className="text-xs text-text-dim">
            {Object.keys(portfolio.positions).length} holdings
          </span>
        </div>
        <PositionsTable />
      </div>

      <div className="card overflow-hidden lg:hidden">
        <div className="px-4 py-3 border-b border-line">
          <h2 className="font-semibold">Watchlist</h2>
        </div>
        <ul>
          {SEED_WATCHLIST.map((sym) => {
            const q = quotes[sym];
            const change = q ? q.price - q.prevClose : 0;
            const changePct = q && q.prevClose > 0 ? change / q.prevClose : 0;
            return (
              <li
                key={sym}
                className="flex items-center justify-between px-4 py-3 border-b border-line last:border-0"
              >
                <Link to={`/ticker/${sym}`} className="font-medium hover:text-accent">
                  {sym}
                </Link>
                <div className="text-right text-sm">
                  <div className="font-mono">{q ? fmtUsd(q.price) : '—'}</div>
                  <div className={`font-mono text-xs ${colorFor(change)}`}>
                    {q ? fmtPct(changePct) : '—'}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-text-dim uppercase tracking-wider">{label}</span>
      <span className={`text-xl font-mono font-semibold tabular-nums ${color ?? ''}`}>
        {value}
      </span>
      {sub && <span className={`text-xs font-mono ${color ?? 'text-text-dim'}`}>{sub}</span>}
    </div>
  );
}
