# StockTrader

A paper-trading **demo** that runs on desktop and mobile. Realtime US equity quotes, simulated buy/sell orders, and a synthetic portfolio so you can play around without a real broker account.

> **Simulated trading — no real money. Not investment advice.**

## What it does

- Connects to **Finnhub**'s free realtime trade WebSocket for live US equity quotes.
- Lets you place **market orders** (buy/sell) against a synthetic $100,000 paper account.
- Tracks holdings, average cost, unrealized P/L, and trade history.
- Persists everything in `localStorage` — close the tab, reopen, your account is still there.
- Installable as a **PWA**: works on desktop browsers and adds to home screen on iOS/Android.
- Responsive layout: three-pane on desktop (≥1024px), stacked + bottom tab bar on mobile.

## Stack

Vite · React 18 · TypeScript · Tailwind CSS · Zustand (with `persist`) · TanStack Query · Recharts · `vite-plugin-pwa`.

No backend. The "broker" is a deterministic local module in `src/broker/`.

## Getting started

You'll need a free Finnhub API key (https://finnhub.io/dashboard).

```bash
npm install
cp .env.example .env
# edit .env and set VITE_FINNHUB_KEY=<your key>
npm run dev
```

Open http://localhost:5173.

### Other scripts

- `npm run build` — production build to `dist/`.
- `npm run preview` — serve the production build locally.
- `npm test` — run unit tests (Vitest).
- `npm run typecheck` — TypeScript only.

## Project layout

```
src/
  market/          # MarketDataProvider interface + Finnhub adapter
  broker/          # placeOrder, fill loop, portfolio math, synthetic seed
  store/           # Zustand stores (market quotes, portfolio)
  components/      # AppShell, QuoteHeader, Chart, OrderTicket, etc.
  routes/          # portfolio, markets, activity, ticker
  hooks/           # useMarketStream, useSubscribeSymbol
  utils/           # formatters, market-hours
```

## Synthetic seed

On first run you start with:

- **$100,000** cash
- 50 AAPL, 20 MSFT, 15 NVDA, 30 VOO, 10 TSLA (cost basis backdated ~6 months)
- ~20 prior trades spread over the last 90 days
- Watchlist of 10 popular tickers

Reset to this state from the **Activity** tab → Reset.

## Data honesty

True consolidated NASDAQ/NYSE SIP data requires paid exchange agreements. Finnhub's free tier gives realtime US-exchange trade messages, which is good enough for a demo. The footer always shows the data source and a "simulated trading" disclaimer.

## License

Demo project — no license specified. Do not use for actual trading.
