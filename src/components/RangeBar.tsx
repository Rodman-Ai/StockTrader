import { fmtUsd } from '@/utils/format';

type Props = {
  low: number;
  high: number;
  current: number;
  label?: string;
};

export function RangeBar({ low, high, current, label = '52 wk range' }: Props) {
  if (!Number.isFinite(low) || !Number.isFinite(high) || high <= low) return null;
  const pct = Math.min(100, Math.max(0, ((current - low) / (high - low)) * 100));
  return (
    <div className="flex flex-col gap-1 max-w-md">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-text-dim">
        <span>{label}</span>
        <span className="font-mono">{pct.toFixed(0)}%</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-line">
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-accent border border-bg shadow"
          style={{ left: `${pct}%` }}
          aria-label={`Current price ${fmtUsd(current)}`}
        />
      </div>
      <div className="flex items-center justify-between font-mono text-xs text-text-dim">
        <span>{fmtUsd(low)}</span>
        <span>{fmtUsd(high)}</span>
      </div>
    </div>
  );
}
