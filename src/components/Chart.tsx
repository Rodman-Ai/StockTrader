import { useMemo } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';
import type { Candle } from '@/market/provider';
import { RANGES, type RangeKey } from '@/market/ranges';

type ChartProps = {
  candles: Candle[];
  livePrice?: number;
  height?: number;
  range: RangeKey;
  onRangeChange: (r: RangeKey) => void;
  loading?: boolean;
};

export function Chart({ candles, livePrice, height = 280, range, onRangeChange, loading }: ChartProps) {
  const data = useMemo(() => {
    const base = candles.map((c) => ({ t: c.t, price: c.c }));
    if (livePrice != null && base.length > 0) {
      const last = base[base.length - 1];
      if (last.price !== livePrice) {
        base.push({ t: Date.now(), price: livePrice });
      }
    }
    return base;
  }, [candles, livePrice]);

  const intraday = range === '1D' || range === '1W';
  const tickFmt = intraday
    ? (t: number) => format(new Date(t), 'h:mm a')
    : (t: number) => format(new Date(t), 'MMM d');
  const labelFmt = intraday
    ? (t: number) => format(new Date(t), 'MMM d, h:mm a')
    : (t: number) => format(new Date(t), 'MMM d, yyyy');

  const first = data[0]?.price ?? 0;
  const last = data[data.length - 1]?.price ?? 0;
  const up = last >= first;
  const stroke = up ? '#22c55e' : '#ef4444';

  return (
    <div className="flex flex-col">
      <div style={{ height, width: '100%' }}>
        {data.length === 0 ? (
          <div className="flex items-center justify-center text-text-dim text-sm h-full">
            {loading ? 'Loading chart…' : 'No chart data for this range'}
          </div>
        ) : (
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="t"
                tickFormatter={tickFmt}
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                minTickGap={40}
              />
              <YAxis
                domain={['auto', 'auto']}
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(v) => v.toFixed(2)}
              />
              <Tooltip
                contentStyle={{
                  background: '#111827',
                  border: '1px solid #1f2937',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelFormatter={(t) => labelFmt(t as number)}
                formatter={(v: number) => [`$${v.toFixed(2)}`, 'Price']}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={stroke}
                strokeWidth={2}
                fill="url(#fill)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="flex items-center justify-center gap-1 px-2 pt-2">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => onRangeChange(r)}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
              r === range
                ? 'bg-accent text-bg'
                : 'text-text-dim hover:text-text hover:bg-bg-subtle'
            }`}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}
