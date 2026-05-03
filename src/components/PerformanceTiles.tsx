import { useMemo } from 'react';
import { usePortfolio } from '@/store/usePortfolio';
import { realizedPL } from '@/utils/stats';
import { fmtUsd, fmtPct, colorFor } from '@/utils/format';

export function PerformanceTiles() {
  const history = usePortfolio((s) => s.portfolio.history);
  const stats = useMemo(() => realizedPL(history), [history]);

  if (stats.trades === 0) {
    return null;
  }

  return (
    <div className="card p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <Tile
        label="Realized P/L"
        value={`${stats.total >= 0 ? '+' : ''}${fmtUsd(stats.total).replace('-', '')}`}
        color={colorFor(stats.total)}
      />
      <Tile
        label="Win rate"
        value={fmtPct(stats.winRate).replace('+', '')}
        sub={`${stats.wins}W / ${stats.losses}L`}
      />
      <Tile
        label="Avg win"
        value={`+${fmtUsd(stats.avgWin).replace('-', '')}`}
        color="text-up"
      />
      <Tile
        label="Avg loss"
        value={fmtUsd(stats.avgLoss)}
        color="text-down"
      />
      <Tile
        label="Profit factor"
        value={
          stats.profitFactor === Infinity
            ? '∞'
            : stats.profitFactor.toFixed(2)
        }
      />
    </div>
  );
}

function Tile({
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
      <span className="text-[10px] uppercase tracking-wider text-text-dim">{label}</span>
      <span className={`text-lg font-mono font-semibold tabular-nums ${color ?? ''}`}>
        {value}
      </span>
      {sub && <span className="text-xs text-text-dim font-mono">{sub}</span>}
    </div>
  );
}
