# Competitive Analysis

Reviewed on 2026-05-06 using public product and support pages. No broker account login, paid market-data entitlement, or app-store hands-on testing was used.

## Sources

- Robinhood advanced charts: <https://robinhood.com/us/en/support/articles/using-advanced-charts/>
- Robinhood price alerts: <https://robinhood.com/us/en/support/articles/price-alerts/>
- Robinhood recurring investments: <https://www.robinhoodinvesting.com/us/en/support/articles/recurring-investments/index.html>
- Webull charts and paper trading: <https://www.webull.com/charts-tools>
- Webull alerts: <https://www.webull.com/help/faq/11116-Alerts>
- TradingView alerts: <https://www.tradingview.com/support/solutions/43000520149-introduction-to-tradingview-alerts/>
- TradingView watchlist alerts: <https://www.tradingview.com/support/solutions/43000739708-watchlist-alerts-your-trading-edge/>
- Schwab thinkorswim paperMoney: <https://international.schwab.com/thinkorswim/paper-money-trading>
- Fidelity fractional shares: <https://www.fidelity.com/trading/fractional-shares>

## Positioning

StockTrader is not trying to be a regulated broker. Its best lane is a transparent, installable paper-trading lab that demonstrates market data, order simulation, replay, and portfolio analytics without account onboarding.

Current differentiators:

- Historical-day replay with simulated order fills.
- Local deterministic broker engine.
- No backend dependency.
- Explicit synthetic-data fallback disclosure.
- Strong portfolio analytics for a small demo.

Current parity gaps:

- Alerts.
- Fractional/dollar-based orders.
- More technical indicators and drawing tools.
- Screeners and richer discovery.
- Mobile-first order entry.
- Global data connection state.

## Competitor Matrix

| Competitor | Publicly visible strengths | StockTrader current coverage | Main gaps to consider |
|---|---|---|---|
| Robinhood | Mobile-first trading, advanced chart gestures, indicator sets, extended-hours display, price/52-week alerts, recurring dollar investments. | Mobile PWA, live quotes, line/candle charts, range pills, paper order ticket, replay. | Price alerts, recurring/fractional orders, chart trading controls, extended-hours display, polished mobile order sheet. |
| Webull | Advanced charts, many indicators/drawing tools, paper trading, real-time quotes, alerts across price/volume/news/technical events, paper trading across products. | Paper trading for equities/ETFs, live quotes, chart basics, watchlist, news. | Alert breadth, screener depth, technical indicators, bid/ask/Level 2 style context, richer chart tools. |
| TradingView | Supercharts, technical and watchlist alerts, drawing tools, screeners, webhook/email/app notifications, cross-device chart workflow. | `lightweight-charts` foundation, watchlist, replay, research surfaces. | Watchlist-wide alerts, drawings, custom indicator conditions, screeners, keyboard/chart workflow. |
| Schwab thinkorswim | paperMoney with real-time simulation, virtual buying power, complex order tools, customizable workspace, performance analysis. | $100,000 synthetic account, market/limit/stop/stop-limit, TIF, P/L stats, replay. | Bracket/trailing orders, workspace customization, deeper trade-performance drilldowns. |
| Fidelity | Fractional and dollar-based trading, recurring investments, watchlist alerts, research and screening ecosystem, account/reporting depth. | Research panels, watchlist, portfolio state, trade history. | Fractional orders, recurring buys, tax lots, exports, richer research/screening. |

## High-Value Parity Plays

1. Alerts hub.
   - Why: Robinhood, Webull, TradingView, and Fidelity all emphasize alerts or notifications.
   - First slice: local price above/below and percent-move alerts for watched/held symbols.

2. Dollar-based and fractional paper orders.
   - Why: Robinhood and Fidelity make small-dollar investing central to onboarding.
   - First slice: dollar input, previewed share quantity, and deterministic 0.001-share rounding.

3. More technical analysis.
   - Why: Webull, TradingView, and Robinhood advanced charts all lean on indicators.
   - First slice: EMA, RSI, and MACD before drawing tools.

4. Watchlist workflow.
   - Why: TradingView watchlist alerts and Webull watchlists make multi-symbol monitoring a core behavior.
   - First slice: named lists, reorder/sort, bulk paste, and alert actions.

5. Mobile order experience.
   - Why: Robinhood's strength is low-friction mobile trading, while Webull supports quick paper-trading actions.
   - First slice: bottom-sheet order ticket with persistent quote and cash context.

## Differentiation Opportunities

- Keep replay central: competitors have paper trading, but historical-day replay with visible simulated time is the demo's most memorable feature.
- Turn transparency into a feature: show live/replay/synthetic/stale/offline state everywhere it matters.
- Add educational overlays: explain order type, TIF, slippage, trigger, and fill price directly inside preview flows.
- Make exports easy: because this is a local paper-trading lab, CSV export/import can be simpler than broker-grade reporting.
