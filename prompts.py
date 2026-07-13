"""
KariyerAI — Prompt şablonları
Kısa, yapılandırılmış, token-dostu. Çıktı formatı sabit (parse/okuma kolay).
"""

SYSTEM_PROMPT = """Sen KariyerAI: dürüst, somut, Türkçe kariyer koçu.
Kurallar: uydurma yok; CV/ilan metnine dayan; madde/tablo kullan; abartma.
Cevapları gereksiz giriş cümlesi olmadan doğrudan başlıklarla ver."""

# Ortak belgeler — kısa yer tutucular
_DOCS = """## CV
{cv_text}

## İLAN
{job_text}

## RAG
{context}
"""

CAREER_ANALYSIS_PROMPT = _DOCS + """
## Görev: Kariyer uyum analizi (özlü)
Şu yapıda yaz (fazla uzatma):
### Uyum skoru: N/100 — 1 cümle gerekçe
### 3 güçlü yön
### 3 risk
### Deneyim eşleşmesi (madde)
### Skill: eşleşen | eksik-kritik
### CV'de vurgula (2 örnek cümle)
### İlk 3 aksiyon (bugün/bu hafta)
"""

GAP_ANALYSIS_PROMPT = _DOCS + """
## Görev: Gap analizi
### Tablo (markdown): | Gereksinim | Önem | CV | Gap | Öncelik |
Önem: Zorunlu/Tercih · Gap: Yok/Düşük/Orta/Yüksek · Öncelik: P0/P1/P2
### P0 kritik gap'ler (nasıl kapatılır, 1 cümle)
### Güçlü eşleşmeler
### Skor kartı: Teknik/Deneyim/Soft /10
"""

ROADMAP_PROMPT = _DOCS + """
## Ek: {extra_notes}
## Görev: 3-6-12 ay yol haritası (somut checklist)
### Hedef rol
### 0-30 gün
### 1-3 ay
### 3-6 ay
### 6-12 ay
### Haftalık rutin (saat)
### KPI (ölçülebilir 4 madde)
"""

CV_IMPROVE_PROMPT = _DOCS + """
## Görev: CV iyileştirme (ilan odaklı)
### Profesyonel özet (2-3 cümle, yeni)
### ATS anahtar kelimeler (10-15)
### 3 deneyim maddesi: Eski → Yeni (etki odaklı)
### Eksik bölümler
### Kaçınılacaklar
### Başvuru öncesi checklist (8 madde)
"""

INTERVIEW_PREP_PROMPT = _DOCS + """
## Görev: Mülakat paketi
### 8 teknik soru + 1 satır cevap iskeleti
### 5 davranışsal (STAR ipucu)
### Adayın soracağı 5 soru
### Zayıf nokta cevap stratejisi
### 60 sn kendini tanıt metni
"""

ATS_LLM_PROMPT = _DOCS + """
## Yerel ATS ön-skor: {ats_local_score}/100
## Anahtar kelime özeti: {ats_summary}
## Görev: Kısa ATS yorumu (token tasarruflu)
### ATS skoru (senin notun 0-100) + gerekçe
### Kaçan kritik kelimeler (max 10)
### Format/ATS riskleri
### 5 hızlı düzeltme
"""

FULL_REPORT_PROMPT = _DOCS + """
## Yerel ATS: {ats_local_score}/100 · {ats_summary}
## Görev: Tek seferlik yönetici özeti raporu
### 1) Yönetici özeti (5 cümle)
### 2) Uyum skoru + ATS skoru
### 3) Kritik gap'ler (P0, max 5)
### 4) CV aksiyonları (max 5)
### 5) 30 günlük plan (haftalık)
### 6) Mülakat: 3 olası soru
Uzun paragraf yazma; madde tercih et.
"""

CHAT_PROMPT = """Soru: {question}
Geçmiş: {chat_history}
RAG: {context}
CV özet: {cv_summary}
İlan özet: {job_summary}
Kariyer koçu olarak net, uygulanabilir yanıt ver. Belgeler varsa atıf yap."""

COVER_LETTER_PROMPT = _DOCS + """
## Görev: Türkçe motivasyon mektubu (ilan odaklı)
### Versiyon A — kısa (180-220 kelime)
### Versiyon B — standart (280-350 kelime)
Kurallar: uydurma deneyim yok; CV'deki gerçeklere dayan; abartma; somut 1-2 başarı.
Son: nazik kapanış + görüşme isteği. İmza: [Ad Soyad]
"""

LINKEDIN_PROMPT = _DOCS + """
## Görev: LinkedIn profil metinleri (ilan hedefine göre)
### Headline (max 220 karakter, TR)
### About (3 kısa paragraf)
### Featured skills (10 madde, öncelik sırası)
### Open-to-work notu (1 cümle, profesyonel)
Uydurma unvan/şirket yok.
"""

SUMMARY_PROMPT = """3-4 cümlede özetle, başka bir şey yazma:\n{text}"""


def build_prompt(template: str, **kwargs) -> str:
    """Eksik anahtarlar boş string; KeyError yok."""

    class _Safe(dict):
        def __missing__(self, key):
            return ""

    return template.format_map(_Safe(**{k: (v if v is not None else "") for k, v in kwargs.items()}))
