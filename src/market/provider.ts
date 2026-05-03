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

export type Metrics = {
  peTTM?: number;
  epsTTM?: number;
  marketCap?: number;
  divYield?: number;
  beta?: number;
  high52w?: number;
  low52w?: number;
  ps?: number;
  pb?: number;
  avgVolume10d?: number;
};

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
  getMetrics?(symbol: string): Promise<Metrics>;
  getNews?(symbol: string, fromMs: number, toMs: number): Promise<NewsItem[]>;
}
