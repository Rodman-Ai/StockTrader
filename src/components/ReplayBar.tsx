import { format } from 'date-fns';
import { useReplay, type ReplaySpeed, isReplayActive } from '@/store/useReplay';
import { replayEngine } from '@/replay/engine';
import { useMarket } from '@/store/useMarket';

const SPEEDS: ReplaySpeed[] = [1, 10, 60];

export function ReplayBar() {
  const mode = useReplay((s) => s.mode);
  const date = useReplay((s) => s.date);
  const speed = useReplay((s) => s.speed);
  const clock = useReplay((s) => s.clock);

  if (!isReplayActive(mode)) return null;

  const onStop = () => {
    replayEngine.stop();
    useMarket.getState().clearAll();
  };

  return (
    <div className="bg-accent/15 border-b border-accent/40 text-text">
      <div className="px-4 py-2 flex flex-wrap items-center gap-3 text-sm">
        <span className="inline-flex items-center gap-2 font-semibold text-accent uppercase tracking-wider text-xs">
          <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
          Replay
        </span>
        <span className="font-mono text-xs text-text-dim hidden sm:inline">
          {date}
        </span>
        <span className="font-mono text-base ml-auto sm:ml-0 tabular-nums">
          {clock > 0 ? format(new Date(clock), 'h:mm:ss a') : '—'}
        </span>

        <div className="flex items-center gap-1 ml-auto">
          {mode === 'playing' && (
            <button
              className="btn-ghost text-xs px-3 py-1"
              onClick={() => replayEngine.pause()}
            >
              Pause
            </button>
          )}
          {mode === 'paused' && (
            <button
              className="btn-ghost text-xs px-3 py-1"
              onClick={() => replayEngine.resume()}
            >
              Resume
            </button>
          )}
          {mode === 'ended' && (
            <span className="text-xs text-text-dim px-2">Day complete</span>
          )}
          <div className="flex items-center gap-1 border border-line rounded-md p-0.5">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => replayEngine.setSpeed(s)}
                className={`px-2 py-0.5 text-xs rounded ${
                  speed === s ? 'bg-accent text-bg' : 'text-text-dim hover:text-text'
                }`}
              >
                {s}×
              </button>
            ))}
          </div>
          <button className="btn-ghost text-xs px-3 py-1" onClick={onStop}>
            Stop
          </button>
        </div>
      </div>
    </div>
  );
}
