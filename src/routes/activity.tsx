import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { usePortfolio } from '@/store/usePortfolio';
import { useWatchlist } from '@/store/useWatchlist';
import { useEquityHistory } from '@/store/useEquityHistory';
import { ActivityList } from '@/components/ActivityList';
import { PerformanceTiles } from '@/components/PerformanceTiles';
import { fmtUsd } from '@/utils/format';

export default function ActivityRoute() {
  const resetPortfolio = usePortfolio((s) => s.reset);
  const resetWatchlist = useWatchlist((s) => s.reset);
  const resetEquityHistory = useEquityHistory((s) => s.reset);
  const tradeCount = usePortfolio((s) => s.portfolio.history.length);
  const openOrders = usePortfolio((s) => s.portfolio.openOrders);
  const cancelOrder = usePortfolio((s) => s.cancelOrder);

  const resetAll = () => {
    if (confirm('Reset all demo data? This will erase your simulated trades, watchlist edits, and equity history.')) {
      resetPortfolio();
      resetWatchlist();
      resetEquityHistory();
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <PerformanceTiles />
      {openOrders.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-line flex items-center justify-between">
            <h2 className="font-semibold">Open orders</h2>
            <span className="text-xs text-text-dim">{openOrders.length}</span>
          </div>
          <ul className="divide-y divide-line">
            {openOrders.map((o) => (
              <li
                key={o.id}
                className="px-4 py-3 flex items-center justify-between gap-3 text-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`text-xs font-bold uppercase rounded px-2 py-0.5 ${
                      o.side === 'buy' ? 'bg-up/15 text-up' : 'bg-down/15 text-down'
                    }`}
                  >
                    {o.side}
                  </span>
                  <div className="min-w-0">
                    <div className="font-medium">
                      <Link to={`/ticker/${o.symbol}`} className="hover:text-accent">
                        {o.symbol}
                      </Link>
                      <span className="text-text-dim ml-2 font-normal">
                        {o.qty} sh{' '}
                        {o.type === 'limit'
                          ? `@ ${fmtUsd(o.limitPrice ?? 0)}`
                          : '(market)'}
                      </span>
                    </div>
                    <div className="text-xs text-text-dim">
                      Placed {format(new Date(o.placedAt), 'MMM d, h:mm a')}
                    </div>
                  </div>
                </div>
                <button
                  className="btn-ghost text-xs px-3 py-1.5"
                  onClick={() => cancelOrder(o.id)}
                >
                  Cancel
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

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
