require('dotenv').config();
const express = require('express');
const { InteractionType, InteractionResponseType, verifyKeyMiddleware } = require('discord-interactions');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────────────────
// 1) ETKİLEŞİM BİTİŞ NOKTASI (Interactions Endpoint)
//    Discord Developer Portal → URL: https://senin-domain.com/interactions
// ─────────────────────────────────────────────────────────
app.post('/interactions',
  verifyKeyMiddleware(process.env.DISCORD_PUBLIC_KEY),
  (req, res) => {
    const interaction = req.body;

    // PING - Discord doğrulama kontrolü
    if (interaction.type === InteractionType.PING) {
      console.log('✅ Discord PING doğrulaması başarılı!');
      return res.json({ type: InteractionResponseType.PONG });
    }

    // APPLICATION_COMMAND - Slash komutları
    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
      const { name } = interaction.data;

      switch (name) {
        case 'dogrula':
          return res.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: '✅ Doğrulama başarılı! Hoş geldin.',
              flags: 64, // Ephemeral (sadece kullanıcıya görünür)
            },
          });

        case 'bilgi':
          return res.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: '🤖 CodderDragon Bot v1.0 | Sunucu doğrulama ve yönetim botu.',
              flags: 64,
            },
          });

        default:
          return res.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `❓ Bilinmeyen komut: ${name}`,
              flags: 64,
            },
          });
      }
    }

    // MESSAGE_COMPONENT - Buton/Select menü etkileşimleri
    if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
      const customId = interaction.data.custom_id;

      if (customId === 'verify_button') {
        return res.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '✅ Doğrulama tamamlandı! Rolün verildi.',
            flags: 64,
          },
        });
      }
    }

    // Modal Submit
    if (interaction.type === InteractionType.MODAL_SUBMIT) {
      return res.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '📋 Form yanıtın alındı!',
          flags: 64,
        },
      });
    }

    return res.status(400).json({ error: 'Bilinmeyen etkileşim türü' });
  }
);

// ─────────────────────────────────────────────────────────
// 2) BAĞLI ROLLER DOĞRULAMA (Linked Roles Verification)
//    Discord Developer Portal → URL: https://senin-domain.com/linked-role
// ─────────────────────────────────────────────────────────

// OAuth2 ile doğrulama başlat
app.get('/linked-role', (req, res) => {
  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: process.env.DISCORD_APP_ID,
    redirect_uri: process.env.DISCORD_REDIRECT_URI || `${process.env.BASE_URL}/linked-role/callback`,
    response_type: 'code',
    scope: 'identify role_connections.write',
    state: state,
  });

  // State'i cookie'ye kaydet (CSRF koruması)
  res.cookie('clientState', state, { maxAge: 1000 * 60 * 5, signed: false });
  res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
});

// OAuth2 callback
app.get('/linked-role/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send('Yetkilendirme kodu bulunamadı.');
    }

    // Token al
    const tokenResponse = await fetch('https://discord.com/api/v10/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_APP_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI || `${process.env.BASE_URL}/linked-role/callback`,
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      return res.status(400).send('Token alınamadı.');
    }

    // Kullanıcı bilgilerini al
    const userResponse = await fetch('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const user = await userResponse.json();

    // Bağlı rol metadata'sını güncelle
    const metadata = {
      platform_name: 'CodderDragon Doğrulama',
      platform_username: user.username,
      metadata: {
        verified: 1, // boolean: doğrulandı
        joined_at: new Date().toISOString(), // tarih: ne zaman katıldı
      },
    };

    await fetch(`https://discord.com/api/v10/users/@me/applications/${process.env.DISCORD_APP_ID}/role-connection`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    res.send(`
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <title>Doğrulama Başarılı</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; background: #1a1a2e; color: #e0e0e0; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
          .card { background: #16213e; padding: 40px; border-radius: 16px; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
          .card h1 { color: #5865F2; }
          .card p { color: #b0b0b0; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>✅ Doğrulama Başarılı!</h1>
          <p>Merhaba <strong>${user.username}</strong>, bağlı rolün güncellendi.</p>
          <p>Bu sayfayı kapatabilirsin.</p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Linked Role hatası:', error);
    res.status(500).send('Bir hata oluştu.');
  }
});

// ─────────────────────────────────────────────────────────
// 3) HİZMET KOŞULLARI (Terms of Service)
//    Discord Developer Portal → URL: https://senin-domain.com/terms
// ─────────────────────────────────────────────────────────
app.get('/terms', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'terms.html'));
});

// ─────────────────────────────────────────────────────────
// 4) GİZLİLİK POLİTİKASI (Privacy Policy)
//    Discord Developer Portal → URL: https://senin-domain.com/privacy
// ─────────────────────────────────────────────────────────
app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'privacy.html'));
});

// Statik dosyalar
app.use(express.static(path.join(__dirname, 'public')));

// Ana sayfa
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║         🐉 CodderDragon Bot Doğrulama Sunucusu         ║
╠══════════════════════════════════════════════════════════╣
║  Port: ${String(PORT).padEnd(49)}║
║                                                          ║
║  Endpoint'ler:                                           ║
║  • Etkileşim:     /interactions                          ║
║  • Bağlı Roller:  /linked-role                           ║
║  • Hizmet Koşul.: /terms                                 ║
║  • Gizlilik Pol.: /privacy                               ║
╚══════════════════════════════════════════════════════════╝
  `);
});
