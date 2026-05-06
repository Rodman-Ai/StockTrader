import { describe, expect, it } from 'vitest';
import { buildFundamentalSections, formatStatValue } from './stats-panel-model';

describe('formatStatValue', () => {
  it('uses a stable unavailable placeholder', () => {
    expect(formatStatValue({ label: 'EV/EBITDA', value: undefined })).toBe('--');
    expect(formatStatValue({ label: 'Rating', value: '' })).toBe('--');
  });

  it('formats numeric values with custom formatters', () => {
    expect(formatStatValue({ label: 'Margin', value: 12.345, fmt: (n) => `${n.toFixed(1)}%` })).toBe('12.3%');
  });
});

describe('buildFundamentalSections', () => {
  it('groups expanded ticker research fields into stable sections', () => {
    const sections = buildFundamentalSections({
      metrics: {
        peTTM: 30,
        evToEbitda: 22,
        revenueTTM: 390000,
        ebitdaTTM: 125000,
        grossMarginTTM: 45,
        totalDebtToEquity: 1.8,
        divYield: 0.6,
        avgVolume10d: 50,
        analystTargetMean: 250,
        metricSource: 'Finnhub basic financials',
        metricFetchedAt: 12345,
      },
      profile: { symbol: 'AAPL', name: 'Apple Inc.', shareOutstanding: 15000 },
      todayVolume: 75_000_000,
      now: 12345,
    });

    expect(sections.map((section) => section.title)).toEqual([
      'Valuation',
      'Profitability',
      'Growth',
      'Balance Sheet',
      'Dividends',
      'Trading Stats',
      'Analyst/Earnings',
      'Source',
    ]);
    expect(sections[0].items.some((item) => item.label === 'EV/EBITDA')).toBe(true);
    expect(sections[1].items.some((item) => item.label === 'EBITDA (TTM)')).toBe(true);
    expect(sections[5].items.find((item) => item.label === 'Vol vs 10d')?.value).toBe(1.5);
    expect(sections[7].items.find((item) => item.label === 'Provider')?.value).toBe('Finnhub basic financials');
  });
});
