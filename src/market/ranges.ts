export type RangeKey = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y';

export const RANGES: RangeKey[] = ['1D', '1W', '1M', '3M', '1Y', '5Y'];

const DAY = 24 * 60 * 60 * 1000;

export type RangeSpec = {
  resolution: string;
  lookbackMs: number;
};

const SPEC: Record<RangeKey, RangeSpec> = {
  '1D': { resolution: '5',  lookbackMs: 2 * DAY },
  '1W': { resolution: '60', lookbackMs: 7 * DAY },
  '1M': { resolution: 'D',  lookbackMs: 30 * DAY },
  '3M': { resolution: 'D',  lookbackMs: 92 * DAY },
  '1Y': { resolution: 'D',  lookbackMs: 365 * DAY },
  '5Y': { resolution: 'W',  lookbackMs: 5 * 365 * DAY },
};

export function rangeWindow(range: RangeKey, now: number = Date.now()) {
  const spec = SPEC[range];
  return {
    resolution: spec.resolution,
    from: now - spec.lookbackMs,
    to: now,
  };
}
