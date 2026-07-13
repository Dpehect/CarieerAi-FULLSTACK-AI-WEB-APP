# KariyerAI — Yerel AI Kariyer Kocu

Profesyonel, **ucretsiz** ve **%100 yerel** kariyer kocu.

- PDF / TXT / MD + metin CV ve is ilani
- **ATS skoru** (aninda, LLM beklemez) + kelime etiketleri
- **Demo veri** (tek tik test)
- RAG (ChromaDB + `nomic-embed-text`)
- Gap, roadmap, CV, **motivasyon mektubu**, **LinkedIn**, mulakat
- **Tam rapor** + Markdown / HTML export (HTML - PDF yazdir)
- Sohbet hafizasi + onerilen sorular + yerel oturum kaydi
- Otomatik model secimi - **API key yok** — [Ollama](https://ollama.com)

> Vercel sayfasi yalnizca bilgilendirmedir. Asil uygulama bilgisayarinizda calisir.

---

## Windows — en kolay kurulum (onerilen)

### 0) Onkosullar (bir kez)

1. **Python 3.10–3.12** — https://www.python.org/downloads/
   - Kurulumda **Add python.exe to PATH** isaretleyin
2. **Ollama** — https://ollama.com/download
   - Kurulumdan sonra Ollama'yi acik birakin

### 1) Projeyi indir

```text
git clone https://github.com/Dpehect/CarieerAi-FULLSTACK-AI-WEB-APP.git
cd CarieerAi-FULLSTACK-AI-WEB-APP
```

veya ZIP indirip klasoru acin.

### 2) Tek tik kurulum

Klasorde **`setup.bat`** dosyasina **cift tiklayin**.

Bu script:

- sanal ortam (`.venv`) olusturur
- paketleri kurar
- `nomic-embed-text` + `llama3.1:8b` modellerini ceker (yoksa)

### 3) Tek tik calistir

**`start.bat`** dosyasina cift tiklayin.

Tarayici: **http://localhost:8501**

---

## Manuel kurulum

```powershell
cd C:\Users\USER\Desktop\tries\aicoach
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
ollama pull nomic-embed-text
ollama pull llama3.1:8b
streamlit run main.py
```

---

## Proje yapisi

```text
aicoach/
├── setup.bat / start.bat  # Tek tik kurulum ve calistir
├── main.py                # Streamlit UI
├── config.py              # Merkezi ayarlar
├── sample_data.py         # Demo CV / ilan
├── ats_scorer.py          # Yerel ATS
├── report_export.py       # MD / HTML
├── prompts.py · llm_handler.py · rag_engine.py · document_processor.py
├── .streamlit/config.toml # Tema
├── public/ · vercel.json  # Statik landing
└── requirements.txt
```

---

## Uygulama kullanimi

1. Sol menu — **Baglantiyi kontrol et**
2. **CV indeksle** + **Ilan indeksle**
3. **ATS** — aninda skor
4. Analiz / Gap / Roadmap / CV / Mulakat
5. **Tam rapor** — MD veya HTML indir
6. HTML'i tarayicida ac — **Ctrl+P** — PDF olarak kaydet

---

## Maliyet

| Bilesen | Ucret |
|--------|--------|
| Ollama + modeller | Ucretsiz |
| Streamlit / ChromaDB | Ucretsiz |
| API key | Yok |
| Vercel landing | Ucretsiz (statik) |

---

## Vercel

Bu repo Vercel'de **statik bilgilendirme** yayinlar.
Streamlit + Ollama **Vercel serverless'da calismaz**.

---

## Sorun giderme

| Sorun | Cozum |
|-------|--------|
| `setup.bat` Python bulamiyor | Python'u PATH ile kur, yeni terminal |
| Ollama baglanti yok | Ollama uygulamasini ac |
| Model yok | `ollama pull llama3.1:8b` |
| Embedding hata | `ollama pull nomic-embed-text` |
| PDF metin yok | Metin yapistir |
| Yavas cevap | 8B model, diger programlari kapat |

---

## Lisans / not

Egitim ve kisisel kullanim. Tavsiyeler bilgilendirme amaclidir.

**Kurulum:** `setup.bat` — **Calistir:** `start.bat` — http://localhost:8501
