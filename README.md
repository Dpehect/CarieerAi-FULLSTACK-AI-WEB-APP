# 🎯 KariyerAI — Yerel AI Kariyer Koçu

Profesyonel, **ücretsiz** ve **%100 yerel** kariyer koçu.

- PDF / TXT / MD + metin CV & iş ilanı  
- **ATS skoru** (anında, LLM beklemez) + renkli kelime etiketleri  
- **Demo veri** (tek tık test)  
- RAG (ChromaDB + `nomic-embed-text`)  
- Gap, roadmap, CV, **motivasyon mektubu**, **LinkedIn**, mülakat  
- **Tam rapor** + Markdown / HTML export (HTML → PDF yazdır)  
- Sohbet hafızası + önerilen sorular + yerel oturum kaydı  
- Otomatik model seçimi · **API key yok** — [Ollama](https://ollama.com)

> Vercel sayfası yalnızca bilgilendirmedir. Asıl app bilgisayarınızda çalışır.

---

## ⚡ Windows — en kolay kurulum (önerilen)

### 0) Önkoşullar (bir kez)

1. **Python 3.10–3.12** → https://www.python.org/downloads/  
   - Kurulumda **Add python.exe to PATH** işaretleyin  
2. **Ollama** → https://ollama.com/download  
   - Kurulumdan sonra Ollama’yı açık bırakın  

### 1) Projeyi indir

```text
git clone https://github.com/Dpehect/CarieerAi-FULLSTACK-AI-WEB-APP.git
cd CarieerAi-FULLSTACK-AI-WEB-APP
```

veya ZIP indirip klasörü açın.

### 2) Tek tık kurulum

Klasörde **`setup.bat`** dosyasına **çift tıklayın**.

Bu script:

- sanal ortam (`.venv`) oluşturur  
- paketleri kurar  
- `nomic-embed-text` + `llama3.1:8b` modellerini çeker (yoksa)  

### 3) Tek tık çalıştır

**`start.bat`** dosyasına çift tıklayın.

Tarayıcı: **http://localhost:8501**

---

## 🖥️ Manuel kurulum (isterseniz)

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

## 📁 Proje yapısı

```text
aicoach/
├── setup.bat / start.bat  # Tek tık kurulum & çalıştır
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

## 🧭 Uygulama kullanımı

1. Sol menü → **Bağlantıyı kontrol et**  
2. **CV indeksle** + **İlan indeksle**  
3. **ATS** → anında skor  
4. Analiz / Gap / Roadmap / CV / Mülakat  
5. **Tam rapor** → MD veya HTML indir  
6. HTML’i tarayıcıda aç → **Ctrl+P** → PDF olarak kaydet  

---

## 💰 Maliyet

| Bileşen | Ücret |
|--------|--------|
| Ollama + modeller | Ücretsiz |
| Streamlit / ChromaDB | Ücretsiz |
| API key | Yok |
| Vercel landing | Ücretsiz (statik) |

---

## ⚠️ Vercel

Bu repo Vercel’de **statik bilgilendirme** yayınlar.  
Streamlit + Ollama **Vercel serverless’da çalışmaz**.

---

## 🛠️ Sorun giderme

| Sorun | Çözüm |
|-------|--------|
| `setup.bat` Python bulamıyor | Python’u PATH ile kur, yeni terminal |
| Ollama bağlantı yok | Ollama uygulamasını aç |
| Model yok | `ollama pull llama3.1:8b` |
| Embedding hata | `ollama pull nomic-embed-text` |
| PDF metin yok | Metin yapıştır |
| Yavaş cevap | 8B model, diğer programları kapat |

---

## Lisans / not

Eğitim ve kişisel kullanım. Tavsiyeler bilgilendirme amaçlıdır.

**Kurulum:** `setup.bat` → **Çalıştır:** `start.bat` → http://localhost:8501 🚀
