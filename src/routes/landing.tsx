import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';

const FEATURES = [
  {
    icon: '⚡',
    color: 'text-up',
    bg: 'bg-up/10 border-up/30',
    title: 'Realtime US quotes',
    body:
      "Live trade WebSocket from Finnhub feeds prices into a tiny Zustand store. A single tick updates the chart, the portfolio P/L, and any resting limit orders — atomically.",
  },
  {
    icon: '⟲',
    color: 'text-accent',
    bg: 'bg-accent/10 border-accent/30',
    title: 'Time-travel replay',
    body:
      'Pick any historical trading day, hit play. The engine fetches that day’s 1-minute bars and emits them as ticks at 1×, 10×, or 60× speed. Limit orders fill at the historical prices.',
  },
  {
    icon: '◢◣',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/30',
    title: 'Pro charting',
    body:
      "TradingView's lightweight-charts: candles or line, volume bars, three SMAs, magnet crosshair, drawdown sub-pane on the equity curve. Sub-200 KB gzipped.",
  },
  {
    icon: '◐',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/30',
    title: 'Portfolio analytics',
    body:
      'Equity curve with SPY benchmark overlay, max-drawdown stats, allocation donuts by holding and sector, FIFO-matched realized P/L (win rate, avg win/loss, profit factor).',
  },
  {
    icon: '⌕',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10 border-pink-500/30',
    title: 'Multi-source data',
    body:
      'Yahoo Finance for chart history and news through a configurable CORS proxy; Finnhub for live quotes, profile, and metrics. Synth fallback keeps charts populated when APIs misbehave.',
  },
  {
    icon: '✓',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    title: 'Pure-functional broker engine',
    body:
      'placeOrder, applyTrade, tryFillOpenOrders are pure functions over a Portfolio. 58 unit tests cover slippage, FIFO realized P/L, marketable-limit semantics, and edge cases.',
  },
];

const STACK = [
  'React 18',
  'TypeScript',
  'Vite',
  'Tailwind',
  'Zustand',
  'TanStack Query',
  'lightweight-charts',
  'vite-plugin-pwa',
];

const STAT_TILES = [
  { label: 'Unit tests', value: '58' },
  { label: 'Backend', value: 'none' },
  { label: 'Bundle (gzip)', value: '~80 KB' },
  { label: 'Install', value: 'PWA' },
];

export default function LandingRoute() {
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between border-b border-line">
        <Logo size={28} withWordmark />
        <Link to="/portfolio" className="btn-ghost text-xs px-3 py-1.5">
          Skip to demo →
        </Link>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              background:
                'radial-gradient(circle at 50% 0%, rgba(96,165,250,0.25), transparent 60%)',
            }}
            aria-hidden
          />
          <div className="relative max-w-4xl mx-auto px-6 pt-16 pb-12 lg:pt-24 lg:pb-20 text-center flex flex-col items-center gap-6">
            <Logo size={88} />
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
              Stock<span className="text-accent">Trader</span>
            </h1>
            <p className="text-lg lg:text-xl text-text-dim max-w-2xl">
              Realtime quotes, simulated buy/sell, and historical-day replay — built as a free PWA you can open on a phone or a 27-inch monitor.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
              <Link to="/portfolio" className="btn-primary px-6 py-3 text-base">
                Open the demo →
              </Link>
              <a
                href="https://github.com/Rodman-Ai/StockTrader"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost px-6 py-3 text-base"
              >
                Source on GitHub
              </a>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 w-full max-w-2xl">
              {STAT_TILES.map((s) => (
                <div
                  key={s.label}
                  className="card px-3 py-3 flex flex-col items-center gap-0.5"
                >
                  <span className="text-xl font-mono font-semibold tabular-nums">
                    {s.value}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-text-dim">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature grid */}
        <section className="max-w-6xl mx-auto px-6 py-12 lg:py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold">What's interesting</h2>
            <p className="text-text-dim mt-2">
              The pieces that aren't obvious from a screenshot.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="card p-5 flex flex-col gap-3 hover:border-accent/40 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-lg border flex items-center justify-center text-xl ${f.color} ${f.bg}`}
                >
                  {f.icon}
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-text-dim leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech stack */}
        <section className="max-w-4xl mx-auto px-6 py-12 lg:py-16 text-center">
          <h2 className="text-xl lg:text-2xl font-semibold mb-1">Built with</h2>
          <p className="text-text-dim text-sm mb-6">
            Strict TypeScript everywhere · zero backend · single-file Zustand stores
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {STACK.map((tech) => (
              <span
                key={tech}
                className="text-xs font-mono px-3 py-1.5 rounded-full border border-line bg-bg-elevated text-text-dim"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Honesty */}
        <section className="max-w-3xl mx-auto px-6 py-10 text-sm text-text-dim leading-relaxed">
          <h2 className="text-base font-semibold text-text mb-2">Honesty surface</h2>
          <p>
            Live ticks come from Finnhub's free realtime trade WebSocket. Chart history comes from Yahoo Finance through a configurable CORS proxy (default <code className="text-text">api.allorigins.win</code>; bring your own free Cloudflare Worker for production). Where data is unavailable the chart falls back to a deterministic per-symbol synthetic walk, with a "Synthetic" badge so you know. Trading is always simulated against a $100,000 paper account — no real money, no real broker.
          </p>
        </section>
      </main>

      <footer className="border-t border-line px-6 py-6 text-center text-xs text-text-dim flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Simulated trading — no real money. Not investment advice.</span>
        <span className="flex items-center gap-3">
          <a
            href="https://github.com/Rodman-Ai/StockTrader"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent"
          >
            GitHub
          </a>
          <Link to="/portfolio" className="hover:text-accent">
            Demo
          </Link>
        </span>
      </footer>
    </div>
  );
}
