# CORS Worker For Yahoo Finance Chart Data

The app fetches historical chart and replay candles from Yahoo Finance's undocumented `query1.finance.yahoo.com/v8/finance/chart/...` endpoint. Yahoo does not send browser CORS headers, so StockTrader needs a small server-side proxy.

By default the app tries two public proxies in sequence:

1. `https://api.allorigins.win/raw?url=`
2. `https://api.codetabs.com/v1/proxy/?quest=`

Each public proxy has an 8-second timeout. If both fail or return an unexpected response, the chart falls back to deterministic synthetic candles. Public proxies are useful for casual demos, but the reliable path is a Cloudflare Worker you control.

When `VITE_CORS_PROXY` is set, only that proxy is used.

## Cost

Cloudflare Workers has a free tier that is more than enough for normal demo traffic. A typical StockTrader session makes a small number of chart requests.

## Deploy

1. Sign up at <https://dash.cloudflare.com/sign-up>.
2. Go to Workers & Pages -> Create -> Worker.
3. Name it, for example `stocktrader-proxy`.
4. Replace the starter source with the worker below.
5. Deploy.
6. Copy the deployed URL, for example `https://stocktrader-proxy.example.workers.dev`.
7. Set `VITE_CORS_PROXY=https://stocktrader-proxy.example.workers.dev/?url=` in `.env` for local dev or as a GitHub Actions secret for Pages builds.

## Worker Source

The allowlist restricts the worker to Yahoo chart URLs. Do not remove it; without the allowlist the worker becomes an open relay.

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

## Expected URL Shape

`src/market/yahoo.ts` builds a Yahoo URL, encodes it, and prefixes it with `VITE_CORS_PROXY`:

```text
<VITE_CORS_PROXY><url-encoded Yahoo URL>
```

Both the default public proxies and the worker URL above follow that pattern.

## Failure Mode

If the proxy fails, returns a non-200 response, times out, or returns an unexpected JSON shape, the ticker chart falls back to `src/market/synth.ts`. The chart shows a synthetic-data badge so the substitution is visible.
