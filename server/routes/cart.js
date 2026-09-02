const express = require('express');
const { auth } = require('../middleware/auth');
const db = require('../db/connection');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.*, p.ad AS urun_ad, p.fiyat, p.emoji, p.image_url
      FROM cart c JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [req.user.id]);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Sepet yuklenemedi.' });
  }
});

router.post('/add', auth, async (req, res) => {
  const { product_id, qty } = req.body;
  if (!product_id || !qty || qty < 1) return res.status(400).json({ error: 'Gecersiz veri.' });
  try {
    const [existing] = await db.query('SELECT * FROM cart WHERE user_id = ? AND product_id = ?', [req.user.id, product_id]);
    if (existing.length > 0) {
      await db.query('UPDATE cart SET qty = qty + ? WHERE user_id = ? AND product_id = ?', [qty, req.user.id, product_id]);
    } else {
      await db.query('INSERT INTO cart (user_id, product_id, qty) VALUES (?, ?, ?)', [req.user.id, product_id, qty]);
    }
    const [count] = await db.query('SELECT SUM(qty) AS toplam FROM cart WHERE user_id = ?', [req.user.id]);
    res.json({ ok: true, toplamAdet: count[0].toplam || 0 });
  } catch (e) {
    res.status(500).json({ error: 'Sepete eklenemedi.' });
  }
});

router.put('/update', auth, async (req, res) => {
  const { product_id, qty } = req.body;
  if (!product_id || qty < 0) return res.status(400).json({ error: 'Gecersiz veri.' });
  try {
    if (qty === 0) {
      await db.query('DELETE FROM cart WHERE user_id = ? AND product_id = ?', [req.user.id, product_id]);
    } else {
      await db.query('UPDATE cart SET qty = ? WHERE user_id = ? AND product_id = ?', [qty, req.user.id, product_id]);
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Sepet guncellenemedi.' });
  }
});

router.delete('/clear', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Sepet temizlenemedi.' });
  }
});

module.exports = router;
