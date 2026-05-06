import { describe, expect, it } from 'vitest';
import { mapFinnhubMetrics, metricNumber } from './fundamentals';

describe('metricNumber', () => {
  it('returns the first finite numeric candidate', () => {
    expect(metricNumber({ a: null, b: Number.NaN, c: 12.5 }, ['a', 'b', 'c'])).toBe(12.5);
  });

  it('ignores numeric strings instead of coercing provider payloads', () => {
    expect(metricNumber({ a: '12.5' }, ['a'])).toBeUndefined();
  });
});

describe('mapFinnhubMetrics', () => {
  it('preserves the existing quote-header metrics and maps richer fundamentals', () => {
    const result = mapFinnhubMetrics(
      {
        peBasicExclExtraTTM: 28.5,
        epsInclExtraItemsTTM: 6.12,
        marketCapitalization: 3100,
        dividendYieldIndicatedAnnual: 0.62,
        beta: 1.21,
        '52WeekHigh': 240,
        '52WeekLow': 165,
        psTTM: 7.4,
        pbQuarterly: 12.1,
        '10DayAverageTradingVolume': 51.4,
        evToEbitdaTTM: 21.7,
        evToRevenueTTM: 6.8,
        ebitdaTTM: 125000,
        revenueTTM: 390000,
        revenueGrowthTTMYoy: 8.6,
        grossMarginTTM: 46.2,
        operatingMarginTTM: 31.5,
        netProfitMarginTTM: 24.1,
        roeTTM: 142.3,
        totalDebtToEquityQuarterly: 1.5,
        currentRatioQuarterly: 0.9,
        dividendPerShareTTM: 1.04,
        payoutRatioTTM: 15.2,
        targetMeanPrice: 250,
        earningsDate: '2026-07-30',
      },
      12345,
    );

    expect(result.peTTM).toBe(28.5);
    expect(result.epsTTM).toBe(6.12);
    expect(result.high52w).toBe(240);
    expect(result.evToEbitda).toBe(21.7);
    expect(result.ebitdaTTM).toBe(125000);
    expect(result.revenueTTM).toBe(390000);
    expect(result.grossMarginTTM).toBe(46.2);
    expect(result.totalDebtToEquity).toBe(1.5);
    expect(result.analystTargetMean).toBe(250);
    expect(result.metricSource).toBe('Finnhub basic financials');
    expect(result.metricFetchedAt).toBe(12345);
  });
});
