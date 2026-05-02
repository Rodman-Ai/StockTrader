import type {
  Candle,
  MarketDataProvider,
  Metrics,
  NewsItem,
  Profile,
  Quote,
  TickHandler,
} from './provider';

const REST_BASE = 'https://finnhub.io/api/v1';
const WS_BASE = 'wss://ws.finnhub.io';

const apiKey = (): string => {
  const key = import.meta.env.VITE_FINNHUB_KEY;
  if (!key) {
    throw new Error('VITE_FINNHUB_KEY is not set. Copy .env.example to .env and add your Finnhub key.');
  }
  return key;
};

export class FinnhubProvider implements MarketDataProvider {
  readonly name = 'Finnhub';

  private ws: WebSocket | null = null;
  private subscribed = new Set<string>();
  private handlers = new Set<TickHandler>();
  private reconnectTimer: number | null = null;
  private connecting: Promise<void> | null = null;

  async connect(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;
    if (this.connecting) return this.connecting;

    this.connecting = new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket(`${WS_BASE}?token=${apiKey()}`);
        this.ws = ws;
        ws.addEventListener('open', () => {
          for (const s of this.subscribed) {
            ws.send(JSON.stringify({ type: 'subscribe', symbol: s }));
          }
          this.connecting = null;
          resolve();
        });
        ws.addEventListener('message', (ev) => this.handleMessage(ev.data));
        ws.addEventListener('error', () => {
          this.connecting = null;
          reject(new Error('WebSocket error'));
        });
        ws.addEventListener('close', () => {
          this.ws = null;
          this.scheduleReconnect();
        });
      } catch (err) {
        this.connecting = null;
        reject(err);
      }
    });

    return this.connecting;
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      try { this.ws.close(); } catch {}
      this.ws = null;
    }
  }

  subscribe(symbol: string): void {
    if (this.subscribed.has(symbol)) return;
    this.subscribed.add(symbol);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', symbol }));
    }
  }

  unsubscribe(symbol: string): void {
    if (!this.subscribed.has(symbol)) return;
    this.subscribed.delete(symbol);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'unsubscribe', symbol }));
    }
  }

  onTick(handler: TickHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  async getQuote(symbol: string): Promise<Quote> {
    const r = await fetch(`${REST_BASE}/quote?symbol=${symbol}&token=${apiKey()}`);
    if (!r.ok) throw new Error(`Quote ${symbol} failed: ${r.status}`);
    const j = await r.json();
    const price = Number(j.c);
    const prevClose = Number(j.pc);
    const change = price - prevClose;
    return {
      symbol,
      price,
      prevClose,
      change,
      changePct: prevClose > 0 ? change / prevClose : 0,
      ts: j.t ? j.t * 1000 : Date.now(),
    };
  }

  async getCandles(symbol: string, from: number, to: number, resolution = 'D'): Promise<Candle[]> {
    const url = `${REST_BASE}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${Math.floor(from / 1000)}&to=${Math.floor(to / 1000)}&token=${apiKey()}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Candles ${symbol} failed: ${r.status}`);
    const j = await r.json();
    if (j.s !== 'ok' || !Array.isArray(j.t)) return [];
    const out: Candle[] = [];
    for (let i = 0; i < j.t.length; i++) {
      out.push({
        t: j.t[i] * 1000,
        o: j.o[i],
        h: j.h[i],
        l: j.l[i],
        c: j.c[i],
        v: j.v[i],
      });
    }
    return out;
  }

  async getProfile(symbol: string): Promise<Profile> {
    const r = await fetch(`${REST_BASE}/stock/profile2?symbol=${symbol}&token=${apiKey()}`);
    if (!r.ok) throw new Error(`Profile ${symbol} failed: ${r.status}`);
    const j = await r.json();
    return {
      symbol,
      name: j.name ?? symbol,
      exchange: j.exchange,
      logo: j.logo,
      industry: j.finnhubIndustry,
      ipoDate: j.ipo,
      weburl: j.weburl,
      marketCap: typeof j.marketCapitalization === 'number' ? j.marketCapitalization : undefined,
      country: j.country,
      shareOutstanding: typeof j.shareOutstanding === 'number' ? j.shareOutstanding : undefined,
    };
  }

  async getMetrics(symbol: string): Promise<Metrics> {
    const r = await fetch(`${REST_BASE}/stock/metric?symbol=${symbol}&metric=all&token=${apiKey()}`);
    if (!r.ok) throw new Error(`Metrics ${symbol} failed: ${r.status}`);
    const j = await r.json();
    const m = j?.metric ?? {};
    const num = (v: unknown): number | undefined =>
      typeof v === 'number' && Number.isFinite(v) ? v : undefined;
    return {
      peTTM: num(m.peBasicExclExtraTTM) ?? num(m.peNormalizedAnnualTTM),
      epsTTM: num(m.epsInclExtraItemsTTM) ?? num(m.epsBasicExclExtraTTM) ?? num(m.epsNormalizedAnnual),
      marketCap: num(m.marketCapitalization),
      divYield: num(m.dividendYieldIndicatedAnnual) ?? num(m.currentDividendYieldTTM),
      beta: num(m.beta),
      high52w: num(m['52WeekHigh']),
      low52w: num(m['52WeekLow']),
      ps: num(m.psTTM),
      pb: num(m.pbAnnual) ?? num(m.pbQuarterly),
      avgVolume10d: num(m['10DayAverageTradingVolume']),
    };
  }

  async getNews(symbol: string, fromMs: number, toMs: number): Promise<NewsItem[]> {
    const fmt = (ms: number) => new Date(ms).toISOString().slice(0, 10);
    const r = await fetch(
      `${REST_BASE}/company-news?symbol=${symbol}&from=${fmt(fromMs)}&to=${fmt(toMs)}&token=${apiKey()}`,
    );
    if (!r.ok) throw new Error(`News ${symbol} failed: ${r.status}`);
    const j = await r.json();
    if (!Array.isArray(j)) return [];
    return j.map((n: {
      id?: number;
      datetime?: number;
      headline?: string;
      source?: string;
      url?: string;
      image?: string;
      summary?: string;
    }) => ({
      id: n.id ?? `${n.datetime ?? 0}-${n.headline?.slice(0, 20) ?? ''}`,
      ts: (n.datetime ?? 0) * 1000,
      headline: n.headline ?? '',
      source: n.source ?? '',
      url: n.url ?? '',
      image: n.image || undefined,
      summary: n.summary || undefined,
    }));
  }

  private handleMessage(raw: unknown): void {
    let msg: { type?: string; data?: Array<{ s: string; p: number; t: number }> };
    try {
      msg = typeof raw === 'string' ? JSON.parse(raw) : JSON.parse(String(raw));
    } catch {
      return;
    }
    if (msg.type !== 'trade' || !Array.isArray(msg.data)) return;
    const latest = new Map<string, { p: number; t: number }>();
    for (const t of msg.data) {
      const cur = latest.get(t.s);
      if (!cur || t.t > cur.t) latest.set(t.s, { p: t.p, t: t.t });
    }
    for (const [s, v] of latest) {
      for (const h of this.handlers) h(s, v.p, v.t);
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect().catch(() => this.scheduleReconnect());
    }, 3000);
  }
}

let singleton: FinnhubProvider | null = null;
export const getProvider = (): MarketDataProvider => {
  if (!singleton) singleton = new FinnhubProvider();
  return singleton;
};
