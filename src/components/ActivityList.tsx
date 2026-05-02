import { format } from 'date-fns';
import { usePortfolio } from '@/store/usePortfolio';
import { fmtUsd } from '@/utils/format';

export function ActivityList() {
  const history = usePortfolio((s) => s.portfolio.history);

  if (history.length === 0) {
    return (
      <div className="text-sm text-text-dim p-4">No trades yet.</div>
    );
  }

  return (
    <ul className="divide-y divide-line">
      {history.map((t) => (
        <li key={t.id} className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-bold uppercase rounded px-2 py-0.5 ${
                t.side === 'buy' ? 'bg-up/15 text-up' : 'bg-down/15 text-down'
              }`}
            >
              {t.side}
            </span>
            <div>
              <div className="font-medium">{t.symbol}</div>
              <div className="text-xs text-text-dim">
                {format(new Date(t.ts), 'MMM d, yyyy · h:mm a')}
              </div>
            </div>
          </div>
          <div className="text-right font-mono">
            <div>{t.qty} @ {fmtUsd(t.price)}</div>
            <div className="text-xs text-text-dim">{fmtUsd(t.total)}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}
