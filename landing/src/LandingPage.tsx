/**
 * Pathora — product landing (production)
 * Stack: React, TypeScript, Tailwind, Framer Motion, React Three Fiber
 *
 * Composition:
 *  - Cinematic hero (copy left · 3D intelligence core right)
 *  - Floating feature constellation (bento + tilt)
 *  - Process rail
 *  - CTA theater
 * Motion: page progress, parallax layers, staggered reveals, hover physics
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
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { BrandLogo } from "./BrandLogo";

const NeuralScene = lazy(() =>
  import("./NeuralScene").then((m) => ({ default: m.NeuralScene }))
);

const REPO = "https://github.com/Dpehect/CarieerAi-FULLSTACK-AI-WEB-APP";

const FEATURES: { title: string; body: string; span?: string }[] = [
  {
    title: "ATS in milliseconds",
    body: "Local keyword & structure scoring before any model call—instant signal, zero wait.",
    span: "sm:col-span-2",
  },
  {
    title: "Grounded RAG",
    body: "ChromaDB retrieval keeps every recommendation tied to your documents.",
  },
  {
    title: "Gap intelligence",
    body: "Prioritized skill gaps with severity and a practical close-the-gap path.",
  },
  {
    title: "Letters & LinkedIn",
    body: "Drafts that read like you—not a template farm.",
    span: "sm:col-span-2",
  },
  {
    title: "Export suite",
    body: "Markdown + print-ready HTML. PDF in one browser print.",
  },
  {
    title: "Private by default",
    body: "Ollama on localhost. No API keys. Data stays on disk.",
  },
];

const STEPS = [
  { id: "01", title: "Bootstrap", text: "One installer. Models included." },
  { id: "02", title: "Open", text: "Streamlit UI on localhost." },
  { id: "03", title: "Index", text: "CV + job post as PDF or text." },
  { id: "04", title: "Decide", text: "Score, plan, draft, export." },
];

const EASE = [0.16, 1, 0.3, 1] as const;

/* ────────────────────────────────────────────────────────────────────────── */
/* Primitives                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.85, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function MagneticButton({
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
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 280, damping: 18 });
  const sy = useSpring(y, { stiffness: 280, damping: 18 });

  const move = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.22);
    y.set((e.clientY - r.top - r.height / 2) * 0.22);
  };
  const leave = () => {
    x.set(0);
    y.set(0);
  };

  const style = { x: sx, y: sy };
  if (href) {
    return (
      <motion.a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noreferrer" : undefined}
        onMouseMove={move}
        onMouseLeave={leave}
        style={style}
        whileTap={{ scale: 0.97 }}
        className={className}
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
      onMouseMove={move}
      onMouseLeave={leave}
      style={style}
      whileTap={{ scale: 0.97 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

/** Floating bento tile with 3D tilt + luminous hover. */
function FloatCard({
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
  const rx = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 180, damping: 16 });
  const ry = useSpring(useTransform(mx, [0, 1], [-10, 10]), { stiffness: 180, damping: 16 });
  const glow = useMotionTemplate`radial-gradient(420px circle at ${useTransform(mx, (v) => v * 100)}% ${useTransform(my, (v) => v * 100)}%, rgba(34,211,238,0.16), rgba(168,85,247,0.08) 40%, transparent 60%)`;

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  return (
    <Reveal delay={delay} className={`h-full [perspective:1200px] ${className}`}>
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={() => {
          mx.set(0.5);
          my.set(0.5);
        }}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        whileHover={{ scale: 1.02, z: 40 }}
        transition={{ type: "spring", stiffness: 240, damping: 20 }}
        className="relative h-full overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-night-800/70 shadow-float backdrop-blur-md"
      >
        <motion.div className="pointer-events-none absolute inset-0 opacity-80" style={{ backgroundImage: glow }} />
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "linear-gradient(135deg, rgba(34,211,238,0.08), transparent 40%, rgba(168,85,247,0.08))",
          }}
        />
        <div className="relative h-full p-6 sm:p-7" style={{ transform: "translateZ(28px)" }}>
          {children}
        </div>
      </motion.div>
    </Reveal>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Chrome                                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

function Progress({ p }: { p: MotionValue<number> }) {
  const scaleX = useSpring(p, { stiffness: 90, damping: 28 });
  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[80] h-[2px] origin-left bg-gradient-to-r from-aqua via-white to-plum"
      style={{ scaleX }}
    />
  );
}

function Nav() {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 60], ["rgba(2,4,10,0)", "rgba(2,4,10,0.78)"]);
  const line = useTransform(scrollY, [0, 60], [0, 1]);

  return (
    <motion.header
      style={{ backgroundColor: bg }}
      className="fixed inset-x-0 top-0 z-50 backdrop-blur-xl"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <motion.div className="absolute inset-x-0 bottom-0 h-px bg-white/10" style={{ opacity: line }} />
      <div className="shell flex h-[4.25rem] items-center justify-between">
        <a href="#top">
          <BrandLogo />
        </a>
        <nav className="absolute left-1/2 hidden -translate-x-1/2 gap-9 text-[13px] text-white/55 md:flex">
          {[
            ["Product", "#product"],
            ["Process", "#process"],
            ["Start", "#start"],
          ].map(([label, href]) => (
            <a key={href} href={href} className="transition hover:text-white">
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <MagneticButton href={REPO} className="btn-line !px-4 !py-2 text-xs">
            GitHub
          </MagneticButton>
          <MagneticButton href="#start" className="btn-solid !px-4 !py-2 text-xs">
            Get Pathora
          </MagneticButton>
        </div>
      </div>
    </motion.header>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Hero                                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

function Hero({ progress }: { progress: MotionValue<number> }) {
  const yCopy = useTransform(progress, [0, 0.28], [0, -90]);
  const yScene = useTransform(progress, [0, 0.32], [0, 140]);
  const sceneOp = useTransform(progress, [0, 0.38], [1, 0.12]);
  const [scroll3d, setScroll3d] = useState(0);

  useEffect(() => progress.on("change", (v) => setScroll3d(Math.min(1, v / 0.35))), [progress]);

  return (
    <section id="top" className="relative min-h-[100svh] overflow-hidden pt-[4.25rem]">
      {/* Atmospheric layers */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-24 h-[28rem] w-[28rem] animate-drift rounded-full bg-aqua/15 blur-[110px]" />
        <div
          className="absolute -right-20 top-10 h-[32rem] w-[32rem] animate-drift rounded-full bg-plum/15 blur-[120px]"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-0 left-1/3 h-64 w-64 animate-floaty rounded-full bg-ice/10 blur-[90px]"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
          }}
        />
      </div>

      {/* 3D layer */}
      <motion.div
        style={{ y: yScene, opacity: sceneOp }}
        className="pointer-events-none absolute inset-y-0 right-0 w-full lg:w-[56%]"
      >
        <Suspense
          fallback={
            <div className="absolute inset-0 bg-gradient-to-br from-aqua/10 via-transparent to-plum/10" />
          }
        >
          <NeuralScene scroll={scroll3d} />
        </Suspense>
      </motion.div>

      <motion.div style={{ y: yCopy }} className="shell relative z-10 flex min-h-[calc(100svh-4.25rem)] items-center py-20">
        <div className="max-w-xl lg:max-w-[34rem]">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, ease: EASE }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[12px] text-white/70"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-aqua/70" />
              <span className="relative h-2 w-2 rounded-full bg-aqua" />
            </span>
            On-device AI · Zero API keys
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.05, ease: EASE }}
            className="font-display text-[2.85rem] font-semibold leading-[1.02] tracking-display text-white sm:text-6xl"
          >
            Clarity for every
            <br />
            <span className="text-shine">career decision.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.16, ease: EASE }}
            className="mt-6 max-w-md text-[15px] leading-relaxed text-white/55 sm:text-base"
          >
            Pathora is a local career intelligence suite—ATS scoring, skill gaps,
            roadmaps, and drafts—running privately on your machine with Ollama.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.26, ease: EASE }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <MagneticButton href="#start" className="btn-solid">
              Start free
              <span className="opacity-50">→</span>
            </MagneticButton>
            <MagneticButton href="#product" className="btn-line">
              See product
            </MagneticButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-14 flex flex-wrap gap-8 border-t border-white/[0.07] pt-8"
          >
            {[
              ["Private", "100% local runtime"],
              ["Fast ATS", "No model wait"],
              ["Full stack", "Analyze → export"],
            ].map(([k, v], i) => (
              <motion.div
                key={k}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + i * 0.08, ease: EASE }}
              >
                <div className="font-display text-sm font-semibold text-white">{k}</div>
                <div className="mt-0.5 text-[12px] text-white/40">{v}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        <span className="text-[10px] uppercase tracking-[0.28em] text-white/30">Scroll</span>
        <motion.div
          className="h-9 w-px origin-top bg-gradient-to-b from-aqua to-transparent"
          animate={{ scaleY: [0.5, 1, 0.5], opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 1.9, repeat: Infinity }}
        />
      </motion.div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Product (floating cards)                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

function Product() {
  return (
    <section id="product" className="relative py-28 sm:py-32">
      <div className="shell">
        <Reveal className="max-w-2xl">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-aqua/90">
            Product
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-display text-white sm:text-5xl">
            A composed system for
            <span className="text-white/45"> serious applications.</span>
          </h2>
          <p className="mt-4 max-w-lg text-[15px] text-white/50">
            Floating panels, intentional hierarchy—tools that feel designed, not assembled.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <FloatCard key={f.title} delay={i * 0.05} className={f.span ?? ""}>
              <div className="flex h-full min-h-[160px] flex-col">
                <div className="mb-5 h-px w-10 bg-gradient-to-r from-aqua to-plum" />
                <h3 className="font-display text-lg font-semibold tracking-tight text-white">
                  {f.title}
                </h3>
                <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-white/50">{f.body}</p>
              </div>
            </FloatCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Process                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

function Process() {
  return (
    <section id="process" className="relative py-24">
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
          <div className="pointer-events-none absolute left-[6%] right-[6%] top-[2.1rem] hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent md:block" />
          {STEPS.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.07}>
              <motion.article
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="rounded-2xl border border-white/[0.08] bg-night-800/50 p-5 backdrop-blur"
              >
                <span className="font-mono text-[11px] text-aqua">{s.id}</span>
                <h3 className="mt-3 font-display text-xl font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-white/45">{s.text}</p>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Marquee strip                                                              */
/* ────────────────────────────────────────────────────────────────────────── */

function Strip() {
  const items = [
    "Ollama",
    "Streamlit",
    "ChromaDB",
    "PyMuPDF",
    "nomic-embed",
    "llama3.1",
    "Local-first",
    "No API keys",
  ];
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-white/[0.06] py-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-night-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-night-950 to-transparent" />
      <motion.div
        className="flex w-max gap-10 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        {row.map((t, i) => (
          <span key={`${t}-${i}`} className="font-mono text-xs uppercase tracking-[0.2em] text-white/35">
            {t}
            <span className="ml-10 text-aqua/40">◆</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* CTA                                                                        */
/* ────────────────────────────────────────────────────────────────────────── */

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
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-night-700 via-night-900 to-night-950 p-8 shadow-glow-aqua sm:p-14">
            <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 animate-drift rounded-full bg-aqua/20 blur-3xl" />
            <div
              className="pointer-events-none absolute -bottom-20 -left-10 h-80 w-80 animate-drift rounded-full bg-plum/20 blur-3xl"
              style={{ animationDelay: "3s" }}
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
              <p className="mt-4 text-[15px] text-white/55">
                This page is the brochure. Pathora runs on your computer—clone, setup, start.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <MagneticButton href={REPO} className="btn-solid">
                  Open GitHub
                </MagneticButton>
                <MagneticButton onClick={copy} className="btn-line min-w-[11.5rem]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={copied ? "1" : "0"}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                    >
                      {copied ? "Copied" : "Copy clone command"}
                    </motion.span>
                  </AnimatePresence>
                </MagneticButton>
              </div>

              <pre className="mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-black/35 p-4 font-mono text-[12px] leading-relaxed text-ice/90">
                {`${cmd}
cd CarieerAi-FULLSTACK-AI-WEB-APP
setup.bat
start.bat
# → http://localhost:8501`}
              </pre>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-10">
      <div className="shell flex flex-col items-center justify-between gap-5 sm:flex-row">
        <div className="flex items-center gap-3">
          <BrandLogo size={28} />
          <span className="text-[13px] text-white/35">Local AI career intelligence</span>
        </div>
        <div className="flex gap-6 text-[13px] text-white/40">
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

/* ────────────────────────────────────────────────────────────────────────── */
/* Page                                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

export function LandingPage() {
  const { scrollYProgress } = useScroll();

  return (
    <div className="min-h-screen bg-night-950 text-white">
      <Progress p={scrollYProgress} />
      <Nav />
      <main>
        <Hero progress={scrollYProgress} />
        <Strip />
        <Product />
        <Process />
        <Start />
      </main>
      <Footer />
    </div>
  );
}
