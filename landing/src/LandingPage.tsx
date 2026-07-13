/**
 * Pathora Landing — full-page product experience
 * React + TS + Tailwind + Framer Motion + R3F
 *
 * Design: deep void navy, teal (#22d3ee) + violet (#a855f7),
 * hero 3D orb, scroll parallax, 3D tilt cards, rich micro-motion.
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

const FEATURES = [
  {
    title: "Instant ATS score",
    desc: "Keyword + format signals before the LLM runs—see what recruiters' systems notice first.",
    icon: "01",
  },
  {
    title: "RAG grounded answers",
    desc: "ChromaDB retrieves real CV & job chunks so every insight stays document-true.",
    icon: "02",
  },
  {
    title: "Gap map & roadmap",
    desc: "Prioritized skill gaps with a calm 30 / 90 / 365-day execution plan.",
    icon: "03",
  },
  {
    title: "Cover letter & LinkedIn",
    desc: "Role-specific drafts shaped by your real experience—not generic templates.",
    icon: "04",
  },
  {
    title: "Export-ready reports",
    desc: "Markdown and HTML you can print to PDF. Share with mentors or keep offline.",
    icon: "05",
  },
  {
    title: "100% local · free",
    desc: "Ollama on your machine. No API keys. Your career data never leaves the device.",
    icon: "06",
  },
] as const;

const STEPS = [
  { n: "01", t: "Install", d: "setup.bat — env, packages, models." },
  { n: "02", t: "Launch", d: "start.bat — open localhost:8501." },
  { n: "03", t: "Upload", d: "CV + job post, or load demo data." },
  { n: "04", t: "Decide", d: "Score, analyze, draft, export." },
] as const;

/* ========================================================================== */
/* Shared motion                                                               */
/* ========================================================================== */

const easeOut = [0.22, 1, 0.36, 1] as const;

function Reveal({
  children,
  className = "",
  delay = 0,
  y = 28,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.75, delay, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

/* ========================================================================== */
/* 3D tilt card                                                                */
/* ========================================================================== */

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
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), { stiffness: 200, damping: 20 });
  const glowX = useTransform(mx, [-0.5, 0.5], [0, 100]);
  const glowY = useTransform(my, [-0.5, 0.5], [0, 100]);
  const glow = useMotionTemplate`radial-gradient(500px circle at ${glowX}% ${glowY}%, rgba(34,211,238,0.14), rgba(168,85,247,0.08) 35%, transparent 55%)`;

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <Reveal delay={delay} className="h-full [perspective:1000px]">
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        whileHover={{ scale: 1.03, z: 20 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className={`group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-void-800/80 shadow-card ${className}`}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ backgroundImage: glow }}
        />
        <div
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(135deg, rgba(34,211,238,0.35), transparent 40%, rgba(168,85,247,0.35))",
            mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            padding: 1,
          }}
        />
        <div className="relative h-full" style={{ transform: "translateZ(24px)" }}>
          {children}
        </div>
      </motion.div>
    </Reveal>
  );
}

/* ========================================================================== */
/* Nav + progress                                                              */
/* ========================================================================== */

function ProgressBar({ progress }: { progress: MotionValue<number> }) {
  const scaleX = useSpring(progress, { stiffness: 100, damping: 30 });
  return (
    <motion.div
      className="fixed left-0 right-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-teal-glow via-white to-violet-glow"
      style={{ scaleX }}
    />
  );
}

function Nav() {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 80], ["rgba(3,5,10,0)", "rgba(3,5,10,0.8)"]);
  const border = useTransform(
    scrollY,
    [0, 80],
    ["rgba(255,255,255,0)", "rgba(255,255,255,0.08)"]
  );

  return (
    <motion.header
      style={{ backgroundColor: bg, borderBottomColor: border }}
      className="fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: easeOut }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <motion.a href="#top" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <BrandLogo size={32} />
        </motion.a>
        <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex">
          {[
            ["Features", "#features"],
            ["How it works", "#how"],
            ["Stack", "#stack"],
          ].map(([label, href], i) => (
            <motion.a
              key={href}
              href={href}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              className="transition hover:text-white"
              whileHover={{ y: -1 }}
            >
              {label}
            </motion.a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <motion.a
            href={REPO}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost !px-4 !py-2 text-xs sm:text-sm"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            GitHub
          </motion.a>
          <motion.a
            href="#cta"
            className="btn-primary !px-4 !py-2 text-xs sm:text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            Get Pathora
          </motion.a>
        </div>
      </div>
    </motion.header>
  );
}

/* ========================================================================== */
/* Hero                                                                        */
/* ========================================================================== */

function Hero({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const yText = useTransform(scrollYProgress, [0, 0.25], [0, -80]);
  const yOrb = useTransform(scrollYProgress, [0, 0.3], [0, 120]);
  const orbOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0.15]);
  const [scrollVal, setScrollVal] = useState(0);

  // Bridge MotionValue → number for R3F orb tilt
  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      setScrollVal(Math.min(1, Math.max(0, v / 0.4)));
    });
  }, [scrollYProgress]);

  return (
    <section id="top" className="relative min-h-[100svh] overflow-hidden pt-16">
      {/* Mesh atmosphere */}
      <div className="pointer-events-none absolute inset-0 bg-mesh" />
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute left-[10%] top-[20%] h-72 w-72 rounded-full bg-teal-glow/20 blur-[100px]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[5%] top-[10%] h-96 w-96 rounded-full bg-violet-glow/20 blur-[110px]"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* 3D orb */}
      <motion.div
        style={{ y: yOrb, opacity: orbOpacity }}
        className="pointer-events-none absolute inset-y-0 right-0 w-full md:w-[58%]"
      >
        <Suspense
          fallback={
            <div className="absolute inset-0 animate-pulseGlow bg-gradient-to-br from-teal-glow/10 to-violet-glow/10" />
          }
        >
          <NeuralScene scroll={scrollVal} />
        </Suspense>
      </motion.div>

      <motion.div
        style={{ y: yText }}
        className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col justify-center px-5 py-20 sm:px-8"
      >
        <div className="max-w-xl lg:max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-glow/25 bg-teal-glow/10 px-3 py-1.5 text-xs font-medium text-teal-soft"
          >
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-teal-glow"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
            Local AI career intelligence · No API key
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.08, ease: easeOut }}
            className="font-display text-4xl font-bold leading-[1.05] tracking-tightest text-white sm:text-5xl lg:text-6xl"
          >
            Your career path,{" "}
            <span className="gradient-text">illuminated by AI</span>
            <span className="text-white/90">—on your machine.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.18, ease: easeOut }}
            className="mt-6 max-w-lg text-base leading-relaxed text-white/60 sm:text-lg"
          >
            Pathora analyzes your CV and target role with Ollama: ATS scores, skill gaps,
            roadmaps, cover letters, and full reports—without sending data to the cloud.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.28, ease: easeOut }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <motion.a
              href="#cta"
              className="btn-primary"
              whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(34,211,238,0.35)" }}
              whileTap={{ scale: 0.97 }}
            >
              Start free
              <motion.span
                aria-hidden
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              >
                →
              </motion.span>
            </motion.a>
            <motion.a
              href="#features"
              className="btn-ghost"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Explore features
            </motion.a>
          </motion.div>

          <motion.dl
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08, delayChildren: 0.4 } },
            }}
            className="mt-12 grid grid-cols-3 gap-4 sm:max-w-md"
          >
            {[
              ["0", "API keys"],
              ["100%", "On-device"],
              ["ATS+", "Instant"],
            ].map(([k, l]) => (
              <motion.div
                key={l}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: { opacity: 1, y: 0, transition: { ease: easeOut } },
                }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 backdrop-blur-sm"
              >
                <dt className="font-display text-lg font-semibold text-white sm:text-xl">{k}</dt>
                <dd className="text-[11px] uppercase tracking-wider text-white/45">{l}</dd>
              </motion.div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
        >
          <span className="text-[10px] uppercase tracking-[0.25em] text-white/35">Scroll</span>
          <motion.span
            className="h-10 w-px bg-gradient-to-b from-teal-glow to-transparent"
            animate={{ scaleY: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ========================================================================== */
/* Sections                                                                    */
/* ========================================================================== */

function Features() {
  return (
    <section id="features" className="relative py-28 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-glow/40 to-transparent" />
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-teal-soft">
            Capabilities
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tightest text-white sm:text-4xl">
            Built to feel like a product,{" "}
            <span className="gradient-text">not a weekend demo.</span>
          </h2>
          <p className="mt-4 text-white/55">
            Hover the cards—subtle 3D tilt, glow, and depth for a tactile UI.
          </p>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <TiltCard key={f.title} delay={i * 0.06}>
              <div className="flex h-full flex-col p-6 sm:p-7">
                <span className="font-mono text-xs text-teal-glow/80">{f.icon}</span>
                <h3 className="mt-4 font-display text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-white/55">{f.desc}</p>
                <motion.div
                  className="mt-5 h-px w-full origin-left bg-gradient-to-r from-teal-glow/60 via-violet-glow/40 to-transparent"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.1 + i * 0.05, ease: easeOut }}
                />
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function How() {
  return (
    <section id="how" className="relative py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="mb-12 max-w-xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-violet-soft">
            Workflow
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tightest text-white sm:text-4xl">
            Four steps. Full control.
          </h2>
        </Reveal>

        <div className="relative grid gap-4 md:grid-cols-4">
          <div className="pointer-events-none absolute left-[10%] right-[10%] top-8 hidden h-px bg-gradient-to-r from-teal-glow/0 via-teal-glow/40 to-violet-glow/0 md:block" />
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -6, borderColor: "rgba(34,211,238,0.35)" }}
                className="rounded-3xl border border-white/10 bg-void-800/60 p-5 backdrop-blur-sm"
              >
                <motion.span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-glow/20 to-violet-glow/20 font-mono text-xs text-teal-soft ring-1 ring-white/10"
                  whileHover={{ scale: 1.1, rotate: 6 }}
                >
                  {s.n}
                </motion.span>
                <h3 className="mt-4 font-display text-xl font-semibold text-white">{s.t}</h3>
                <p className="mt-2 text-sm text-white/50">{s.d}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stack() {
  const items = ["Ollama", "Streamlit", "ChromaDB", "PyMuPDF", "nomic-embed", "llama3.1"];
  return (
    <section id="stack" className="py-20">
      <div className="mx-auto max-w-6xl px-5 text-center sm:px-8">
        <Reveal>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
            Stack
          </p>
          <h2 className="font-display text-2xl font-bold tracking-tightest text-white sm:text-3xl">
            Serious tools. <span className="gradient-text">Zero cloud bill.</span>
          </h2>
        </Reveal>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {items.map((item, i) => (
            <Reveal key={item} delay={i * 0.05}>
              <motion.span
                whileHover={{
                  scale: 1.08,
                  borderColor: "rgba(34,211,238,0.5)",
                  boxShadow: "0 0 24px rgba(34,211,238,0.2)",
                }}
                className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-xs text-white/70 sm:text-sm"
              >
                {item}
              </motion.span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  const [copied, setCopied] = useState(false);
  const cmd = `git clone ${REPO}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1700);
    } catch {
      /* ignore */
    }
  };

  return (
    <section id="cta" className="pb-28 pt-10">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <Reveal>
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-void-700 via-void-900 to-void-950 p-8 shadow-glow-cta sm:p-12"
          >
            <motion.div
              className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-teal-glow/25 blur-3xl"
              animate={{ x: [0, 20, 0], y: [0, 15, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-violet-glow/20 blur-3xl"
              animate={{ x: [0, -15, 0], y: [0, -10, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-soft">
                Call to action
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tightest text-white sm:text-4xl">
                Install once.{" "}
                <span className="gradient-text">Own the workflow.</span>
              </h2>
              <p className="mt-4 text-white/60">
                This site is the product page. Pathora runs on your computer—clone,
                setup, start.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <motion.a
                  href={REPO}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Open repository
                </motion.a>
                <motion.button
                  type="button"
                  onClick={copy}
                  className="btn-ghost min-w-[12rem]"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={copied ? "ok" : "copy"}
                      initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                      transition={{ duration: 0.2 }}
                    >
                      {copied ? "Copied to clipboard" : "Copy clone command"}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              </div>

              <motion.pre
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-xs leading-relaxed text-teal-soft/90 sm:text-sm"
              >
                {`${cmd}
cd CarieerAi-FULLSTACK-AI-WEB-APP
setup.bat
start.bat
# → http://localhost:8501`}
              </motion.pre>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 sm:flex-row sm:px-8">
        <div className="flex items-center gap-3">
          <BrandLogo size={28} />
          <span className="text-sm text-white/40">Local AI career intelligence</span>
        </div>
        <div className="flex gap-6 text-sm text-white/45">
          {[
            ["GitHub", REPO],
            ["Features", "#features"],
            ["Setup", "#cta"],
          ].map(([label, href]) => (
            <motion.a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
              whileHover={{ color: "#fff", y: -1 }}
            >
              {label}
            </motion.a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ========================================================================== */
/* Page root                                                                   */
/* ========================================================================== */

export function LandingPage() {
  const { scrollYProgress } = useScroll();

  return (
    <div className="min-h-screen bg-void-950 text-white">
      <ProgressBar progress={scrollYProgress} />
      <Nav />
      <main>
        <Hero scrollYProgress={scrollYProgress} />
        <Features />
        <How />
        <Stack />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
