# StockTrader

A paper-trading **demo** that runs on desktop and mobile. Realtime US equity quotes, simulated market and limit orders, a synthetic $100,000 portfolio, and a time-travel replay mode that streams a historical day's 1-minute bars as if they were live.

> **Simulated trading — no real money. Not investment advice.**

**Live demo:** https://rodman-ai.github.io/StockTrader/

---

## Features

### Trading
- **Live quotes** via Finnhub's realtime trade WebSocket (US exchanges).
- **Market orders** with a small synthetic slippage (~2 bps).
- **Limit orders** that rest in an open-orders book and fill when the price crosses.
- **Preview-then-confirm** on every order with explicit cost/share/cash readouts.
- **Open-orders panel** with one-click cancel.
- Insufficient-cash and insufficient-shares guards block submission with a clear reason.

### Portfolio
- Total equity, cash, positions value, and unrealized P/L tiles.
- Positions table with live mark-to-market value and per-position P/L (% and $).
- **Synthetic seed** on first run: $100k cash, 5 backdated holdings, ~20 prior trades.
- Trade history with timestamps; reset button to restore the seed.
- Persisted across reloads via Zustand's `localStorage` middleware.

### Watchlist
- Editable sidebar list, persisted locally.
- Add tickers via the input at the top; remove via hover-to-reveal × per row.
- Live-quote display with 1-day % change.

### Charting
- TradingView's `lightweight-charts` with **line and candlestick** views (toggle in the chart toolbar).
- **Time-range pills** (1D / 1W / 1M / 3M / 1Y / 5Y), each mapped to an appropriate Yahoo candle interval (5m/30m/1d/1wk).
- **Volume bars** below the price, color-coded green/red by candle direction.
- **Toggleable SMA(20/50/200)** overlays in distinct colors.
- Live last-tick is appended to the historical series (line view) or merged into the in-progress candle (candle view) so the chart "ticks" in real time.
- Magnet crosshair, pinch-zoom, scrollable timeline.

### Quote header
- Current price, change, change %.
- **Day range and open** (today's high/low/open from Finnhub `/quote`).
- **52-week range bar** with a marker for where the current price sits between the 52w low and high.
- "Stale" pill when no tick has arrived in 60+ seconds.

### Research panels
- **Key stats** under the chart: P/E (TTM), EPS (TTM), market cap, dividend yield, 52-week high/low, beta, P/S, P/B, 10-day average volume, current volume vs 10-day average.
- **Company profile strip**: exchange, country, IPO date, website link.
- **Recent news** panel: last 14 days of headlines (up to 12) from Finnhub `/company-news`, with thumbnail, source, relative timestamp, and external link.

### Portfolio analytics
- **Equity curve** of total account value over time (synthetic backfill on first run, real snapshots from there forward), with **SPY benchmark overlay** normalized to your starting equity.
- **Drawdown sub-pane** below the equity curve plus tiles for max drawdown, current drawdown, and drawdown duration.
- **Allocation donuts** — by holding and by sector, side by side.
- **Sector exposure** stacked bar with a labeled legend.
- **Positions table** gets a 30-day **sparkline** column per holding.

### Performance stats
- **Trade performance tiles** on the Activity page: realized P/L, win rate, average win, average loss, profit factor — derived from FIFO-matched round-trips in your trade history.

### Time-travel replay (the headline trick)
- Pick any historical trading day and replay it at **1× / 10× / 60×** speed.
- The engine fetches that day's 1-minute candles for held + watchlist symbols and emits them as ticks against a simulated clock.
- Limit orders fill against historical prices.
- The trade history records the **historical timestamp** for orders placed during replay.
- Live WebSocket messages are suppressed while replay is on so the simulation isn't overwritten.
- Pause / resume / speed-switch / stop controls in a persistent bar.
- Auto-pauses at 4 PM ET ("Day complete").

### Cross-platform
- **Responsive PWA**: three-pane layout on ≥1024px, stacked + bottom tab bar below.
- Installable on iOS/Android home screens via the manifest.
- Dark mode by default.
- HashRouter so deep links work on GitHub Pages without a 404 fallback.

---

## Quick start

You'll need a free Finnhub API key from https://finnhub.io/dashboard.

```bash
npm install
cp .env.example .env
# edit .env and set VITE_FINNHUB_KEY=<your key>
npm run dev
```

Open http://localhost:5173.

### Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR. |
| `npm run build` | Production build to `dist/`. Honors `BASE_PATH` env. |
| `npm run preview` | Serve the production build. |
| `npm test` | Run Vitest unit tests (broker engine, ranges, ET bounds). |
| `npm run typecheck` | TypeScript only, no emit. |

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Build | **Vite** | Fast HMR, no SSR needed (everything is client-side). |
| UI | **React 18 + TypeScript** | Industry standard. |
| Styling | **Tailwind CSS** | Utility classes, dark theme, `lg:` breakpoint at 1024px. |
| Routing | **react-router-dom** with `HashRouter` | Deep links work on GH Pages without a 404 page. |
| State | **Zustand** with `persist` | Tiny API, idiomatic React, free localStorage. |
| Data fetching | **TanStack Query** | Cache + retry for REST candle/profile. |
| Charts | **lightweight-charts** (TradingView) | True candlesticks, sub-200 KB gzipped, fast even with 1-min replay data. |
| PWA | **vite-plugin-pwa** | Manifest + service worker. |

No backend. The "broker" is a deterministic local module in `src/broker/`.

---

## Project layout

```
src/
  main.tsx                  # entry
  App.tsx                   # router + StreamBoot

  market/
    provider.ts             # MarketDataProvider interface
    finnhub.ts              # adapter: WebSocket + REST quote/candle/profile
    ranges.ts               # 1D…5Y → resolution + lookback
    symbols.ts              # seeded universe + name lookup

  broker/
    types.ts                # Order, Trade, Position, Portfolio
    engine.ts               # placeOrder, tryFillOpenOrders, slippage
    portfolio.ts            # applyTrade, position math, equity calc
    seed.ts                 # synthetic starting state

  store/
    useMarket.ts            # in-memory live quotes (+ replay ticks)
    usePortfolio.ts         # persisted: cash, positions, history, openOrders
    useWatchlist.ts         # persisted: editable symbol list
    useReplay.ts            # transient: replay mode + sim clock

  replay/
    engine.ts               # singleton: candle fetch + interval-driven ticks

  hooks/
    useMarketStream.ts      # boots WS, gates on replay mode

  components/
    AppShell.tsx            # responsive layout, header, replay button
    BottomTabs.tsx          # mobile tab bar
    Chart.tsx               # Recharts area + time-range pills
    QuoteHeader.tsx         # symbol, price, change/%
    OrderTicket.tsx         # buy/sell, market/limit, preview modal
    PositionsTable.tsx
    ActivityList.tsx
    Watchlist.tsx           # editable, with add/remove
    PaperBadge.tsx          # toggles to "REPLAY" when active
    ReplayBar.tsx           # persistent control strip
    ReplayDialog.tsx        # date + speed picker
    Footer.tsx

  routes/
    portfolio.tsx           # / — equity tiles + positions
    markets.tsx             # /markets — symbol grid
    activity.tsx            # /activity — open orders + history + reset
    ticker.tsx              # /ticker/:symbol — quote, chart, ticket

  utils/
    format.ts               # Intl.NumberFormat helpers
    market-hours.ts         # is US market open?
    et-bounds.ts            # ET 9:30 / 16:00 timestamps for a date

  styles/index.css          # Tailwind base + component classes
```

Deeper architecture notes (data flow, order lifecycle, replay flow): see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## Synthetic seed

On first run you start with:

- **$100,000** cash
- 50 AAPL, 20 MSFT, 15 NVDA, 30 VOO, 10 TSLA (cost basis backdated ~6 months)
- ~20 prior trades spread over the last 90 days
- Watchlist of 10 popular tickers

Reset to this state from the **Activity** tab → Reset demo.

---

## Data honesty

Live quotes and historical candles come from two different sources:

- **Live tick / quote: Finnhub** (free tier, realtime trade WebSocket + `/quote` REST).
- **Historical chart bars: Yahoo Finance** (`query1.finance.yahoo.com/v8/finance/chart`) via a CORS proxy. No API key. Used by both the chart's range pills and replay mode's 1-minute history.
- **Fallback: synthetic chart** in `src/market/synth.ts` — a deterministic per-symbol log-normal walk anchored to the live price. Triggered when Yahoo / the proxy is unreachable. A small amber "Synthetic" badge makes the substitution obvious.

True consolidated NASDAQ/NYSE SIP data requires paid exchange agreements ($50–$200/mo). Finnhub's free WebSocket is adequate for the demo's live tick, and Yahoo's chart endpoint is widely used (though unofficial — they can change it without notice).

### CORS proxy

Yahoo doesn't send CORS headers, so the browser can't call it directly. The app uses a small proxy that forwards the request server-side and adds the missing headers.

- **Default**: `https://api.allorigins.win/raw?url=` (free public proxy, fine for casual use, can be unreliable under load).
- **Recommended for anything beyond playing around**: deploy a Cloudflare Worker (free tier, 100k req/day, no credit card). 15-line worker source + deploy steps in [`docs/CORS-WORKER.md`](docs/CORS-WORKER.md). Set `VITE_CORS_PROXY` to your worker URL.

The footer always shows the data source and a "simulated trading" disclaimer. Quote staleness ≥60s is surfaced on the quote header. The `MarketDataProvider` interface in `src/market/provider.ts` makes it possible to swap to Alpaca, Polygon, or a different provider entirely without touching the rest of the app.

---

## Deploying to GitHub Pages

The repo ships `.github/workflows/deploy.yml`, which builds and publishes to GitHub Pages on every push to `main` or the active feature branch. Routing uses `HashRouter` so deep links survive direct loads. Vite's `base` is read from `BASE_PATH` (set to `/StockTrader/` by the workflow).

**One-time repo setup:**

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `VITE_FINNHUB_KEY`
   - Value: your Finnhub API key
3. **Settings → Environments → github-pages → Deployment branches and tags** — allow the branches you want to deploy from (or "All branches").
4. Push, or trigger manually from the Actions tab.

Site URL: `https://<owner>.github.io/StockTrader/`.

> Any `VITE_*` env var is embedded into the public client bundle. Finnhub free-tier keys are rate-limited and harmless if leaked, but rotate them if you ever upgrade.

---

## Roadmap

The full 100-feature roadmap (with effort estimates and competitor origins) lives in [`docs/ROADMAP.md`](docs/ROADMAP.md). Highlights of what's still on deck:

- Stop and trailing-stop orders
- Per-ticker news feed and fundamentals tabs
- Stock screener, sector heatmap, earnings calendar
- Equity-curve chart over time, allocation donut by sector
- Push notifications for price alerts
- Keyboard shortcuts (B/S, J/K to walk the watchlist)
- Settings screen with theme + data-source switcher

---

## License

Demo project — no license specified. Do not use for actual trading.
