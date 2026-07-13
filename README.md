# 🎯 KariyerAI — Yerel AI Kariyer Koçu

**KariyerAI**, bilgisayarınızda %100 yerel çalışan profesyonel bir AI kariyer koçudur.

- PDF CV ve iş ilanı yükleme  
- ChromaDB + `nomic-embed-text` ile RAG  
- Kariyer analizi, gap analizi, roadmap, CV iyileştirme, mülakat hazırlığı  
- Streamlit arayüzü + sohbet hafızası  
- **API key yok** — sadece [Ollama](https://ollama.com)

---

## 📁 Proje Yapısı

```
aicoach/
├── main.py                 # Streamlit arayüzü (başlangıç noktası)
├── prompts.py              # Tüm LLM prompt şablonları
├── document_processor.py   # PDF okuma, temizleme, chunking
├── rag_engine.py           # ChromaDB + embedding + arama
├── llm_handler.py          # Ollama LLM + memory + analizler
├── requirements.txt        # Python bağımlılıkları
├── README.md               # Bu dosya
└── data/
    └── chroma_db/          # (otomatik oluşur) vektör veritabanı
```

---

## 🧰 Gereksinimler (donanım / yazılım)

| Bileşen | Öneri |
|--------|--------|
| İşletim sistemi | Windows 10/11, macOS veya Linux |
| Python | **3.10, 3.11 veya 3.12** (3.13 bazen paket sorunlu olabilir) |
| RAM | En az **16 GB** (8B model için); 14B için **32 GB** ideal |
| Disk | Modeller için ~5–10 GB boş alan |
| GPU | Zorunlu değil; NVIDIA GPU varsa Ollama otomatik hızlanır |
| İnternet | Sadece **ilk kurulumda** (Ollama + model indirme). Sonra offline çalışır. |

---

# 🚀 KURULUM — ADIM ADIM (Windows odaklı)

Aşağıdaki adımları **sırayla**, atlamadan uygulayın.

---

## ADIM 1 — Python kurulumu

1. Tarayıcıdan şu adrese gidin:  
   https://www.python.org/downloads/
2. **Python 3.11** veya **3.12** indirin (önerilen).
3. Kurulum sihirbazında **mutlaka** şunu işaretleyin:  
   ✅ **Add python.exe to PATH**
4. “Install Now” ile kurun.
5. Kurulum bitince **yeni bir PowerShell / Terminal** açın (eski pencere PATH’i görmez).
6. Kontrol edin:

```powershell
python --version
```

Beklenen örnek çıktı:

```
Python 3.11.9
```

`python` bulunamadı diyorsa:

```powershell
py --version
```

Bundan sonra komutlarda `python` yerine `py` kullanabilirsiniz.

**pip kontrolü:**

```powershell
python -m pip --version
```

---

## ADIM 2 — Ollama kurulumu

1. https://ollama.com/download adresine gidin.
2. **Windows** sürümünü indirip kurun.
3. Kurulumdan sonra Ollama arka planda çalışır (sistem tepsisinde ikon).
4. **Yeni PowerShell** açıp kontrol edin:

```powershell
ollama --version
```

### Ollama servisinin açık olduğundan emin olun

- Windows’ta Ollama uygulamasını Start menüsünden açın.
- Veya:

```powershell
ollama serve
```

(Bu pencere açık kalabilir; başka bir PowerShell’de devam edin.)

---

## ADIM 3 — AI modellerini indirin

İki model gerekir:

1. **Chat / analiz modeli** (birini seçin)  
2. **Embedding modeli** (zorunlu: `nomic-embed-text`)

### 3.1 Embedding modeli (zorunlu)

```powershell
ollama pull nomic-embed-text
```

### 3.2 Chat modeli — seçenek A (önerilen, daha az RAM)

```powershell
ollama pull llama3.1:8b
```

### 3.2 Chat modeli — seçenek B (daha güçlü, daha çok RAM)

```powershell
ollama pull qwen2.5:14b
```

İndirme birkaç GB sürebilir. Bittiğini doğrulayın:

```powershell
ollama list
```

Listede `nomic-embed-text` ve seçtiğiniz chat modeli görünmeli.

### Hızlı test (opsiyonel)

```powershell
ollama run llama3.1:8b "Merhaba, bir cümleyle kendini tanıt."
```

Cevap gelirse LLM tarafı hazır demektir. Çıkmak için `/bye` yazın.

---

## ADIM 4 — Proje klasörüne gidin

Proje masaüstünde `tries\aicoach` altındaysa:

```powershell
cd C:\Users\USER\Desktop\tries\aicoach
```

Kendi yolunuz farklıysa ona göre değiştirin.  
Doğrulama:

```powershell
dir
```

Şunları görmelisiniz: `main.py`, `requirements.txt`, `prompts.py`, ...

---

## ADIM 5 — Sanal ortam (virtual environment) oluşturun

Projeyi sistem Python’undan izole etmek için sanal ortam kullanın:

```powershell
python -m venv .venv
```

Sanal ortamı **aktifleştirin**:

```powershell
.\.venv\Scripts\Activate.ps1
```

Başarılı olursa satır başında `(.venv)` görürsünüz.

### PowerShell “execution policy” hatası alırsanız

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Onaylayın (`Y`), sonra tekrar:

```powershell
.\.venv\Scripts\Activate.ps1
```

**CMD** kullanıyorsanız:

```cmd
.venv\Scripts\activate.bat
```

---

## ADIM 6 — Python paketlerini kurun

Sanal ortam **aktifken**:

```powershell
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

Bu işlem birkaç dakika sürebilir (özellikle `chromadb`, `streamlit`).

Hata alırsanız:

1. Python sürümünüzün 3.10–3.12 olduğundan emin olun.  
2. Visual C++ Build Tools gerekebilir (nadiren `chroma` derlemesi için).  
3. Tekrar deneyin:

```powershell
python -m pip install -r requirements.txt --upgrade
```

---

## ADIM 7 — Uygulamayı başlatın

Ollama’nın çalıştığından emin olun, sanal ortam aktifken:

```powershell
streamlit run main.py
```

Otomatik tarayıcı açılır. Açılmazsa adreste şunu deneyin:

```
http://localhost:8501
```

---

# 🖥️ İLK KULLANIM (uygulama içi)

1. Sol menüde **“Bağlantıyı Kontrol Et”** → yeşil ✅ olmalı.  
2. Model listesinden `llama3.1:8b` veya `qwen2.5:14b` seçin.  
3. **CV (PDF)** yükleyin veya metin yapıştırın → **CV'yi İndeksle**.  
4. **İş ilanı** yükleyin veya yapıştırın → **İlanı İndeksle**.  
5. Üst sekmelerden istediğiniz analizi çalıştırın veya **Sohbet** edin.

### İpuçları

- Taranmış (sadece görüntü) PDF’lerde metin çıkmayabilir → metin tabanlı PDF veya kopyala-yapıştır kullanın.  
- İlk embedding / ilk LLM cevabı yavaş olabilir (model RAM’e yüklenir).  
- “DB Temizle” vektör deposunu sıfırlar; “Sohbeti Sil” sadece sohbet geçmişini siler.

---

# 🔁 Sonraki açılışlarda (kısa özet)

Her yeni terminal oturumunda:

```powershell
cd C:\Users\USER\Desktop\tries\aicoach
.\.venv\Scripts\Activate.ps1
streamlit run main.py
```

Ollama’nın arka planda açık olduğundan emin olun.

---

# 🛠️ Sık Karşılaşılan Hatalar

### 1) `ollama is not recognized`

- Ollama kurulu değil veya PATH’e eklenmemiş.  
- Ollama’yı yeniden kurun, bilgisayarı / terminali yeniden başlatın.

### 2) `Connection refused` / Ollama'ya bağlanılamadı

- Ollama uygulamasını açın veya `ollama serve` çalıştırın.  
- Varsayılan adres: `http://localhost:11434`

### 3) Model bulunamadı

```powershell
ollama pull llama3.1:8b
ollama pull nomic-embed-text
```

### 4) Embedding hatası

```powershell
ollama pull nomic-embed-text
ollama list
```

### 5) PDF’den metin çıkmadı

- Dosya taranmış görüntü olabilir.  
- Google Docs / Word’e aktarıp metin PDF kaydedin veya metni yapıştırın.

### 6) Çok yavaş cevap

- 14B model yerine `llama3.1:8b` deneyin.  
- Temperature’ı 0.3–0.4 tutun.  
- Diğer ağır programları kapatın.  
- Mümkünse NVIDIA GPU sürücülerini güncelleyin.

### 7) `ModuleNotFoundError`

Sanal ortam aktif mi kontrol edin; sonra:

```powershell
python -m pip install -r requirements.txt
```

### 8) Port 8501 dolu

```powershell
streamlit run main.py --server.port 8502
```

---

# 🧠 Mimari (kısa)

```
[PDF/Metin] → document_processor (PyMuPDF + chunk)
                    ↓
            rag_engine (nomic-embed-text + ChromaDB)
                    ↓
            llm_handler (Ollama chat + prompts + memory)
                    ↓
              main.py (Streamlit UI)
```

- **prompts.py**: Analiz / sohbet şablonları  
- **document_processor.py**: Metin çıkarma ve parçalama  
- **rag_engine.py**: Vektör indeks + anlamsal arama  
- **llm_handler.py**: Ollama çağrıları, streaming, conversation memory  
- **main.py**: Kullanıcı arayüzü ve orkestrasyon  

Veriler `data/chroma_db/` altında yerelde saklanır; dışarı API çağrısı yapılmaz (Ollama localhost hariç).

---

# 📦 Bağımlılıklar (özet)

- `streamlit` — arayüz  
- `ollama` — yerel LLM / embedding istemcisi  
- `chromadb` — vektör veritabanı  
- `langchain-text-splitters` — metin parçalama  
- `pymupdf` — PDF okuma  

---

# 📜 Lisans / Not

Eğitim ve kişisel kullanım için örnek projedir. Üretilen kariyer tavsiyeleri bilgilendirme amaçlıdır; profesyonel İK danışmanlığı yerine geçmez.

**İyi şanslar — CV’nizi yükleyin ve KariyerAI ile planınızı çıkarın! 🚀**
