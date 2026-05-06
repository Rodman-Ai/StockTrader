import type { Fundamentals } from './provider';

type MetricRecord = Record<string, unknown>;

export function metricNumber(metric: MetricRecord, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = metric[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return undefined;
}

export function metricString(metric: MetricRecord, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = metric[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return undefined;
}

export function mapFinnhubMetrics(
  metric: MetricRecord,
  fetchedAt = Date.now(),
): Fundamentals {
  return {
    peTTM: metricNumber(metric, ['peBasicExclExtraTTM', 'peInclExtraTTM', 'peNormalizedAnnualTTM']),
    forwardPe: metricNumber(metric, ['forwardPE', 'peForward', 'forwardPe']),
    peg: metricNumber(metric, ['pegTTM', 'pegRatio', 'peg']),
    epsTTM: metricNumber(metric, [
      'epsInclExtraItemsTTM',
      'epsBasicExclExtraItemsTTM',
      'epsBasicExclExtraTTM',
      'epsNormalizedAnnual',
    ]),
    marketCap: metricNumber(metric, ['marketCapitalization']),
    enterpriseValue: metricNumber(metric, ['enterpriseValue', 'currentEnterpriseValue', 'ev']),
    divYield: metricNumber(metric, ['dividendYieldIndicatedAnnual', 'currentDividendYieldTTM']),
    beta: metricNumber(metric, ['beta']),
    high52w: metricNumber(metric, ['52WeekHigh']),
    low52w: metricNumber(metric, ['52WeekLow']),
    ps: metricNumber(metric, ['psTTM', 'psAnnual']),
    pb: metricNumber(metric, ['pbAnnual', 'pbQuarterly']),
    priceToFreeCashFlow: metricNumber(metric, ['pfcfShareTTM', 'pfcfShareAnnual', 'priceToFreeCashFlowTTM']),
    evToRevenue: metricNumber(metric, [
      'evToRevenueTTM',
      'evToSalesTTM',
      'currentEv/revenueTTM',
      'currentEv/revenueAnnual',
    ]),
    evToEbitda: metricNumber(metric, [
      'evToEbitdaTTM',
      'evToEBITDATTM',
      'currentEv/ebitdaTTM',
      'currentEv/ebitdaAnnual',
      'enterpriseValueOverEBITDA',
    ]),
    revenueTTM: metricNumber(metric, ['revenueTTM', 'totalRevenueTTM']),
    revenuePerShareTTM: metricNumber(metric, ['revenuePerShareTTM', 'revenuePerShareAnnual']),
    revenueGrowthTTMYoy: metricNumber(metric, ['revenueGrowthTTMYoy', 'revenueGrowthQuarterlyYoy']),
    epsGrowthTTMYoy: metricNumber(metric, ['epsGrowthTTMYoy', 'epsGrowthQuarterlyYoy']),
    ebitdaGrowthTTMYoy: metricNumber(metric, ['ebitdaGrowthTTMYoy', 'ebitdGrowthTTMYoy']),
    freeCashFlowGrowthTTMYoy: metricNumber(metric, ['freeCashFlowGrowthTTMYoy', 'fcfGrowthTTMYoy']),
    ebitdaTTM: metricNumber(metric, ['ebitdaTTM', 'ebitdaAnnual', 'ebitdTTM']),
    ebitdaPerShareTTM: metricNumber(metric, ['ebitdaPerShareTTM', 'ebitdPerShareTTM', 'ebitdPerShareAnnual']),
    grossMarginTTM: metricNumber(metric, ['grossMarginTTM', 'grossMarginAnnual']),
    operatingMarginTTM: metricNumber(metric, ['operatingMarginTTM', 'operatingMarginAnnual']),
    netMarginTTM: metricNumber(metric, ['netProfitMarginTTM', 'netMarginTTM', 'netProfitMarginAnnual']),
    roeTTM: metricNumber(metric, ['roeTTM', 'roeRfy']),
    roaTTM: metricNumber(metric, ['roaTTM', 'roaRfy']),
    roicTTM: metricNumber(metric, ['roiTTM', 'roiAnnual', 'roicTTM']),
    totalDebtToEquity: metricNumber(metric, [
      'totalDebt/totalEquityAnnual',
      'totalDebt/totalEquityQuarterly',
      'totalDebtToEquityAnnual',
      'totalDebtToEquityQuarterly',
    ]),
    currentRatio: metricNumber(metric, ['currentRatioQuarterly', 'currentRatioAnnual']),
    quickRatio: metricNumber(metric, ['quickRatioQuarterly', 'quickRatioAnnual']),
    cashRatio: metricNumber(metric, ['cashRatioQuarterly', 'cashRatioAnnual']),
    netDebt: metricNumber(metric, ['netDebtQuarterly', 'netDebtAnnual']),
    dividendPerShareTTM: metricNumber(metric, ['dividendPerShareTTM', 'dividendPerShareAnnual']),
    payoutRatioTTM: metricNumber(metric, ['payoutRatioTTM', 'payoutRatioAnnual']),
    dividendGrowth5Y: metricNumber(metric, ['dividendGrowthRate5Y', 'dividendGrowth5Y']),
    exDividendDate: metricString(metric, ['exDividendDate', 'dividendExDate']),
    avgVolume10d: metricNumber(metric, ['10DayAverageTradingVolume']),
    avgVolume3Month: metricNumber(metric, ['3MonthAverageTradingVolume']),
    priceReturn52w: metricNumber(metric, ['52WeekPriceReturnDaily']),
    priceReturnYtd: metricNumber(metric, ['yearToDatePriceReturnDaily']),
    priceReturn13w: metricNumber(metric, ['13WeekPriceReturnDaily']),
    freeFloat: metricNumber(metric, ['freeFloat', 'floatShares']),
    analystTargetMean: metricNumber(metric, ['targetMeanPrice', 'analystTargetMean', 'priceTargetMean']),
    analystRating: metricString(metric, ['analystRating', 'recommendation']),
    earningsDate: metricString(metric, ['earningsDate', 'nextEarningsDate']),
    metricSource: 'Finnhub basic financials',
    metricFetchedAt: fetchedAt,
  };
}
