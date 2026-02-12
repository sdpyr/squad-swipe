# SQUAD

SQUAD, arkadaş grupları için mobil-öncelikli bir karar + eğlence PWA MVP'sidir.
Akış: **Lobby -> Decide -> Final Vote (gerekirse) -> Wheel -> Share**.

Bu kılavuz özellikle **online preview** (PR başına test URL) ve **production deploy** için hazırlanmıştır.

---

## 1) Gereksinimler

- Node.js 20+
- npm 10+
- Firebase hesabı
- Vercel hesabı (önerilen deploy platformu)
- GitHub/GitLab/Bitbucket repo bağlantısı

---

## 2) Firebase kurulumu (zorunlu)

Uygulama Firestore'a gerçek zamanlı bağlandığı için önce Firebase kurulmalıdır.

### 2.1 Firebase proje oluştur

1. Firebase Console'a gir: https://console.firebase.google.com
2. **Add project** ile yeni proje aç.
3. Proje içinde **Build > Firestore Database** bölümünden veritabanı oluştur.
   - MVP için başlangıçta *test mode* kullanılabilir.
   - Üretime çıkmadan önce güvenlik kuralları sıkılaştırılmalıdır.

### 2.2 Web app ekle ve config al

1. Firebase proje ayarlarına gir.
2. **Your apps > Web app (</>)** ile uygulama ekle.
3. Verilen config değerlerini not al:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

### 2.3 Ortam değişkenleri

Repo kökünde `.env.local` dosyası oluştur ve `.env.local.example` içeriğini doldur:

```bash
cp .env.local.example .env.local
```

`.env.local` içine gerçek Firebase değerlerini yaz.

---

## 3) Lokal geliştirme (hızlı doğrulama)

```bash
npm install
npm run dev
```

Ardından: `http://localhost:3000`

Önerilen hızlı smoke testi:

1. Nickname ile room oluştur
2. İkinci tarayıcı/sekmede aynı room'a katıl
3. Decide aşamasında oy ver
4. Match olmazsa final vote ekranının geldiğini doğrula
5. Wheel spin sonrası Share ekranında image indirme/paylaşmayı dene

---

## 4) Online Preview (PR başına otomatik URL) - Vercel

Bu bölümde amaç: her PR açıldığında otomatik bir preview URL almak.

### 4.1 Repo'yu Vercel'e bağla

1. https://vercel.com/new adresinden import yap.
2. Git sağlayıcını seç, `squad-swipe` repo'yu bağla.
3. Framework: **Next.js** (genelde otomatik algılanır).

### 4.2 Build ayarları

- Build Command: `npm run build`
- Output: Next.js default
- Install Command: `npm install`

### 4.3 Vercel Environment Variables ekle

Vercel Project Settings > Environment Variables altında şunları ekle:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

**Önemli:** Preview ve Production ortamları için aynı veya farklı Firebase projesi kullanabilirsin:

- **Öneri:**
  - Preview için ayrı Firebase projesi
  - Production için ayrı Firebase projesi

Böylece test verisi canlı veriyi kirletmez.

### 4.4 Preview deploy akışı

- Feature branch'e push yap
- PR aç
- Vercel otomatik preview deploy oluşturur
- PR üzerinde preview URL görünür

---

## 5) Production Deploy - Vercel

### 5.1 Ana branch stratejisi

- `main` branch'ine merge edilen her commit production deploy tetiklesin.
- Branch protection ile PR review zorunlu tutulması önerilir.

### 5.2 Production env kontrol listesi

Deploy öncesi:

- [ ] Production Firebase env değişkenleri girildi
- [ ] Firestore kuralları gözden geçirildi
- [ ] Preview ortamında temel akış test edildi
- [ ] `npm run build` hatasız

### 5.3 Go-live

- PR merge et (`main`)
- Vercel production deploy tamamlanınca canlı URL aç
- Canlı smoke testi yap (room create/join, decide, final vote, wheel, share)

---

## 6) Firestore güvenlik notu (MVP -> Production)

MVP sırasında test mode hızlıdır ama üretim için risklidir.

Minimum öneri:

1. Firestore Rules ile sadece beklenen alanlara yazımı sınırla
2. İstismar riskini azaltmak için rate limit stratejisi düşün
3. Mümkünse Firebase Anonymous Auth ekleyerek kimliği doğrulanmış istemci zorunlu yap

> Bu repo nickname tabanlı MVP yaklaşımı kullanır; production'da auth/rules sıkılaştırması kritik.

---

## 7) PWA doğrulama

Projede manifest ve metadata tanımlıdır. Deploy sonrası:

1. Chrome DevTools > Application > Manifest bölümünü kontrol et
2. Home screen'e ekleme davranışını mobilde doğrula
3. Tema rengi/ikon görünümünü test et

---

## 8) Sık karşılaşılan sorunlar

### 8.1 `Missing Firebase env var`

- Vercel veya lokal `.env.local` değişkenlerinden biri eksik.
- Tüm `NEXT_PUBLIC_FIREBASE_*` değişkenlerini tekrar kontrol et.

### 8.2 Preview açılıyor ama Firestore çalışmıyor

- Yanlış Firebase project ID
- Firestore henüz enable edilmemiş
- Firestore rules yazmaya izin vermiyor

### 8.3 npm install 403/registry hatası

- Kurum ağı / özel registry policy kaynaklı olabilir.
- CI/CD ortamında erişilebilir npm mirror veya izinli registry kullan.

---

## 9) Önerilen release checklist

- [ ] Preview deploy linki üzerinden uçtan uca akış test edildi
- [ ] En az 2 kullanıcıyla eşzamanlı oylama test edildi
- [ ] Final vote fallback beklendiği gibi çalıştı
- [ ] Share image indirildi/paylaşıldı
- [ ] Firestore'da `events` kayıtları oluştu
- [ ] Production env değişkenleri doğrulandı
- [ ] Merge sonrası production health check yapıldı

---

## 10) Komut özeti

```bash
npm install
npm run dev
npm run build
npm run start
```

