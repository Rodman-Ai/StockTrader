import { describe, it, expect } from 'vitest';
import { parseYahooChart, parseYahooNews } from './yahoo';

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

describe('parseYahooNews', () => {
  it('parses news with thumbnail and timestamp', () => {
    const j = {
      news: [
        {
          uuid: 'abc',
          title: 'Apple beats earnings',
          publisher: 'Reuters',
          link: 'https://example.com/aapl',
          providerPublishTime: 1700000000,
          thumbnail: {
            resolutions: [
              { url: 'https://img/large', width: 1080, tag: 'original' },
              { url: 'https://img/140', width: 140, tag: '140x140' },
            ],
          },
          relatedTickers: ['AAPL'],
        },
      ],
    };
    const out = parseYahooNews(j);
    expect(out.length).toBe(1);
    expect(out[0]).toMatchObject({
      id: 'abc',
      ts: 1700000000000,
      headline: 'Apple beats earnings',
      source: 'Reuters',
      url: 'https://example.com/aapl',
      image: 'https://img/140',
    });
  });

  it('skips items without title or link', () => {
    const j = {
      news: [
        { title: 'no link', publisher: 'X' },
        { link: 'https://x', publisher: 'X' },
        { title: 'good', link: 'https://y', publisher: 'X' },
      ],
    };
    expect(parseYahooNews(j).length).toBe(1);
  });

  it('falls back to first available thumbnail when no 140x140', () => {
    const j = {
      news: [
        {
          title: 't',
          link: 'https://x',
          thumbnail: { resolutions: [{ url: 'https://img/200', width: 200 }] },
        },
      ],
    };
    expect(parseYahooNews(j)[0].image).toBe('https://img/200');
  });

  it('returns empty when news is missing', () => {
    expect(parseYahooNews({})).toEqual([]);
    expect(parseYahooNews({ news: [] })).toEqual([]);
  });
});
