# Feature Backlog

Reviewed on 2026-05-06. This backlog ranks deployment opportunities by user value, effort, competitive relevance, and implementation risk.

Effort scale: `S` is about one day or less, `M` is one to three days, and `L` is larger or likely needs new infrastructure. Risk scale: `Low`, `Medium`, `High`.

## Top 20 Deployment Backlog

| Rank | Status | Priority | Feature | Value | Effort | Competitive relevance | Risk | Notes |
|---:|---|---|---|---|---|---|---|---|
| 1 | Shipped | P1 | Expanded ticker research and stock statistics. | High | M | Robinhood, Webull, TradingView, Fidelity | Medium | Ticker detail now groups P/E, EBITDA fields, EV/EBITDA, revenue, margins, debt, growth, dividends, trading stats, analyst/earnings placeholders, and source/freshness disclosure. Next: reuse in search previews, watchlists, and screener rows. |
| 2 | Open | P1 | Alerts hub. | High | M | Robinhood, Webull, TradingView | Medium | Price, percent move, 52-week high/low, volume spike, news, and watchlist-wide alerts. Start with local notifications before web push. |
| 3 | Open | P1 | Stock screener. | High | L | Robinhood, Webull, TradingView, Fidelity | High | Filter by valuation, growth, profitability, dividend, volume, market cap, sector, and technical state. Reuse the expanded fundamentals model. |
| 4 | Open | P1 | Dollar-based and fractional paper orders. | High | M | Robinhood, Fidelity, Webull | Medium | Buy by dollars or fractional shares, with preview math, cash checks, and deterministic 0.001-share rounding. |
| 5 | Open | P1 | Global data-status pill. | High | S | Webull, broker platform norm | Low | Show live, reconnecting, stale, offline, replay, and synthetic states across quote, chart, and trade surfaces. |
| 6 | Open | P1 | EMA, RSI, and MACD indicators. | High | M | Robinhood, Webull, TradingView, thinkorswim | Medium | First high-value technical set; add a small indicator selector and saved defaults. |
| 7 | Open | P1 | Multiple named watchlists. | High | M | Webull, TradingView, Fidelity | Medium | Rename, reorder, sort, bulk paste, and quick alert creation. |
| 8 | Open | P2 | Mobile bottom-sheet order ticket. | High | M | Robinhood, Webull | Medium | Persistent quote, buying power, preview, and clearer confirmation on small screens. |
| 9 | Open | P2 | Bid/ask and extended-hours quote context. | Medium | M | Robinhood, Webull | Medium | Show spread, session, pre/post-market move, and fallback disclosure when unavailable. |
| 10 | Open | P2 | Watchlist mini stats and sparklines. | Medium | M | Robinhood, Webull, TradingView | Medium | Add price, day move, volume/relative volume, P/E, market cap, and compact trend. |
| 11 | Open | P2 | Earnings calendar and earnings alerts. | Medium | M | Robinhood, Webull, Fidelity | Medium | Surface upcoming earnings, EPS estimate/actual, and ticker-level event reminders. |
| 12 | Open | P2 | Chart compare overlay. | Medium | M | TradingView, Fidelity, Yahoo-style research | Medium | Compare against SPY or another ticker with normalized percent returns. |
| 13 | Open | P2 | CSV export/import. | Medium | S | Fidelity, power-user norm | Low | Export and import holdings, orders, fills, P/L, watchlists, and screener results. |
| 14 | Open | P2 | Settings screen. | Medium | S | Common platform expectation | Low | Centralize theme, provider status, replay defaults, reset/export, and PWA options. |
| 15 | Open | P2 | Keyboard shortcuts and command palette. | Medium | S | TradingView, thinkorswim, IBKR-style workflow | Low | Fast symbol search, trade actions, cancel order, watchlist stepping, and route navigation. |
| 16 | Open | P2 | Trade journal. | Medium | S | Trader discipline workflows | Low | Add notes, rationale, tags, price snapshot metadata, and post-trade review fields. |
| 17 | Open | P2 | Recurring simulated buys. | Medium | M | Robinhood, Fidelity | Medium | Dollar-cost averaging schedules that pair with fractional orders. |
| 18 | Open | P2 | Tax lots and realized/unrealized drilldown. | Medium | L | Fidelity, thinkorswim | High | FIFO lot accounting, realized gains, cost-basis detail, and per-symbol P/L history. |
| 19 | Open | P3 | Advanced simulated orders. | Medium | L | Webull, thinkorswim | High | Trailing stops and bracket orders with clear linked-order lifecycle. |
| 20 | Open | P3 | Drawing tools and saved chart layouts. | Medium | L | TradingView, Webull, thinkorswim | High | Horizontal line, trendline, channel, saved indicator sets, and per-symbol chart preferences. |

## Shipped Items Removed From Next Picks

These are no longer open recommendations because they are already present in current `main`:

- Symbol search.
- Expanded ticker research stats and provider freshness disclosure.
- Stop and stop-limit orders.
- Time-in-force controls.
- Open-order cancel controls.
- Allocation donuts and sector exposure.
- Equity curve, SPY benchmark overlay, and drawdown metrics.
- Per-ticker news.
- Company profile and stats panels.
- Top gainers/losers.
- Time-travel replay.

## Prioritization Notes

- Research depth should now flow into discovery: search previews, watchlists, and screener rows should reuse the same fundamentals model instead of remapping fields.
- Trust and transparency features should stay ahead of flashy analytics because data quality is the main user risk in a client-only market app.
- Trading actions need extra friction and clarity even though the app is simulated.
- Features that require new external data should include fallback behavior before UI build-out.
- PWA and mobile polish should be verified in browser screenshots, not only by code review.
