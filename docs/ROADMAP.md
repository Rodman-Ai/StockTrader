# Roadmap

Reviewed on 2026-05-06. This file summarizes direction and current next picks. The ranked implementation backlog lives in [FEATURE_BACKLOG.md](FEATURE_BACKLOG.md), and active defects live in [BUGS.md](BUGS.md).

## Product Direction

StockTrader is strongest as a transparent paper-trading lab:

- No backend account setup.
- Deterministic local broker engine.
- Realtime quote surface for current market context.
- Historical-day replay for learning and testing order behavior.
- Clear disclosure when data is live, replayed, stale, or synthetic.

The next roadmap should protect that identity while closing the biggest parity gaps against retail trading apps.

## Shipped Baseline

Shipped capabilities include:

- Symbol search, editable watchlist, US ETF index strip, top gainers/losers, and recently viewed/search-driven discovery.
- Live quotes, day/open/previous-close context, 52-week range, stale quote pill, and ticker tape.
- `lightweight-charts` with line/candle modes, time-range pills, volume bars, SMA overlays, and live tick updates.
- Market, limit, stop, and stop-limit orders.
- DAY, GTC, IOC, and FOK time in force.
- Open-orders feed, cancel controls, pending-trigger state, and better-price marketable limit fills.
- Synthetic portfolio seed, reset-all demo state, activity history, realized P/L, win rate, drawdown, equity curve, SPY benchmark overlay, allocation donuts, sector exposure, and position sparklines.
- Per-ticker stats, profile, and news; aggregate news across watchlist and holdings.
- Time-travel replay with simulated timestamps and live-tick gating.
- GitHub Pages PWA build with relative manifest start URL and SVG icon.

## Recommended Next Picks

These are ordered by current value-per-effort, competitive relevance, and risk:

1. Alerts hub: price thresholds, percent moves, watchlist-wide alerts, and notification settings.
2. Connection state: global live/reconnecting/stale/offline indicator with provider error details.
3. Dollar-based and fractional paper orders with explicit rounding and cash-reserve preview.
4. EMA, RSI, and MACD chart indicators in a sub-pane.
5. Multi-watchlists with drag reorder, sort, and bulk paste.
6. Stock screener with market cap, P/E, sector, dividend yield, volume, and price-change filters.
7. Keyboard shortcuts for common trader actions.
8. Settings screen for theme, data source, replay defaults, and reset/export controls.
9. CSV export for holdings, trades, and realized P/L.
10. Mobile bottom-sheet order ticket with persistent quote context.

Recently shipped items were removed from this list: symbol search, allocation donuts, equity curve, per-ticker news, stop orders, stop-limit orders, open-order cancel, and time-in-force controls.

## Backlog Categories

Use [FEATURE_BACKLOG.md](FEATURE_BACKLOG.md) as the source of truth for ranked work. The current categories are:

- Market data and reliability.
- Alerts and watchlists.
- Charting and technical analysis.
- Order ticket and paper broker behavior.
- Portfolio analytics and exports.
- Search, screeners, and research.
- Mobile/PWA polish.
- Education, onboarding, and transparency.
- Desktop power-user workflow.
- Demo/data settings.

## Review Cadence

At the end of each meaningful feature or bug-fix batch:

1. Run tests, typecheck, audit, and production build.
2. Update [BUGS.md](BUGS.md) for fixed/new defects.
3. Update [FEATURE_BACKLOG.md](FEATURE_BACKLOG.md) when priorities change.
4. Update this roadmap only when the product direction or recommended next picks change.
