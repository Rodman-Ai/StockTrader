import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { usePortfolio } from '@/store/usePortfolio';
import { useMarket } from '@/store/useMarket';
import { fmtPct, fmtUsd } from '@/utils/format';
import type { Order } from '@/broker/types';

type Props = {
  emptyMessage?: string;
  onSelect?: (symbol: string) => void;
};

export function OpenOrdersFeed({
  emptyMessage = 'No open orders. Place a limit, stop, or stop-limit above and watch it work here.',
  onSelect,
}: Props) {
  const openOrders = usePortfolio((s) => s.portfolio.openOrders);
  const cancelOrder = usePortfolio((s) => s.cancelOrder);
  const quotes = useMarket((s) => s.quotes);

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-line flex items-center justify-between">
        <h3 className="font-semibold">Open orders</h3>
        <span className="text-xs text-text-dim">{openOrders.length}</span>
      </div>

      {openOrders.length === 0 ? (
        <div className="px-4 py-6 text-sm text-text-dim text-center">{emptyMessage}</div>
      ) : (
        <ul className="divide-y divide-line">
          {openOrders.map((o) => {
            const last = quotes[o.symbol]?.price;
            return (
              <li key={o.id} className="px-4 py-3 flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`text-xs font-bold uppercase rounded px-2 py-0.5 ${
                        o.side === 'buy' ? 'bg-up/15 text-up' : 'bg-down/15 text-down'
                      }`}
                    >
                      {o.side}
                    </span>
                    <div className="min-w-0">
                      <div className="font-medium flex items-center gap-2 flex-wrap">
                        {onSelect ? (
                          <button onClick={() => onSelect(o.symbol)} className="hover:text-accent font-medium">
                            {o.symbol}
                          </button>
                        ) : (
                          <Link to={`/ticker/${o.symbol}`} className="hover:text-accent">
                            {o.symbol}
                          </Link>
                        )}
                        <span className="text-text-dim font-normal">
                          {o.qty} sh
                        </span>
                        <StatusPill order={o} />
                        <span className="text-[10px] uppercase tracking-wider text-text-dim font-mono">
                          {o.timeInForce}
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
                </div>

                <OrderDetailLine order={o} last={last} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function StatusPill({ order: o }: { order: Order }) {
  if (o.type === 'limit') {
    return (
      <span className="text-[10px] uppercase tracking-wider rounded px-1.5 py-0.5 bg-accent/15 text-accent">
        Working
      </span>
    );
  }
  if (o.type === 'stop') {
    return (
      <span className="text-[10px] uppercase tracking-wider rounded px-1.5 py-0.5 bg-amber-500/15 text-amber-400">
        Pending trigger
      </span>
    );
  }
  if (o.type === 'stop_limit') {
    return o.stopTriggered ? (
      <span className="text-[10px] uppercase tracking-wider rounded px-1.5 py-0.5 bg-accent/15 text-accent">
        Triggered · working
      </span>
    ) : (
      <span className="text-[10px] uppercase tracking-wider rounded px-1.5 py-0.5 bg-amber-500/15 text-amber-400">
        Pending trigger
      </span>
    );
  }
  return null;
}

function OrderDetailLine({ order: o, last }: { order: Order; last?: number }) {
  const tooltip =
    o.type === 'limit'
      ? `Fills when last ${o.side === 'buy' ? '≤' : '≥'} ${fmtUsd(o.limitPrice ?? 0)}`
      : o.type === 'stop'
        ? `Triggers when last ${o.side === 'buy' ? '≥' : '≤'} ${fmtUsd(o.stopPrice ?? 0)}, then fills at market`
        : o.stopTriggered
          ? `Triggered. Working as limit ${fmtUsd(o.limitPrice ?? 0)}.`
          : `Triggers when last ${o.side === 'buy' ? '≥' : '≤'} ${fmtUsd(o.stopPrice ?? 0)}, then becomes limit ${fmtUsd(o.limitPrice ?? 0)}`;

  // Distance to relevant level
  let level: number | undefined;
  let label = '';
  if (o.type === 'limit') {
    level = o.limitPrice;
    label = 'limit';
  } else if (o.type === 'stop' || (o.type === 'stop_limit' && !o.stopTriggered)) {
    level = o.stopPrice;
    label = 'trigger';
  } else if (o.type === 'stop_limit' && o.stopTriggered) {
    level = o.limitPrice;
    label = 'limit';
  }

  let distLabel = '—';
  if (last && level && level > 0) {
    const distPct = (level - last) / last;
    const sign = distPct >= 0 ? '+' : '';
    distLabel = `${sign}${fmtPct(distPct).replace('+', '')} away`;
  }

  return (
    <div className="text-xs text-text-dim flex items-center justify-between gap-3 font-mono pl-9">
      <span title={tooltip}>{tooltip}</span>
      {last && level && level > 0 && (
        <span>
          last {fmtUsd(last)} · {label} {fmtUsd(level)} · {distLabel}
        </span>
      )}
    </div>
  );
}
