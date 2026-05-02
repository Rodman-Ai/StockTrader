import { Link, Outlet, useLocation } from 'react-router-dom';
import { PaperBadge } from './PaperBadge';
import { BottomTabs } from './BottomTabs';
import { Watchlist } from './Watchlist';
import { Footer } from './Footer';

export function AppShell() {
  const location = useLocation();
  const isTicker = location.pathname.startsWith('/ticker/');

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 py-3 border-b border-line flex items-center justify-between bg-bg-elevated">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-lg font-bold tracking-tight group-hover:text-accent">
            StockTrader
          </span>
          <PaperBadge />
        </Link>
        <nav className="hidden lg:flex items-center gap-1 text-sm">
          <NavItem to="/">Portfolio</NavItem>
          <NavItem to="/markets">Markets</NavItem>
          <NavItem to="/activity">Activity</NavItem>
        </nav>
      </header>

      <main className="flex-1 lg:grid lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block border-r border-line bg-bg-elevated">
          <Watchlist />
        </aside>
        <section
          className={`flex flex-col ${isTicker ? '' : 'pb-24 lg:pb-0'}`}
        >
          <Outlet />
        </section>
      </main>

      <Footer />
      <BottomTabs />
    </div>
  );
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  const loc = useLocation();
  const active =
    to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(to);
  return (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded-md ${
        active ? 'bg-bg-subtle text-text' : 'text-text-dim hover:text-text'
      }`}
    >
      {children}
    </Link>
  );
}
