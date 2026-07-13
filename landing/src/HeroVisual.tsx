/**
 * HeroVisual — refined product stage (Framer Motion)
 * No gimmick paths, no bouncing score chips, no spinning orbs.
 * Aesthetic: quiet depth, editorial layout, subtle interaction.
 */
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import type { MouseEvent } from "react";

const ROWS = [
  { k: "Document match", v: "High", tone: "text-aqua" },
  { k: "Critical gaps", v: "2 items", tone: "text-orchid" },
  { k: "Next action", v: "Rewrite summary", tone: "text-white/80" },
] as const;

export function HeroVisual() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 22, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 40, damping: 22, mass: 0.6 });

  const tiltX = useTransform(sy, [-0.5, 0.5], [6, -6]);
  const tiltY = useTransform(sx, [-0.5, 0.5], [-8, 8]);
  const shiftX = useTransform(sx, [-0.5, 0.5], [-14, 14]);
  const shiftY = useTransform(sy, [-0.5, 0.5], [-10, 10]);
  const ghost1x = useTransform(sx, [-0.5, 0.5], [8, -8]);
  const ghost2x = useTransform(sx, [-0.5, 0.5], [4, -4]);
  const spotX = useTransform(sx, [-0.5, 0.5], ["35%", "65%"]);
  const spotY = useTransform(sy, [-0.5, 0.5], ["30%", "70%"]);

  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${spotX} ${spotY}, rgba(255,255,255,0.09), transparent 55%)`;

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div
      className="relative flex h-full min-h-[400px] w-full items-center justify-center overflow-hidden p-6 sm:p-10"
      onMouseMove={onMove}
      onMouseLeave={reset}
    >
      {/* Soft stage light */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: spotlight }}
      />

      {/* Quiet background geometry */}
      <motion.div
        style={{ x: shiftX, y: shiftY }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <svg
          viewBox="0 0 420 420"
          className="h-[120%] w-[120%] opacity-[0.55]"
          aria-hidden
        >
          <defs>
            <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          {/* Concentric rings — static elegance, one slow breathe */}
          {[150, 118, 86].map((r, i) => (
            <motion.circle
              key={r}
              cx="210"
              cy="210"
              r={r}
              fill="none"
              stroke="url(#ring)"
              strokeWidth="1"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.25, 0.55, 0.25] }}
              transition={{
                duration: 6 + i * 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.4,
              }}
            />
          ))}
          {/* Sparse arc accents */}
          <motion.path
            d="M70 210 A140 140 0 0 1 210 70"
            fill="none"
            stroke="rgba(34,211,238,0.35)"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.path
            d="M350 210 A140 140 0 0 1 210 350"
            fill="none"
            stroke="rgba(168,85,247,0.35)"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
      </motion.div>

      {/* Main product card */}
      <motion.div
        style={{
          rotateX: tiltX,
          rotateY: tiltY,
          transformPerspective: 1200,
        }}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
        className="relative w-full max-w-[340px]"
      >
        {/* Offset ghost layers for depth */}
        <motion.div
          aria-hidden
          className="absolute -inset-x-3 top-4 h-full rounded-3xl border border-white/5 bg-white/[0.03]"
          style={{ x: ghost1x, y: 10 }}
        />
        <motion.div
          aria-hidden
          className="absolute -inset-x-1.5 top-2 h-full rounded-3xl border border-white/5 bg-white/[0.04]"
          style={{ x: ghost2x, y: 5 }}
        />

        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-[#121a2b]/90 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          {/* Title bar */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-aqua/90" />
              <span className="text-[12px] font-medium text-white/70">Analysis</span>
            </div>
            <span className="rounded-full bg-white/8 px-2.5 py-0.5 font-mono text-[10px] text-white/45">
              local
            </span>
          </div>

          <div className="space-y-5 p-5">
            {/* Score block — calm, not flashy */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
            >
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">
                    Fit index
                  </p>
                  <p className="mt-1 font-display text-4xl font-semibold tracking-tight text-white">
                    86
                    <span className="text-lg font-medium text-white/40">/100</span>
                  </p>
                </div>
                {/* Minimal bar meter */}
                <div className="mb-1 h-1.5 w-28 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-aqua to-plum"
                    initial={{ width: 0 }}
                    animate={{ width: "86%" }}
                    transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Rows */}
            <ul className="space-y-2.5">
              {ROWS.map((row, i) => (
                <motion.li
                  key={row.k}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.1, duration: 0.55 }}
                  className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5"
                >
                  <span className="text-[13px] text-white/50">{row.k}</span>
                  <span className={`text-[13px] font-medium ${row.tone}`}>{row.v}</span>
                </motion.li>
              ))}
            </ul>

            {/* CTA strip inside mock */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.95 }}
              className="flex items-center justify-between rounded-xl bg-gradient-to-r from-aqua/15 to-plum/15 px-3.5 py-3"
            >
              <span className="text-[12px] text-white/65">Report ready</span>
              <span className="text-[12px] font-semibold text-white">Export →</span>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
