import { useQuery } from '@tanstack/react-query';
import { fetchYahooByRange } from '@/market/yahoo';

type Props = {
  symbol: string;
  width?: number;
  height?: number;
};

export function Sparkline({ symbol, width = 80, height = 24 }: Props) {
  const { data: candles } = useQuery({
    queryKey: ['sparkline', symbol],
    queryFn: () => fetchYahooByRange(symbol, '1M').catch(() => []),
    staleTime: 60 * 60 * 1000,
    retry: 0,
  });

  if (!candles || candles.length < 2) {
    return <div style={{ width, height }} className="bg-bg-subtle rounded" aria-hidden />;
  }

  const closes = candles.map((c) => c.c);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  const stepX = width / (closes.length - 1);
  const points = closes
    .map((c, i) => `${(i * stepX).toFixed(2)},${(height - ((c - min) / range) * height).toFixed(2)}`)
    .join(' ');

  const up = closes[closes.length - 1] >= closes[0];
  const stroke = up ? '#22c55e' : '#ef4444';

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
