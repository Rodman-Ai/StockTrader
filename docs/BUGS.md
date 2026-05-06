# Bug Ledger

Reviewed on 2026-05-06. Status values: `Open`, `Planned`, `Resolved`, `Won't fix`.

This ledger tracks active bugs plus notable review findings that have already been corrected in current `main`.

## Active Bugs

No active bugs are currently tracked from the first UX/UI and major-bug slice. The next work should come from the remaining UX backlog in [UX_UI_REVIEW.md](UX_UI_REVIEW.md) and the ranked feature backlog in [FEATURE_BACKLOG.md](FEATURE_BACKLOG.md).

## Resolved Findings In Current Main

| ID | Priority | Status | Area | Finding | Resolution evidence |
|---|---:|---|---|---|---|
| BUG-001 | P2 | Resolved | UX/UI copy | User-facing source strings were suspected of mojibake and several decorative glyphs were fragile in terminal/review output. | Source was verified as valid UTF-8, then first-slice landing, mobile tabs, replay button, and Trade-route copy were normalized to ASCII-stable text or inline SVG icons. |
| BUG-002 | P3 | Resolved | Landing copy | Landing page hard-coded the previous 58-test baseline. | Landing stat tile now says tests are passing and the feature copy no longer embeds an exact test count. |
| BUG-003 | P3 | Resolved | Trade route state | Trade tab selected symbol could remain bound to a symbol no longer in the trade universe. | Trade universe is now built from positions, watchlist, and open orders, with selected-symbol reconciliation covered by pure helper tests. |
| BUG-004 | P3 | Resolved | Layout code quality | App shell had a redundant ticker conditional with identical branches. | AppShell now uses a single stable content padding class. |
| BUG-005 | P2 | Resolved | Live stream | Dev live stream previously risked permanent unsubscribe under React StrictMode. | `useMarketStream` no longer uses a module-level `started` guard; each mount registers and cleans up the tick handler. |
| BUG-006 | P2 | Resolved | PWA manifest | GitHub Pages PWA manifest previously used root-relative start URL and missing PNG icons. | `vite.config.ts` uses relative `start_url: '.'`, `scope: '.'`, and the existing `favicon.svg` icon. |
| BUG-007 | P2 | Resolved | Broker fills | Marketable limit orders previously filled at the limit instead of the crossed price. | `marketableLimitPrice` fills buy limits at `min(last, limit)` and sell limits at `max(last, limit)`. |
| BUG-008 | P2 | Resolved | Market store | Older live ticks previously could overwrite newer displayed prices. | `useMarket.setTick` returns early when `existing.ts >= ts`. |
| BUG-009 | P3 | Resolved | Reset demo | Reset demo previously reset only portfolio state. | `src/routes/activity.tsx` resets portfolio, watchlist, and equity history. |
| BUG-010 | P3 | Resolved | Quote freshness | Stale quote pill previously depended on unrelated renders. | `QuoteHeader` updates local time every 10 seconds while a quote exists. |
| BUG-011 | P3 | Resolved | Documentation | Architecture, README, CORS, and roadmap docs had stale test/audit/roadmap claims. | The documentation refresh updates the current baseline and splits bugs/features/UX/competitive analysis into separate ledgers. |

## New Bug Intake Template

Use this shape for future entries:

```text
ID:
Priority:
Status:
Area:
Finding:
Evidence:
Impact:
Proposed fix:
Verification:
```
