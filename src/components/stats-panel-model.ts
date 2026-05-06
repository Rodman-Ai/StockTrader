import type { Fundamentals, Profile } from '@/market/provider';
import { fmtBigNum, fmtMarketCapMillions, fmtNum, fmtUsd } from '@/utils/format';

export type StatValue = number | string | undefined | null;

export type StatItem = {
  label: string;
  value: StatValue;
  fmt?: (value: number) => string;
};

export type StatSection = {
  title: string;
  items: StatItem[];
};

const pctPoint = (n: number) => `${n.toFixed(2)}%`;
const usdMillions = (n: number) => fmtMarketCapMillions(n);
const sharesFromMillions = (n: number) => fmtBigNum(n * 1_000_000);
const volumeFromMillions = (n: number) => fmtBigNum(n * 1_000_000);

export function formatStatValue(item: StatItem): string {
  if (item.value == null || item.value === '') return '--';
  if (typeof item.value === 'string') return item.value;
  return item.fmt ? item.fmt(item.value) : fmtNum(item.value);
}

export function buildFundamentalSections({
  metrics,
  profile,
  todayVolume,
  now = Date.now(),
}: {
  metrics?: Fundamentals;
  profile?: Profile;
  todayVolume?: number;
  now?: number;
}): StatSection[] {
  const avgVolUnits = metrics?.avgVolume10d ? metrics.avgVolume10d * 1_000_000 : undefined;
  const volRatio =
    todayVolume && avgVolUnits && avgVolUnits > 0 ? todayVolume / avgVolUnits : undefined;

  const sections: StatSection[] = [
    {
      title: 'Valuation',
      items: [
        { label: 'Market cap', value: metrics?.marketCap ?? profile?.marketCap, fmt: usdMillions },
        { label: 'Enterprise value', value: metrics?.enterpriseValue, fmt: usdMillions },
        { label: 'P/E (TTM)', value: metrics?.peTTM },
        { label: 'Forward P/E', value: metrics?.forwardPe },
        { label: 'PEG', value: metrics?.peg },
        { label: 'P/S (TTM)', value: metrics?.ps },
        { label: 'P/B', value: metrics?.pb },
        { label: 'P/FCF', value: metrics?.priceToFreeCashFlow },
        { label: 'EV/Sales', value: metrics?.evToRevenue },
        { label: 'EV/EBITDA', value: metrics?.evToEbitda },
      ],
    },
    {
      title: 'Profitability',
      items: [
        { label: 'EPS (TTM)', value: metrics?.epsTTM, fmt: fmtUsd },
        { label: 'Revenue (TTM)', value: metrics?.revenueTTM, fmt: usdMillions },
        { label: 'Revenue/share', value: metrics?.revenuePerShareTTM, fmt: fmtUsd },
        { label: 'EBITDA (TTM)', value: metrics?.ebitdaTTM, fmt: usdMillions },
        { label: 'EBITDA/share', value: metrics?.ebitdaPerShareTTM, fmt: fmtUsd },
        { label: 'Gross margin', value: metrics?.grossMarginTTM, fmt: pctPoint },
        { label: 'Operating margin', value: metrics?.operatingMarginTTM, fmt: pctPoint },
        { label: 'Net margin', value: metrics?.netMarginTTM, fmt: pctPoint },
        { label: 'ROE', value: metrics?.roeTTM, fmt: pctPoint },
        { label: 'ROA', value: metrics?.roaTTM, fmt: pctPoint },
        { label: 'ROIC', value: metrics?.roicTTM, fmt: pctPoint },
      ],
    },
    {
      title: 'Growth',
      items: [
        { label: 'Revenue growth', value: metrics?.revenueGrowthTTMYoy, fmt: pctPoint },
        { label: 'EPS growth', value: metrics?.epsGrowthTTMYoy, fmt: pctPoint },
        { label: 'EBITDA growth', value: metrics?.ebitdaGrowthTTMYoy, fmt: pctPoint },
        { label: 'FCF growth', value: metrics?.freeCashFlowGrowthTTMYoy, fmt: pctPoint },
      ],
    },
    {
      title: 'Balance Sheet',
      items: [
        { label: 'Debt/equity', value: metrics?.totalDebtToEquity },
        { label: 'Current ratio', value: metrics?.currentRatio },
        { label: 'Quick ratio', value: metrics?.quickRatio },
        { label: 'Cash ratio', value: metrics?.cashRatio },
        { label: 'Net debt', value: metrics?.netDebt, fmt: usdMillions },
      ],
    },
    {
      title: 'Dividends',
      items: [
        { label: 'Div yield', value: metrics?.divYield, fmt: pctPoint },
        { label: 'Dividend/share', value: metrics?.dividendPerShareTTM, fmt: fmtUsd },
        { label: 'Payout ratio', value: metrics?.payoutRatioTTM, fmt: pctPoint },
        { label: '5y div growth', value: metrics?.dividendGrowth5Y, fmt: pctPoint },
        { label: 'Ex-div date', value: metrics?.exDividendDate },
      ],
    },
    {
      title: 'Trading Stats',
      items: [
        { label: 'Beta', value: metrics?.beta },
        { label: '52w high', value: metrics?.high52w, fmt: fmtUsd },
        { label: '52w low', value: metrics?.low52w, fmt: fmtUsd },
        { label: 'Avg vol (10d)', value: metrics?.avgVolume10d, fmt: volumeFromMillions },
        { label: 'Avg vol (3m)', value: metrics?.avgVolume3Month, fmt: volumeFromMillions },
        { label: 'Vol vs 10d', value: volRatio, fmt: (n) => `${(n * 100).toFixed(0)}%` },
        { label: '52w return', value: metrics?.priceReturn52w, fmt: pctPoint },
        { label: 'YTD return', value: metrics?.priceReturnYtd, fmt: pctPoint },
        { label: 'Shares out', value: profile?.shareOutstanding, fmt: sharesFromMillions },
        { label: 'Free float', value: metrics?.freeFloat, fmt: fmtBigNum },
      ],
    },
    {
      title: 'Analyst/Earnings',
      items: [
        { label: 'Target mean', value: metrics?.analystTargetMean, fmt: fmtUsd },
        { label: 'Rating', value: metrics?.analystRating },
        { label: 'Earnings date', value: metrics?.earningsDate },
      ],
    },
  ];

  const trackedValues = sections.flatMap((section) => section.items.map((item) => item.value));
  const missingCount = trackedValues.filter((value) => value == null || value === '').length;
  const totalCount = trackedValues.length;
  const fetchedAt = metrics?.metricFetchedAt
    ? new Date(metrics.metricFetchedAt).toLocaleString()
    : undefined;

  sections.push({
    title: 'Source',
    items: [
      { label: 'Provider', value: metrics?.metricSource },
      { label: 'Fetched', value: fetchedAt },
      { label: 'Missing fields', value: `${missingCount}/${totalCount}` },
      { label: 'As of', value: new Date(now).toLocaleDateString() },
    ],
  });

  return sections;
}
