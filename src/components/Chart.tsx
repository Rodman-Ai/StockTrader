import { useMemo } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';
import type { Candle } from '@/market/provider';

type ChartProps = {
  candles: Candle[];
  livePrice?: number;
  height?: number;
};

export function Chart({ candles, livePrice, height = 280 }: ChartProps) {
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

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-text-dim text-sm"
        style={{ height }}
      >
        No chart data
      </div>
    );
  }

  const first = data[0].price;
  const last = data[data.length - 1].price;
  const up = last >= first;
  const stroke = up ? '#22c55e' : '#ef4444';

  return (
    <div style={{ height, width: '100%' }}>
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
            tickFormatter={(t) => format(new Date(t), 'MMM d')}
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
            labelFormatter={(t) => format(new Date(t as number), 'MMM d, yyyy')}
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
    </div>
  );
}
