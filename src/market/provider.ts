export type Quote = {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  prevClose: number;
  ts: number;
  dayHigh?: number;
  dayLow?: number;
  dayOpen?: number;
};

export type Candle = {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
};

export type Profile = {
  symbol: string;
  name: string;
  exchange?: string;
  logo?: string;
  industry?: string;
  ipoDate?: string;
  weburl?: string;
  marketCap?: number;
  country?: string;
  shareOutstanding?: number;
};

export type Fundamentals = {
  peTTM?: number;
  forwardPe?: number;
  peg?: number;
  epsTTM?: number;
  marketCap?: number;
  enterpriseValue?: number;
  divYield?: number;
  beta?: number;
  high52w?: number;
  low52w?: number;
  ps?: number;
  pb?: number;
  priceToFreeCashFlow?: number;
  evToRevenue?: number;
  evToEbitda?: number;
  revenueTTM?: number;
  revenuePerShareTTM?: number;
  revenueGrowthTTMYoy?: number;
  epsGrowthTTMYoy?: number;
  ebitdaGrowthTTMYoy?: number;
  freeCashFlowGrowthTTMYoy?: number;
  ebitdaTTM?: number;
  ebitdaPerShareTTM?: number;
  grossMarginTTM?: number;
  operatingMarginTTM?: number;
  netMarginTTM?: number;
  roeTTM?: number;
  roaTTM?: number;
  roicTTM?: number;
  totalDebtToEquity?: number;
  currentRatio?: number;
  quickRatio?: number;
  cashRatio?: number;
  netDebt?: number;
  dividendPerShareTTM?: number;
  payoutRatioTTM?: number;
  dividendGrowth5Y?: number;
  exDividendDate?: string;
  avgVolume10d?: number;
  avgVolume3Month?: number;
  priceReturn52w?: number;
  priceReturnYtd?: number;
  priceReturn13w?: number;
  freeFloat?: number;
  analystTargetMean?: number;
  analystRating?: string;
  earningsDate?: string;
  metricSource?: string;
  metricFetchedAt?: number;
};

export type Metrics = Fundamentals;

export type NewsItem = {
  id: number | string;
  ts: number;
  headline: string;
  source: string;
  url: string;
  image?: string;
  summary?: string;
};

export type TickHandler = (symbol: string, price: number, ts: number) => void;

export interface MarketDataProvider {
  readonly name: string;
  connect(): Promise<void>;
  disconnect(): void;
  subscribe(symbol: string): void;
  unsubscribe(symbol: string): void;
  onTick(handler: TickHandler): () => void;
  getQuote(symbol: string): Promise<Quote>;
  getCandles(symbol: string, from: number, to: number, resolution?: string): Promise<Candle[]>;
  getProfile(symbol: string): Promise<Profile>;
  getMetrics?(symbol: string): Promise<Fundamentals>;
  getNews?(symbol: string, fromMs: number, toMs: number): Promise<NewsItem[]>;
}
