import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { usePortfolio } from '@/store/usePortfolio';
import { useMarket } from '@/store/useMarket';
import { useWatchlist } from '@/store/useWatchlist';
import { useEquityHistory } from '@/store/useEquityHistory';
import { useSubscribeMany } from '@/hooks/useMarketStream';
import { portfolioEquity, positionValue } from '@/broker/portfolio';
import { computeDrawdowns } from '@/utils/stats';
import { fmtPct, fmtUsd, colorFor } from '@/utils/format';
import { PositionsTable } from '@/components/PositionsTable';
import { EquityCurve } from '@/components/EquityCurve';
import { AllocationDonut, type DonutSlice } from '@/components/AllocationDonut';
import { SectorBars } from '@/components/SectorBars';
import { getProvider } from '@/market/finnhub';

const SECTOR_COLORS = [
  '#60a5fa', '#22c55e', '#fbbf24', '#a78bfa', '#f472b6',
  '#34d399', '#f87171', '#38bdf8', '#facc15', '#c084fc',
  '#fb923c', '#4ade80', '#94a3b8',
];

export default function PortfolioRoute() {
  const portfolio = usePortfolio((s) => s.portfolio);
  const quotes = useMarket((s) => s.quotes);

  const watchlistSymbols = useWatchlist((s) => s.symbols);
  const heldSymbols = useMemo(() => Object.keys(portfolio.positions), [portfolio.positions]);
  const subs = useMemo(
    () => Array.from(new Set([...heldSymbols, ...watchlistSymbols])),
    [heldSymbols, watchlistSymbols],
  );
  useSubscribeMany(subs);

  const prices: Record<string, number> = {};
  for (const [s, q] of Object.entries(quotes)) prices[s] = q.price;

  const { equity, positionsValue, dayPl } = portfolioEquity(portfolio, prices);
  const dayPlPct = positionsValue - dayPl > 0 ? dayPl / (positionsValue - dayPl) : 0;

  const ensureSeed = useEquityHistory((s) => s.ensureSeed);
  const recordSnapshot = useEquityHistory((s) => s.recordSnapshot);
  const series = useEquityHistory((s) => s.series);

  useEffect(() => {
    ensureSeed(equity);
  }, [ensureSeed, equity]);

  useEffect(() => {
    if (equity > 0) recordSnapshot(equity);
  }, [equity, recordSnapshot]);

  const dd = useMemo(() => computeDrawdowns(series), [series]);

  const profileQueries = useQueries({
    queries: heldSymbols.map((sym) => ({
      queryKey: ['profile', sym],
      queryFn: () => getProvider().getProfile(sym),
      staleTime: 24 * 60 * 60 * 1000,
      retry: 0,
    })),
  });
  const sectorBySymbol = useMemo(() => {
    const m: Record<string, string> = {};
    heldSymbols.forEach((sym, i) => {
      const ind = profileQueries[i]?.data?.industry;
      m[sym] = ind && ind.trim() ? ind : 'Other';
    });
    return m;
  }, [heldSymbols, profileQueries]);

  const holdingSlices: DonutSlice[] = useMemo(
    () =>
      Object.values(portfolio.positions).map((p) => {
        const last = quotes[p.symbol]?.price ?? p.avgCost;
        return { label: p.symbol, value: positionValue(p, last).market };
      }),
    [portfolio.positions, quotes],
  );

  const sectorAgg = useMemo(() => {
    const totals = new Map<string, number>();
    for (const p of Object.values(portfolio.positions)) {
      const last = quotes[p.symbol]?.price ?? p.avgCost;
      const v = positionValue(p, last).market;
      const sector = sectorBySymbol[p.symbol] ?? 'Other';
      totals.set(sector, (totals.get(sector) ?? 0) + v);
    }
    return Array.from(totals, ([label, value], i) => ({
      label,
      value,
      color: SECTOR_COLORS[i % SECTOR_COLORS.length],
    }));
  }, [portfolio.positions, quotes, sectorBySymbol]);

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

      {series.length > 1 && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-line flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-semibold">Equity curve</h2>
            <span className="text-xs text-text-dim">
              SPY benchmark · drawdown overlay
            </span>
          </div>
          <div className="px-2 pt-2 pb-3">
            <EquityCurve series={series} />
          </div>
          <div className="grid grid-cols-3 gap-px bg-line border-t border-line">
            <DDStat label="Max drawdown" value={fmtPct(dd.max).replace('+', '')} color="text-down" />
            <DDStat
              label="Current DD"
              value={dd.current < 0 ? fmtPct(dd.current).replace('+', '') : '0.00%'}
              color={dd.current < 0 ? 'text-down' : 'text-text-dim'}
            />
            <DDStat
              label="DD duration"
              value={dd.durationDays > 0 ? `${dd.durationDays}d` : '—'}
            />
          </div>
        </div>
      )}

      {holdingSlices.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-4">
          <AllocationDonut title="Allocation by holding" slices={holdingSlices} />
          <AllocationDonut
            title="Allocation by sector"
            slices={sectorAgg.map((s) => ({ label: s.label, value: s.value, color: s.color }))}
          />
        </div>
      )}

      {sectorAgg.length > 1 && <SectorBars segments={sectorAgg} />}

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
          {watchlistSymbols.length === 0 && (
            <li className="px-4 py-6 text-sm text-text-dim text-center">
              No tickers in your watchlist.
            </li>
          )}
          {watchlistSymbols.map((sym) => {
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

function DDStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-bg-elevated px-3 py-3 flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-text-dim">{label}</span>
      <span className={`text-sm font-mono font-semibold tabular-nums ${color ?? ''}`}>
        {value}
      </span>
    </div>
  );
}
