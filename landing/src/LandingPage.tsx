/**
 * Pathora Landing — product page
 * Lighter dark palette · heavy Framer Motion · creative path-map hero
 * (no spinning 3D orb)
 *
 * Build-safe CSS: no fragile Tailwind @apply opacity utilities.
 */
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { BrandLogo } from "./BrandLogo";
import { HeroVisual } from "./HeroVisual";

const REPO = "https://github.com/Dpehect/CarieerAi-FULLSTACK-AI-WEB-APP";

const FEATURES = [
  {
    title: "ATS in milliseconds",
    body: "Local keyword & structure scoring before any model call—instant signal.",
    wide: true,
  },
  {
    title: "Grounded RAG",
    body: "ChromaDB retrieval keeps every recommendation tied to your documents.",
  },
  {
    title: "Gap intelligence",
    body: "Prioritized skill gaps with severity and a clear close-the-gap path.",
  },
  {
    title: "Letters & LinkedIn",
    body: "Drafts that read like you—not a template farm.",
    wide: true,
  },
  {
    title: "Export suite",
    body: "Markdown + print-ready HTML. PDF in one browser print.",
  },
  {
    title: "Private by default",
    body: "Ollama on localhost. No API keys. Data stays on disk.",
  },
] as const;

const STEPS = [
  { id: "01", title: "Bootstrap", text: "One installer. Models included." },
  { id: "02", title: "Open", text: "Streamlit UI on localhost." },
  { id: "03", title: "Index", text: "CV + job as PDF or text." },
  { id: "04", title: "Decide", text: "Score, plan, draft, export." },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

/* ─── motion primitives ─────────────────────────────────────────────────── */

function Reveal({
  children,
  className = "",
  delay = 0,
  y = 40,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function Magnetic({
  children,
  className,
  href,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 18, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 300, damping: 18, mass: 0.3 });

  const move = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.28);
    y.set((e.clientY - r.top - r.height / 2) * 0.28);
  };
  const leave = () => {
    x.set(0);
    y.set(0);
  };

  const shared = {
    onMouseMove: move,
    onMouseLeave: leave,
    style: { x: sx, y: sy },
    whileHover: { scale: 1.04 },
    whileTap: { scale: 0.97 },
    className,
  };

  if (href) {
    return (
      <motion.a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noreferrer" : undefined}
        {...shared}
      >
        {children}
      </motion.a>
    );
  }
  return (
    <motion.button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type="button"
      onClick={onClick}
      {...shared}
    >
      {children}
    </motion.button>
  );
}

function TiltCard({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [11, -11]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-14, 14]), { stiffness: 200, damping: 18 });
  const px = useTransform(mx, (v) => `${v * 100}%`);
  const py = useTransform(my, (v) => `${v * 100}%`);
  const glow = useMotionTemplate`radial-gradient(500px circle at ${px} ${py}, rgba(34,211,238,0.22), rgba(168,85,247,0.12) 40%, transparent 65%)`;

  return (
    <Reveal delay={delay} className={`h-full [perspective:1400px] ${className}`}>
      <motion.div
        ref={ref}
        onMouseMove={(e) => {
          const el = ref.current;
          if (!el) return;
          const r = el.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width);
          my.set((e.clientY - r.top) / r.height);
        }}
        onMouseLeave={() => {
          mx.set(0.5);
          my.set(0.5);
        }}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        whileHover={{ scale: 1.035, z: 48 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="glass relative h-full overflow-hidden rounded-[1.4rem] shadow-float"
      >
        <motion.div className="pointer-events-none absolute inset-0" style={{ backgroundImage: glow }} />
        <div className="relative h-full p-6 sm:p-7" style={{ transform: "translateZ(32px)" }}>
          {children}
        </div>
      </motion.div>
    </Reveal>
  );
}

/* ─── chrome ─────────────────────────────────────────────────────────────── */

function Progress({ p }: { p: MotionValue<number> }) {
  const scaleX = useSpring(p, { stiffness: 100, damping: 28 });
  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[90] h-[2px] origin-left bg-gradient-to-r from-aqua via-white to-plum"
      style={{ scaleX }}
    />
  );
}

function Nav() {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 50], ["rgba(11,18,32,0)", "rgba(11,18,32,0.82)"]);
  const border = useTransform(scrollY, [0, 50], [0, 1]);

  return (
    <motion.header
      style={{ backgroundColor: bg }}
      className="fixed inset-x-0 top-0 z-50 backdrop-blur-xl"
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.75, ease: EASE }}
    >
      <motion.div
        className="absolute inset-x-0 bottom-0 h-px bg-white/15"
        style={{ opacity: border }}
      />
      <div className="shell flex h-[4.25rem] items-center justify-between">
        <motion.a href="#top" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <BrandLogo />
        </motion.a>
        <nav className="absolute left-1/2 hidden -translate-x-1/2 gap-9 text-[13px] text-white/65 md:flex">
          {[
            ["Product", "#product"],
            ["Process", "#process"],
            ["Start", "#start"],
          ].map(([label, href], i) => (
            <motion.a
              key={href}
              href={href}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.06 }}
              whileHover={{ color: "#fff", y: -1 }}
              className="transition"
            >
              {label}
            </motion.a>
          ))}
        </nav>
        <div className="flex gap-2">
          <Magnetic href={REPO} className="btn btn-line !px-4 !py-2 text-xs">
            GitHub
          </Magnetic>
          <Magnetic href="#start" className="btn btn-solid !px-4 !py-2 text-xs">
            Get Pathora
          </Magnetic>
        </div>
      </div>
    </motion.header>
  );
}

/* ─── hero ───────────────────────────────────────────────────────────────── */

function Hero({ progress }: { progress: MotionValue<number> }) {
  const yCopy = useTransform(progress, [0, 0.3], [0, -70]);
  const yVisual = useTransform(progress, [0, 0.35], [0, 90]);
  const opVisual = useTransform(progress, [0, 0.4], [1, 0.25]);

  return (
    <section id="top" className="relative min-h-[100svh] overflow-hidden pt-[4.25rem]">
      {/* Atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -left-24 top-16 h-[30rem] w-[30rem] rounded-full bg-aqua/25 blur-[100px]"
          animate={{ scale: [1, 1.12, 1], x: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-16 top-8 h-[34rem] w-[34rem] rounded-full bg-plum/25 blur-[110px]"
          animate={{ scale: [1.08, 1, 1.08], y: [0, 24, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            maskImage: "radial-gradient(ellipse at 40% 40%, black 15%, transparent 70%)",
          }}
        />
      </div>

      <div className="shell relative z-10 grid min-h-[calc(100svh-4.25rem)] items-center gap-10 py-16 lg:grid-cols-2 lg:gap-8">
        <motion.div style={{ y: yCopy }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[12px] text-white/80 backdrop-blur"
          >
            <motion.span
              className="h-2 w-2 rounded-full bg-aqua"
              animate={{ scale: [1, 1.35, 1], opacity: [1, 0.55, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            On-device AI · Zero API keys
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.06, ease: EASE }}
            className="font-display text-[2.75rem] font-semibold leading-[1.02] tracking-display text-white sm:text-5xl lg:text-6xl"
          >
            Clarity for every
            <br />
            <span className="text-shine">career decision.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.16, ease: EASE }}
            className="mt-6 max-w-md text-[15px] leading-relaxed text-white/65 sm:text-base"
          >
            Pathora is local career intelligence—ATS scoring, skill gaps, roadmaps,
            and drafts—running privately with Ollama. No cloud keys. No data leaks.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.26, ease: EASE }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <Magnetic href="#start" className="btn btn-solid">
              Start free
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              >
                →
              </motion.span>
            </Magnetic>
            <Magnetic href="#product" className="btn btn-line">
              Explore product
            </Magnetic>
          </motion.div>

          <motion.div
            className="mt-14 grid grid-cols-3 gap-4 border-t border-white/12 pt-8 sm:max-w-md"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.09, delayChildren: 0.4 } },
            }}
          >
            {[
              ["0", "API keys"],
              ["100%", "On-device"],
              ["Live", "Path map"],
            ].map(([k, v]) => (
              <motion.div
                key={v}
                variants={{
                  hidden: { opacity: 0, y: 18 },
                  show: { opacity: 1, y: 0, transition: { ease: EASE } },
                }}
                className="rounded-2xl border border-white/12 bg-white/8 px-3 py-3 backdrop-blur-sm"
              >
                <div className="font-display text-lg font-semibold text-white">{k}</div>
                <div className="text-[11px] text-white/50">{v}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Creative motion visual (replaces spinning 3D orb) */}
        <motion.div
          style={{ y: yVisual, opacity: opVisual }}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: EASE }}
          className="relative hidden h-[min(520px,70vh)] lg:block"
        >
          <div className="glass absolute inset-0 overflow-hidden rounded-[2rem]">
            <HeroVisual />
          </div>
        </motion.div>
      </div>

      {/* Mobile visual */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.8 }}
        className="shell relative z-10 pb-16 lg:hidden"
      >
        <div className="glass h-[380px] overflow-hidden rounded-[1.75rem]">
          <HeroVisual />
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.15 }}
      >
        <span className="text-[10px] uppercase tracking-[0.28em] text-white/40">Scroll</span>
        <motion.div
          className="h-10 w-px origin-top bg-gradient-to-b from-aqua to-transparent"
          animate={{ scaleY: [0.45, 1, 0.45], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.85, repeat: Infinity }}
        />
      </motion.div>
    </section>
  );
}

/* ─── sections ───────────────────────────────────────────────────────────── */

function Product() {
  return (
    <section id="product" className="relative py-28 sm:py-32">
      <div className="shell">
        <Reveal className="max-w-2xl">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-aqua">
            Product
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-display text-white sm:text-5xl">
            A composed system for
            <span className="text-white/50"> serious applications.</span>
          </h2>
          <p className="mt-4 max-w-lg text-[15px] text-white/55">
            Hover the panels—3D tilt, luminous trails, spring physics.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <TiltCard
              key={f.title}
              delay={i * 0.06}
              className={f.wide ? "sm:col-span-2 lg:col-span-1" : ""}
            >
              <div className="flex min-h-[150px] flex-col">
                <motion.div
                  className="mb-5 h-px w-12 origin-left bg-gradient-to-r from-aqua to-plum"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.1 + i * 0.04, ease: EASE }}
                />
                <h3 className="font-display text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/55">{f.body}</p>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section id="process" className="py-24">
      <div className="shell">
        <Reveal className="mb-12 max-w-xl">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-orchid">
            Process
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-display text-white sm:text-4xl">
            From zero to decision in four beats.
          </h2>
        </Reveal>
        <div className="relative grid gap-3 md:grid-cols-4">
          <div className="pointer-events-none absolute left-[6%] right-[6%] top-8 hidden h-px bg-gradient-to-r from-transparent via-white/20 to-transparent md:block" />
          {STEPS.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.08}>
              <motion.article
                whileHover={{ y: -10, borderColor: "rgba(34,211,238,0.4)" }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className="glass rounded-2xl p-5"
              >
                <span className="font-mono text-[11px] text-aqua">{s.id}</span>
                <h3 className="mt-3 font-display text-xl font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-white/50">{s.text}</p>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = [
    "Ollama",
    "Framer Motion",
    "Path map UI",
    "Local AI",
    "ChromaDB",
    "Streamlit",
    "Local-first",
    "No API keys",
  ];
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-white/12 bg-white/5 py-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-night-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-28 bg-gradient-to-l from-night-950 to-transparent" />
      <motion.div
        className="flex w-max gap-10"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
      >
        {row.map((t, i) => (
          <span
            key={`${t}-${i}`}
            className="font-mono text-xs uppercase tracking-[0.22em] text-white/45"
          >
            {t}
            <span className="ml-10 text-aqua/50">◆</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function Start() {
  const [copied, setCopied] = useState(false);
  const cmd = `git clone ${REPO}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <section id="start" className="py-28">
      <div className="shell">
        <Reveal>
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-br from-night-700 via-night-800 to-night-900 p-8 shadow-glow sm:p-14"
          >
            <motion.div
              className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-aqua/30 blur-3xl"
              animate={{ x: [0, 24, 0], y: [0, 16, 0] }}
              transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="pointer-events-none absolute -bottom-20 -left-12 h-96 w-96 rounded-full bg-plum/25 blur-3xl"
              animate={{ x: [0, -18, 0], y: [0, -12, 0] }}
              transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-aqua">
                Get started
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-display text-white sm:text-5xl">
                Install once.
                <br />
                <span className="text-shine">Ship your next application.</span>
              </h2>
              <p className="mt-4 text-[15px] text-white/60">
                This site is the brochure. Pathora runs on your computer.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Magnetic href={REPO} className="btn btn-solid">
                  Open GitHub
                </Magnetic>
                <Magnetic onClick={copy} className="btn btn-line min-w-[12rem]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={copied ? "y" : "n"}
                      initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {copied ? "Copied" : "Copy clone command"}
                    </motion.span>
                  </AnimatePresence>
                </Magnetic>
              </div>
              <pre className="mt-8 overflow-x-auto rounded-2xl border border-white/12 bg-black/30 p-4 font-mono text-[12px] leading-relaxed text-ice">
                {`${cmd}
cd CarieerAi-FULLSTACK-AI-WEB-APP
setup.bat
start.bat
# → http://localhost:8501`}
              </pre>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/12 py-10">
      <div className="shell flex flex-col items-center justify-between gap-5 sm:flex-row">
        <div className="flex items-center gap-3">
          <BrandLogo size={28} />
          <span className="text-[13px] text-white/45">Local AI career intelligence</span>
        </div>
        <div className="flex gap-6 text-[13px] text-white/45">
          <a className="hover:text-white" href={REPO} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a className="hover:text-white" href="#product">
            Product
          </a>
          <a className="hover:text-white" href="#start">
            Start
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ─── page ───────────────────────────────────────────────────────────────── */

export function LandingPage() {
  const { scrollYProgress } = useScroll();

  return (
    <div className="min-h-screen bg-night-950 text-white">
      <Progress p={scrollYProgress} />
      <Nav />
      <main>
        <Hero progress={scrollYProgress} />
        <Marquee />
        <Product />
        <Process />
        <Start />
      </main>
      <Footer />
    </div>
  );
}
