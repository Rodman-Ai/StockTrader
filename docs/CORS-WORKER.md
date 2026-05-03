# CORS Worker for Yahoo Finance chart data

The chart fetches its history from Yahoo Finance's undocumented
`query1.finance.yahoo.com/v8/finance/chart/...` endpoint. Yahoo doesn't send
CORS headers, so a browser can't call it directly — it needs a tiny proxy that
forwards the request server-side and adds the `Access-Control-Allow-Origin`
header.

By default the app tries two free public proxies in sequence:
**`https://api.allorigins.win/raw?url=`** then **`https://api.codetabs.com/v1/proxy/?quest=`**,
each with an 8-second timeout. If the first 429s, hangs, or errors, the
second is tried before the chart falls back to synthesized history. That's
fine for casual exploration, but both are shared free infrastructure and
will rate-limit you if you hit them hard. The recommended upgrade for
anything you want to be reliable is a Cloudflare Worker you control.

When `VITE_CORS_PROXY` is set, only that proxy is used — the public fallbacks
are skipped because your worker is the trusted path.

## Cost

**Free.** Cloudflare Workers' free tier is 100,000 requests/day with no credit
card required at signup. A typical session of this demo makes a handful of
chart requests; you'd never approach the limit.

## Deploy

1. Sign up at <https://dash.cloudflare.com/sign-up> (free).
2. Workers & Pages → Create → Worker → name it (e.g. `stocktrader-proxy`).
3. Replace the starter code with the file below and click **Deploy**.
4. Copy the deployed URL (e.g. `https://stocktrader-proxy.you.workers.dev`).
5. In this repo, set `VITE_CORS_PROXY=https://stocktrader-proxy.you.workers.dev/?url=`
   either in `.env` (local) or as a GitHub Actions secret (Pages build).

## Worker source

The allowlist below restricts the worker to Yahoo Finance chart paths only.
**Don't remove it** — without it the worker is an open relay anyone can abuse.

```js
const ALLOW = /^https:\/\/query1\.finance\.yahoo\.com\/v8\/finance\/chart\//;

export default {
  async fetch(req) {
    const target = new URL(req.url).searchParams.get('url');
    if (!target || !ALLOW.test(target)) {
      return new Response('forbidden', { status: 403 });
    }
    const upstream = await fetch(target, {
      headers: { 'user-agent': 'Mozilla/5.0 (StockTrader demo)' },
    });
    const body = await upstream.arrayBuffer();
    return new Response(body, {
      status: upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type') ?? 'application/json',
        'access-control-allow-origin': '*',
        'cache-control': 'public, max-age=60',
      },
    });
  },
};
```

## How the app uses it

`src/market/yahoo.ts` builds the Yahoo URL, encodes it, and prepends
`VITE_CORS_PROXY`. The exact format expected is:

```
<VITE_CORS_PROXY><url-encoded yahoo URL>
```

Both `https://api.allorigins.win/raw?url=` (the default) and
`https://your-worker.example.workers.dev/?url=` follow that pattern.

## Failure mode

If the proxy is unreachable, returns a non-200, or returns an unexpected
shape, `src/routes/ticker.tsx` falls back to the local synthetic chart in
`src/market/synth.ts`. The chart shows an amber "Synthetic" badge so the
substitution isn't hidden.
