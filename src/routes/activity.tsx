import { usePortfolio } from '@/store/usePortfolio';
import { ActivityList } from '@/components/ActivityList';

export default function ActivityRoute() {
  const reset = usePortfolio((s) => s.reset);
  const tradeCount = usePortfolio((s) => s.portfolio.history.length);
  const openOrders = usePortfolio((s) => s.portfolio.openOrders);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-line flex items-center justify-between">
          <h2 className="font-semibold">Trade history</h2>
          <span className="text-xs text-text-dim">{tradeCount} trade{tradeCount === 1 ? '' : 's'}</span>
        </div>
        <ActivityList />
      </div>

      {openOrders.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-line">
            <h2 className="font-semibold">Open orders</h2>
          </div>
          <ul className="divide-y divide-line text-sm">
            {openOrders.map((o) => (
              <li key={o.id} className="px-4 py-3 flex justify-between font-mono">
                <span>
                  {o.side.toUpperCase()} {o.qty} {o.symbol} {o.type === 'limit' ? `@ ${o.limitPrice}` : '(market)'}
                </span>
                <span className="text-text-dim">{new Date(o.placedAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card p-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold">Reset demo</h3>
          <p className="text-xs text-text-dim mt-1">
            Restore the synthetic starting state: $100,000 cash, five seed positions, and example trade history.
          </p>
        </div>
        <button
          className="btn-ghost"
          onClick={() => {
            if (confirm('Reset all demo data? This will erase your simulated trades.')) reset();
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
