# UX/UI Review

Reviewed on 2026-05-06. This review focuses on the current app experience and opportunities discovered during the systemic pass.

## Strengths

- Clear app framing: simulated trading, no backend, visible data-source disclaimers.
- Strong core surfaces: portfolio, research, trade, markets, activity, ticker detail, replay.
- Trading flow includes preview and confirmation, which is appropriate even for paper trading.
- Desktop layout makes good use of a persistent watchlist rail.
- Current portfolio analytics are unusually rich for a small demo: equity curve, SPY comparison, drawdown, allocation, sector exposure, and trade stats.

## Remaining Priority UX Issues

| ID | Priority | Area | Issue | Recommendation | Verification |
|---|---:|---|---|---|---|
| UX-002 | P1 | Mobile trading | The order ticket is page-bound instead of a focused mobile sheet. | Use a bottom-sheet ticket on mobile with sticky quote, side, order type, estimated cost, and confirmation. | Mobile viewport smoke test for market, limit, stop, and stop-limit orders. |
| UX-003 | P1 | Data confidence | Stale state exists per quote, but provider health is not globally visible. | Add a compact global state pill: live, reconnecting, stale, offline, replay, synthetic. | Simulate provider failure and replay mode; confirm status changes. |
| UX-004 | P2 | Order clarity | Preview is helpful but can explain slippage, reserves, trigger state, TIF cancellation, and better-price limit fills more explicitly. | Add short contextual rows to preview modal based on order type and TIF. | Unit test preview helpers or manual order matrix. |
| UX-006 | P2 | Watchlist | Add/remove works, but there is no reorder, sort, bulk add, or named list support. | Add edit mode, drag/reorder or move buttons, sort menu, and paste parser. | Manual watchlist workflow test. |
| UX-007 | P2 | Research flow | Search, movers, index strip, and news are useful but disconnected from quick actions. | Add quick actions from research cards: view, trade, alert, add/remove watchlist. | Manual research-to-trade path. |
| UX-008 | P2 | Accessibility | Trading and chart-heavy apps need explicit focus, labels, touch targets, and contrast checks. | Add an accessibility audit pass before major UI expansion. | Keyboard-only run through primary routes. |
| UX-009 | P2 | PWA install | Manifest is fixed, but install/offline expectations are not surfaced. | Add install prompt and a clear offline/read-only policy once cache strategy is implemented. | Install test on mobile and desktop Chromium. |

## Resolved In First UX/UI Slice

| ID | Priority | Area | Resolution | Verification |
|---|---:|---|---|---|
| UX-001 | P1 | Visual polish | Source was verified as valid UTF-8, and fragile decorative glyphs in first-slice UI files were replaced with ASCII-stable copy or inline SVG icons. | Search for mojibake patterns; smoke-test landing, header, and bottom tabs. |
| UX-005 | P2 | Navigation | Mobile bottom tabs now use inline SVG icons plus text labels and an explicit primary-nav label. | Mobile screenshot at 360px and 430px widths. |
| UX-010 | P3 | Layout cleanup | AppShell duplicate ticker padding branch was removed. | Static review and build. |

## Recommended Interaction Principles

- Make the data state visible before asking users to trade.
- Prefer familiar trading controls over decorative labels: icons for navigation/tools, segmented controls for order type, numeric inputs for prices/quantity, toggles for binary settings.
- Keep order confirmation explicit. Even in a demo, accidental actions teach bad habits.
- Avoid stale exact numbers in marketing copy unless they are maintained by release process.
- Mobile trading should minimize context switching: symbol, price, cash, quantity, order type, and preview should stay near each other.

## Suggested Smoke Matrix

| Surface | Desktop | Mobile |
|---|---|---|
| Landing | Hero, feature cards, links, source CTA | No clipped text, readable cards, CTA visible |
| Portfolio | Analytics, positions, reset link path | Cards stack cleanly, tables scroll |
| Trade | Symbol picker, quote, ticket, open orders | Bottom tab, ticket, quick buy, confirm modal |
| Ticker detail | Quote, chart, stats, news, order ticket | Chart gestures, header freshness, ticket reachability |
| Replay | Dialog, replay bar, status, live gating | Controls fit and remain tappable |
| PWA | Manifest install target, Pages base path | Home-screen launch under `/StockTrader/` |
