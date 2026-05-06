# Roadmap

Reviewed on 2026-05-06. This file summarizes direction and current next picks. The ranked implementation backlog lives in [FEATURE_BACKLOG.md](FEATURE_BACKLOG.md), and active defects live in [BUGS.md](BUGS.md).

## Product Direction

StockTrader is strongest as a transparent paper-trading lab:

- No backend account setup.
- Deterministic local broker engine.
- Realtime quote surface for current market context.
- Historical-day replay for learning and testing order behavior.
- Ticker research that exposes data gaps instead of hiding them.
- Clear disclosure when data is live, replayed, stale, or synthetic.

The next roadmap should protect that identity while closing the biggest parity gaps against retail trading apps.

## Shipped Baseline

Shipped capabilities include:

- Symbol search, editable watchlist, US ETF index strip, top gainers/losers, and recently viewed/search-driven discovery.
- Live quotes, day/open/previous-close context, 52-week range, stale quote pill, and ticker tape.
- `lightweight-charts` with line/candle modes, time-range pills, volume bars, SMA overlays, and live tick updates.
- Expanded ticker research stats grouped by valuation, profitability, growth, balance sheet, dividends, trading stats, analyst/earnings, and source.
- Market, limit, stop, and stop-limit orders.
- DAY, GTC, IOC, and FOK time in force.
- Open-orders feed, cancel controls, pending-trigger state, and better-price marketable limit fills.
- Synthetic portfolio seed, reset-all demo state, activity history, realized P/L, win rate, drawdown, equity curve, SPY benchmark overlay, allocation donuts, sector exposure, and position sparklines.
- Per-ticker profile and news; aggregate news across watchlist and holdings.
- Time-travel replay with simulated timestamps and live-tick gating.
- GitHub Pages PWA build with relative manifest start URL and SVG icon.

## Recommended Next Picks

These are ordered by current value-per-effort, competitive relevance, and risk after the expanded ticker-statistics slice:

1. Alerts hub: price thresholds, percent moves, 52-week high/low, volume spike, news, watchlist-wide alerts, and notification settings.
2. Stock screener with valuation, growth, profitability, dividend, market cap, sector, volume, and price-change filters.
3. Connection state: global live/reconnecting/stale/offline indicator with provider error details.
4. Dollar-based and fractional paper orders with explicit rounding and cash-reserve preview.
5. EMA, RSI, and MACD chart indicators in a sub-pane.
6. Multi-watchlists with drag reorder, sort, bulk paste, and quick alert creation.
7. Mobile bottom-sheet order ticket with persistent quote, buying power, and preview context.
8. Bid/ask spread and extended-hours quote context with fallback disclosure.
9. Watchlist mini stats and sparklines backed by the expanded fundamentals model.
10. Earnings calendar and earnings-date alerts.

Recently shipped items were removed from this list: expanded ticker research stats, symbol search, allocation donuts, equity curve, per-ticker news, stop orders, stop-limit orders, open-order cancel, and time-in-force controls.

## Backlog Categories

Use [FEATURE_BACKLOG.md](FEATURE_BACKLOG.md) as the source of truth for ranked work. The current categories are:

- Search, screeners, and research.
- Market data and reliability.
- Alerts and watchlists.
- Charting and technical analysis.
- Order ticket and paper broker behavior.
- Portfolio analytics and exports.
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
