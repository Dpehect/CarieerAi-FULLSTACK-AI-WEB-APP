type Props = {
  className?: string;
  showWordmark?: boolean;
  size?: number;
};

/** Pathora mark — teal → violet path monogram. */
export function BrandLogo({ className = "", showWordmark = true, size = 32 }: Props) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="shrink-0 drop-shadow-[0_0_12px_rgba(34,211,238,0.35)]"
      >
        <defs>
          <linearGradient id="pl" x1="8" y1="30" x2="32" y2="10" gradientUnits="userSpaceOnUse">
            <stop stopColor="#22d3ee" />
            <stop offset="1" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="12" fill="#0a1220" />
        <rect x="0.5" y="0.5" width="39" height="39" rx="11.5" stroke="url(#pl)" strokeOpacity="0.45" />
        <path
          d="M11 28c3.5 0 5-5.5 8.5-9S25 12 30 10"
          stroke="url(#pl)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="28" r="2.2" fill="#22d3ee" />
        <circle cx="20" cy="18.5" r="2.5" fill="#67e8f9" />
        <circle cx="30" cy="10" r="3" fill="#a855f7" />
      </svg>
      {showWordmark ? (
        <span className="font-display text-[15px] font-semibold tracking-tight text-white">
          Path<span className="gradient-text">ora</span>
        </span>
      ) : null}
    </span>
  );
}
