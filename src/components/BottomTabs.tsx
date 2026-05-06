import { NavLink } from 'react-router-dom';

type TabIconName = 'portfolio' | 'research' | 'trade' | 'markets' | 'activity';

const TABS: { to: string; label: string; icon: TabIconName }[] = [
  { to: '/portfolio', label: 'Portfolio', icon: 'portfolio' },
  { to: '/research', label: 'Research', icon: 'research' },
  { to: '/transact', label: 'Trade', icon: 'trade' },
  { to: '/markets', label: 'Markets', icon: 'markets' },
  { to: '/activity', label: 'Activity', icon: 'activity' },
];

export function BottomTabs() {
  return (
    <nav className="lg:hidden bg-bg-elevated border-b border-line" aria-label="Primary">
      <div className="grid grid-cols-5">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            aria-label={t.label}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] ${
                isActive ? 'text-accent' : 'text-text-dim'
              }`
            }
          >
            <TabIcon name={t.icon} />
            <span>{t.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function TabIcon({ name }: { name: TabIconName }) {
  const common = {
    className: 'h-4 w-4',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  if (name === 'portfolio') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 4v8h8" />
      </svg>
    );
  }

  if (name === 'research') {
    return (
      <svg {...common}>
        <circle cx="10.5" cy="10.5" r="5.5" />
        <path d="M15 15l4 4" />
      </svg>
    );
  }

  if (name === 'trade') {
    return (
      <svg {...common}>
        <path d="M7 7h8a2 2 0 0 1 0 4h-6a2 2 0 0 0 0 4h8" />
        <path d="M12 4v16" />
      </svg>
    );
  }

  if (name === 'markets') {
    return (
      <svg {...common}>
        <path d="M5 19V9" />
        <path d="M12 19V5" />
        <path d="M19 19v-7" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </svg>
  );
}
