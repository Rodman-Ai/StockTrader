import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { PaperBadge } from './PaperBadge';
import { BottomTabs } from './BottomTabs';
import { Watchlist } from './Watchlist';
import { Footer } from './Footer';
import { ReplayBar } from './ReplayBar';
import { ReplayDialog } from './ReplayDialog';
import { TickerTape } from './TickerTape';
import { useReplay, isReplayActive } from '@/store/useReplay';

export function AppShell() {
  const replayActive = useReplay((s) => isReplayActive(s.mode));
  const [replayOpen, setReplayOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 py-3 border-b border-line flex items-center justify-between bg-bg-elevated">
        <Link
          to="/portfolio"
          className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-md"
        >
          <Logo size={26} withWordmark />
          <PaperBadge />
        </Link>
        <div className="flex items-center gap-3">
          <nav className="hidden lg:flex items-center gap-1 text-sm" aria-label="Primary">
            <NavItem to="/portfolio">Portfolio</NavItem>
            <NavItem to="/research">Research</NavItem>
            <NavItem to="/transact">Trade</NavItem>
            <NavItem to="/markets">Markets</NavItem>
            <NavItem to="/activity">Activity</NavItem>
          </nav>
          {!replayActive && (
            <button
              onClick={() => setReplayOpen(true)}
              className="btn-ghost text-xs px-3 py-1.5"
              title="Replay a historical trading day"
            >
              Replay
            </button>
          )}
        </div>
      </header>

      <ReplayBar />

      <main className="flex-1 lg:grid lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block border-r border-line bg-bg-elevated">
          <Watchlist />
        </aside>
        <section className="flex flex-col pb-20 lg:pb-10">
          <Outlet />
        </section>
      </main>

      <Footer />

      <div className="fixed bottom-0 inset-x-0 z-30 bg-bg-elevated border-t border-line">
        <BottomTabs />
        <TickerTape />
        <div className="lg:hidden h-[env(safe-area-inset-bottom)]" />
      </div>

      <ReplayDialog open={replayOpen} onClose={() => setReplayOpen(false)} />
    </div>
  );
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  const loc = useLocation();
  const active = loc.pathname.startsWith(to);
  return (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded-md transition-colors ${
        active ? 'bg-bg-subtle text-text' : 'text-text-dim hover:text-text'
      }`}
    >
      {children}
    </Link>
  );
}
