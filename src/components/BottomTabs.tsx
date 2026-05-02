import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/', label: 'Portfolio', icon: '◐' },
  { to: '/markets', label: 'Markets', icon: '☰' },
  { to: '/activity', label: 'Activity', icon: '⟲' },
];

export function BottomTabs() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-bg-elevated border-t border-line z-30 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-3">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 py-2 text-xs ${
                isActive ? 'text-accent' : 'text-text-dim'
              }`
            }
          >
            <span className="text-lg leading-none">{t.icon}</span>
            <span>{t.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
