/**
 * Bağlı Roller (Linked Roles) Metadata Kaydı
 * 
 * Bu scripti bir kez çalıştırarak Discord'a bağlı rol metadata'larını kaydet.
 * Çalıştırmak için: node register-metadata.js
 */

require('dotenv').config();

const metadata = [
  {
    key: 'verified',
    name: 'Doğrulandı',
    description: 'Kullanıcı doğrulama sisteminden geçti',
    type: 7, // BOOLEAN_EQUAL
  },
  {
    key: 'joined_at',
    name: 'Katılma Tarihi',
    description: 'Doğrulama tarihi',
    type: 6, // DATETIME_GREATER_THAN_OR_EQUAL
  },
];

async function registerMetadata() {
  const url = `https://discord.com/api/v10/applications/${process.env.DISCORD_APP_ID}/role-connections/metadata`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
    },
    body: JSON.stringify(metadata),
  });

  if (response.ok) {
    const data = await response.json();
    console.log('✅ Bağlı Rol metadata başarıyla kaydedildi!');
    console.log(JSON.stringify(data, null, 2));
  } else {
    const text = await response.text();
    console.error('❌ Hata:', response.status, text);
  }
}

registerMetadata();
