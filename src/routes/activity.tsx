import { usePortfolio } from '@/store/usePortfolio';
import { useWatchlist } from '@/store/useWatchlist';
import { useEquityHistory } from '@/store/useEquityHistory';
import { ActivityList } from '@/components/ActivityList';
import { PerformanceTiles } from '@/components/PerformanceTiles';
import { OpenOrdersFeed } from '@/components/OpenOrdersFeed';

export default function ActivityRoute() {
  const resetPortfolio = usePortfolio((s) => s.reset);
  const resetWatchlist = useWatchlist((s) => s.reset);
  const resetEquityHistory = useEquityHistory((s) => s.reset);
  const tradeCount = usePortfolio((s) => s.portfolio.history.length);

  const resetAll = () => {
    if (
      confirm(
        'Reset all demo data? This will erase your simulated trades, watchlist edits, and equity history.',
      )
    ) {
      resetPortfolio();
      resetWatchlist();
      resetEquityHistory();
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <PerformanceTiles />

      <OpenOrdersFeed />

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-line flex items-center justify-between">
          <h2 className="font-semibold">Trade history</h2>
          <span className="text-xs text-text-dim">
            {tradeCount} trade{tradeCount === 1 ? '' : 's'}
          </span>
        </div>
        <ActivityList />
      </div>

      <div className="card p-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold">Reset demo</h3>
          <p className="text-xs text-text-dim mt-1">
            Restore the synthetic starting state: $100,000 cash, five seed positions, example trade history, the seeded watchlist, and a fresh equity curve.
          </p>
        </div>
        <button className="btn-ghost" onClick={resetAll}>
          Reset
        </button>
      </div>
    </div>
  );
}
