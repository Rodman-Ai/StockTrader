type Props = {
  size?: number;
  withWordmark?: boolean;
  className?: string;
};

export function Logo({ size = 28, withWordmark = false, className = '' }: Props) {
  const gid = `trend-${size}`;
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gid} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="14" fill="#0b0f17" />
        <g opacity="0.55">
          <line
            x1="32"
            y1="14"
            x2="32"
            y2="50"
            stroke="#1f2937"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <rect x="28" y="22" width="8" height="20" rx="1.5" fill="#1f2937" />
        </g>
        <path
          d="M8 50 L22 38 L36 32 L50 18 L58 10"
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="58" cy="10" r="4" fill="#60a5fa" />
      </svg>
      {withWordmark && (
        <span className="text-lg font-bold tracking-tight">
          Stock<span className="text-accent">Trader</span>
        </span>
      )}
    </span>
  );
}
