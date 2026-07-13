"""
KariyerAI - Streamlit Ana Uygulama
%100 yerel AI Kariyer Koçu: PDF CV + iş ilanı, RAG (ChromaDB), Ollama LLM.
"""

from __future__ import annotations

import traceback
from pathlib import Path

import streamlit as st

from document_processor import (
    get_document_stats,
    preview_text,
    process_pdf_bytes,
    process_plain_text,
)
from llm_handler import DEFAULT_MODEL, LLMHandler
from rag_engine import RAGEngine

# ---------------------------------------------------------------------------
# Sayfa yapılandırması
# ---------------------------------------------------------------------------
st.set_page_config(
    page_title="KariyerAI | Yerel Kariyer Koçu",
    page_icon="🎯",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ---------------------------------------------------------------------------
# Özel CSS
# ---------------------------------------------------------------------------
CUSTOM_CSS = """
<style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

    html, body, [class*="css"] {
        font-family: 'DM Sans', system-ui, sans-serif;
    }

    .main-header {
        background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 45%, #0ea5e9 100%);
        padding: 1.75rem 2rem;
        border-radius: 16px;
        margin-bottom: 1.5rem;
        color: white;
        box-shadow: 0 10px 40px rgba(14, 165, 233, 0.25);
    }
    .main-header h1 {
        margin: 0;
        font-size: 2rem;
        font-weight: 700;
        letter-spacing: -0.02em;
    }
    .main-header p {
        margin: 0.4rem 0 0 0;
        opacity: 0.9;
        font-size: 1.05rem;
    }
    .badge-local {
        display: inline-block;
        background: rgba(34, 197, 94, 0.2);
        color: #86efac;
        border: 1px solid rgba(34, 197, 94, 0.4);
        padding: 0.2rem 0.65rem;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 600;
        margin-top: 0.75rem;
    }
    .stat-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1rem 1.1rem;
        margin-bottom: 0.5rem;
    }
    .stat-card strong {
        color: #0f172a;
    }
    .status-ok {
        color: #16a34a;
        font-weight: 600;
    }
    .status-bad {
        color: #dc2626;
        font-weight: 600;
    }
    /* Chat baloncukları */
    .stChatMessage {
        border-radius: 12px;
    }
    div[data-testid="stSidebar"] {
        background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
    }
    .block-container {
        padding-top: 1.5rem;
        max-width: 1200px;
    }
</style>
"""
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)


# ---------------------------------------------------------------------------
# Session state başlatma
# ---------------------------------------------------------------------------
def init_session() -> None:
    defaults = {
        "rag": None,
        "llm": None,
        "cv_loaded": False,
        "job_loaded": False,
        "cv_stats": None,
        "job_stats": None,
        "cv_preview": "",
        "job_preview": "",
        "chat_messages": [],  # UI için {role, content}
        "analysis_result": "",
        "analysis_type": "",
        "ollama_status": None,
        "model_name": DEFAULT_MODEL,
        "temperature": 0.4,
        "top_k": 6,
        "initialized": False,
    }
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v


def get_rag() -> RAGEngine:
    if st.session_state.rag is None:
        st.session_state.rag = RAGEngine()
    return st.session_state.rag


def get_llm() -> LLMHandler:
    if st.session_state.llm is None:
        st.session_state.llm = LLMHandler(
            model=st.session_state.model_name,
            temperature=st.session_state.temperature,
            rag=get_rag(),
        )
        # Memory'yi UI chat'ten geri yükle
        from llm_handler import ConversationMemory

        mem_data = []
        for m in st.session_state.chat_messages:
            mem_data.append({"role": m["role"], "content": m["content"]})
        st.session_state.llm.memory = ConversationMemory.from_list(mem_data)
    else:
        # Ayar senkronu
        st.session_state.llm.model = st.session_state.model_name
        st.session_state.llm.temperature = st.session_state.temperature
        st.session_state.llm.rag = get_rag()
    return st.session_state.llm


def require_documents() -> bool:
    if not st.session_state.cv_loaded or not st.session_state.job_loaded:
        st.warning(
            "Bu özellik için hem **CV** hem **iş ilanı** yüklemelisiniz. "
            "Sol menüden dosya yükleyin veya metin yapıştırın."
        )
        return False
    return True


def stream_to_ui(generator, placeholder):
    """Generator token'larını Streamlit placeholder'a yazar."""
    parts = []
    for token in generator:
        parts.append(token)
        placeholder.markdown("".join(parts))
    return "".join(parts)


# ---------------------------------------------------------------------------
# Sidebar
# ---------------------------------------------------------------------------
def render_sidebar() -> None:
    with st.sidebar:
        st.markdown("## 🎯 KariyerAI")
        st.caption("Yerel · Ollama · ChromaDB · RAG")
        st.divider()

        # --- Bağlantı ---
        st.subheader("🔌 Ollama Durumu")
        if st.button("Bağlantıyı Kontrol Et", use_container_width=True):
            llm = get_llm()
            with st.spinner("Ollama kontrol ediliyor..."):
                st.session_state.ollama_status = llm.check_connection()

        status = st.session_state.ollama_status
        if status:
            if status["ok"]:
                st.markdown(f'<p class="status-ok">✅ {status["message"]}</p>', unsafe_allow_html=True)
            else:
                st.markdown(f'<p class="status-bad">❌ Bağlantı sorunu</p>', unsafe_allow_html=True)
                st.error(status["message"])
            if status.get("models"):
                st.caption("Yüklü modeller: " + ", ".join(status["models"][:8]))

        # --- Model ayarları ---
        st.subheader("⚙️ Model Ayarları")
        models_hint = ["llama3.1:8b", "qwen2.5:14b", "llama3.2", "mistral", "gemma2:9b"]
        known = st.session_state.ollama_status.get("models") if st.session_state.ollama_status else None
        choices = known if known else models_hint

        current = st.session_state.model_name
        if current not in choices:
            choices = [current] + list(choices)

        st.session_state.model_name = st.selectbox(
            "LLM modeli",
            options=choices,
            index=choices.index(st.session_state.model_name)
            if st.session_state.model_name in choices
            else 0,
            help="Önce Ollama'da modeli indirmeniz gerekir: ollama pull <model>",
        )
        st.session_state.temperature = st.slider(
            "Temperature",
            0.0,
            1.0,
            float(st.session_state.temperature),
            0.05,
            help="Düşük = daha tutarlı; yüksek = daha yaratıcı",
        )
        st.session_state.top_k = st.slider(
            "RAG top-k",
            2,
            12,
            int(st.session_state.top_k),
            help="Aramada kaç belge parçası kullanılacak",
        )

        st.divider()

        # --- CV yükleme ---
        st.subheader("📄 CV Yükle")
        cv_file = st.file_uploader("CV (PDF)", type=["pdf"], key="cv_uploader")
        cv_text_area = st.text_area(
            "veya CV metni yapıştır",
            height=100,
            key="cv_paste",
            placeholder="PDF yoksa CV'nizi buraya yapıştırın...",
        )
        if st.button("CV'yi İndeksle", type="primary", use_container_width=True, key="btn_cv"):
            _ingest_cv(cv_file, cv_text_area)

        if st.session_state.cv_loaded and st.session_state.cv_stats:
            s = st.session_state.cv_stats
            st.success(f"CV hazır: {s['file_name']} · {s['chunks']} parça · ~{s['words_approx']} kelime")

        st.divider()

        # --- İş ilanı ---
        st.subheader("💼 İş İlanı Yükle")
        job_file = st.file_uploader("İş ilanı (PDF)", type=["pdf"], key="job_uploader")
        job_text_area = st.text_area(
            "veya ilan metni yapıştır",
            height=100,
            key="job_paste",
            placeholder="LinkedIn / Kariyer.net ilan metnini yapıştırın...",
        )
        if st.button("İlanı İndeksle", type="primary", use_container_width=True, key="btn_job"):
            _ingest_job(job_file, job_text_area)

        if st.session_state.job_loaded and st.session_state.job_stats:
            s = st.session_state.job_stats
            st.success(f"İlan hazır: {s['file_name']} · {s['chunks']} parça · ~{s['words_approx']} kelime")

        st.divider()

        # --- RAG stats & temizlik ---
        st.subheader("🗄️ Vektör Deposu")
        try:
            stats = get_rag().get_stats()
            st.markdown(
                f"""
                <div class="stat-card">
                <strong>Toplam chunk:</strong> {stats['total_chunks']}<br>
                <strong>CV:</strong> {stats['cv_chunks']} · <strong>İlan:</strong> {stats['job_chunks']}<br>
                <strong>Embedding:</strong> {stats['embed_model']}
                </div>
                """,
                unsafe_allow_html=True,
            )
        except Exception as e:
            st.caption(f"Stats alınamadı: {e}")

        col_a, col_b = st.columns(2)
        with col_a:
            if st.button("Sohbeti Sil", use_container_width=True):
                st.session_state.chat_messages = []
                get_llm().clear_memory()
                st.rerun()
        with col_b:
            if st.button("DB Temizle", use_container_width=True):
                get_rag().clear_all()
                st.session_state.cv_loaded = False
                st.session_state.job_loaded = False
                st.session_state.cv_stats = None
                st.session_state.job_stats = None
                llm = get_llm()
                llm.cv_text = ""
                llm.job_text = ""
                st.success("Vektör deposu temizlendi.")
                st.rerun()

        st.caption("KariyerAI · %100 offline · API key yok")


def _ingest_cv(cv_file, cv_text_area: str) -> None:
    try:
        with st.spinner("CV işleniyor ve indeksleniyor... (embedding biraz sürebilir)"):
            if cv_file is not None:
                data = cv_file.read()
                doc = process_pdf_bytes(data, source_type="cv", file_name=cv_file.name)
            elif cv_text_area and cv_text_area.strip():
                doc = process_plain_text(cv_text_area, source_type="cv", file_name="cv_pasted.txt")
            else:
                st.error("PDF yükleyin veya metin yapıştırın.")
                return

            n = get_rag().add_document(doc, replace_source=True)
            llm = get_llm()
            llm.set_cv_text(doc.cleaned_text)

            st.session_state.cv_loaded = True
            st.session_state.cv_stats = get_document_stats(doc)
            st.session_state.cv_preview = preview_text(doc.cleaned_text, 800)
            st.success(f"CV indekslendi: {n} parça eklendi.")
    except Exception as e:
        st.error(f"CV işlenemedi: {e}")
        st.code(traceback.format_exc())


def _ingest_job(job_file, job_text_area: str) -> None:
    try:
        with st.spinner("İş ilanı işleniyor ve indeksleniyor..."):
            if job_file is not None:
                data = job_file.read()
                doc = process_pdf_bytes(data, source_type="job", file_name=job_file.name)
            elif job_text_area and job_text_area.strip():
                doc = process_plain_text(job_text_area, source_type="job", file_name="job_pasted.txt")
            else:
                st.error("PDF yükleyin veya metin yapıştırın.")
                return

            n = get_rag().add_document(doc, replace_source=True)
            llm = get_llm()
            llm.set_job_text(doc.cleaned_text)

            st.session_state.job_loaded = True
            st.session_state.job_stats = get_document_stats(doc)
            st.session_state.job_preview = preview_text(doc.cleaned_text, 800)
            st.success(f"İş ilanı indekslendi: {n} parça eklendi.")
    except Exception as e:
        st.error(f"İlan işlenemedi: {e}")
        st.code(traceback.format_exc())


# ---------------------------------------------------------------------------
# Ana sekmeler
# ---------------------------------------------------------------------------
def render_header() -> None:
    st.markdown(
        """
        <div class="main-header">
            <h1>🎯 KariyerAI</h1>
            <p>Yerel çalışan profesyonel AI kariyer koçun — CV & iş ilanı analizi, gap, roadmap, sohbet</p>
            <span class="badge-local">🔒 %100 Yerel · Ollama · ChromaDB · API Key Yok</span>
        </div>
        """,
        unsafe_allow_html=True,
    )


def tab_overview() -> None:
    st.subheader("Hoş geldin")
    st.markdown(
        """
        **KariyerAI** CV'nizi ve hedef iş ilanınızı yerelde analiz eder.
        Verileriniz bilgisayarınızdan çıkmaz; OpenAI / Anthropic anahtarı gerekmez.

        ### Nasıl kullanılır?
        1. Sol menüden **Ollama bağlantısını** kontrol edin  
        2. **CV** PDF veya metin yükleyip *CV'yi İndeksle*  
        3. **İş ilanı** yükleyip *İlanı İndeksle*  
        4. Üst sekmelerden analiz / sohbet / roadmap seçin  

        ### Özellikler
        | Sekme | Ne yapar? |
        |-------|-----------|
        | 📊 Kariyer Analizi | Uyum skoru, güçlü/zayıf yönler |
        | 🔍 Gap Analizi | Eksik beceriler, öncelik tablosu |
        | 🗺️ Yol Haritası | 30 gün / 3-6-12 ay plan |
        | ✨ CV İyileştir | ATS ve ilana özel rewrite |
        | 🎤 Mülakat | Soru bankası + STAR ipuçları |
        | 💬 Sohbet | Hafızalı, RAG destekli koçluk |
        """
    )

    c1, c2, c3 = st.columns(3)
    with c1:
        st.metric("CV", "Yüklü ✅" if st.session_state.cv_loaded else "Yok ❌")
    with c2:
        st.metric("İş İlanı", "Yüklü ✅" if st.session_state.job_loaded else "Yok ❌")
    with c3:
        try:
            n = get_rag().get_stats()["total_chunks"]
        except Exception:
            n = 0
        st.metric("RAG Chunk", n)

    if st.session_state.cv_preview:
        with st.expander("CV önizleme"):
            st.text(st.session_state.cv_preview)
    if st.session_state.job_preview:
        with st.expander("İş ilanı önizleme"):
            st.text(st.session_state.job_preview)


def tab_analysis(kind: str) -> None:
    """
    kind: career | gap | roadmap | cv | interview
    """
    titles = {
        "career": ("📊 Detaylı Kariyer Analizi", "career_analysis"),
        "gap": ("🔍 Gap (Beceri Boşluğu) Analizi", "gap_analysis"),
        "roadmap": ("🗺️ Kariyer Yol Haritası", "roadmap"),
        "cv": ("✨ CV İyileştirme Önerileri", "improve_cv"),
        "interview": ("🎤 Mülakat Hazırlık Paketi", "interview_prep"),
    }
    title, method = titles[kind]
    st.subheader(title)

    if not require_documents():
        return

    extra = ""
    if kind == "roadmap":
        extra = st.text_input(
            "Ek not (opsiyonel)",
            placeholder="Örn: Haftada 10 saat ayırabilirim, İngilizcem B2...",
        )

    col1, col2 = st.columns([1, 3])
    with col1:
        run = st.button("Analizi Başlat 🚀", type="primary", use_container_width=True)
    with col2:
        st.caption("İlk çalıştırmada model soğuk olabilir; 8B modellerde 30 sn – birkaç dk sürebilir.")

    if run:
        llm = get_llm()
        llm.temperature = st.session_state.temperature
        placeholder = st.empty()
        try:
            with st.spinner("KariyerAI düşünüyor..."):
                if method == "roadmap":
                    gen = llm.roadmap(extra_notes=extra, stream=True)
                else:
                    gen = getattr(llm, method)(stream=True)
                result = stream_to_ui(gen, placeholder)
            st.session_state.analysis_result = result
            st.session_state.analysis_type = kind
        except Exception as e:
            st.error(f"Analiz hatası: {e}")
            st.code(traceback.format_exc())

    elif st.session_state.analysis_result and st.session_state.analysis_type == kind:
        st.markdown(st.session_state.analysis_result)

    if st.session_state.analysis_result and st.session_state.analysis_type == kind:
        st.download_button(
            "Sonucu .md indir",
            data=st.session_state.analysis_result,
            file_name=f"kariyerai_{kind}.md",
            mime="text/markdown",
        )


def tab_chat() -> None:
    st.subheader("💬 Kariyer Koçu Sohbeti")
    st.caption("Konuşma geçmişi oturum boyunca saklanır. RAG, yüklü CV/ilan parçalarını kullanır.")

    # Geçmişi göster
    for msg in st.session_state.chat_messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    user_input = st.chat_input("Sorunu yaz... (örn: Bu ilan için Python seviyem yeterli mi?)")
    if user_input:
        st.session_state.chat_messages.append({"role": "user", "content": user_input})
        with st.chat_message("user"):
            st.markdown(user_input)

        llm = get_llm()
        llm.temperature = st.session_state.temperature
        with st.chat_message("assistant"):
            placeholder = st.empty()
            try:
                # chat_stream memory'ye de yazar
                gen = llm.chat_stream(
                    user_input,
                    use_rag=True,
                    top_k=int(st.session_state.top_k),
                )
                answer = stream_to_ui(gen, placeholder)
            except Exception as e:
                answer = f"⚠️ Hata: {e}"
                placeholder.markdown(answer)
                # Hata durumunda memory'deki yarım user'ı dengele
                llm.memory.add("assistant", answer)

        st.session_state.chat_messages.append({"role": "assistant", "content": answer})

    if st.session_state.chat_messages:
        export = get_llm().export_memory_json()
        st.download_button(
            "Sohbet geçmişini JSON indir",
            data=export,
            file_name="kariyerai_chat.json",
            mime="application/json",
        )


# ---------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------
def main() -> None:
    init_session()
    render_sidebar()
    render_header()

    tabs = st.tabs(
        [
            "🏠 Özet",
            "📊 Kariyer Analizi",
            "🔍 Gap Analizi",
            "🗺️ Yol Haritası",
            "✨ CV İyileştir",
            "🎤 Mülakat",
            "💬 Sohbet",
        ]
    )

    with tabs[0]:
        tab_overview()
    with tabs[1]:
        tab_analysis("career")
    with tabs[2]:
        tab_analysis("gap")
    with tabs[3]:
        tab_analysis("roadmap")
    with tabs[4]:
        tab_analysis("cv")
    with tabs[5]:
        tab_analysis("interview")
    with tabs[6]:
        tab_chat()


if __name__ == "__main__":
    main()
