# StockTrader

StockTrader is a client-only paper-trading demo for desktop and mobile. It combines realtime US equity quotes, simulated order handling, persisted demo state, portfolio analytics, and a time-travel replay mode that streams historical 1-minute candles as if they were live ticks.

> Simulated trading only. No real money. Not investment advice.

**Live demo:** https://rodman-ai.github.io/StockTrader/

## Review Artifacts

The current systemic review is tracked in durable docs:

- [Bug ledger](docs/BUGS.md)
- [Feature backlog](docs/FEATURE_BACKLOG.md)
- [UX/UI review](docs/UX_UI_REVIEW.md)
- [Competitive analysis](docs/COMPETITIVE_ANALYSIS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)
- [Yahoo CORS Worker setup](docs/CORS-WORKER.md)

## Current Capabilities

### Trading

- Live trade ticks and REST quotes from Finnhub.
- Market, limit, stop, and stop-limit orders.
- Time in force: DAY, GTC, IOC, and FOK.
- Marketable limit orders fill at the better crossed price, bounded by the limit.
- Market orders apply 2 bps of simulated slippage.
- Stop orders show pending/triggered state and fill through the same deterministic broker engine.
- Preview-then-confirm order flow with cash, quantity, and cost readouts.
- Open-orders feed with cancel controls and live distance-to-trigger updates.

### Portfolio

- Synthetic first-run account: $100,000 cash, seed positions, trade history, and watchlist.
- Persisted portfolio, watchlist, and equity-history state through Zustand localStorage stores.
- Total equity, cash, positions value, unrealized P/L, realized P/L, win rate, average win/loss, and profit factor.
- Equity curve with SPY benchmark overlay, drawdown pane, allocation donuts, sector exposure, and position sparklines.
- Activity tab reset restores portfolio, watchlist, and equity-history demo state.

### Markets And Research

- Editable watchlist with live quotes.
- Research tab with symbol search, US ETF index strip, top gainers/losers, and aggregate news.
- Ticker detail page with quote header, chart, order ticket, key stats, company profile, and recent news.
- Quote header shows day range, open, previous close, 52-week range, and stale-data state.

### Charting And Replay

- TradingView `lightweight-charts` line and candlestick chart modes.
- Time ranges: 1D, 1W, 1M, 3M, 1Y, and 5Y.
- Volume bars and SMA(20/50/200) overlays.
- Historical candles from Yahoo Finance through a CORS proxy, with deterministic synthetic fallback.
- Time-travel replay mode for a historical trading day at 1x, 10x, or 60x speed.
- Replay suppresses live WebSocket ticks, timestamps trades at simulated time, and stops at the market close.

### Cross-Platform

- React 18, TypeScript, Vite, Tailwind CSS, Zustand, TanStack Query, and vite-plugin-pwa.
- HashRouter routing so GitHub Pages deep links work without a server fallback.
- Responsive layout with desktop watchlist rail and mobile bottom navigation.
- PWA manifest is built relative to `BASE_PATH`, so the GitHub Pages install target stays under `/StockTrader/`.

## Quick Start

You need a free Finnhub API key from https://finnhub.io/dashboard.

```bash
npm install
cp .env.example .env
# edit .env and set VITE_FINNHUB_KEY=<your key>
npm run dev
```

Open http://localhost:5173.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server. |
| `npm run build` | Type-check and build production assets to `dist/`. Honors `BASE_PATH`. |
| `npm run preview` | Serve the production build locally. |
| `npm test` | Run the Vitest unit suite. Current baseline: 71 passing tests. |
| `npm run typecheck` | Run TypeScript without emitting files. |

## Project Layout

```text
src/
  main.tsx                  entry
  App.tsx                   router and global stream boot
  broker/                   pure order, trade, portfolio math
  components/               app shell, chart, ticket, tables, cards
  hooks/                    market stream and subscription hooks
  market/                   Finnhub, Yahoo, synthetic data, symbols, ranges
  replay/                   historical-day replay engine
  routes/                   landing, portfolio, research, trade, markets, activity, ticker
  store/                    Zustand stores
  styles/                   Tailwind base and shared classes
  utils/                    formatting, indicators, market hours, stats
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for data flow, order lifecycle, replay flow, provider boundaries, and test coverage.

## Data Honesty

Live quotes and historical chart candles come from different sources:

- **Finnhub:** realtime trade WebSocket plus REST quote/profile/metrics/news fallbacks.
- **Yahoo Finance:** historical chart candles through a CORS proxy.
- **Synthetic fallback:** deterministic per-symbol candles anchored to the live price when Yahoo or the proxy fails.

Yahoo's chart endpoint is unofficial and CORS-blocked in browsers. The default public proxies are convenient for casual demo use but should not be treated as reliable infrastructure. For production-style demos, deploy the Cloudflare Worker in [docs/CORS-WORKER.md](docs/CORS-WORKER.md) and set `VITE_CORS_PROXY`.

## GitHub Pages Deploy

The workflow in `.github/workflows/deploy.yml` builds on pushes to `main` and publishes with GitHub Pages Actions. `BASE_PATH` is set to `/${{ github.event.repository.name }}/`, and routing uses `HashRouter`.

One-time repo setup:

1. Settings -> Pages -> Build and deployment -> Source: GitHub Actions.
2. Settings -> Secrets and variables -> Actions -> New repository secret.
3. Add `VITE_FINNHUB_KEY` with your Finnhub key.
4. Settings -> Environments -> github-pages -> allow the branch or all branches.
5. Push to `main` or run the workflow manually.

Any `VITE_*` variable is embedded in the public client bundle. Treat upgraded or paid API keys accordingly.

## Roadmap

The current backlog is split by purpose:

- [docs/ROADMAP.md](docs/ROADMAP.md) gives the product direction and recommended next picks.
- [docs/FEATURE_BACKLOG.md](docs/FEATURE_BACKLOG.md) ranks feature opportunities by value, effort, competitive relevance, and risk.
- [docs/BUGS.md](docs/BUGS.md) tracks active bugs and resolved review findings.

## License

Demo project - no license specified. Do not use for actual trading.
