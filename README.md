# Pathora - Local AI Career Intelligence and ATS System

## Proje Vizyonu ve Kapsamı
Pathora, açık kaynaklı dil modelleri (LLM) ve vektör veritabanı teknolojileri mimarisi üzerine inşa edilmiş, tam yerel çalışan, kapalı devre bir İnsan Kaynakları zekası ve Aday Takip Sistemi (ATS) platformudur. Proje, adayların özgeçmiş verilerini ve iş ilanı metinlerini Doğal Dil İşleme (NLP) yöntemleriyle analiz ederek yetenek eşleştirmesi yapar, yetenek boşluklarını (skill gap) belirler ve adaya özel gelişim rotaları (roadmap) oluşturur. Sistem, veri gizliliği (KVKK/GDPR uyumluluğu) esas alınarak bulut API'lerinden bağımsız çalışacak şekilde tasarlanmıştır.

## Mimari ve Teknoloji Yığını (Tech Stack)

### Yapay Zeka ve Veri Katmanı
* Çıkarımsal Dil Modeli (LLM): Llama 3.1 (8B) - Yerel (on-premise) metin üretimi ve anlamsal çıkarım.
* Gömme (Embedding) Modeli: Nomic-Embed-Text - Metin verilerinin yüksek boyutlu vektörel temsili.
* Vektör Veritabanı: ChromaDB - RAG (Retrieval-Augmented Generation) mimarisi altyapısında hızlı anlamsal arama (semantic search) entegrasyonu.
* Model Yönetim Arayüzü: Ollama - Büyük dil modellerinin yerel ortamda izolasyonu ve yönetimi.

### Backend ve Mantıksal İşlemler
* Programlama Dili: Python (3.10 - 3.12)
* Belge Ayrıştırma (Parsing): PyMuPDF - Yapılandırılmamış PDF formatındaki özgeçmişlerin veri çıkarımı.
* Veri İşleme: LangChain Text Splitters - RAG mimarisi için bağlam penceresini optimize eden metin bölümleme (chunking).
* Veri Doğrulama ve Modelleme: Pydantic.

### Frontend ve Sunum Katmanı
* Analitik Arayüz: Streamlit - Python tabanlı, reaktif ve veri odaklı web arayüzü sunumu.
* Tanıtım Sayfası (Landing Page): React, TypeScript, Tailwind CSS, Framer Motion, React Three Fiber (R3F) kullanılarak tasarlanmış modern, WebGL destekli interaktif mimari (Vercel üzerinde barındırılmaktadır).

## Sistem Kapasitesi ve Temel Özellikler

1. Otonom ATS (Applicant Tracking System) Simülasyonu
Aday profili ile iş ilanının teknik ve yapısal eşleşmesini milisaniyeler içinde hesaplayan algoritmik skorlama motoru. Model gecikmesine (latency) maruz kalmadan anlık anahtar kelime yoğunluğu ve alaka düzeyi hesaplaması gerçekleştirilir.

2. RAG Tabanlı Bağlamsal Analiz
Kullanıcı verileri vektörel parçalara (embeddings) ayrıştırılarak ChromaDB'de indekslenir. Kullanıcı sorgularında (prompting), sadece veritabanındaki en alakalı metin kesitleri (context) modele beslenerek halüsinasyon riski (AI hallucination) minimize edilir. Bu yöntem uzun özgeçmişlerde dahi yüksek tutarlılık sağlar.

3. Güvenlik ve Uyumluluk Odaklı (Privacy-First) Yapı
Hiçbir harici bulut servisine (OpenAI, Anthropic vb.) API çağrısı yapılmaz. Bütün süreç istemci donanımında (Edge Computing mantığı ile) çözümlenir, böylece aday kişisel verilerinin sızma riski ortadan kaldırılır.

4. İleri Düzey Kariyer Zekası Raporlaması
Uygulama, ham verilerden katma değerli ve eyleme geçirilebilir (actionable) raporlar derler:
* Teknik Yetenek Boşluğu Analizi (Skill Gap Analysis)
* Çok Yönlü Kariyer Gelişim Planlaması (Roadmapping)
* Rol ve İlana Özelleştirilmiş Motivasyon Mektubu (Cover Letter) Üretimi
* Adayın CV'si ile İş İlanı Çaprazlanarak Oluşturulan Davranışsal Mülakat Soruları (Behavioral Interview Prep)
* HTML ve Markdown formatlarında yapılandırılmış çıktı dışa aktarımı.

## Geliştirme Ortamı ve Kurulum Talimatları

Sistem, platform bağımsız (cross-platform) çalışacak şekilde izole edilmiştir. Windows ortamı için sıfır yapılandırma (zero-config) prensibiyle çalışan batch komut dosyaları hazırlanmıştır.

### Ön Koşullar
* Python 3.10 - 3.12 arası sürüm kurulumu ve PATH çevre değişkenine eklenmiş olması.
* Ollama yerel sunucusunun aktif çalışır durumda olması.

### Kurulum (Tam Otomatik)
Sanal çalışma ortamının (venv) oluşturulması, kütüphane bağımlılıklarının çözülmesi ve gerekli LLM modellerinin sisteme indirilmesi için projenin kök dizininde bulunan kurulum betiği çalıştırılmalıdır:

```cmd
setup.bat
```

### Uygulamayı Başlatma
Hazırlık süreçleri tamamlandıktan sonra lokal web sunucusunu ayağa kaldırmak için:

```cmd
start.bat
```

Sunucu, standart yapılandırmada http://localhost:8501 adresi üzerinden dinlemeye başlar.

## İnsan Kaynakları (İK) ve İşe Alım Ekipleri İçin Stratejik Değeri

Pathora, modern yetenek kazanımı (Talent Acquisition) süreçlerinin verimliliğini maksimize etmek üzere tasarlanmıştır:
* İşe Alım Süresi (Time-to-Fill / Time-to-Hire) Optimizasyonu: Yüksek hacimli başvurularda manuel ön eleme sürecini dakikalardan saniyelere indirger.
* Analitik Karar Verme (Data-Driven Decision Making): Adayları tarafsız, tutarlı ve salt yetkinlik bazlı metriklerle değerlendirerek ön yargıları (unconscious bias) en aza indirir.
* Aday Deneyimi (Candidate Experience): Reddedilen adaylara bile detaylı teknik gelişim geri bildirimleri sunabilme kapasitesi ile işveren markası (Employer Branding) değerini güçlendirir.
* Güvenlik Uyumlu İnovasyon: Kurumsal verilerin dış sunuculara iletilmemesi prensibi, KVKK ve GDPR süreçlerinde hukuki bir bariyer oluşturmadan yapay zeka entegrasyonuna olanak tanır.
