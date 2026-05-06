import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMarket } from '@/store/useMarket';
import { usePortfolio } from '@/store/usePortfolio';
import { useWatchlist } from '@/store/useWatchlist';
import { useSubscribeMany, useSubscribeSymbol } from '@/hooks/useMarketStream';
import { OrderTicket } from '@/components/OrderTicket';
import { QuickBuyButton } from '@/components/QuickBuyButton';
import { OpenOrdersFeed } from '@/components/OpenOrdersFeed';
import { fmtPct, fmtUsd, colorFor } from '@/utils/format';
import { buildTradeUniverse, chooseTradeSymbol } from './transact-helpers';

export default function TransactRoute() {
  const positions = usePortfolio((s) => s.portfolio.positions);
  const cash = usePortfolio((s) => s.portfolio.cash);
  const openOrders = usePortfolio((s) => s.portfolio.openOrders);
  const watchlist = useWatchlist((s) => s.symbols);
  const quotes = useMarket((s) => s.quotes);

  const universe = useMemo(
    () => buildTradeUniverse(positions, watchlist, openOrders),
    [positions, watchlist, openOrders],
  );

  useSubscribeMany(universe);

  const [selected, setSelected] = useState<string>(() => chooseTradeSymbol('', universe));

  useEffect(() => {
    setSelected((current) => chooseTradeSymbol(current, universe));
  }, [universe]);

  useSubscribeSymbol(selected || undefined);

  const selectedQuote = selected ? quotes[selected] : undefined;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="card p-4 grid grid-cols-2 gap-4">
        <Stat label="Cash available" value={fmtUsd(cash)} />
        <Stat
          label="Open orders"
          value={String(openOrders.length)}
          sub={openOrders.length > 0 ? 'awaiting trigger or fill' : undefined}
        />
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-4 items-start">
        <div className="lg:order-2">
          {selected ? (
            <>
              <div className="card p-2 mb-3">
                <div className="px-2 py-1 text-xs text-text-dim uppercase tracking-wider">
                  Trading
                </div>
                <div className="px-2 pb-2 flex items-baseline justify-between gap-3">
                  <span className="text-lg font-semibold font-mono">{selected}</span>
                  <span className="text-sm font-mono text-text-dim">
                    {selectedQuote?.price ? fmtUsd(selectedQuote.price) : 'No quote'}
                  </span>
                </div>
              </div>
              <OrderTicket symbol={selected} />
            </>
          ) : (
            <div className="card p-4 text-sm text-text-dim">
              Add a ticker from Research or keep an open order to start trading.
            </div>
          )}
        </div>

        <div className="card overflow-hidden lg:order-1">
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
                            view detail -&gt;
                          </Link>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-mono">{q ? fmtUsd(q.price) : 'No quote'}</div>
                          <div className={`text-xs font-mono ${colorFor(change)}`}>
                            {q ? fmtPct(changePct) : ''}
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
      </div>

      <OpenOrdersFeed onSelect={setSelected} />
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
