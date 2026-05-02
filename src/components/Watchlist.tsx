import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMarket } from '@/store/useMarket';
import { useWatchlist } from '@/store/useWatchlist';
import { fmtPct, fmtUsd, colorFor } from '@/utils/format';

export function Watchlist() {
  const params = useParams();
  const active = params.symbol;
  const quotes = useMarket((s) => s.quotes);
  const symbols = useWatchlist((s) => s.symbols);
  const add = useWatchlist((s) => s.add);
  const remove = useWatchlist((s) => s.remove);

  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const ok = add(draft);
    if (!ok) {
      setError(symbols.includes(draft.trim().toUpperCase()) ? 'Already in watchlist.' : 'Invalid ticker.');
      return;
    }
    setDraft('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-line flex items-center justify-between">
        <h3 className="font-semibold">Watchlist</h3>
        <span className="text-xs text-text-dim">{symbols.length}</span>
      </div>
      <form onSubmit={onAdd} className="px-4 py-3 border-b border-line flex gap-2">
        <input
          className="input flex-1 text-sm uppercase"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add ticker"
          maxLength={10}
        />
        <button
          type="submit"
          className="btn-ghost text-xs px-3"
          disabled={!draft.trim()}
        >
          Add
        </button>
      </form>
      {error && (
        <div className="px-4 py-2 text-xs text-down bg-down/10 border-b border-line">
          {error}
        </div>
      )}
      <ul className="flex-1 overflow-y-auto">
        {symbols.length === 0 && (
          <li className="px-4 py-6 text-sm text-text-dim text-center">
            Watchlist is empty. Add a ticker above.
          </li>
        )}
        {symbols.map((sym) => {
          const q = quotes[sym];
          const change = q ? q.price - q.prevClose : 0;
          const changePct = q && q.prevClose > 0 ? change / q.prevClose : 0;
          return (
            <li key={sym} className="group relative">
              <Link
                to={`/ticker/${sym}`}
                className={`flex items-center justify-between pl-4 pr-12 py-3 border-b border-line hover:bg-bg-subtle ${
                  active === sym ? 'bg-bg-subtle' : ''
                }`}
              >
                <div>
                  <div className="font-medium">{sym}</div>
                  <div className="text-xs text-text-dim">
                    {q ? fmtUsd(q.price) : '—'}
                  </div>
                </div>
                <div className={`text-sm font-mono text-right ${colorFor(change)}`}>
                  {q ? fmtPct(changePct) : '—'}
                </div>
              </Link>
              <button
                onClick={() => remove(sym)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full text-text-dim hover:text-down hover:bg-down/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-lg leading-none"
                title={`Remove ${sym}`}
                aria-label={`Remove ${sym}`}
              >
                ×
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
