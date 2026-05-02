import { useQuery } from '@tanstack/react-query';
import { getProvider } from '@/market/finnhub';
import { fmtBigNum, fmtMarketCapMillions, fmtNum, fmtUsd } from '@/utils/format';

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

  const profile = profileQ.data;
  const metrics = metricsQ.data;
  const loading = profileQ.isLoading || metricsQ.isLoading;
  const failed = profileQ.isError && metricsQ.isError;

  const stats = [
    { label: 'P/E (TTM)', value: metrics?.peTTM, fmt: (n: number) => fmtNum(n) },
    { label: 'EPS (TTM)', value: metrics?.epsTTM, fmt: (n: number) => fmtUsd(n) },
    { label: 'Market cap', value: metrics?.marketCap ?? profile?.marketCap, fmt: (n: number) => fmtMarketCapMillions(n) },
    { label: 'Div yield', value: metrics?.divYield, fmt: (n: number) => `${n.toFixed(2)}%` },
    { label: '52w high', value: metrics?.high52w, fmt: (n: number) => fmtUsd(n) },
    { label: '52w low', value: metrics?.low52w, fmt: (n: number) => fmtUsd(n) },
    { label: 'Beta', value: metrics?.beta, fmt: (n: number) => fmtNum(n) },
    { label: 'P/S (TTM)', value: metrics?.ps, fmt: (n: number) => fmtNum(n) },
    { label: 'P/B', value: metrics?.pb, fmt: (n: number) => fmtNum(n) },
    { label: 'Avg vol (10d)', value: metrics?.avgVolume10d, fmt: (n: number) => `${fmtBigNum(n * 1_000_000)}` },
  ];

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-line flex items-center justify-between">
        <h3 className="font-semibold">Key stats</h3>
        {profile?.industry && (
          <span className="text-xs text-text-dim">{profile.industry}</span>
        )}
      </div>

      {loading && (
        <div className="px-4 py-6 text-sm text-text-dim">Loading…</div>
      )}

      {failed && !loading && (
        <div className="px-4 py-6 text-sm text-text-dim">
          Stats unavailable for this symbol on the current data plan.
        </div>
      )}

      {!loading && !failed && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-line">
            {stats.map((s) => (
              <div key={s.label} className="bg-bg-elevated px-3 py-3 flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-wider text-text-dim">
                  {s.label}
                </span>
                <span className="text-sm font-mono tabular-nums">
                  {s.value != null ? s.fmt(s.value) : <span className="text-text-dim">—</span>}
                </span>
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
