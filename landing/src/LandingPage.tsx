/**
 * Pathora — product landing
 * Aesthetic: Linear / Stripe / Arc — restrained, premium, high craft.
 */
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
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
    title: "Instant ATS scoring",
    body: "Keyword coverage and structure signals—before the model even runs. Clear, actionable gaps.",
  },
  {
    title: "Document-grounded RAG",
    body: "Your CV and job post are chunked and retrieved so answers cite what you actually wrote.",
  },
  {
    title: "Gap maps & roadmaps",
    body: "Prioritized skill gaps with a calm 30 / 90 / 365-day plan you can execute.",
  },
  {
    title: "Letters that sound like you",
    body: "Cover letters and LinkedIn copy shaped by your real experience—not generic fluff.",
  },
  {
    title: "Export-ready reports",
    body: "Markdown and print-ready HTML. Save as PDF from the browser when you need it.",
  },
  {
    title: "Local by design",
    body: "Ollama on your machine. No API keys. No data leaving the device.",
  },
] as const;

const STEPS = [
  { n: "01", title: "Install", text: "One script sets up the environment and models." },
  { n: "02", title: "Launch", text: "Open the app at localhost—fully offline capable." },
  { n: "03", title: "Upload", text: "CV and job post as PDF, text, or markdown." },
  { n: "04", title: "Decide", text: "Score, analyze, draft, export—with clarity." },
] as const;

/* -------------------------------------------------------------------------- */
/* Motion helpers                                                              */
/* -------------------------------------------------------------------------- */

function useScrollProgress() {
  const { scrollYProgress } = useScroll();
  return useSpring(scrollYProgress, { stiffness: 100, damping: 28, mass: 0.2 });
}

function FadeIn({
  children,
  className = "",
  delay = 0,
  y = 16,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Spotlight card                                                              */
/* -------------------------------------------------------------------------- */

function SpotlightCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const bg = useMotionTemplate`radial-gradient(420px circle at ${x}px ${y}px, rgba(107,140,255,0.09), transparent 55%)`;

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      style={{ backgroundImage: bg }}
      className={`relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Shell                                                                       */
/* -------------------------------------------------------------------------- */

function Progress() {
  const p = useScrollProgress();
  const scaleX = useTransform(p, [0, 1], [0, 1]);
  return (
    <motion.div
      className="fixed left-0 right-0 top-0 z-[60] h-px origin-left bg-gradient-to-r from-accent/0 via-accent to-accent/0"
      style={{ scaleX }}
    />
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-white/[0.06] bg-surface-0/75 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[3.75rem] max-w-[1120px] items-center justify-between px-6">
        <a href="#top" className="relative z-10">
          <BrandLogo size={28} />
        </a>
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-[13px] text-ink-soft md:flex">
          {[
            ["Features", "#features"],
            ["How it works", "#how"],
            ["Stack", "#stack"],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="transition-colors duration-200 hover:text-white"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href={REPO} target="_blank" rel="noreferrer" className="btn-secondary !py-2 !px-3.5">
            GitHub
          </a>
          <a href="#cta" className="btn-primary !py-2 !px-3.5">
            Get Pathora
          </a>
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero                                                                        */
/* -------------------------------------------------------------------------- */

function Hero() {
  return (
    <section id="top" className="relative min-h-[100svh] overflow-hidden pt-[3.75rem]">
      {/* Atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-dot-grid bg-dots opacity-[0.45]" />
        <div className="absolute left-1/2 top-[-10%] h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-accent/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-surface-0 to-transparent" />
      </div>

      {/* 3D field */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[55%] lg:block">
        <Suspense fallback={null}>
          <NeuralScene />
        </Suspense>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-3.75rem)] max-w-[1120px] flex-col justify-center px-6 pb-24 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[560px]"
        >
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[12px] text-ink-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-soft" />
            Local AI · No cloud keys · Built for focus
          </div>

          <h1 className="font-display text-[2.75rem] font-semibold leading-[1.05] tracking-tighter2 text-white sm:text-[3.5rem] sm:leading-[1.02]">
            Career decisions,
            <br />
            <span className="text-white/55">with quiet intelligence.</span>
          </h1>

          <p className="mt-6 max-w-[440px] text-[15px] leading-relaxed text-ink-soft sm:text-[16px]">
            Pathora turns your CV and a job post into ATS insight, skill gaps,
            roadmaps, and drafts—running entirely on your machine with Ollama.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a href="#cta" className="btn-primary">
              Start free
              <span className="text-surface-50/50">→</span>
            </a>
            <a href="#features" className="btn-secondary">
              See what it does
            </a>
          </div>

          <dl className="mt-14 grid grid-cols-3 gap-6 border-t border-white/[0.06] pt-8 sm:max-w-[420px]">
            {[
              ["0", "API keys"],
              ["100%", "On-device"],
              ["ms", "ATS baseline"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="font-display text-xl font-semibold tracking-tight text-white">{v}</dt>
                <dd className="mt-1 text-[12px] text-ink-muted">{l}</dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Sections                                                                    */
/* -------------------------------------------------------------------------- */

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.18em] text-ink-muted">
      {children}
    </p>
  );
}

function Features() {
  return (
    <section id="features" className="relative py-28">
      <div className="mx-auto max-w-[1120px] px-6">
        <FadeIn className="max-w-xl">
          <SectionLabel>Capabilities</SectionLabel>
          <h2 className="font-display text-3xl font-semibold tracking-tighter2 text-white sm:text-[2.5rem]">
            Everything you need between
            <span className="text-white/50"> “apply” and “offer.”</span>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
            Designed like a product, not a demo. Dense where it matters—light where it doesn’t.
          </p>
        </FadeIn>

        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.05}>
              <SpotlightCard className="h-full p-6 transition-colors duration-300 hover:border-white/[0.12]">
                <div className="mb-5 h-px w-8 bg-gradient-to-r from-accent-soft to-transparent" />
                <h3 className="font-display text-[17px] font-semibold tracking-tight text-white">
                  {f.title}
                </h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-ink-soft">{f.body}</p>
              </SpotlightCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function How() {
  return (
    <section id="how" className="relative py-28">
      <div className="mx-auto max-w-[1120px] px-6">
        <FadeIn className="max-w-xl">
          <SectionLabel>Workflow</SectionLabel>
          <h2 className="font-display text-3xl font-semibold tracking-tighter2 text-white sm:text-[2.5rem]">
            Four calm steps to clarity.
          </h2>
        </FadeIn>

        <div className="relative mt-14 grid gap-3 md:grid-cols-4">
          <div className="pointer-events-none absolute left-[8%] right-[8%] top-[1.65rem] hidden h-px bg-gradient-to-r from-transparent via-white/10 to-transparent md:block" />
          {STEPS.map((s, i) => (
            <FadeIn key={s.n} delay={i * 0.06}>
              <div className="panel relative p-5">
                <span className="font-mono text-[11px] text-accent-soft">{s.n}</span>
                <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-white">
                  {s.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{s.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stack() {
  const items = [
    "Ollama",
    "Streamlit",
    "ChromaDB",
    "PyMuPDF",
    "nomic-embed",
    "llama3.1",
  ];
  return (
    <section id="stack" className="py-24">
      <div className="mx-auto max-w-[1120px] px-6 text-center">
        <FadeIn>
          <SectionLabel>Stack</SectionLabel>
          <h2 className="font-display text-2xl font-semibold tracking-tighter2 text-white sm:text-3xl">
            Serious tools. Zero subscription tax.
          </h2>
        </FadeIn>
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {items.map((item, i) => (
            <FadeIn key={item} delay={i * 0.04}>
              <span className="inline-flex rounded-full border border-white/[0.07] bg-white/[0.02] px-4 py-2 font-mono text-[12px] text-ink-soft transition hover:border-white/15 hover:text-white/90">
                {item}
              </span>
            </FadeIn>
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
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* noop */
    }
  };

  return (
    <section id="cta" className="pb-28 pt-10">
      <div className="mx-auto max-w-[1120px] px-6">
        <FadeIn>
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-gradient-to-b from-surface-200 to-surface-50 p-8 shadow-elevate sm:p-12">
            <div className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-accent/15 blur-[80px]" />
            <div className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-white/[0.03] blur-[60px]" />

            <div className="relative max-w-xl">
              <SectionLabel>Get started</SectionLabel>
              <h2 className="font-display text-3xl font-semibold tracking-tighter2 text-white sm:text-[2.35rem]">
                Install once. Own the workflow.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
                This site is the product page. Pathora itself runs on your computer—
                clone the repo, run setup, then start.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href={REPO} target="_blank" rel="noreferrer" className="btn-primary">
                  Open repository
                </a>
                <button type="button" onClick={copy} className="btn-secondary min-w-[11rem]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={copied ? "y" : "n"}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                    >
                      {copied ? "Copied" : "Copy clone command"}
                    </motion.span>
                  </AnimatePresence>
                </button>
              </div>

              <pre className="mt-8 overflow-x-auto rounded-xl border border-white/[0.06] bg-black/30 p-4 font-mono text-[12px] leading-relaxed text-white/70">
                {`${cmd}
cd CarieerAi-FULLSTACK-AI-WEB-APP
setup.bat
start.bat
# → http://localhost:8501`}
              </pre>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-10">
      <div className="mx-auto flex max-w-[1120px] flex-col items-center justify-between gap-6 px-6 sm:flex-row">
        <div className="flex items-center gap-3">
          <BrandLogo size={26} />
          <span className="text-[13px] text-ink-muted">Local AI career intelligence</span>
        </div>
        <div className="flex gap-6 text-[13px] text-ink-muted">
          <a className="hover:text-white/90" href={REPO} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a className="hover:text-white/90" href="#features">
            Features
          </a>
          <a className="hover:text-white/90" href="#cta">
            Setup
          </a>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-0 text-white">
      <Progress />
      <Nav />
      <main>
        <Hero />
        <Features />
        <How />
        <Stack />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
