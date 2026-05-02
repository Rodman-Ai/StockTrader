# Architecture

This document explains the moving parts in `src/`: how data flows, how orders are simulated, how replay works, and how the provider layer is decoupled.

## Module map

```
                                 ┌─────────────┐
                                 │  Finnhub    │  REST + WebSocket
                                 │   API       │
                                 └──────┬──────┘
                                        │
                         ┌──────────────┴───────────────┐
                         │   src/market/finnhub.ts      │   ← MarketDataProvider impl
                         └──────┬───────────────┬───────┘
                                │               │
              live ticks ───────┘               └──── REST candles/profile
                                │
                ┌───────────────┴────────────────────────────┐
                │   src/hooks/useMarketStream.ts             │
                │   (drops live ticks while replay is on)    │
                └───────────────┬────────────────────────────┘
                                │
                                │   replay path
                ┌───────────────┴───────────────┐
                │  src/replay/engine.ts          │   ← module singleton
                │  setInterval → simNow()        │
                │  emit candle.c as ticks        │
                └───────────────┬───────────────┘
                                │
                ┌───────────────┴────────────────────────────────────┐
                │   src/store/useMarket.ts        (in-memory)       │
                │   { quotes: { [sym]: { price, prevClose, ts } } } │
                └────────────┬───────────────────────────────────────┘
                             │
            ┌────────────────┴────────────────┐
            │ Per-tick fan-out:               │
            │  - useMarket.setTick (or replay)│
            │  - usePortfolio.onTick(...,sim) │  ← runs limit-fill loop
            └────────────────┬────────────────┘
                             │
                ┌────────────┴────────────────────┐
                │ src/store/usePortfolio.ts        │  ← persisted to localStorage
                │ submitOrder/cancelOrder/onTick   │
                │   ↓ delegates to                 │
                │ src/broker/engine.ts             │  ← pure functions
                │   placeOrder, tryFillOpenOrders  │
                └──────────────────────────────────┘
```

## Provider abstraction

`src/market/provider.ts` defines a small `MarketDataProvider` interface:

```ts
interface MarketDataProvider {
  connect(): Promise<void>;
  disconnect(): void;
  subscribe(symbol: string): void;
  unsubscribe(symbol: string): void;
  onTick(handler: TickHandler): () => void;
  getQuote(symbol): Promise<Quote>;
  getCandles(symbol, from, to, resolution): Promise<Candle[]>;
  getProfile(symbol): Promise<Profile>;
}
```

`src/market/finnhub.ts` is the only implementation today (`FinnhubProvider`). To swap in Alpaca or Polygon, add a class implementing the interface and change the singleton in `getProvider()`. Nothing downstream needs to change.

The Finnhub adapter:
- Maintains a single WebSocket and re-subscribes everything on reconnect.
- Dedupes per-symbol `subscribed` set so React's strict-mode double effects don't double-subscribe.
- Reduces incoming `data[]` batches to "latest tick per symbol" before fanning out.
- Reconnects with a 3s delay on close.

## Order lifecycle

Pure logic lives in `src/broker/engine.ts` and operates on `Portfolio` snapshots. There is no mutation outside the Zustand `set()` call.

### `placeOrder(portfolio, input, lastPrice, now)`

```
                      ┌── insufficient cash → reject (buy)
input ──→ validate ───┤── insufficient shares → reject (sell)
                      └── ok
                          │
              ┌───────────┼───────────┐
       market │           │  limit    │
              ▼           ▼           ▼
         apply        crossed?    rest in
         slippage      ─yes─→      openOrders
              │           │
              ▼           ▼
        fill at      fill at
        slipped       limit
        price         price
              │           │
              └─────┬─────┘
                    ▼
              return Trade
```

- **Slippage**: market orders fill at `last ± 2 bps` (defined by `SLIPPAGE_BPS` in `engine.ts`). Limit orders that cross immediately fill at the limit price (more advantageous), matching real-broker convention.
- **Resting limits**: `tryFillOpenOrders(portfolio, prices, now)` is called on every tick from the live stream and the replay engine. It walks each open order, checks `canCrossLimit(side, limit, last)`, and applies the resulting trade.
- **Determinism**: the engine is a set of pure functions; `engine.test.ts` covers buy/sell math, both insufficiency paths, weighted-average cost on add-ons, position removal on full sell, and limit-cross fill semantics.

### Why `now` is threaded

`placeOrder` and `tryFillOpenOrders` accept an explicit `now` parameter. In live mode this is `Date.now()`; in replay it is the simulated clock. This means:

- Trade timestamps in history reflect the right time (real now or historical replay time).
- Tests can pass deterministic timestamps.

## State stores

Four Zustand stores, two persisted, two transient:

| Store | Persisted? | Holds |
|---|---|---|
| `useMarket` | no | Per-symbol live quote `{ price, prevClose, ts }`. |
| `usePortfolio` | yes (localStorage) | `seedVersion`, `Portfolio` (cash, positions, history, openOrders). |
| `useWatchlist` | yes | User's symbol list. |
| `useReplay` | no (intentional) | Replay mode, date, speed, sim clock, error. |

`usePortfolio.submitOrder` consults `useReplay` to choose the right `now` so trades placed during replay get the historical timestamp. This is the only cross-store dependency.

## Replay engine

`src/replay/engine.ts` exports a module-scoped singleton, `replayEngine`. The shape:

```
start(date, speed, initialSymbols)
  ↓
  bounds = etMarketBounds(date)         // 9:30 → 16:00 ET, EDT/EST aware
  clockAt = bounds.open
  startedAt = wall clock
  mode = 'loading'
  preload all subscribed (Promise.all)
  mode = 'playing'
  setInterval(tick, 200ms)

simNow()
  if mode != 'playing' → clockAt
  else → min(clockAt + (now - startedAt) * speed, bounds.close)

tick()
  for each subscribed sym:
    while candles[cursor].t <= simNow:
      useMarket.setReplayTick(sym, candle.c, prevClose, candle.t)
      cursor++
  if any advanced: portfolio.onTick(prices, simNow)
  useReplay.setClock(simNow)
  if simNow >= close: mode = 'ended', clear interval
```

### Why setReplayTick exists

`useMarket.setTick` (the live path) drops out-of-order ticks via `existing.ts >= ts`. Replay ticks have historical timestamps, so they would be dropped. `setReplayTick` writes unconditionally and also lets the engine seed `prevClose` from the day's first candle. The dialog calls `useMarket.clearAll()` before starting replay so no stale live quotes leak through.

### Live-tick gating

`useMarketStream.ts` checks `replayEngine.isActive()` inside the WS handler and short-circuits while replay is on. The subscribe hooks (`useSubscribeSymbol`, `useSubscribeMany`) take a different path entirely while replay is active — they call `replayEngine.subscribe(...)` instead of the WS provider.

When replay stops, the subscribe effects re-run, the live provider re-subscribes, and a fresh `getQuote()` repopulates `useMarket`.

### Race-condition guard

`preload()` checks `if (!this.subscribed.has(symbol)) return;` after the candle fetch resolves. This handles the case where the user clicks "Start replay" twice rapidly — the first call's in-flight fetches won't write stale data into the second call's freshly-cleared maps.

## Routing

`HashRouter` (not BrowserRouter). URLs look like `/#/ticker/AAPL`. This matters because GitHub Pages is a static host that always returns `index.html` for `/StockTrader/` but 404s for `/StockTrader/ticker/AAPL`. Hash-based routes never hit the server's path resolver, so deep links work without a 404 fallback page.

`vite.config.ts` reads `process.env.BASE_PATH` so local dev uses `/` and the GH Pages build uses `/StockTrader/`. The workflow sets `BASE_PATH: /${{ github.event.repository.name }}/`.

## Testing

| File | Covers |
|---|---|
| `src/broker/engine.test.ts` | Slippage, market and limit fills, insufficiency rejections, applyTrade math, resting limit fills via `tryFillOpenOrders`. |
| `src/market/ranges.test.ts` | Range-key → resolution and lookback mapping. |
| `src/utils/et-bounds.test.ts` | EDT and EST market-bounds correctness, last-weekday helper. |

Total: **25 tests** at the time of writing. Component-level tests are deferred — the surface is small and primarily integrative.

## Known limitations

- **Bundle size**: the ticker chunk is ~400 kB (110 kB gzipped). Recharts is ~half of that. Switching to TradingView's `lightweight-charts` is a tracked roadmap item that would also unlock proper candlesticks.
- **Finnhub free-tier intraday history** can be restricted; if so, replay and the 1D/1W chart ranges show "No chart data" for affected symbols. Daily/weekly candles are reliable.
- **Single global provider singleton** — fine for one demo user; would need scoping if we ever multi-tenant.
- **Replay state is intentionally transient** — a page reload returns to live mode. Adding `persist` would be a few lines if needed.

## Adding a new feature

Most features land in well-understood spots. Quick reference:

| Want to add… | Touch |
|---|---|
| New chart indicator | `src/components/Chart.tsx`. |
| New order type | `src/broker/engine.ts` (logic) + `src/components/OrderTicket.tsx` (UI). |
| New portfolio analytic | `src/broker/portfolio.ts` (math) + `src/routes/portfolio.tsx` (display). |
| Additional data provider | `src/market/<name>.ts` implementing `MarketDataProvider`, plus a switch in `getProvider()`. |
| Another route | `src/routes/<name>.tsx`, register in `src/App.tsx`. |
| Persisted state | New Zustand store with `persist` middleware in `src/store/`. |

For larger work, the full backlog is in [`ROADMAP.md`](ROADMAP.md).
