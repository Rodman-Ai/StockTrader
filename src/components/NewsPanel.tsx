import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNowStrict } from 'date-fns';
import { getProvider } from '@/market/finnhub';

const DAY = 24 * 60 * 60 * 1000;

export function NewsPanel({ symbol }: { symbol: string }) {
  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ['news', symbol],
    queryFn: async () => {
      const to = Date.now();
      const from = to - 14 * DAY;
      const items = await getProvider().getNews!(symbol, from, to);
      return items
        .filter((n) => n.headline)
        .sort((a, b) => b.ts - a.ts)
        .slice(0, 12);
    },
    staleTime: 10 * 60 * 1000,
    retry: 0,
  });

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-line flex items-center justify-between">
        <h3 className="font-semibold">Recent news</h3>
        <span className="text-xs text-text-dim">last 14 days</span>
      </div>

      {isLoading && (
        <div className="px-4 py-6 text-sm text-text-dim">Loading…</div>
      )}

      {isError && (
        <div className="px-4 py-6 text-sm text-text-dim">
          News unavailable for this symbol.
        </div>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <div className="px-4 py-6 text-sm text-text-dim">No recent headlines.</div>
      )}

      {items.length > 0 && (
        <ul className="divide-y divide-line">
          {items.map((n) => (
            <li key={n.id}>
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
                    <div className="text-xs text-text-dim mt-1 flex items-center gap-2">
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
