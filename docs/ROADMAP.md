# Roadmap

A competitor-driven backlog of 100 candidate features. Effort: **S** ≤ 1 day · **M** = 1–3 days · **L** > 3 days or needs backend. Each item lists the competitor that pioneered or popularized it. ✅ marks shipped.

## Status

**Shipped (5):** #11 (time-range pills), #23 (limit orders UI), #30 (cancel open orders), #47 (editable watchlist), #100 (time-travel replay).

**Engine-ready, UI deferred:** stop / trailing-stop / bracket order types could plug straight into the existing engine.

---

### Market data & quotes (10)
1. Symbol search box backed by Finnhub `/search`. **S** · Yahoo
2. Pre-market and after-hours extended-hours quote line. **M** · Robinhood
3. Live bid/ask spread under the price. **S** · Webull
4. Day high/low and 52-week high/low. **S** · Yahoo
5. Current volume vs 30-day avg volume. **S** · Yahoo
6. Sparkline chip on each watchlist row. **S** · Robinhood
7. Auto-failover to mock provider on Finnhub 429. **M** · defensive
8. Connection-state pill (live / reconnecting / stale / offline). **S** · IBKR
9. Crypto symbols on the same surface (Finnhub crypto WS). **M** · Robinhood
10. International index strip (FTSE, DAX, Nikkei, HSI). **S** · Bloomberg

### Charting (12)
11. ✅ Time-range pills (1D/1W/1M/3M/1Y/5Y) wired to candle resolution. **S** · Robinhood
12. Candle/line view toggle. **M** · Webull
13. Volume bars under the price pane. **S** · pro-app default
14. SMA(20/50/200) overlays. **M** · Webull
15. EMA / RSI / MACD indicators in a sub-pane. **M** · thinkorswim
16. Hover crosshair with date+price tooltip. **S** · TradingView
17. Pinch-zoom and pan on touch. **M** · Robinhood
18. Drawing tools (trendline, horizontal, channel). **L** · TradingView
19. Two-ticker compare overlay (% change normalized). **M** · Yahoo
20. Per-ticker chart settings persistence. **S** · Webull
21. Mobile full-screen chart with rotation lock. **S** · Robinhood
22. Swap Recharts → `lightweight-charts` for true candles + perf. **M** · engineering

### Order types & ticket (12)
23. ✅ Surface limit orders in the UI. **S** · already half-built
24. Stop-market and stop-limit orders. **M** · IBKR
25. Trailing stops (trail by % or $). **M** · IBKR
26. Bracket orders (entry + TP + SL in one ticket). **L** · thinkorswim
27. Time-in-force selector (Day, GTC, IOC, FOK). **M** · IBKR
28. Dollar-amount entry → fractional share calc. **M** · Robinhood, Public
29. Slippage estimate visible in preview modal. **S** · trust
30. ✅ Open-orders panel with cancel/modify. **S**
31. Recurring buys (e.g. $50 VOO/wk). **M** · Robinhood
32. Confirmation haptic on mobile (Vibration API). **S** · Robinhood
33. Double-confirm on orders >$10k. **S** · safety
34. One-tap "buy 1 share" on watchlist rows. **S** · Robinhood

### Portfolio & analytics (12)
35. Allocation donut by holding + by sector. **S** · SoFi
36. Equity-curve chart over time (snapshot daily). **M** · Public
37. Realized vs unrealized P/L split. **S** · IBKR
38. Cost-basis lots view (FIFO/LIFO/specific). **L** · Fidelity
39. Day-P/L vs total-P/L toggle. **S** · Webull
40. Simulated dividend payouts on a schedule. **M** · SoFi
41. Sector / country exposure bars. **S** · SoFi
42. Concentration & beta risk score. **M** · Wealthfront
43. "Pies" — bucket holdings with target weights and rebalance hints. **L** · Trading 212
44. SPY-benchmark line overlaid on equity curve. **S** · Public
45. Short-term vs long-term tax-lot tagging on realized gains. **M** · Fidelity
46. CSV export of holdings + trades. **S** · Fidelity

### Watchlists & alerts (10)
47. ✅ Add / remove tickers. **S** · table-stakes
48. Multiple named watchlists. **S** · Webull
49. Drag-to-reorder rows. **S** · Robinhood
50. Price-threshold alerts via Notifications API. **M** · Webull
51. % move alerts (e.g. ±5% intraday). **M** · Robinhood
52. Earnings-date alerts. **S** · Yahoo
53. Volume-spike alerts. **M** · Webull
54. Sort by % change / market cap / volume. **S** · Yahoo
55. Inline sparkline per row. **S** · Robinhood
56. Bulk-add via comma/newline-separated paste. **S** · power-user

### Search, discovery & screeners (8)
57. Cmd-K / "/" universal search (tickers, screens, settings). **S** · modern norm
58. Stock screener with filters (mcap, P/E, sector, yield). **L** · Webull
59. Pre-built screens: most active / top gainers / top losers. **M** · Yahoo
60. Sector heatmap. **M** · Finviz
61. Earnings calendar (this week). **M** · Yahoo
62. IPO calendar. **M** · Webull
63. Fuzzy ticker search ("appl" → AAPL). **S** · UX
64. Recently-viewed tickers list. **S** · Robinhood

### News, research & fundamentals (8)
65. Per-ticker news feed (Finnhub `/news`). **S** · Yahoo
66. Company profile card (sector, industry, IPO date, HQ, employees). **S** · Yahoo
67. Income / balance-sheet / cash-flow tabs. **M** · Stock Analysis
68. Analyst ratings panel (avg target, buy/hold/sell distribution). **M** · Webull
69. Insider transactions log. **M** · Webull
70. Earnings beats/misses history. **M** · Yahoo
71. Dividend history chart. **S** · SoFi
72. Macro events panel (FOMC, CPI dates). **M** · Bloomberg

### Social & community (6)
73. Private trade journal — note per trade, prompted at fill. **S** · original
74. Required "rationale" field at order submit, captured in history. **S** · discipline
75. Share order ticket as image (Web Share API). **S** · Public
76. Public read-only portfolio share link. **L** · Public.com
77. Synthetic leaderboard ("you vs 9 demo bots"). **M** · eToro
78. Per-ticker discussion thread (local, demo-scoped). **M** · StockTwits-lite

### Education & onboarding (6)
79. First-run tour with anchored tooltips. **S** · Robinhood
80. Hover-glossary on jargon (P/E, EPS, beta…). **S** · Robinhood Learn
81. "How a market order fills" explainer modal. **S** · original
82. Strategy challenges ("buy and hold AAPL 30 sim-days"). **M** · Investopedia
83. Daily market briefing card. **M** · SoFi
84. "What is paper trading?" FAQ link from the PAPER badge. **S** · honesty

### Mobile & PWA polish (8)
85. Custom install prompt with manifest screenshot. **S** · PWA
86. Offline-first cache (read-only portfolio works offline). **M** · vite-plugin-pwa
87. Pull-to-refresh on watchlist + portfolio. **S** · Robinhood
88. Bottom-sheet order ticket on mobile. **M** · Robinhood
89. Swipe-to-delete on watchlist rows. **S** · iOS Mail
90. Home-screen widget (top-3 holdings via PWA widgets). **L** · Robinhood
91. Web Push for price alerts. **M** · Webull
92. Biometric unlock (WebAuthn / passkeys) gate. **M** · Robinhood

### Desktop & power-user (4)
93. Keyboard shortcuts (B/S toggle, Enter preview, Esc cancel). **S** · IBKR
94. Detachable / draggable trader workspace panels. **L** · thinkorswim
95. J/K hotkeys to walk the watchlist; G+P for portfolio etc. **S** · Vim
96. Right-click ticker → quick-actions menu. **S** · TWS

### Demo / data / settings (4)
97. Settings screen — theme toggle (dark / light / system). **S** · universal
98. Data-source switcher (Finnhub / mock / Polygon). **M** · extends provider interface
99. Multiple seed profiles ("Aggressive growth", "Dividend seeker", "Just $10k"). **S** · original
100. ✅ Time-travel mode — replay a historical day's ticks at 1×/10×/60× speed. **L** · novel demo flex

---

## Recommended next picks

By impact-per-effort against the current MVP:

1. **#13** Volume bars on the chart.
2. **#35** Allocation donut.
3. **#65** Per-ticker news feed (Finnhub `/news` already supported).
4. **#22** Swap Recharts → `lightweight-charts` (also enables proper candles + #12 + #14).
5. **#28** Dollar-amount entry / fractional shares.
6. **#50** Price-threshold alerts via Notifications API.
7. **#57** Cmd-K universal search.
8. **#36** Equity curve over time.
9. **#93** Keyboard shortcuts.
10. **#97** Settings screen + theme toggle.
