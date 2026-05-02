import type { Candle } from './provider';
import { rangeWindow, type RangeKey } from './ranges';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const STEP_MS: Record<string, number> = {
  '1': 60_000,
  '5': 5 * 60_000,
  '15': 15 * 60_000,
  '30': 30 * 60_000,
  '60': 60 * 60_000,
  D: MS_PER_DAY,
  W: 7 * MS_PER_DAY,
  M: 30 * MS_PER_DAY,
};

function hashSeed(s: string): number {
  let h = 2_166_136_261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16_777_619);
  }
  return h >>> 0;
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

const round2 = (n: number) => Math.round(n * 100) / 100;

export function synthesizeCandles(
  symbol: string,
  anchorPrice: number,
  range: RangeKey,
  now: number = Date.now(),
): Candle[] {
  if (!Number.isFinite(anchorPrice) || anchorPrice <= 0) return [];
  const { resolution, from, to } = rangeWindow(range, now);
  const stepMs = STEP_MS[resolution] ?? MS_PER_DAY;
  const rawCount = Math.floor((to - from) / stepMs);
  const count = Math.max(2, Math.min(rawCount, 600));
  if (count <= 1) return [];

  const stepDays = stepMs / MS_PER_DAY;
  const stdDev = 0.012 * Math.sqrt(Math.max(stepDays, 1 / 24));

  const rand = mulberry32(hashSeed(`${symbol}|${range}`));

  const path: number[] = new Array(count);
  path[0] = 1;
  for (let i = 1; i < count; i++) {
    const r = boxMuller(rand) * stdDev;
    path[i] = path[i - 1] * Math.exp(r);
  }

  const scale = anchorPrice / path[count - 1];

  const candles: Candle[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const close = path[i] * scale;
    const open = i === 0 ? close : path[i - 1] * scale;
    const range_ = Math.abs(close - open) + close * stdDev * 0.5;
    const high = Math.max(open, close) + Math.abs(boxMuller(rand)) * range_ * 0.6;
    const low = Math.min(open, close) - Math.abs(boxMuller(rand)) * range_ * 0.6;
    const v = Math.floor(50_000 + rand() * 5_000_000);
    candles[i] = {
      t: from + i * stepMs,
      o: round2(open),
      h: round2(high),
      l: round2(Math.max(low, 0.01)),
      c: round2(close),
      v,
    };
  }
  return candles;
}
