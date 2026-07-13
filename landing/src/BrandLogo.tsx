/**
 * Pathora mark — refined monogram: ascending path + node.
 * Quiet luxury, not neon cyberpunk.
 */
type Props = {
  className?: string;
  showWordmark?: boolean;
  size?: number;
};

export function BrandLogo({ className = "", showWordmark = true, size = 28 }: Props) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="shrink-0"
      >
        <rect width="40" height="40" rx="10" fill="#121820" />
        <rect
          x="0.5"
          y="0.5"
          width="39"
          height="39"
          rx="9.5"
          stroke="rgba(255,255,255,0.08)"
        />
        {/* Path */}
        <path
          d="M10 27c4 0 5.5-5 9-8s5-5 10-8"
          stroke="#9eb0ff"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <circle cx="11" cy="27" r="2" fill="#6b8cff" opacity="0.9" />
        <circle cx="19.5" cy="18.5" r="2.25" fill="#8aa4ff" />
        <circle cx="29.5" cy="11" r="2.75" fill="#c5d0ff" />
      </svg>

      {showWordmark ? (
        <span className="font-display text-[15px] font-semibold tracking-[-0.03em] text-white/95">
          Pathora
        </span>
      ) : null}
    </span>
  );
}
