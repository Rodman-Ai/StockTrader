import { useMemo, useState } from 'react';
import { usePortfolio } from '@/store/usePortfolio';
import { useWatchlist } from '@/store/useWatchlist';
import { replayEngine } from '@/replay/engine';
import { useReplay, type ReplaySpeed } from '@/store/useReplay';
import { useMarket } from '@/store/useMarket';
import { lastWeekdayDateStr } from '@/utils/et-bounds';

type Props = { open: boolean; onClose: () => void };

const SPEEDS: ReplaySpeed[] = [1, 10, 60];

export function ReplayDialog({ open, onClose }: Props) {
  const watchlist = useWatchlist((s) => s.symbols);
  const positions = usePortfolio((s) => s.portfolio.positions);
  const replayError = useReplay((s) => s.error);

  const [date, setDate] = useState(lastWeekdayDateStr());
  const [speed, setSpeed] = useState<ReplaySpeed>(10);
  const [starting, setStarting] = useState(false);

  const initialSymbols = useMemo(
    () => Array.from(new Set([...Object.keys(positions), ...watchlist])).slice(0, 20),
    [positions, watchlist],
  );

  if (!open) return null;

  const onStart = async () => {
    setStarting(true);
    useMarket.getState().clearAll();
    await replayEngine.start(date, speed, initialSymbols);
    setStarting(false);
    if (!useReplay.getState().error) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="card p-6 max-w-sm w-full flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h4 className="font-semibold">Time-travel mode</h4>
          <p className="text-xs text-text-dim mt-1">
            Replay a historical trading day's 1-minute bars as if they were happening live.
            Limit orders fill against the historical prices. Live quotes are paused while replay is on.
          </p>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-text-dim">Trading day</span>
          <input
            type="date"
            className="input font-mono"
            value={date}
            max={lastWeekdayDateStr()}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-text-dim">Speed</span>
          <div className="grid grid-cols-3 gap-2">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`btn ${speed === s ? 'bg-accent text-bg' : 'btn-ghost'}`}
              >
                {s}×
              </button>
            ))}
          </div>
          <span className="text-xs text-text-dim">
            1× = real time (6.5h day) · 10× ≈ 39 min · 60× ≈ 6.5 min
          </span>
        </div>

        <div className="text-xs text-text-dim">
          Will preload {initialSymbols.length} symbol{initialSymbols.length === 1 ? '' : 's'}: {initialSymbols.slice(0, 8).join(', ')}
          {initialSymbols.length > 8 ? '…' : ''}
        </div>

        {replayError && (
          <div className="text-xs text-down">{replayError}</div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button className="btn-ghost" onClick={onClose} disabled={starting}>
            Cancel
          </button>
          <button className="btn-primary" onClick={onStart} disabled={starting}>
            {starting ? 'Loading…' : 'Start replay'}
          </button>
        </div>
      </div>
    </div>
  );
}
