import { describe, it, expect } from 'vitest';
import { parseYahooChart } from './yahoo';

const sample = {
  chart: {
    result: [
      {
        timestamp: [1700000000, 1700000060, 1700000120],
        indicators: {
          quote: [
            {
              open:   [100, 101, null],
              high:   [102, 103, null],
              low:    [99, 100.5, null],
              close:  [101, 102, null],
              volume: [12345, 23456, null],
            },
          ],
        },
      },
    ],
    error: null,
  },
};

describe('parseYahooChart', () => {
  it('parses a valid response and converts timestamps to ms', () => {
    const candles = parseYahooChart(sample);
    expect(candles).toEqual([
      { t: 1700000000000, o: 100, h: 102, l: 99,    c: 101, v: 12345 },
      { t: 1700000060000, o: 101, h: 103, l: 100.5, c: 102, v: 23456 },
    ]);
  });

  it('skips bars with any null OHLC value (e.g. trading halts)', () => {
    const candles = parseYahooChart(sample);
    expect(candles.length).toBe(2);
  });

  it('returns empty for a missing result', () => {
    expect(parseYahooChart({ chart: { result: [] } })).toEqual([]);
    expect(parseYahooChart({ chart: { result: null } })).toEqual([]);
    expect(parseYahooChart({})).toEqual([]);
  });

  it('returns empty when timestamp is missing', () => {
    expect(parseYahooChart({ chart: { result: [{ indicators: { quote: [{}] } }] } })).toEqual([]);
  });

  it('treats missing volume as 0', () => {
    const j = {
      chart: {
        result: [
          {
            timestamp: [1700000000],
            indicators: {
              quote: [{ open: [1], high: [2], low: [0.5], close: [1.5] }],
            },
          },
        ],
      },
    };
    expect(parseYahooChart(j)[0].v).toBe(0);
  });
});
