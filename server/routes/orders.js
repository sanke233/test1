const express = require('express');
const { auth } = require('../middleware/auth');
const db = require('../db/connection');

const router = express.Router();

const KARGO_UCRETSIZ_ESIK = 2000;
const KARGO_UCRETI = 79;

router.post('/place', auth, async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [cartItems] = await conn.query(`
      SELECT c.*, p.fiyat, p.ad AS urun_ad FROM cart c
      JOIN products p ON c.product_id = p.id WHERE c.user_id = ?
    `, [req.user.id]);

    if (cartItems.length === 0) { await conn.rollback(); return res.status(400).json({ error: 'Sepet bos.' }); }

    let toplam = 0;
    for (const item of cartItems) toplam += item.fiyat * item.qty;
    const kargo = toplam >= KARGO_UCRETSIZ_ESIK ? 0 : KARGO_UCRETI;
    const siparisNo = 'SO-' + Math.floor(100000 + Math.random() * 900000);

    const [orderResult] = await conn.query(
      'INSERT INTO orders (siparis_no, user_id, toplam, kargo) VALUES (?, ?, ?, ?)',
      [siparisNo, req.user.id, toplam, kargo]
    );

    for (const item of cartItems) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, adet, birim_fiyat) VALUES (?, ?, ?, ?)',
        [orderResult.insertId, item.product_id, item.qty, item.fiyat]
      );
    }

    await conn.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
    await conn.query(
      "INSERT INTO analytics_events (tip, kullanici_ad, detay) VALUES ('siparis_verildi', ?, ?)",
      [req.user.ad, siparisNo + ' - ' + toplam + ' TL']
    );

    await conn.commit();
    res.json({ ok: true, siparis_no: siparisNo, toplam, kargo });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: 'Siparis olusturulamadi.' });
  } finally {
    conn.release();
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, GROUP_CONCAT(p.ad, ' x', oi.adet SEPARATOR ', ') AS urunler
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ?
      GROUP BY o.id ORDER BY o.created_at DESC
    `, [req.user.id]);
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: 'Siparisler yuklenemedi.' });
  }
});

module.exports = router;
