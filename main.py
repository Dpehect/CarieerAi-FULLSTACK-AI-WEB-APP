"""
KariyerAI — Profesyonel Streamlit arayüzü
Yerel · Ollama · ATS · RAG · Rapor · Ücretsiz
Çalıştır: streamlit run main.py  |  start.bat
"""

from __future__ import annotations

import json
import traceback
from datetime import datetime
from pathlib import Path

import streamlit as st

from ats_scorer import compute_ats, score_label
from config import (
    APP_NAME,
    APP_TAGLINE,
    DATA_DIR,
    DEFAULT_MODEL,
    DEFAULT_TEMPERATURE,
    DEFAULT_TOP_K,
    SESSION_PATH,
)
from document_processor import (
    get_document_stats,
    preview_text,
    process_plain_text,
    process_upload_bytes,
)
from llm_handler import LLMHandler
from rag_engine import RAGEngine
from report_export import build_markdown_report, export_bundle
from sample_data import DEMO_CV, DEMO_JOB

# ---------------------------------------------------------------------------
st.set_page_config(
    page_title=APP_NAME,
    page_icon="🎯",
    layout="wide",
    initial_sidebar_state="expanded",
)

CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
html, body, [class*="css"] { font-family: Inter, system-ui, sans-serif; }
.block-container { padding-top: 1rem; max-width: 1180px; }
div[data-testid="stSidebar"] {
  background: linear-gradient(180deg, #0b1220 0%, #111827 55%, #0f172a 100%);
}
div[data-testid="stSidebar"] * { color: #e5e7eb !important; }
div[data-testid="stSidebar"] .stCaption,
div[data-testid="stSidebar"] label { color: #9ca3af !important; }
div[data-testid="stSidebar"] .stButton > button {
  background: #1f2937; border: 1px solid #374151; color: #f9fafb;
}
div[data-testid="stSidebar"] .stButton > button:hover { border-color: #38bdf8; }
div[data-testid="stSidebar"] [data-baseweb="select"] span { color: #111 !important; }
.hero {
  background: linear-gradient(120deg, #0f172a 0%, #1e3a5f 42%, #0284c7 100%);
  border-radius: 18px; padding: 1.45rem 1.7rem; color: #fff; margin-bottom: 1.1rem;
  box-shadow: 0 12px 40px rgba(2,132,199,.22);
}
.hero h1 { margin: 0; font-size: 1.8rem; font-weight: 700; letter-spacing: -.03em; }
.hero p { margin: .35rem 0 0; opacity: .92; font-size: .98rem; }
.pills { margin-top: .8rem; display: flex; flex-wrap: wrap; gap: .4rem; }
.pill {
  font-size: .7rem; font-weight: 600; padding: .2rem .55rem; border-radius: 999px;
  background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.18);
}
.score-box {
  border-radius: 14px; padding: 1rem; border: 1px solid #e2e8f0;
  background: #fff; text-align: center;
}
.score-num { font-size: 2rem; font-weight: 700; letter-spacing: -.03em; color: #0f172a; }
.score-label { color: #64748b; font-size: .84rem; }
.chip {
  display: inline-block; margin: .15rem .25rem .15rem 0; padding: .15rem .5rem;
  border-radius: 999px; font-size: .78rem; font-weight: 500;
}
.chip-ok { background: #dcfce7; color: #166534; }
.chip-miss { background: #fee2e2; color: #991b1b; }
.ok { color: #4ade80; font-weight: 600; }
.bad { color: #f87171; font-weight: 600; }
.upload-hint {
  border: 1.5px dashed #4b5563; border-radius: 12px; padding: .7rem .9rem;
  background: rgba(255,255,255,.04); color: #9ca3af; font-size: .85rem; margin-bottom: .45rem;
}
.step {
  display: flex; gap: .65rem; align-items: flex-start; margin: .45rem 0;
  padding: .65rem .8rem; border-radius: 10px; background: #f1f5f9; border: 1px solid #e2e8f0;
}
.step b { color: #0284c7; min-width: 1.4rem; }
</style>
"""
st.markdown(CSS, unsafe_allow_html=True)

CHAT_SUGGESTIONS = [
    "Bu ilana genel uyumum nasıl?",
    "CV'mde ilk neyi değiştirmeliyim?",
    "Eksik 3 kritik skill ve nasıl kapatırım?",
    "Mülakatta zayıf noktam ne olabilir?",
    "30 günde ne yapmalıyım?",
]


# ---------------------------------------------------------------------------
# Session helpers
# ---------------------------------------------------------------------------
def init_state() -> None:
    defaults = {
        "rag": None,
        "llm": None,
        "cv_loaded": False,
        "job_loaded": False,
        "cv_stats": None,
        "job_stats": None,
        "cv_preview": "",
        "job_preview": "",
        "chat_messages": [],
        "results": {},
        "ats_result": None,
        "ollama_status": None,
        "model_name": DEFAULT_MODEL,
        "temperature": DEFAULT_TEMPERATURE,
        "top_k": DEFAULT_TOP_K,
        "bootstrapped": False,
    }
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v


def rag() -> RAGEngine:
    if st.session_state.rag is None:
        st.session_state.rag = RAGEngine()
    return st.session_state.rag


def llm() -> LLMHandler:
    if st.session_state.llm is None:
        st.session_state.llm = LLMHandler(
            model=st.session_state.model_name,
            temperature=st.session_state.temperature,
            rag=rag(),
        )
        from llm_handler import ConversationMemory

        st.session_state.llm.memory = ConversationMemory.from_list(
            [{"role": m["role"], "content": m["content"]} for m in st.session_state.chat_messages]
        )
    else:
        st.session_state.llm.model = st.session_state.model_name
        st.session_state.llm.temperature = st.session_state.temperature
        st.session_state.llm.rag = rag()
    return st.session_state.llm


def docs_ready() -> bool:
    return bool(st.session_state.cv_loaded and st.session_state.job_loaded)


def need_docs() -> bool:
    if docs_ready():
        return True
    st.warning("Sol panelden **CV** ve **iş ilanı** yükleyip indeksleyin — veya **Demo veri yükle**.")
    return False


def stream_ui(gen, box):
    parts = []
    for t in gen:
        parts.append(t)
        box.markdown("".join(parts))
    return "".join(parts)


def save_result(key: str, text: str) -> None:
    st.session_state.results[key] = text
    _persist_session()


def export_buttons(key: str, title: str) -> None:
    text = st.session_state.results.get(key) or ""
    if not text:
        return
    md = build_markdown_report(title, {title: text}, meta={"Modül": title, "Uygulama": APP_NAME})
    bundle = export_bundle(md, title=title)
    c1, c2 = st.columns(2)
    with c1:
        st.download_button(
            "⬇ Markdown",
            data=bundle["markdown"],
            file_name=f"kariyerai_{key}_{datetime.now():%Y%m%d_%H%M}.md",
            mime="text/markdown",
            key=f"dl_md_{key}",
            use_container_width=True,
        )
    with c2:
        st.download_button(
            "⬇ HTML → PDF yazdır",
            data=bundle["html"],
            file_name=f"kariyerai_{key}_{datetime.now():%Y%m%d_%H%M}.html",
            mime="text/html",
            key=f"dl_html_{key}",
            use_container_width=True,
        )


def run_analysis(kind: str, title: str, runner) -> None:
    if not need_docs():
        return
    if st.button(f"▶ {title}", type="primary", use_container_width=True, key=f"run_{kind}"):
        h = llm()
        h.temperature = st.session_state.temperature
        box = st.empty()
        try:
            with st.spinner("Analiz ediliyor… (ilk yanıtta model yavaş olabilir)"):
                text = stream_ui(runner(h), box)
            save_result(kind, text)
        except Exception as e:
            st.error(f"Hata: {e}")
            st.code(traceback.format_exc())
    elif kind in st.session_state.results:
        st.markdown(st.session_state.results[kind])
    export_buttons(kind, title)


def _persist_session() -> None:
    """Son durumu diske yaz (ücretsiz, yerel)."""
    try:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        payload = {
            "saved_at": datetime.now().isoformat(timespec="seconds"),
            "model": st.session_state.model_name,
            "results_keys": list(st.session_state.results.keys()),
            "results": st.session_state.results,
            "chat": st.session_state.chat_messages[-30:],
            "ats": st.session_state.ats_result.to_dict() if st.session_state.ats_result else None,
        }
        SESSION_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    except Exception:
        pass


def _load_session_results() -> None:
    if not SESSION_PATH.exists():
        return
    try:
        data = json.loads(SESSION_PATH.read_text(encoding="utf-8"))
        if data.get("results") and not st.session_state.results:
            st.session_state.results = data["results"]
        if data.get("chat") and not st.session_state.chat_messages:
            st.session_state.chat_messages = data["chat"]
    except Exception:
        pass


def bootstrap() -> None:
    if st.session_state.bootstrapped:
        return
    st.session_state.bootstrapped = True
    _load_session_results()
    # Ollama modellerini sessiz kontrol + öneri
    try:
        status = llm().check_connection()
        st.session_state.ollama_status = status
        if status.get("suggested") and not status.get("ok"):
            st.session_state.model_name = status["suggested"]
        elif status.get("ok") and status.get("models"):
            # tercih edilen yoksa en iyiyi seç
            best = LLMHandler.pick_best_model(status["models"], st.session_state.model_name)
            if st.session_state.model_name not in status["models"]:
                st.session_state.model_name = best
    except Exception:
        pass


# ---------------------------------------------------------------------------
# Ingest
# ---------------------------------------------------------------------------
def _apply_doc(kind: str, doc) -> int:
    n = rag().add_document(doc, replace_source=True)
    h = llm()
    if kind == "cv":
        h.set_cv_text(doc.cleaned_text)
        st.session_state.cv_loaded = True
        st.session_state.cv_stats = get_document_stats(doc)
        st.session_state.cv_preview = preview_text(doc.cleaned_text, 700)
    else:
        h.set_job_text(doc.cleaned_text)
        st.session_state.job_loaded = True
        st.session_state.job_stats = get_document_stats(doc)
        st.session_state.job_preview = preview_text(doc.cleaned_text, 700)
    if st.session_state.cv_loaded and st.session_state.job_loaded:
        st.session_state.ats_result = compute_ats(h.cv_text, h.job_text)
        _persist_session()
    return n


def _ingest(kind: str, file, paste: str) -> None:
    try:
        with st.spinner("İşleniyor + embedding…"):
            if file is not None:
                doc = process_upload_bytes(file.read(), file.name, source_type=kind)
            elif paste and paste.strip():
                doc = process_plain_text(paste, source_type=kind, file_name=f"{kind}_paste.txt")
            else:
                st.error("PDF/TXT/MD dosyası veya metin gerekli.")
                return
            n = _apply_doc(kind, doc)
            st.success(f"{'CV' if kind == 'cv' else 'İlan'} hazır · {n} parça")
    except Exception as e:
        st.error(str(e))


def load_demo() -> None:
    try:
        with st.spinner("Demo CV + ilan indeksleniyor…"):
            cv_doc = process_plain_text(DEMO_CV, "cv", "demo_cv.txt")
            job_doc = process_plain_text(DEMO_JOB, "job", "demo_job.txt")
            n1 = _apply_doc("cv", cv_doc)
            n2 = _apply_doc("job", job_doc)
            st.success(f"Demo yüklendi · CV {n1} + İlan {n2} parça. ATS sekmesine bakın.")
    except Exception as e:
        st.error(f"Demo yüklenemedi (Ollama/embedding?): {e}")


# ---------------------------------------------------------------------------
# Sidebar
# ---------------------------------------------------------------------------
def sidebar() -> None:
    with st.sidebar:
        st.markdown(f"### 🎯 {APP_NAME}")
        st.caption(APP_TAGLINE)

        st.markdown("#### Sistem")
        if st.button("Bağlantıyı kontrol et", use_container_width=True):
            with st.spinner("Kontrol…"):
                st.session_state.ollama_status = llm().check_connection()
                st_ = st.session_state.ollama_status
                if st_.get("suggested") and not st_.get("ok"):
                    st.session_state.model_name = st_["suggested"]

        st_ = st.session_state.ollama_status
        if st_:
            if st_["ok"]:
                st.markdown(f'<span class="ok">● {st_["message"]}</span>', unsafe_allow_html=True)
            else:
                st.markdown('<span class="bad">● Bağlantı / model sorunu</span>', unsafe_allow_html=True)
                st.caption(st_["message"])

        models = (st_ or {}).get("models") or [DEFAULT_MODEL, "qwen2.5:14b", "llama3.2", "mistral"]
        if st.session_state.model_name not in models:
            models = [st.session_state.model_name] + list(models)
        st.session_state.model_name = st.selectbox(
            "Model",
            models,
            index=models.index(st.session_state.model_name),
        )
        st.session_state.temperature = st.slider(
            "Temperature", 0.0, 1.0, float(st.session_state.temperature), 0.05
        )
        st.session_state.top_k = st.slider("RAG top-k", 2, 10, int(st.session_state.top_k))

        st.divider()
        if st.button("🧪 Demo veri yükle", use_container_width=True, help="Örnek CV + ilan (test)"):
            load_demo()
            st.rerun()

        st.markdown("#### 📄 CV")
        st.markdown(
            '<div class="upload-hint">PDF / TXT / MD veya yapıştır → İndeksle</div>',
            unsafe_allow_html=True,
        )
        cv_file = st.file_uploader(
            "CV dosya", type=["pdf", "txt", "md"], label_visibility="collapsed", key="cv_up"
        )
        cv_paste = st.text_area(
            "CV metin", height=88, placeholder="CV metni…", label_visibility="collapsed", key="cv_ta"
        )
        if st.button("CV indeksle", type="primary", use_container_width=True):
            _ingest("cv", cv_file, cv_paste)

        if st.session_state.cv_loaded and st.session_state.cv_stats:
            s = st.session_state.cv_stats
            st.success(f"CV · {s['chunks']} parça · ~{s['words_approx']} kelime")

        st.markdown("#### 💼 İş ilanı")
        st.markdown(
            '<div class="upload-hint">PDF / TXT / MD veya yapıştır → İndeksle</div>',
            unsafe_allow_html=True,
        )
        job_file = st.file_uploader(
            "İlan dosya", type=["pdf", "txt", "md"], label_visibility="collapsed", key="job_up"
        )
        job_paste = st.text_area(
            "İlan metin",
            height=88,
            placeholder="İlan metni…",
            label_visibility="collapsed",
            key="job_ta",
        )
        if st.button("İlan indeksle", type="primary", use_container_width=True):
            _ingest("job", job_file, job_paste)

        if st.session_state.job_loaded and st.session_state.job_stats:
            s = st.session_state.job_stats
            st.success(f"İlan · {s['chunks']} parça · ~{s['words_approx']} kelime")

        st.divider()
        try:
            stats = rag().get_stats()
            st.caption(
                f"DB {stats['total_chunks']} chunk · CV {stats['cv_chunks']} / İlan {stats['job_chunks']}"
            )
        except Exception:
            pass

        c1, c2 = st.columns(2)
        with c1:
            if st.button("Sohbet sil", use_container_width=True):
                st.session_state.chat_messages = []
                llm().clear_memory()
                _persist_session()
                st.rerun()
        with c2:
            if st.button("DB temizle", use_container_width=True):
                rag().clear_all()
                st.session_state.cv_loaded = False
                st.session_state.job_loaded = False
                st.session_state.cv_stats = None
                st.session_state.job_stats = None
                st.session_state.ats_result = None
                h = llm()
                h.cv_text = h.job_text = ""
                st.rerun()


# ---------------------------------------------------------------------------
# Tabs
# ---------------------------------------------------------------------------
def tab_home() -> None:
    st.markdown(
        f"""
        <div class="hero">
          <h1>{APP_NAME}</h1>
          <p>ATS skoru · gap · roadmap · mektup · LinkedIn · tam rapor. Verin PC’nizden çıkmaz.</p>
          <div class="pills">
            <span class="pill">Ollama ücretsiz</span>
            <span class="pill">ChromaDB RAG</span>
            <span class="pill">ATS anında</span>
            <span class="pill">MD / HTML export</span>
            <span class="pill">Demo veri</span>
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("CV", "Hazır ✓" if st.session_state.cv_loaded else "—")
    c2.metric("İlan", "Hazır ✓" if st.session_state.job_loaded else "—")
    ats = st.session_state.ats_result
    c3.metric("ATS", f"{ats.score}" if ats else "—")
    try:
        c4.metric("RAG", rag().get_stats()["total_chunks"])
    except Exception:
        c4.metric("RAG", "—")

    st.markdown("##### 3 adımda başla")
    st.markdown(
        """
        <div class="step"><b>1</b><div>Sol menüde Ollama bağlantısını kontrol et (gerekirse model seç)</div></div>
        <div class="step"><b>2</b><div>CV + ilan indeksle <em>veya</em> “Demo veri yükle”</div></div>
        <div class="step"><b>3</b><div>ATS → Analiz / Tam rapor → HTML indirip Ctrl+P ile PDF</div></div>
        """,
        unsafe_allow_html=True,
    )

    if not docs_ready():
        if st.button("🧪 Demo ile dene", type="primary"):
            load_demo()
            st.rerun()

    if ats:
        st.markdown("##### Anlık ATS")
        a, b, c = st.columns(3)
        with a:
            st.markdown(
                f'<div class="score-box"><div class="score-num">{ats.score}</div>'
                f'<div class="score-label">{score_label(ats.score)}</div></div>',
                unsafe_allow_html=True,
            )
        with b:
            st.markdown(
                f'<div class="score-box"><div class="score-num">{ats.keyword_score}</div>'
                f'<div class="score-label">Kelime /70</div></div>',
                unsafe_allow_html=True,
            )
        with c:
            st.markdown(
                f'<div class="score-box"><div class="score-num">{ats.format_score}</div>'
                f'<div class="score-label">Format /30</div></div>',
                unsafe_allow_html=True,
            )

    col_l, col_r = st.columns(2)
    with col_l:
        if st.session_state.cv_preview:
            with st.expander("CV önizleme"):
                st.text(st.session_state.cv_preview)
    with col_r:
        if st.session_state.job_preview:
            with st.expander("İlan önizleme"):
                st.text(st.session_state.job_preview)

    if st.session_state.results:
        st.caption(
            f"Kayıtlı analizler: {', '.join(st.session_state.results.keys())} · "
            f"oturum dosyası: `{SESSION_PATH.name}`"
        )


def tab_ats() -> None:
    st.subheader("ATS uyum skoru")
    st.caption("Yerel hesap — token harcamaz. AI yorumu opsiyonel.")
    if not need_docs():
        return

    h = llm()
    if st.button("ATS skorunu yenile", use_container_width=True):
        st.session_state.ats_result = compute_ats(h.cv_text, h.job_text)
        _persist_session()

    ats = st.session_state.ats_result or compute_ats(h.cv_text, h.job_text)
    st.session_state.ats_result = ats

    a, b, c = st.columns(3)
    a.metric("Toplam", f"{ats.score}/100", score_label(ats.score))
    b.metric("Kapsam", f"%{int(ats.coverage * 100)}")
    c.metric("Format", f"{ats.format_score}/30")

    st.markdown("**Eşleşen**")
    if ats.matched:
        st.markdown(
            " ".join(f'<span class="chip chip-ok">{m}</span>' for m in ats.matched[:30]),
            unsafe_allow_html=True,
        )
    else:
        st.write("—")

    st.markdown("**Eksik**")
    if ats.missing:
        st.markdown(
            " ".join(f'<span class="chip chip-miss">{m}</span>' for m in ats.missing[:30]),
            unsafe_allow_html=True,
        )
    else:
        st.write("—")

    if ats.format_notes:
        st.markdown("**Format notları**")
        for n in ats.format_notes:
            st.write(f"- {n}")

    st.divider()
    if st.button("AI ile ATS yorumu", type="primary", use_container_width=True):
        box = st.empty()
        try:
            with st.spinner("Yorum…"):
                text = stream_ui(llm().ats_commentary(ats.score, ats.summary, stream=True), box)
            save_result("ats_ai", text)
        except Exception as e:
            st.error(str(e))
    elif "ats_ai" in st.session_state.results:
        st.markdown(st.session_state.results["ats_ai"])
    export_buttons("ats_ai", "ATS AI Yorumu")

    raw_md = build_markdown_report(
        "ATS Skor Raporu",
        {
            "Skor": f"**{ats.score}/100** — {score_label(ats.score)}\n\n{ats.summary}",
            "Eşleşen": ", ".join(ats.matched) or "—",
            "Eksik": ", ".join(ats.missing) or "—",
            "Format": "\n".join(f"- {x}" for x in ats.format_notes) or "—",
        },
    )
    st.download_button(
        "⬇ Yerel ATS (.md)",
        data=raw_md,
        file_name=f"kariyerai_ats_{datetime.now():%Y%m%d}.md",
        mime="text/markdown",
    )


def tab_chat() -> None:
    st.subheader("Kariyer koçu sohbeti")
    st.caption("Hafıza + RAG. Önerilen sorulara tıklayabilirsiniz.")

    cols = st.columns(min(3, len(CHAT_SUGGESTIONS)))
    clicked = None
    for i, sug in enumerate(CHAT_SUGGESTIONS):
        if cols[i % 3].button(sug, key=f"sug_{i}", use_container_width=True):
            clicked = sug

    for msg in st.session_state.chat_messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    q = st.chat_input("Sorunu yaz…") or clicked
    if q:
        st.session_state.chat_messages.append({"role": "user", "content": q})
        with st.chat_message("user"):
            st.markdown(q)
        with st.chat_message("assistant"):
            box = st.empty()
            try:
                ans = stream_ui(
                    llm().chat_stream(q, use_rag=True, top_k=int(st.session_state.top_k)),
                    box,
                )
            except Exception as e:
                ans = f"⚠️ {e}"
                box.markdown(ans)
                llm().memory.add("assistant", ans)
        st.session_state.chat_messages.append({"role": "assistant", "content": ans})
        _persist_session()
        if clicked:
            st.rerun()

    if st.session_state.chat_messages:
        st.download_button(
            "Sohbet JSON",
            data=llm().export_memory_json(),
            file_name="kariyerai_chat.json",
            mime="application/json",
        )


def tab_full_report() -> None:
    st.subheader("Tek tık tam rapor")
    if not need_docs():
        return
    h = llm()
    ats = st.session_state.ats_result or compute_ats(h.cv_text, h.job_text)
    st.session_state.ats_result = ats

    if st.button("Tam rapor oluştur", type="primary", use_container_width=True):
        box = st.empty()
        try:
            with st.spinner("Rapor…"):
                text = stream_ui(h.full_report(ats.score, ats.summary, stream=True), box)
            header = (
                f"**Yerel ATS:** {ats.score}/100 ({score_label(ats.score)}) — {ats.summary}\n\n"
                f"**Eksik kelimeler:** {', '.join(ats.missing[:12]) or '—'}\n\n---\n\n"
            )
            full = header + text
            save_result("full", full)
            box.markdown(full)
        except Exception as e:
            st.error(str(e))
    elif "full" in st.session_state.results:
        st.markdown(st.session_state.results["full"])

    if "full" in st.session_state.results:
        md = build_markdown_report(
            "KariyerAI Tam Rapor",
            {"Rapor": st.session_state.results["full"]},
            meta={
                "ATS": f"{ats.score}/100",
                "Model": st.session_state.model_name,
                "Tarih": datetime.now().strftime("%Y-%m-%d %H:%M"),
            },
        )
        bundle = export_bundle(md, "KariyerAI Tam Rapor")
        c1, c2 = st.columns(2)
        c1.download_button(
            "⬇ Rapor MD",
            bundle["markdown"],
            f"kariyerai_full_{datetime.now():%Y%m%d}.md",
            "text/markdown",
            use_container_width=True,
        )
        c2.download_button(
            "⬇ Rapor HTML",
            bundle["html"],
            f"kariyerai_full_{datetime.now():%Y%m%d}.html",
            "text/html",
            use_container_width=True,
        )
        st.info("HTML aç → Ctrl+P → **PDF olarak kaydet**.")


def main() -> None:
    init_state()
    bootstrap()
    sidebar()

    tabs = st.tabs(
        [
            "🏠 Panel",
            "📊 ATS",
            "📈 Analiz",
            "🔍 Gap",
            "🗺️ Roadmap",
            "✨ CV",
            "✉️ Mektup",
            "🔗 LinkedIn",
            "🎤 Mülakat",
            "📋 Tam rapor",
            "💬 Sohbet",
        ]
    )

    with tabs[0]:
        tab_home()
    with tabs[1]:
        tab_ats()
    with tabs[2]:
        st.subheader("Kariyer analizi")
        run_analysis("career", "Kariyer Analizi", lambda h: h.career_analysis(stream=True))
    with tabs[3]:
        st.subheader("Gap analizi")
        run_analysis("gap", "Gap Analizi", lambda h: h.gap_analysis(stream=True))
    with tabs[4]:
        st.subheader("Yol haritası")
        extra = st.text_input("Ek not", placeholder="Örn: haftada 8 saat, B2 İngilizce…")
        run_analysis(
            "roadmap",
            "Yol Haritası",
            lambda h: h.roadmap(extra_notes=extra, stream=True),
        )
    with tabs[5]:
        st.subheader("CV iyileştirme")
        run_analysis("cv", "CV İyileştirme", lambda h: h.improve_cv(stream=True))
    with tabs[6]:
        st.subheader("Motivasyon mektubu")
        st.caption("İlana özel, CV’ye dayalı — uydurma deneyim yok.")
        run_analysis("cover", "Motivasyon Mektubu", lambda h: h.cover_letter(stream=True))
    with tabs[7]:
        st.subheader("LinkedIn metinleri")
        run_analysis("linkedin", "LinkedIn Profili", lambda h: h.linkedin_profile(stream=True))
    with tabs[8]:
        st.subheader("Mülakat hazırlığı")
        run_analysis("interview", "Mülakat Paketi", lambda h: h.interview_prep(stream=True))
    with tabs[9]:
        tab_full_report()
    with tabs[10]:
        tab_chat()


if __name__ == "__main__":
    main()
