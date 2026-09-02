const express = require('express');
const db = require('../db/connection');

const router = express.Router();

router.post('/heartbeat', async (req, res) => {
  const { id, ad, sayfa, olay } = req.body;
  if (!id) return res.status(400).json({ error: 'ID gerekli.' });
  try {
    const kullaniciAd = ad || 'Misafir';
    const [existing] = await db.query('SELECT id FROM visits WHERE oturum_id = ?', [id]);
    if (existing.length > 0) {
      await db.query('UPDATE visits SET kullanici_ad = ?, sayfa = ?, son_guncelleme = NOW() WHERE oturum_id = ?', [kullaniciAd, sayfa || 'anasayfa', id]);
    } else {
      await db.query('INSERT INTO visits (oturum_id, kullanici_ad, sayfa) VALUES (?, ?, ?)', [id, kullaniciAd, sayfa || 'anasayfa']);
    }

    if (olay) {
      await db.query('INSERT INTO analytics_events (tip, kullanici_ad, detay) VALUES (?, ?, ?)', [olay, kullaniciAd, sayfa || '']);
    }

    const [sayi] = await db.query("SELECT COUNT(*) AS sayi FROM visits WHERE son_guncelleme > DATE_SUB(NOW(), INTERVAL 20 SECOND)");
    res.json({ ok: true, sayi: sayi[0].sayi });
  } catch (e) {
    res.status(500).json({ error: 'Heartbeat islenemedi.' });
  }
});

router.get('/canli', async (req, res) => {
  try {
    const [aktif] = await db.query(`
      SELECT oturum_id, kullanici_ad, sayfa, son_guncelleme
      FROM visits WHERE son_guncelleme > DATE_SUB(NOW(), INTERVAL 20 SECOND)
      ORDER BY son_guncelleme DESC
    `);

    const [olaylar] = await db.query(`
      SELECT tip, kullanici_ad, detay, created_at
      FROM analytics_events ORDER BY created_at DESC LIMIT 50
    `);

    const [toplamUye] = await db.query('SELECT COUNT(*) AS sayi FROM users');
    const [toplamSiparis] = await db.query('SELECT COUNT(*) AS sayi FROM orders');

    res.json({
      aktif: aktif.map(a => ({
        id: a.oturum_id,
        ad: a.kullanici_ad,
        sayfa: a.sayfa,
        son: a.son_guncelleme
      })),
      sayi: aktif.length,
      olaylar: olaylar.map(o => ({
        tip: o.tip,
        ad: o.kullanici_ad,
        detay: o.detay,
        t: o.created_at
      })),
      toplamUye: toplamUye[0].sayi,
      toplamSiparis: toplamSiparis[0].sayi
    });
  } catch (e) {
    res.status(500).json({ error: 'Canli veri alinamadi.' });
  }
});

module.exports = router;
