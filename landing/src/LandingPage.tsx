/**
 * KariyerAI — Premium landing (tek sayfa).
 * React + Tailwind + Framer Motion + R3F
 */
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";

/** Three.js sahnesi lazy — ilk paint hizli kalsin. */
const NeuralScene = lazy(() =>
  import("./NeuralScene").then((m) => ({ default: m.NeuralScene }))
);

const REPO =
  "https://github.com/Dpehect/CarieerAi-FULLSTACK-AI-WEB-APP";

const FEATURES = [
  {
    title: "ATS skoru (aninda)",
    desc: "LLM beklemeden yerel anahtar kelime + format analizi. Eksik skill'leri gorme.",
    accent: "from-cyan-400/20 to-sky-500/5",
    ring: "group-hover:border-cyan-400/40",
  },
  {
    title: "RAG + ChromaDB",
    desc: "CV ve is ilani parcalari vektorlenir; her analiz gercek belgelere dayanir.",
    accent: "from-violet-400/20 to-fuchsia-500/5",
    ring: "group-hover:border-violet-400/40",
  },
  {
    title: "Gap & roadmap",
    desc: "Kritik bosluklar, oncelik sirasi ve 30/90/365 gunluk uygulanabilir plan.",
    accent: "from-blue-400/20 to-indigo-500/5",
    ring: "group-hover:border-blue-400/40",
  },
  {
    title: "Mektup & LinkedIn",
    desc: "Ilana ozel motivasyon mektubu ve profesyonel profil metinleri.",
    accent: "from-pink-400/20 to-rose-500/5",
    ring: "group-hover:border-pink-400/40",
  },
  {
    title: "Tam rapor export",
    desc: "Markdown ve HTML indir; tarayicidan PDF olarak kaydet.",
    accent: "from-lime-400/15 to-emerald-500/5",
    ring: "group-hover:border-lime-400/40",
  },
  {
    title: "%100 yerel · ucretsiz",
    desc: "Ollama ile calisir. API key yok. Verileriniz bilgisayarinizdan cikmaz.",
    accent: "from-amber-400/15 to-orange-500/5",
    ring: "group-hover:border-amber-400/40",
  },
] as const;

const STEPS = [
  { n: "01", t: "Kur", d: "setup.bat — venv, paketler, modeller tek tik." },
  { n: "02", t: "Ac", d: "start.bat — Streamlit arayuzu localhost:8501." },
  { n: "03", t: "Yukle", d: "CV + is ilani (PDF/TXT/MD) veya demo veri." },
  { n: "04", t: "Analiz et", d: "ATS, gap, roadmap, mektup, tam rapor." },
] as const;

const STATS = [
  { k: "0", l: "API key" },
  { k: "100%", l: "Yerel calisma" },
  { k: "ATS+", l: "Aninda skor" },
  { k: "RAG", l: "Akilli baglam" },
] as const;

function useSmoothProgress() {
  const { scrollYProgress } = useScroll();
  return useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.35 });
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-white/10 bg-ink-950/75 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="group flex items-center gap-2.5">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400/30 to-violet-500/30 ring-1 ring-white/15">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_16px_#22d3ee]" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-white">
            Kariyer<span className="text-cyan-300">AI</span>
          </span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <a className="transition hover:text-white" href="#features">
            Ozellikler
          </a>
          <a className="transition hover:text-white" href="#how">
            Kurulum
          </a>
          <a className="transition hover:text-white" href="#stack">
            Teknoloji
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost !px-4 !py-2 text-xs sm:!px-5 sm:text-sm"
          >
            GitHub
          </a>
          <a href="#cta" className="btn-primary !px-4 !py-2 text-xs sm:!px-5 sm:text-sm">
            Basla
          </a>
        </div>
      </div>
    </motion.header>
  );
}

function ProgressBar() {
  const p = useSmoothProgress();
  const scaleX = useTransform(p, [0, 1], [0, 1]);
  return (
    <motion.div
      style={{ scaleX, transformOrigin: "0% 50%" }}
      className="fixed left-0 right-0 top-0 z-[60] h-[2px] bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400"
    />
  );
}

function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-24 top-24 h-72 w-72 animate-float rounded-full bg-cyan-500/20 blur-[90px]" />
      <div
        className="absolute right-0 top-40 h-96 w-96 animate-float rounded-full bg-violet-600/20 blur-[100px]"
        style={{ animationDelay: "1.2s" }}
      />
      <div
        className="absolute bottom-10 left-1/3 h-64 w-64 animate-float rounded-full bg-blue-500/15 blur-[80px]"
        style={{ animationDelay: "2s" }}
      />
    </div>
  );
}

function Hero() {
  return (
    <section id="top" className="relative min-h-[100svh] overflow-hidden pt-16">
      <div className="absolute inset-0 bg-grid-fade bg-grid opacity-40" />
      <FloatingOrbs />
      {/* 3D sahne — sag tarafta */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-full md:w-[58%]">
        <Suspense
          fallback={
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/15" />
          }
        >
          <NeuralScene />
        </Suspense>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col justify-center px-5 py-16 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl lg:max-w-2xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
            </span>
            Yerel AI · API key yok · Ollama
          </div>

          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Kariyerini{" "}
            <span className="text-gradient">akilli bir kocluk</span> sistemiyle yonet.
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-300 sm:text-lg">
            CV ve is ilanini yerel modelle analiz et. ATS skoru, gap haritasi, roadmap,
            motivasyon mektubu ve tam rapor — verilerin sunucuya gitmeden.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <motion.a
              href="#cta"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary"
            >
              Hemen basla
              <span aria-hidden className="text-ink-900/70">
                →
              </span>
            </motion.a>
            <motion.a
              href={REPO}
              target="_blank"
              rel="noreferrer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="btn-ghost"
            >
              Kaynak kodu
            </motion.a>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {STATS.map((s, i) => (
              <motion.div
                key={s.l}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.08, duration: 0.5 }}
                className="glass rounded-2xl px-3 py-3 sm:px-4"
              >
                <div className="font-display text-lg font-semibold text-white sm:text-xl">{s.k}</div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400">{s.l}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-500 md:flex"
        >
          <span>Kaydir</span>
          <span className="h-8 w-px bg-gradient-to-b from-cyan-400/80 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}

function SectionTitle({
  kicker,
  title,
  sub,
}: {
  kicker: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/90"
      >
        {kicker}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ delay: 0.05 }}
        className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
      >
        {title}
      </motion.h2>
      {sub ? (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-slate-400"
        >
          {sub}
        </motion.p>
      ) : null}
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionTitle
          kicker="Platform"
          title="Tek arayuzde kariyer istihbarati"
          sub="Profesyonel is akisi: yukle, indeksle, skorla, raporla — hepsi yerelde."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.article
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              whileHover={{ y: -4 }}
              className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-ink-900/60 p-6 shadow-card transition ${f.ring}`}
            >
              <div
                className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${f.accent} blur-2xl transition group-hover:opacity-100`}
              />
              <div className="relative">
                <div className="mb-4 h-1 w-10 rounded-full bg-gradient-to-r from-cyan-300 to-violet-400" />
                <h3 className="font-display text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</p>
              </div>
            </motion.article>
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
        <SectionTitle
          kicker="Akis"
          title="4 adimda calisir durumda"
          sub="Ogrenci projesi hissi yok — net kurulum, net deger."
        />
        <div className="relative grid gap-4 md:grid-cols-4">
          <div className="pointer-events-none absolute left-[12%] right-[12%] top-10 hidden h-px bg-gradient-to-r from-cyan-500/0 via-cyan-400/40 to-violet-500/0 md:block" />
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass relative rounded-3xl p-5"
            >
              <div className="font-mono text-xs text-cyan-300/90">{s.n}</div>
              <div className="mt-3 font-display text-xl font-semibold text-white">{s.t}</div>
              <p className="mt-2 text-sm text-slate-400">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stack() {
  const items = useMemo(
    () => ["Ollama", "Streamlit", "ChromaDB", "LangChain split", "PyMuPDF", "nomic-embed", "llama3.1"],
    []
  );
  return (
    <section id="stack" className="relative py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionTitle kicker="Stack" title="Maliyet yok, guc yerelde" />
        <div className="flex flex-wrap justify-center gap-3">
          {items.map((item, i) => (
            <motion.span
              key={item}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.06, borderColor: "rgba(34,211,238,0.45)" }}
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-xs text-slate-300 sm:text-sm"
            >
              {item}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  const [copied, setCopied] = useState(false);
  const cmd = "git clone https://github.com/Dpehect/CarieerAi-FULLSTACK-AI-WEB-APP.git";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <section id="cta" className="relative py-24 sm:py-28">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 p-8 shadow-glow-lg sm:p-12"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
              Call to action
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Kariyer kosunu bugun baslat — sunucu faturasi olmadan.
            </h2>
            <p className="mt-4 max-w-xl text-slate-300">
              Repo'yu klonla, <span className="text-cyan-200">setup.bat</span> calistir,
              <span className="text-cyan-200"> start.bat</span> ile ac. Bu site yalnizca
              bilgilendirmedir; asil uygulama bilgisayarinda calisir.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={REPO} target="_blank" rel="noreferrer" className="btn-primary">
                GitHub'da ac
              </a>
              <button type="button" onClick={copy} className="btn-ghost">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={copied ? "ok" : "copy"}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                  >
                    {copied ? "Kopyalandi" : "Clone komutunu kopyala"}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>

            <pre className="mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-xs text-cyan-100/90 sm:text-sm">
              {`git clone ${REPO.replace("https://github.com/", "https://github.com/")}
cd CarieerAi-FULLSTACK-AI-WEB-APP
setup.bat
start.bat
# → http://localhost:8501`}
            </pre>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-center text-sm text-slate-500 sm:flex-row sm:text-left sm:px-8">
        <div>
          <span className="font-display font-semibold text-slate-300">KariyerAI</span>
          <span className="mx-2 text-slate-600">·</span>
          Yerel AI kariyer kocu
        </div>
        <div className="flex gap-5">
          <a className="hover:text-slate-300" href={REPO} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a className="hover:text-slate-300" href="#features">
            Ozellikler
          </a>
          <a className="hover:text-slate-300" href="#cta">
            Kurulum
          </a>
        </div>
      </div>
    </footer>
  );
}

/** Ana landing komponenti — production-ready tek sayfa. */
export function LandingPage() {
  return (
    <div className="relative min-h-screen bg-ink-950 text-slate-100">
      <ProgressBar />
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
