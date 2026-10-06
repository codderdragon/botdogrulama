# 🐉 CodderDragon Bot Doğrulama

Discord bot uygulaması için gerekli tüm endpoint'leri içeren sunucu.

## 📁 Dosya Yapısı

```
botdogrulama/
├── server.js               # Ana sunucu (tüm endpoint'ler)
├── register-metadata.js    # Bağlı rol metadata kaydı (1 kez çalıştır)
├── package.json
├── .env.example            # Ortam değişkenleri şablonu
├── .gitignore
└── public/
    ├── index.html          # Ana sayfa
    ├── terms.html          # Hizmet Koşulları
    └── privacy.html        # Gizlilik Politikası
```

## 🔗 Endpoint'ler

| Endpoint | URL | Açıklama |
|----------|-----|----------|
| **Etkileşim Bitiş Noktası** | `/interactions` | Discord etkileşimlerini HTTP POST ile alır |
| **Bağlı Roller Doğrulama** | `/linked-role` | OAuth2 ile bağlı rol doğrulaması |
| **Hizmet Koşulları** | `/terms` | Hizmet koşulları sayfası |
| **Gizlilik Politikası** | `/privacy` | Gizlilik politikası sayfası |

## 🚀 Kurulum

### 1. Bağımlılıkları yükle
```bash
npm install
```

### 2. `.env` dosyasını oluştur
```bash
cp .env.example .env
```
`.env` dosyasını düzenle ve Discord uygulama bilgilerini gir.

### 3. Sunucuyu başlat
```bash
npm start
```

### 4. Bağlı Rol Metadata Kaydı (1 kez)
```bash
node register-metadata.js
```

## ☁️ Deploy (Yayınlama)

### Railway ile Deploy
1. [railway.app](https://railway.app) adresine git
2. GitHub repo'nu bağla
3. `.env` değişkenlerini Railway'de ayarla
4. Deploy et → otomatik URL alırsın

### Render ile Deploy
1. [render.com](https://render.com) adresine git
2. "New Web Service" → GitHub repo'nu seç
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Ortam değişkenlerini ekle

### Vercel ile Deploy
1. `vercel.json` dosyası oluştur
2. `vercel deploy` komutunu çalıştır

## ⚙️ Discord Developer Portal Ayarları

Deploy ettikten sonra aldığın URL'yi Discord Developer Portal'da şu alanlara yaz:

| Alan | URL |
|------|-----|
| **Interactions Endpoint URL** | `https://senin-domain.com/interactions` |
| **Linked Roles Verification URL** | `https://senin-domain.com/linked-role` |
| **Terms of Service URL** | `https://senin-domain.com/terms` |
| **Privacy Policy URL** | `https://senin-domain.com/privacy` |

## 📝 Lisans

© 2026 CodderDragon. Tüm hakları saklıdır.
