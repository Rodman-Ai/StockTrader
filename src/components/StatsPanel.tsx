import { useQuery } from '@tanstack/react-query';
import { getProvider } from '@/market/finnhub';
import { fetchYahooByRange } from '@/market/yahoo';
import { buildFundamentalSections, formatStatValue } from './stats-panel-model';

export function StatsPanel({ symbol }: { symbol: string }) {
  const profileQ = useQuery({
    queryKey: ['profile', symbol],
    queryFn: () => getProvider().getProfile(symbol),
    staleTime: 24 * 60 * 60 * 1000,
    retry: 0,
  });

  const metricsQ = useQuery({
    queryKey: ['metrics', symbol],
    queryFn: async () => {
      const p = getProvider();
      if (!p.getMetrics) throw new Error('Metrics not supported by provider');
      return p.getMetrics(symbol);
    },
    staleTime: 60 * 60 * 1000,
    retry: 0,
  });

  const sparklineQ = useQuery({
    queryKey: ['sparkline', symbol],
    queryFn: () => fetchYahooByRange(symbol, '1M').catch(() => []),
    staleTime: 60 * 60 * 1000,
    retry: 0,
  });

  const profile = profileQ.data;
  const metrics = metricsQ.data;
  const loading = profileQ.isLoading || metricsQ.isLoading;
  const hasDataGap = profileQ.isError || metricsQ.isError;
  const todayVolume = sparklineQ.data?.[sparklineQ.data.length - 1]?.v;
  const sections = buildFundamentalSections({ metrics, profile, todayVolume });

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-line flex items-center justify-between gap-3">
        <h3 className="font-semibold">Research stats</h3>
        {profile?.industry && (
          <span className="text-xs text-text-dim text-right">{profile.industry}</span>
        )}
      </div>

      {loading && (
        <div className="px-4 py-6 text-sm text-text-dim">Loading...</div>
      )}

      {!loading && (
        <>
          {hasDataGap && (
            <div className="px-4 py-3 border-b border-line text-xs text-text-dim">
              Some profile or fundamentals data is unavailable for this symbol on the current data plan. Provider gaps are shown as --.
            </div>
          )}

          <div className="divide-y divide-line">
            {sections.map((section) => (
              <div key={section.title} className="px-4 py-4">
                <h4 className="text-xs uppercase tracking-wider text-text-dim mb-3">
                  {section.title}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-px bg-line overflow-hidden rounded">
                  {section.items.map((item) => {
                    const value = formatStatValue(item);
                    return (
                      <div
                        key={`${section.title}-${item.label}`}
                        className="bg-bg-elevated px-3 py-3 flex flex-col gap-0.5 min-w-0"
                      >
                        <span className="text-[10px] uppercase tracking-wider text-text-dim truncate">
                          {item.label}
                        </span>
                        <span
                          className={`text-sm font-mono tabular-nums truncate ${
                            value === '--' ? 'text-text-dim' : ''
                          }`}
                        >
                          {value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {(profile?.exchange || profile?.ipoDate || profile?.weburl || profile?.country) && (
            <div className="px-4 py-3 border-t border-line text-xs text-text-dim flex flex-wrap gap-x-4 gap-y-1">
              {profile?.exchange && (
                <span>
                  <span className="text-text-dim">Exchange:</span>{' '}
                  <span className="text-text">{profile.exchange.replace(/ NMS.*$/, '')}</span>
                </span>
              )}
              {profile?.country && (
                <span>
                  <span className="text-text-dim">Country:</span>{' '}
                  <span className="text-text">{profile.country}</span>
                </span>
              )}
              {profile?.ipoDate && (
                <span>
                  <span className="text-text-dim">IPO:</span>{' '}
                  <span className="text-text">{profile.ipoDate}</span>
                </span>
              )}
              {profile?.weburl && (
                <a
                  href={profile.weburl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  {profile.weburl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
