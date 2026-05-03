import type { Candle, NewsItem } from './provider';
import type { RangeKey } from './ranges';

const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';
const DEFAULT_PROXY = 'https://api.allorigins.win/raw?url=';

const RANGE_PARAMS: Record<RangeKey, { range: string; interval: string }> = {
  '1D': { range: '1d', interval: '5m' },
  '1W': { range: '5d', interval: '30m' },
  '1M': { range: '1mo', interval: '1d' },
  '3M': { range: '3mo', interval: '1d' },
  '1Y': { range: '1y', interval: '1d' },
  '5Y': { range: '5y', interval: '1wk' },
};

function proxied(url: string): string {
  const prefix = import.meta.env.VITE_CORS_PROXY ?? DEFAULT_PROXY;
  return `${prefix}${encodeURIComponent(url)}`;
}

type YahooQuote = {
  open?: (number | null)[];
  high?: (number | null)[];
  low?: (number | null)[];
  close?: (number | null)[];
  volume?: (number | null)[];
};

type YahooResult = {
  timestamp?: number[];
  indicators?: { quote?: YahooQuote[] };
};

export type YahooChartResponse = {
  chart?: {
    result?: YahooResult[] | null;
    error?: { code?: string; description?: string } | null;
  };
};

export function parseYahooChart(json: YahooChartResponse): Candle[] {
  const result = json?.chart?.result?.[0];
  if (!result?.timestamp) return [];
  const ts = result.timestamp;
  const q = result.indicators?.quote?.[0] ?? {};
  const out: Candle[] = [];
  for (let i = 0; i < ts.length; i++) {
    const o = q.open?.[i];
    const h = q.high?.[i];
    const l = q.low?.[i];
    const c = q.close?.[i];
    const v = q.volume?.[i];
    if (o == null || h == null || l == null || c == null) continue;
    out.push({
      t: ts[i] * 1000,
      o,
      h,
      l,
      c,
      v: v ?? 0,
    });
  }
  return out;
}

async function fetchAndParse(url: string): Promise<Candle[]> {
  const r = await fetch(proxied(url));
  if (!r.ok) throw new Error(`Yahoo proxy returned ${r.status}`);
  const j = (await r.json()) as YahooChartResponse;
  return parseYahooChart(j);
}

export async function fetchYahooByRange(
  symbol: string,
  range: RangeKey,
): Promise<Candle[]> {
  const p = RANGE_PARAMS[range];
  const url =
    `${YAHOO_BASE}/${encodeURIComponent(symbol)}` +
    `?range=${p.range}&interval=${p.interval}&includePrePost=false`;
  return fetchAndParse(url);
}

export async function fetchYahooByWindow(
  symbol: string,
  fromMs: number,
  toMs: number,
  interval = '1m',
): Promise<Candle[]> {
  const p1 = Math.floor(fromMs / 1000);
  const p2 = Math.floor(toMs / 1000);
  const url =
    `${YAHOO_BASE}/${encodeURIComponent(symbol)}` +
    `?period1=${p1}&period2=${p2}&interval=${interval}&includePrePost=false`;
  return fetchAndParse(url);
}

const YAHOO_SEARCH = 'https://query1.finance.yahoo.com/v1/finance/search';

type YahooThumbnail = {
  resolutions?: Array<{ url?: string; width?: number; height?: number; tag?: string }>;
};

type YahooNewsRaw = {
  uuid?: string;
  title?: string;
  publisher?: string;
  link?: string;
  providerPublishTime?: number;
  thumbnail?: YahooThumbnail;
  relatedTickers?: string[];
};

export type YahooSearchResponse = {
  news?: YahooNewsRaw[];
};

export function parseYahooNews(json: YahooSearchResponse): NewsItem[] {
  const list = json?.news;
  if (!Array.isArray(list)) return [];
  const out: NewsItem[] = [];
  for (const n of list) {
    if (!n.title || !n.link) continue;
    const thumbs = n.thumbnail?.resolutions ?? [];
    const image =
      thumbs.find((t) => t.tag === '140x140')?.url ??
      thumbs.find((t) => t.width && t.width >= 100 && t.width <= 320)?.url ??
      thumbs[0]?.url;
    out.push({
      id: n.uuid ?? `${n.providerPublishTime ?? 0}-${n.title.slice(0, 20)}`,
      ts: (n.providerPublishTime ?? 0) * 1000,
      headline: n.title,
      source: n.publisher ?? '',
      url: n.link,
      image: image || undefined,
    });
  }
  return out;
}

export async function fetchYahooNews(symbol: string, count = 20): Promise<NewsItem[]> {
  const url = `${YAHOO_SEARCH}?q=${encodeURIComponent(symbol)}&newsCount=${count}&quotesCount=0&enableFuzzyQuery=false`;
  const r = await fetch(proxied(url));
  if (!r.ok) throw new Error(`Yahoo news ${symbol} ${r.status}`);
  const j = (await r.json()) as YahooSearchResponse;
  return parseYahooNews(j);
}
