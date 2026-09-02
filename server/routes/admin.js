const express = require('express');
const { auth, admin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const db = require('../db/connection');

const router = express.Router();

router.use(auth, admin);

router.get('/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, ad, email, rol, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Kullanici listesi alinamadi.' });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT o.*, u.ad AS kullanici_ad, u.email,
        GROUP_CONCAT(p.ad, ' x', oi.adet SEPARATOR ', ') AS urunler
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      GROUP BY o.id ORDER BY o.created_at DESC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Siparis listesi alinamadi.' });
  }
});

router.put('/orders/:id/durum', async (req, res) => {
  const { durum } = req.body;
  if (!['hazirlaniyor', 'kargoda', 'teslim'].includes(durum)) return res.status(400).json({ error: 'Gecersiz durum.' });
  try {
    await db.query('UPDATE orders SET durum = ? WHERE id = ?', [durum, req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Durum guncellenemedi.' });
  }
});

router.post('/products', [
  body('ad').trim().isLength({ min: 2, max: 150 }),
  body('fiyat').isFloat({ min: 0 }),
  body('kategori_id').isInt({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Gecersiz veri.', detay: errors.array() });

  const { ad, kategori_id, emoji, image_url, fiyat, eski_fiyat, birim, aciklama } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO products (ad, kategori_id, emoji, image_url, fiyat, eski_fiyat, birim, aciklama) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [ad, kategori_id, emoji || null, image_url || null, fiyat, eski_fiyat || null, birim || 'adet', aciklama || null]
    );
    res.json({ ok: true, id: result.insertId });
  } catch (e) {
    res.status(500).json({ error: 'Urun eklenemedi.' });
  }
});

router.put('/products/:id', async (req, res) => {
  const { ad, kategori_id, emoji, image_url, fiyat, eski_fiyat, birim, aciklama, durum } = req.body;
  try {
    await db.query(
      `UPDATE products SET ad=?, kategori_id=?, emoji=?, image_url=?, fiyat=?, eski_fiyat=?, birim=?, aciklama=?, durum=? WHERE id=?`,
      [ad, kategori_id, emoji, image_url, fiyat, eski_fiyat, birim, aciklama, durum, req.params.id]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Urun guncellenemedi.' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    await db.query('UPDATE products SET durum = "pasif" WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Urun silinemedi.' });
  }
});

module.exports = router;
