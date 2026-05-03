type Segment = { label: string; value: number; color: string };

export function SectorBars({ segments }: { segments: Segment[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total <= 0) return null;
  return (
    <div className="card p-4 flex flex-col gap-3">
      <h3 className="font-semibold text-sm">Sector exposure</h3>
      <div className="flex h-3 w-full rounded overflow-hidden">
        {segments.map((s) => (
          <div
            key={s.label}
            style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.color }}
            title={`${s.label}: ${((s.value / total) * 100).toFixed(1)}%`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs">
        {segments
          .slice()
          .sort((a, b) => b.value - a.value)
          .map((s) => (
            <div key={s.label} className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ backgroundColor: s.color }}
              />
              <span className="truncate flex-1">{s.label}</span>
              <span className="font-mono tabular-nums text-text-dim">
                {((s.value / total) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
