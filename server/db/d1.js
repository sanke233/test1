// ============================================
//  Cloudflare D1 HTTP API Bağlantı Modülü
//  Node.js'ten D1 veritabanına HTTP ile sorgu çalıştırır.
//
//  Gereken .env değişkenleri:
//    CF_API_TOKEN      - Cloudflare API Token (D1 ile ed.it)
//    CF_ACCOUNT_ID     - Cloudflare hesap ID
//    CF_D1_DATABASE_ID - D1 veritabanı ID
//  veya doğrudan:
//    D1_HTTP_URL       - Proxy endpoint (kendi Worker'ın)
// ============================================

const D1_HTTP_URL = process.env.D1_HTTP_URL || '';

// Sorgu çalıştır. d1 db'ye HTTP üzerinden erişir.
async function d1Query(sql, params = []) {
  // Yol 1: Özel D1 HTTP proxy URL (kendi Worker'ın)
  if (D1_HTTP_URL) {
    const res = await fetch(D1_HTTP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql, params })
    });
    const data = await res.json();
    return data;
  }

  // Yol 2: Cloudflare REST API
  const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/d1/database/${process.env.CF_D1_DATABASE_ID}/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CF_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql, params })
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error('D1 hata: ' + (data.errors ? data.errors.map(e => e.message).join('; ') : 'bilinmeyen'));
  }
  return data.result && data.result[0];
}

// D1 yanıtını sorgu sonucuna çevirir.
// D1 HTTP API sonucu: { results: [...], success: true }
function rows(d1Result) {
  if (!d1Result) return [];
  if (Array.isArray(d1Result.results)) return d1Result.results;
  if (Array.isArray(d1Result)) return d1Result;
  return [];
}

module.exports = { d1Query, rows };
