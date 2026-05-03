import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useMarket } from '@/store/useMarket';
import { usePortfolio } from '@/store/usePortfolio';
import { useWatchlist } from '@/store/useWatchlist';
import { useSubscribeMany, useSubscribeSymbol } from '@/hooks/useMarketStream';
import { OrderTicket } from '@/components/OrderTicket';
import { QuickBuyButton } from '@/components/QuickBuyButton';
import { fmtPct, fmtUsd, colorFor } from '@/utils/format';

export default function TransactRoute() {
  const positions = usePortfolio((s) => s.portfolio.positions);
  const cash = usePortfolio((s) => s.portfolio.cash);
  const openOrders = usePortfolio((s) => s.portfolio.openOrders);
  const cancelOrder = usePortfolio((s) => s.cancelOrder);
  const watchlist = useWatchlist((s) => s.symbols);
  const quotes = useMarket((s) => s.quotes);

  const universe = useMemo(() => {
    const held = Object.keys(positions);
    return Array.from(new Set([...held, ...watchlist]));
  }, [positions, watchlist]);

  useSubscribeMany(universe);

  const [selected, setSelected] = useState<string>(() => universe[0] ?? 'AAPL');
  useSubscribeSymbol(selected);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="card p-4 grid grid-cols-2 gap-4">
        <Stat label="Cash available" value={fmtUsd(cash)} />
        <Stat
          label="Open orders"
          value={String(openOrders.length)}
          sub={openOrders.length > 0 ? 'awaiting fill' : undefined}
        />
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-4 items-start">
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-line flex items-center justify-between">
            <h3 className="font-semibold">Pick a symbol to trade</h3>
            <span className="text-xs text-text-dim">{universe.length} available</span>
          </div>
          {universe.length === 0 ? (
            <div className="px-4 py-6 text-sm text-text-dim">
              No symbols. Use the Research tab to find tickers and add them to your watchlist.
            </div>
          ) : (
            <ul className="divide-y divide-line max-h-[480px] overflow-y-auto">
              {universe.map((sym) => {
                const q = quotes[sym];
                const change = q ? q.price - q.prevClose : 0;
                const changePct = q && q.prevClose > 0 ? change / q.prevClose : 0;
                const held = positions[sym]?.qty;
                const isSelected = sym === selected;
                return (
                  <li key={sym}>
                    <div
                      className={`flex items-center justify-between gap-3 px-4 py-3 ${
                        isSelected ? 'bg-bg-subtle' : ''
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelected(sym)}
                        className="flex-1 min-w-0 flex items-center justify-between gap-3 text-left"
                      >
                        <div className="min-w-0">
                          <div className="font-medium flex items-center gap-2">
                            {sym}
                            {held && (
                              <span className="text-[10px] uppercase tracking-wider rounded bg-accent/15 text-accent px-1.5 py-0.5">
                                {held} held
                              </span>
                            )}
                          </div>
                          <Link
                            to={`/ticker/${sym}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] text-text-dim hover:text-accent uppercase tracking-wider"
                          >
                            view detail →
                          </Link>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-mono">{q ? fmtUsd(q.price) : '—'}</div>
                          <div className={`text-xs font-mono ${colorFor(change)}`}>
                            {q ? fmtPct(changePct) : '—'}
                          </div>
                        </div>
                      </button>
                      <QuickBuyButton symbol={sym} qty={1} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="lg:sticky lg:top-4">
          <div className="card p-2 mb-3">
            <div className="px-2 py-1 text-xs text-text-dim uppercase tracking-wider">
              Trading
            </div>
            <div className="px-2 pb-2 text-lg font-semibold font-mono">{selected}</div>
          </div>
          <OrderTicket symbol={selected} />
        </div>
      </div>

      {openOrders.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-line flex items-center justify-between">
            <h3 className="font-semibold">Open orders</h3>
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
                      <button
                        onClick={() => setSelected(o.symbol)}
                        className="hover:text-accent"
                      >
                        {o.symbol}
                      </button>
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
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-text-dim uppercase tracking-wider">{label}</span>
      <span className="text-xl font-mono font-semibold tabular-nums">{value}</span>
      {sub && <span className="text-xs text-text-dim">{sub}</span>}
    </div>
  );
}
