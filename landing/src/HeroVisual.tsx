/**
 * Hero visual — no spinning 3D orb.
 * Creative Framer Motion composition: live path map, floating glass modules,
 * mouse parallax depth, soft ambient light orbs.
 */
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, type MouseEvent } from "react";

const MODULES = [
  { label: "ATS", value: "92", sub: "match signal", x: "8%", y: "18%", delay: 0.15 },
  { label: "Gap", value: "P0", sub: "3 critical", x: "58%", y: "12%", delay: 0.28 },
  { label: "Roadmap", value: "90d", sub: "plan ready", x: "22%", y: "58%", delay: 0.4 },
  { label: "Export", value: "MD", sub: "HTML · PDF", x: "62%", y: "62%", delay: 0.52 },
] as const;

export function HeroVisual() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });

  // Layered parallax depths
  const layer1x = useTransform(sx, [-0.5, 0.5], [-18, 18]);
  const layer1y = useTransform(sy, [-0.5, 0.5], [-12, 12]);
  const layer2x = useTransform(sx, [-0.5, 0.5], [-32, 32]);
  const layer2y = useTransform(sy, [-0.5, 0.5], [-22, 22]);
  const layer3x = useTransform(sx, [-0.5, 0.5], [-48, 48]);
  const layer3y = useTransform(sy, [-0.5, 0.5], [-30, 30]);

  const glow = useMotionTemplate`radial-gradient(600px circle at ${useTransform(
    sx,
    [-0.5, 0.5],
    ["30%", "70%"]
  )} ${useTransform(sy, [-0.5, 0.5], ["35%", "65%"])}, rgba(34,211,238,0.2), rgba(168,85,247,0.12) 40%, transparent 65%)`;

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  // Subtle auto-idle when idle
  useEffect(() => {
    let t = 0;
    let id = 0;
    const tick = () => {
      t += 0.008;
      // only gentle drift if near center
      if (Math.abs(mx.get()) < 0.02 && Math.abs(my.get()) < 0.02) {
        mx.set(Math.sin(t) * 0.04);
        my.set(Math.cos(t * 0.8) * 0.03);
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [mx, my]);

  return (
    <div
      className="relative h-full min-h-[420px] w-full select-none"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {/* Ambient cursor-linked wash */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-90"
        style={{ backgroundImage: glow }}
      />

      {/* Soft light orbs */}
      <motion.div
        style={{ x: layer3x, y: layer3y }}
        className="pointer-events-none absolute left-[12%] top-[20%] h-44 w-44 rounded-full bg-aqua/30 blur-[60px]"
      />
      <motion.div
        style={{ x: layer2x, y: layer2y }}
        className="pointer-events-none absolute bottom-[15%] right-[10%] h-52 w-52 rounded-full bg-plum/30 blur-[70px]"
      />

      {/* Animated connection canvas (SVG) */}
      <motion.svg
        style={{ x: layer1x, y: layer1y }}
        viewBox="0 0 400 360"
        className="absolute inset-0 h-full w-full"
        fill="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="pathGrad" x1="0" y1="0" x2="400" y2="360">
            <stop stopColor="#22d3ee" stopOpacity="0.9" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="1" stopColor="#a855f7" stopOpacity="0.9" />
          </linearGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lattice */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.line
            key={`h-${i}`}
            x1="40"
            x2="360"
            y1={50 + i * 52}
            y2={50 + i * 52}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.1 + i * 0.05 }}
          />
        ))}
        {Array.from({ length: 7 }).map((_, i) => (
          <motion.line
            key={`v-${i}`}
            y1="40"
            y2="320"
            x1={50 + i * 50}
            x2={50 + i * 50}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.15 + i * 0.04 }}
          />
        ))}

        {/* Main career path curve */}
        <motion.path
          d="M48 280 C 90 240, 110 160, 160 140 S 240 120, 280 90 S 330 70, 360 48"
          stroke="url(#pathGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#softGlow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />

        {/* Secondary branch */}
        <motion.path
          d="M160 140 C 180 180, 200 210, 250 230 S 310 250, 340 260"
          stroke="url(#pathGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.55"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Path nodes */}
        {[
          [48, 280],
          [160, 140],
          [280, 90],
          [360, 48],
          [250, 230],
          [340, 260],
        ].map(([cx, cy], i) => (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            r={i === 3 ? 7 : 5}
            fill={i % 2 ? "#a855f7" : "#22d3ee"}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 + i * 0.1, type: "spring", stiffness: 260, damping: 16 }}
          />
        ))}

        {/* Traveling pulse along main path */}
        <motion.circle r="4" fill="#ffffff" filter="url(#softGlow)">
          <animateMotion
            dur="4.5s"
            repeatCount="indefinite"
            path="M48 280 C 90 240, 110 160, 160 140 S 240 120, 280 90 S 330 70, 360 48"
          />
        </motion.circle>
      </motion.svg>

      {/* Floating metric modules */}
      <motion.div style={{ x: layer2x, y: layer2y }} className="absolute inset-0">
        {MODULES.map((m) => (
          <motion.div
            key={m.label}
            className="absolute w-[9.5rem] rounded-2xl border border-white/15 bg-white/10 p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] backdrop-blur-xl"
            style={{ left: m.x, top: m.y }}
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: m.delay, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.06, y: -4, borderColor: "rgba(34,211,238,0.45)" }}
          >
            <motion.div
              className="absolute -inset-px rounded-2xl opacity-0"
              whileHover={{ opacity: 1 }}
              style={{
                background:
                  "linear-gradient(135deg, rgba(34,211,238,0.25), transparent 50%, rgba(168,85,247,0.25))",
                zIndex: -1,
              }}
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
                {m.label}
              </span>
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-aqua"
                animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: m.delay }}
              />
            </div>
            <div className="mt-2 font-display text-2xl font-semibold tracking-tight text-white">
              {m.value}
            </div>
            <div className="mt-0.5 text-[11px] text-white/45">{m.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom caption chip */}
      <motion.div
        style={{ x: layer1x, y: layer1y }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/12 bg-white/8 px-4 py-1.5 text-[11px] text-white/55 backdrop-blur-md"
      >
        Live path map · hover to explore depth
      </motion.div>
    </div>
  );
}
