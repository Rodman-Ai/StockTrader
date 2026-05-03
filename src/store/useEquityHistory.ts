import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type EquityPoint = { t: number; v: number };

const DAY_MS = 24 * 60 * 60 * 1000;
const BACKFILL_DAYS = 90;

function midnight(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function boxMuller(rand: () => number): number {
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function synthesizeBackfill(anchorEquity: number, days = BACKFILL_DAYS): EquityPoint[] {
  const today = midnight(Date.now());
  const rand = mulberry32(0x5b3afa);
  const stdDev = 0.008;

  const path: number[] = new Array(days + 1);
  path[0] = 1;
  for (let i = 1; i <= days; i++) {
    path[i] = path[i - 1] * Math.exp(boxMuller(rand) * stdDev);
  }
  const scale = anchorEquity / path[days];
  const out: EquityPoint[] = new Array(days + 1);
  for (let i = 0; i <= days; i++) {
    out[i] = {
      t: today - (days - i) * DAY_MS,
      v: Math.round(path[i] * scale * 100) / 100,
    };
  }
  return out;
}

type EquityHistoryState = {
  series: EquityPoint[];
  synthetic: boolean;
  ensureSeed: (currentEquity: number) => void;
  recordSnapshot: (currentEquity: number) => void;
  reset: () => void;
};

export const useEquityHistory = create<EquityHistoryState>()(
  persist(
    (set, get) => ({
      series: [],
      synthetic: false,
      ensureSeed: (currentEquity) => {
        if (get().series.length > 0) return;
        if (!Number.isFinite(currentEquity) || currentEquity <= 0) return;
        const series = synthesizeBackfill(currentEquity);
        set({ series, synthetic: true });
      },
      recordSnapshot: (currentEquity) => {
        if (!Number.isFinite(currentEquity) || currentEquity <= 0) return;
        const today = midnight(Date.now());
        const cur = get().series;
        const last = cur[cur.length - 1];
        const v = Math.round(currentEquity * 100) / 100;
        if (last && last.t === today) {
          if (last.v === v) return;
          const next = cur.slice(0, -1);
          next.push({ t: today, v });
          set({ series: next });
        } else {
          set({ series: [...cur, { t: today, v }] });
        }
      },
      reset: () => set({ series: [], synthetic: false }),
    }),
    { name: 'stocktrader-equity-history', version: 1 },
  ),
);
