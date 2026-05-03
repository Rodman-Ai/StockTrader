import { useMemo } from 'react';

export type DonutSlice = { label: string; value: number; color?: string };

const DEFAULT_PALETTE = [
  '#60a5fa', '#22c55e', '#fbbf24', '#a78bfa', '#f472b6',
  '#34d399', '#f87171', '#38bdf8', '#facc15', '#c084fc',
  '#fb923c', '#4ade80', '#e879f9', '#2dd4bf', '#94a3b8',
];

type Props = {
  title: string;
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
};

export function AllocationDonut({ title, slices, size = 180, thickness = 24 }: Props) {
  const sliceData = useMemo(() => {
    const total = slices.reduce((s, x) => s + x.value, 0);
    if (total <= 0) return { total: 0, slices: [] as Array<DonutSlice & { pct: number; offset: number; len: number; color: string }> };
    const r = (size - thickness) / 2;
    const C = 2 * Math.PI * r;
    let cum = 0;
    const out = slices
      .filter((s) => s.value > 0)
      .sort((a, b) => b.value - a.value)
      .map((s, i) => {
        const pct = s.value / total;
        const len = pct * C;
        const offset = -cum;
        cum += len;
        return {
          ...s,
          pct,
          offset,
          len,
          color: s.color ?? DEFAULT_PALETTE[i % DEFAULT_PALETTE.length],
        };
      });
    return { total, slices: out };
  }, [slices, size, thickness]);

  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="card p-4 flex flex-col gap-3">
      <h3 className="font-semibold text-sm">{title}</h3>
      {sliceData.slices.length === 0 ? (
        <div className="text-sm text-text-dim py-4 text-center">No data.</div>
      ) : (
        <div className="flex items-center gap-4">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="rgba(31,41,55,0.6)"
              strokeWidth={thickness}
            />
            {sliceData.slices.map((s) => (
              <circle
                key={s.label}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={thickness}
                strokeDasharray={`${s.len} ${C - s.len}`}
                strokeDashoffset={s.offset}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            ))}
          </svg>
          <ul className="flex-1 min-w-0 space-y-1 text-xs">
            {sliceData.slices.slice(0, 8).map((s) => (
              <li key={s.label} className="flex items-center justify-between gap-2 min-w-0">
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="truncate">{s.label}</span>
                </span>
                <span className="font-mono tabular-nums text-text-dim">
                  {(s.pct * 100).toFixed(1)}%
                </span>
              </li>
            ))}
            {sliceData.slices.length > 8 && (
              <li className="text-text-dim italic">+{sliceData.slices.length - 8} more</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
