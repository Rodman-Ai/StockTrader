import { useReplay, isReplayActive } from '@/store/useReplay';

export function PaperBadge() {
  const mode = useReplay((s) => s.mode);
  if (isReplayActive(mode)) {
    return (
      <span className="inline-flex items-center rounded-md border border-accent/50 bg-accent/15 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-accent">
        Replay
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md border border-up/40 bg-up/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-up">
      Paper
    </span>
  );
}
