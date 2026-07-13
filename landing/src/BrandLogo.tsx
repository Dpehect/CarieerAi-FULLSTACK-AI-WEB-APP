/**
 * Pathora marka logosu — yol + nöral düğüm + yükselen yörünge.
 * wordmark opsiyonel; sadece ikon da kullanılabilir.
 */
type Props = {
  className?: string;
  showWordmark?: boolean;
  size?: number;
};

export function BrandLogo({ className = "", showWordmark = true, size = 36 }: Props) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="shrink-0 drop-shadow-[0_0_12px_rgba(34,211,238,0.35)]"
      >
        <defs>
          <linearGradient id="p-ring" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#22d3ee" />
            <stop offset="0.5" stopColor="#38bdf8" />
            <stop offset="1" stopColor="#a78bfa" />
          </linearGradient>
          <linearGradient id="p-core" x1="24" y1="20" x2="44" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#67e8f9" />
            <stop offset="1" stopColor="#818cf8" />
          </linearGradient>
          <filter id="p-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer orbit */}
        <circle cx="32" cy="32" r="27" stroke="url(#p-ring)" strokeWidth="1.5" opacity="0.35" />
        <circle
          cx="32"
          cy="32"
          r="27"
          stroke="url(#p-ring)"
          strokeWidth="1.5"
          strokeDasharray="8 14"
          opacity="0.85"
        />

        {/* Ascending path (career trajectory) */}
        <path
          d="M14 44 C20 44 22 36 28 32 C34 28 36 24 42 18"
          stroke="url(#p-ring)"
          strokeWidth="2.4"
          strokeLinecap="round"
          filter="url(#p-glow)"
        />

        {/* Nodes along path */}
        <circle cx="16" cy="44" r="3" fill="#22d3ee" />
        <circle cx="28" cy="32" r="3.5" fill="#38bdf8" />
        <circle cx="42" cy="18" r="4" fill="url(#p-core)" filter="url(#p-glow)" />

        {/* Neural branches from mid node */}
        <path
          d="M28 32 L36 40 M28 32 L20 26"
          stroke="#a78bfa"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.9"
        />
        <circle cx="36" cy="40" r="2.2" fill="#c4b5fd" />
        <circle cx="20" cy="26" r="2.2" fill="#c4b5fd" />

        {/* Apex spark */}
        <path
          d="M42 12 L43.2 15.5 L46.8 16.2 L44 18.6 L44.8 22.2 L42 20.2 L39.2 22.2 L40 18.6 L37.2 16.2 L40.8 15.5 Z"
          fill="#67e8f9"
          opacity="0.95"
        />
      </svg>

      {showWordmark ? (
        <span className="font-display text-lg font-semibold tracking-tight text-white sm:text-xl">
          Path<span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">ora</span>
        </span>
      ) : null}
    </span>
  );
}
