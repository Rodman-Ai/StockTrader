# Feature Backlog

Reviewed on 2026-05-06. This backlog ranks opportunities by user value, effort, competitive relevance, and implementation risk.

Effort scale: `S` is about one day or less, `M` is one to three days, and `L` is larger or likely needs new infrastructure. Risk scale: `Low`, `Medium`, `High`.

## Ranked Opportunities

| Rank | Priority | Feature | Value | Effort | Competitive relevance | Risk | Notes |
|---:|---|---|---|---|---|---|---|
| 1 | P1 | Alerts hub: price, percent move, watchlist-wide alerts, and delivery settings. | High | M | Robinhood, Webull, TradingView | Medium | Biggest retention and parity gap. Start with local Notifications API before web push. |
| 2 | P1 | Global connection state for live, reconnecting, stale, offline, replay, and synthetic data. | High | S | Webull, IBKR-style status surfaces | Low | Builds trust and clarifies data quality. |
| 3 | P1 | Dollar-based and fractional paper orders. | High | M | Robinhood, Fidelity, Webull | Medium | Requires rounding policy, preview math, and position precision updates. |
| 4 | P1 | EMA, RSI, and MACD chart indicators. | High | M | Webull, TradingView, thinkorswim | Medium | Fits current chart stack and improves analysis depth. |
| 5 | P1 | Multiple named watchlists with reorder, sort, and bulk paste. | High | M | Webull, TradingView, Fidelity | Medium | Extends current persisted watchlist store. |
| 6 | P1 | Stock screener with core filters. | High | L | Webull, TradingView, Fidelity | High | Needs data availability decisions and filter caching. |
| 7 | P2 | Bid/ask spread and extended-hours quote line. | Medium | M | Robinhood, Webull | Medium | Depends on provider coverage and fallback display rules. |
| 8 | P2 | Keyboard shortcuts for buy/sell, preview, cancel, navigation, and watchlist stepping. | Medium | S | IBKR, TradingView, thinkorswim | Low | High leverage for desktop users. |
| 9 | P2 | Settings screen for theme, data source, replay defaults, and reset/export controls. | Medium | S | Common platform expectation | Low | Creates a home for controls currently spread across the app. |
| 10 | P2 | CSV export of holdings, trades, and realized P/L. | Medium | S | Fidelity, power-user norm | Low | Low-risk value for review and sharing. |
| 11 | P2 | Mobile bottom-sheet order ticket with persistent quote context. | High | M | Robinhood, Webull | Medium | Improves the highest-risk mobile workflow. |
| 12 | P2 | Chart compare overlay for a second ticker or SPY normalization. | Medium | M | Yahoo, Webull, TradingView | Medium | Reuses existing SPY benchmark logic ideas. |
| 13 | P2 | Drawing tools: horizontal line, trendline, and channel. | Medium | L | TradingView, Webull | High | Valuable but interaction-heavy. |
| 14 | P2 | Recurring buys for simulated dollar-cost averaging. | Medium | M | Robinhood, Fidelity | Medium | Pairs naturally with fractional orders. |
| 15 | P2 | Trade journal notes and required rationale field. | Medium | S | Original discipline feature | Low | Strong fit for paper-trading education. |
| 16 | P2 | Data provider switcher and explicit mock/offline provider. | Medium | M | Reliability feature | Medium | Strengthens demos during provider outages. |
| 17 | P2 | Tax lots and realized/unrealized drilldown. | Medium | L | Fidelity, IBKR | High | Requires lot model UI and math decisions. |
| 18 | P2 | Earnings calendar and earnings-date alerts. | Medium | M | Yahoo, Webull | Medium | Data availability should be verified first. |
| 19 | P2 | First-run tour and glossary for P/E, EPS, beta, stop, limit, TIF. | Medium | S | Robinhood Learn | Low | Reduces confusion for non-pro users. |
| 20 | P2 | Offline read-only PWA portfolio and last quotes. | Medium | M | PWA quality | Medium | Needs cache policy and stale disclosure. |
| 21 | P3 | Custom install prompt and PWA readiness checklist. | Medium | S | Mobile PWA polish | Low | Complements fixed manifest. |
| 22 | P3 | Sector heatmap. | Medium | M | Finviz, broker research tabs | Medium | Nice visual scan surface after screener work. |
| 23 | P3 | Multiple seed profiles. | Medium | S | Demo differentiation | Low | Good for education and repeat demos. |
| 24 | P3 | Day P/L versus total P/L toggle. | Medium | S | Webull, broker norm | Medium | Needs clear day baseline. |
| 25 | P3 | Visible slippage estimate in order preview. | Medium | S | Trust feature | Low | Existing broker constant makes this straightforward. |
| 26 | P3 | Trailing stops. | Medium | M | IBKR, Webull | Medium | Extend current stop order model. |
| 27 | P3 | Bracket orders. | Medium | L | thinkorswim | High | Requires linked order lifecycle. |
| 28 | P3 | Watchlist row sparklines. | Medium | S | Robinhood, Webull | Medium | Historical-data cost needs throttling. |
| 29 | P3 | Mobile full-screen chart mode. | Medium | S | Robinhood, TradingView | Medium | Mainly layout and gesture polish. |
| 30 | P3 | Accessibility pass with named controls, focus states, and touch target audit. | High | M | Baseline quality | Low | Should accompany all UI work. |

## Shipped Items Removed From Next Picks

These are no longer backlog recommendations because they are already present in current `main`:

- Symbol search.
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

- Trust and transparency features should stay ahead of flashy analytics because data quality is the main user risk in a client-only market app.
- Trading actions need extra friction and clarity even though the app is simulated.
- Features that require new external data should include fallback behavior before UI build-out.
- PWA and mobile polish should be verified in browser screenshots, not only by code review.
