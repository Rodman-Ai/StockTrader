import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { formatDistanceToNowStrict } from 'date-fns';
import { Link } from 'react-router-dom';
import { fetchYahooNews } from '@/market/yahoo';
import type { NewsItem } from '@/market/provider';

type Props = {
  symbols: string[];
  perSymbol?: number;
  total?: number;
};

export function AggregateNewsPanel({ symbols, perSymbol = 6, total = 18 }: Props) {
  const results = useQueries({
    queries: symbols.slice(0, 8).map((sym) => ({
      queryKey: ['yahoo-news', sym],
      queryFn: () => fetchYahooNews(sym, perSymbol).catch(() => [] as NewsItem[]),
      staleTime: 10 * 60 * 1000,
      retry: 0,
    })),
  });

  const items = useMemo(() => {
    const seen = new Set<string>();
    const merged: Array<NewsItem & { sym: string }> = [];
    results.forEach((r, i) => {
      const sym = symbols[i];
      for (const n of r.data ?? []) {
        const key = String(n.id) || n.url;
        if (seen.has(key)) continue;
        seen.add(key);
        if (!n.headline) continue;
        merged.push({ ...n, sym });
      }
    });
    merged.sort((a, b) => b.ts - a.ts);
    return merged.slice(0, total);
  }, [results, symbols, total]);

  const loading = results.some((r) => r.isLoading);
  const failed = results.length > 0 && results.every((r) => r.isError);

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-line flex items-center justify-between">
        <h3 className="font-semibold">News across your holdings &amp; watchlist</h3>
        <span className="text-xs text-text-dim">via Yahoo Finance</span>
      </div>
      {symbols.length === 0 && (
        <div className="px-4 py-6 text-sm text-text-dim">
          Add tickers to your watchlist to see related news here.
        </div>
      )}
      {symbols.length > 0 && loading && items.length === 0 && (
        <div className="px-4 py-6 text-sm text-text-dim">Loading…</div>
      )}
      {failed && items.length === 0 && (
        <div className="px-4 py-6 text-sm text-text-dim">News unavailable right now.</div>
      )}
      {items.length > 0 && (
        <ul className="divide-y divide-line">
          {items.map((n) => (
            <li key={`${n.sym}-${n.id}`}>
              <a
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3 hover:bg-bg-subtle transition-colors"
              >
                <div className="flex gap-3">
                  {n.image ? (
                    <img
                      src={n.image}
                      alt=""
                      loading="lazy"
                      className="w-16 h-16 rounded object-cover flex-shrink-0 bg-bg-subtle"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded bg-bg-subtle flex-shrink-0" aria-hidden />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium leading-snug line-clamp-2">
                      {n.headline}
                    </div>
                    <div className="text-xs text-text-dim mt-1 flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/ticker/${n.sym}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-mono font-semibold text-accent hover:underline"
                      >
                        {n.sym}
                      </Link>
                      <span className="truncate">{n.source}</span>
                      {n.ts > 0 && (
                        <>
                          <span>·</span>
                          <span className="whitespace-nowrap">
                            {formatDistanceToNowStrict(new Date(n.ts), { addSuffix: true })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
