export type Quote = {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  prevClose: number;
  ts: number;
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
}
