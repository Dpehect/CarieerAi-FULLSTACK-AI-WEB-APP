type Props = { className?: string; size?: number; wordmark?: boolean };

export function BrandLogo({ className = "", size = 30, wordmark = true }: Props) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden>
        <rect width="36" height="36" rx="11" fill="#162238" />
        <rect
          x="0.5"
          y="0.5"
          width="35"
          height="35"
          rx="10.5"
          stroke="url(#lg)"
          strokeOpacity="0.55"
        />
        <defs>
          <linearGradient id="lg" x1="6" y1="28" x2="30" y2="8">
            <stop stopColor="#22d3ee" />
            <stop offset="1" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <path
          d="M9 25c3 0 4.5-5 8-8.5S23 10 28 8"
          stroke="url(#lg)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="10" cy="25" r="2" fill="#22d3ee" />
        <circle cx="17.5" cy="16" r="2.2" fill="#7dd3fc" />
        <circle cx="27.5" cy="8.5" r="2.6" fill="#a855f7" />
      </svg>
      {wordmark ? (
        <span className="font-display text-[15px] font-semibold tracking-tight text-white">
          Pathora
        </span>
      ) : null}
    </span>
  );
}
