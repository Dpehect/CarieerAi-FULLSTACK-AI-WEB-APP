"""
KariyerAI - Prompt Şablonları
Tüm sistem promptları ve kullanıcı prompt şablonları burada toplanır.
LLM'e gönderilen her metin Türkçe ve net talimatlar içerir.
"""

# ---------------------------------------------------------------------------
# Sistem promptu: AI'ın kimliği ve davranış kuralları
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """Sen KariyerAI'sın — profesyonel, samimi ve dürüst bir kariyer koçusun.

Görevin:
- Adayın CV'sini ve hedef iş ilanını derinlemesine analiz etmek
- Beceri boşluklarını (gap analysis) net ve öncelikli şekilde göstermek
- Gerçekçi, adım adım kariyer yol haritası (roadmap) önermek
- CV iyileştirme, mülakat ve iş arama konularında somut tavsiyeler vermek

Kuralların:
1. Her zaman Türkçe yanıt ver (kullanıcı İngilizce isterse İngilizce de olur).
2. Somut ol: genel laflar yerine örnek cümleler, madde listeleri, öncelik sıraları ver.
3. Dürüst ol: zayıf yönleri yumuşatmadan ama yapıcı şekilde söyle.
4. Veriye dayan: elindeki CV ve iş ilanı metinlerine referans ver.
5. Uzun cevaplarda başlıklar (##), madde işaretleri ve tablolar kullan.
6. Uydurma: bilmediğin şirket/maaş/istatistik uydurma; emin değilsen belirt.
7. Motivasyon ver ama abartma; gerçekçi hedefler koy.
"""

# ---------------------------------------------------------------------------
# CV + İş ilanı ile genel kariyer analizi
# ---------------------------------------------------------------------------
CAREER_ANALYSIS_PROMPT = """Aşağıda adayın CV metni ve hedef iş ilanı metni var.
Bu iki belgeyi karşılaştırarak kapsamlı bir **kariyer analizi** yaz.

## CV METNİ
{cv_text}

## İŞ İLANI METNİ
{job_text}

## RAG BAĞLAMI (ilgili parçalar)
{context}

Lütfen şu bölümleri sırayla doldur:

### 1. Genel Uyum Özeti
- Uyum skoru (0-100) ve kısa gerekçe
- 3 güçlü yön
- 3 risk / zayıf yön

### 2. Deneyim Eşleşmesi
- İş ilanındaki sorumluluklarla CV deneyimlerinin eşleşmesi
- Eksik veya zayıf görünen deneyim alanları

### 3. Teknik ve Soft Skill Değerlendirmesi
- Eşleşen beceriler
- Eksik ama kritik beceriler

### 4. CV'de Öne Çıkarılması Gerekenler
- Hangileri vurgulanmalı, nasıl yazılmalı (örnek cümlelerle)

### 5. Sonuç ve İlk 3 Aksiyon
- Adayın hemen yapabileceği 3 somut adım
"""

# ---------------------------------------------------------------------------
# Gap (beceri boşluğu) analizi
# ---------------------------------------------------------------------------
GAP_ANALYSIS_PROMPT = """Adayın CV'si ile hedef iş ilanını karşılaştırarak detaylı **Gap Analizi** yap.

## CV METNİ
{cv_text}

## İŞ İLANI METNİ
{job_text}

## RAG BAĞLAMI
{context}

Çıktı formatı (mutlaka bu yapıda):

### Gap Analizi Tablosu
Her satır için: | Beceri / Gereksinim | İş İlanı Önemi | CV'de Durum | Gap Seviyesi | Öncelik |

Gap Seviyesi: Yok / Düşük / Orta / Yüksek
Öncelik: P0 (kritik) / P1 (önemli) / P2 (nice-to-have)

### Kritik Gap'ler (P0)
- Her biri için: ne eksik, neden önemli, nasıl kapatılır (1-2 cümle)

### Orta Seviye Gap'ler (P1)
- Kısa liste

### Güçlü Eşleşmeler
- İşe alımda artı puan getirecek eşleşmeler

### Özet Skor Kartı
- Teknik uyum: X/10
- Deneyim uyumu: X/10
- Soft skill / kültür ipuçları: X/10
- Genel hazırlık: X/10
"""

# ---------------------------------------------------------------------------
# Kariyer yol haritası (roadmap)
# ---------------------------------------------------------------------------
ROADMAP_PROMPT = """Adayın mevcut profili ve hedef işi için **3-6-12 aylık kariyer yol haritası** oluştur.

## CV METNİ
{cv_text}

## İŞ İLANI METNİ
{job_text}

## RAG BAĞLAMI
{context}

## Ek not (varsa)
{extra_notes}

Yol haritası şu yapıda olsun:

### Hedef Rol Tanımı
- Hedef unvan, seviye, ana yetkinlikler

### 0-30 Gün (Hızlı Kazanımlar)
- Haftalık checklist (somut görevler)
- CV / LinkedIn güncellemeleri
- Hızlı öğrenilebilecek skill'ler

### 1-3 Ay
- Öğrenme planı (kurs, proje, sertifika önerileri — gerçekçi isimler)
- Portföy / GitHub / proje fikirleri
- Network ve başvuru stratejisi

### 3-6 Ay
- Orta vadeli yetkinlik hedefleri
- Deneyim biriktirme yolları (freelance, open source, yan proje)

### 6-12 Ay
- Uzun vadeli hedefe geçiş
- Maaş / seviye beklentisi için hazırlık
- Alternatif plan B (benzer roller)

### Haftalık Rutin Önerisi
- Çalışma saati dağılımı örneği

### Başarı Ölçütleri (KPI)
- Her dönem için ölçülebilir 3-5 metrik
"""

# ---------------------------------------------------------------------------
# Serbest sohbet (chat) — RAG bağlamlı
# ---------------------------------------------------------------------------
CHAT_PROMPT = """Kullanıcı sorusu: {question}

## Konuşma geçmişi (özet / son mesajlar)
{chat_history}

## İlgili belge parçaları (RAG)
{context}

## CV özeti (varsa)
{cv_summary}

## İş ilanı özeti (varsa)
{job_summary}

Yukarıdaki bağlamı kullanarak kariyer koçu olarak net, uygulanabilir ve samimi bir yanıt ver.
Belge yoksa genel kariyer bilgine dayan; belgeler varsa mutlaka onlara atıf yap.
"""

# ---------------------------------------------------------------------------
# CV iyileştirme önerileri
# ---------------------------------------------------------------------------
CV_IMPROVE_PROMPT = """Aşağıdaki CV'yi hedef iş ilanına göre optimize et.

## CV METNİ
{cv_text}

## İŞ İLANI METNİ
{job_text}

## RAG BAĞLAMI
{context}

Şunları üret:

### 1. Profesyonel Özet (2-3 cümle) — yeni versiyon
### 2. Anahtar kelime listesi (ilan + ATS uyumu)
### 3. Deneyim maddeleri için yeniden yazım örnekleri (en az 3 madde: Eski → Yeni)
### 4. Eksik bölüm önerileri (projeler, sertifikalar, beceriler)
### 5. Kaçınılması gereken hatalar
### 6. Son kontrol listesi (başvuru öncesi 10 madde)
"""

# ---------------------------------------------------------------------------
# Mülakat hazırlığı
# ---------------------------------------------------------------------------
INTERVIEW_PREP_PROMPT = """Bu aday ve iş ilanı için mülakat hazırlık paketi oluştur.

## CV METNİ
{cv_text}

## İŞ İLANI METNİ
{job_text}

## RAG BAĞLAMI
{context}

İçerik:

### 1. Beklenen teknik sorular (8-10) + kısa cevap iskeleti
### 2. Davranışsal sorular (STAR formatı ipuçlarıyla) — 5 soru
### 3. Adayın sorması gereken sorular (işe alım uzmanına) — 6 soru
### 4. Zayıf noktalar için hazır cevap stratejileri
### 5. 60 saniyelik "kendini tanıt" metni (Türkçe)
"""

# ---------------------------------------------------------------------------
# Kısa özet üretici (memory / sidebar için)
# ---------------------------------------------------------------------------
SUMMARY_PROMPT = """Aşağıdaki metni 3-5 cümlede özetle. Sadece özeti yaz, başka bir şey ekleme.

METİN:
{text}
"""


def build_prompt(template: str, **kwargs) -> str:
    """
    Şablondaki {placeholder} alanlarını doldurur.
    Eksik anahtarlar boş string ile değiştirilir (KeyError olmaz).
    """
    safe = {k: (v if v is not None else "") for k, v in kwargs.items()}
    # Şablonda olup kwargs'ta olmayanlar için boş string
    class _SafeDict(dict):
        def __missing__(self, key):
            return ""

    return template.format_map(_SafeDict(**safe))
