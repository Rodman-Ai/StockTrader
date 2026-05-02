const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const usdCompact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 2,
});

const pct = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  signDisplay: 'exceptZero',
});

const num = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 4,
});

export const fmtUsd = (n: number) => usd.format(n);
export const fmtUsdCompact = (n: number) => usdCompact.format(n);
export const fmtPct = (n: number) => pct.format(n);
export const fmtNum = (n: number) => num.format(n);

export const fmtSigned = (n: number) =>
  (n >= 0 ? '+' : '') + fmtUsd(n).replace('-', '');

export const colorFor = (n: number) =>
  n > 0 ? 'text-up' : n < 0 ? 'text-down' : 'text-text-dim';
