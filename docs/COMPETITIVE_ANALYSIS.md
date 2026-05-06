# Competitive Analysis

Reviewed on 2026-05-06 using public product and support pages. No broker account login, paid market-data entitlement, or app-store hands-on testing was used.

## Sources

- Robinhood stock details: <https://robinhood.com/us/en/support/articles/viewing-stock-detail-pages/?hcs=true>
- Robinhood advanced charts: <https://robinhood.com/us/en/support/articles/using-advanced-charts/>
- Robinhood price alerts: <https://robinhood.com/us/en/support/articles/price-alerts/>
- Robinhood fractional shares: <https://robinhood.com/us/en/support/articles/fractional-shares/>
- Robinhood recurring investments: <https://www.robinhoodinvesting.com/us/en/support/articles/recurring-investments/index.html>
- Webull charts and paper trading: <https://www.webull.com/charts-tools>
- Webull alerts: <https://www.webull.com/help/faq/11116-Alerts>
- Webull valuation indicators: <https://www.webull.com/help/faq/249-Company-Valuation-Basic-Indicators-and-Financial-Indicators>
- TradingView stock screener: <https://www.tradingview.com/support/solutions/43000718866-tradingview-stock-screener-trade-smarter-not-harder/>
- TradingView alerts: <https://www.tradingview.com/support/solutions/43000520149-introduction-to-tradingview-alerts/>
- TradingView watchlist alerts: <https://www.tradingview.com/support/solutions/43000739708-watchlist-alerts-your-trading-edge/>
- Schwab thinkorswim paperMoney: <https://international.schwab.com/thinkorswim/paper-money-trading>
- Schwab thinkorswim charts: <https://international.schwab.com/story/getting-started-with-thinkorswim-charts>
- Fidelity stock research help: <https://www.fidelity.com/quick-content/etf/help/research/learn_er_evaluating.shtml>
- Fidelity fractional shares: <https://www.fidelity.com/trading/fractional-shares>

## Positioning

StockTrader is not trying to be a regulated broker. Its best lane is a transparent, installable paper-trading lab that demonstrates market data, order simulation, replay, research, and portfolio analytics without account onboarding.

Current differentiators:

- Historical-day replay with simulated order fills.
- Local deterministic broker engine.
- No backend dependency.
- Explicit synthetic-data fallback disclosure.
- Expanded ticker research stats with provider freshness and unavailable-value disclosure.
- Strong portfolio analytics for a small demo.

Current parity gaps:

- Alerts.
- Stock screening and discovery filters.
- Fractional/dollar-based paper orders.
- More technical indicators and drawing tools.
- Mobile-first order entry.
- Global data connection state.

## Competitor Matrix

| Competitor | Publicly visible strengths | StockTrader current coverage | Main gaps to consider |
|---|---|---|---|
| Robinhood | Mobile-first stock details, core stats, analyst ratings, financials, earnings, recurring investments, fractional orders, alerts, and advanced chart interactions. | Mobile PWA, live quotes, chart basics, research stats, news, order ticket, replay. | Price alerts, recurring/fractional orders, chart trading controls, extended-hours display, polished mobile order sheet. |
| Webull | Advanced charts, paper trading, real-time quote context, alerts across price/volume/news/technical events, technical indicators, and valuation/financial data. | Paper trading for equities/ETFs, live quotes, chart basics, watchlist, news, expanded stats. | Alert breadth, screener depth, bid/ask context, more indicators, richer chart tools. |
| TradingView | Screeners with fundamentals and technical filters, EV/EBITDA and EBITDA coverage, Supercharts, technical/watchlist alerts, drawing tools, and chart workflow. | `lightweight-charts` foundation, watchlist, replay, expanded research surface. | Stock screener, watchlist-wide alerts, drawings, custom indicator conditions, keyboard/chart workflow. |
| Schwab thinkorswim | paperMoney with real-time simulation, virtual buying power, complex charts, studies, drawing tools, saved layouts, and advanced order workflows. | $100,000 synthetic account, market/limit/stop/stop-limit, TIF, P/L stats, replay. | Bracket/trailing orders, workspace customization, deeper trade-performance drilldowns. |
| Fidelity | Quote/detail research, key statistics, financial statements, earnings, dividends, analyst opinions, screeners, account/reporting depth, and fractional/dollar-based trading. | Research stats, profile, news, watchlist, portfolio state, trade history. | Fractional orders, recurring buys, tax lots, exports, compare workflows, deeper statements. |

## Top Deployment Themes

1. Ticker research depth.
   - Shipped first slice: grouped valuation, profitability, growth, balance sheet, dividend, trading-stat, analyst/earnings, and source sections on the ticker detail page.
   - Next slice: feed the same model into search previews, watchlists, and the screener.

2. Alerts hub.
   - Why: Robinhood, Webull, TradingView, and Fidelity all emphasize alerts or notifications.
   - First slice: local price above/below, percent-move, 52-week, and watchlist-wide alerts.

3. Stock screener.
   - Why: TradingView and Fidelity make fundamentals and technical filters a core research workflow.
   - First slice: valuation, growth, profitability, dividend, market cap, volume, and sector filters backed by cached fundamentals.

4. Dollar-based and fractional paper orders.
   - Why: Robinhood and Fidelity make small-dollar investing central to onboarding.
   - First slice: dollar input, previewed share quantity, and deterministic 0.001-share rounding.

5. More technical analysis and chart workflow.
   - Why: Webull, TradingView, Robinhood advanced charts, and thinkorswim all lean on indicators, drawings, and saved layouts.
   - First slice: EMA, RSI, and MACD before drawing tools.

## Differentiation Opportunities

- Keep replay central: competitors have paper trading, but historical-day replay with visible simulated time is the demo's most memorable feature.
- Turn transparency into a feature: show live/replay/synthetic/stale/offline state everywhere it matters.
- Make research explainable: show `--` for missing metrics and display source/fetched context instead of hiding data gaps.
- Add educational overlays: explain P/E, EBITDA, EV/EBITDA, order type, TIF, slippage, trigger, and fill price directly inside workflows.
- Make exports easy: because this is a local paper-trading lab, CSV export/import can be simpler than broker-grade reporting.
