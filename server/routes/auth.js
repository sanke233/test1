const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../db/connection');

const router = express.Router();

router.post('/register', [
  body('ad').trim().isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('sifre').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Gecersiz veri.', detay: errors.array() });

  const { ad, email, sifre } = req.body;
  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ error: 'Bu e-posta zaten kayitli.' });

    const hash = await bcrypt.hash(sifre, 12);
    const [result] = await db.query('INSERT INTO users (ad, email, sifre_hash) VALUES (?, ?, ?)', [ad, email, hash]);
    const token = jwt.sign({ id: result.insertId, ad, email, rol: 'user' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

    await db.query("INSERT INTO analytics_events (tip, kullanici_ad, detay) VALUES ('uye_olundu', ?, ?)", [ad, email]);
    res.json({ token, user: { id: result.insertId, ad, email, rol: 'user' } });
  } catch (e) {
    res.status(500).json({ error: 'Kayit sirasinda hata olustu.' });
  }
});

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('sifre').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Gecersiz veri.' });

  const { email, sifre } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'E-posta veya sifre hatali.' });

    const user = rows[0];
    const valid = await bcrypt.compare(sifre, user.sifre_hash);
    if (!valid) return res.status(401).json({ error: 'E-posta veya sifre hatali.' });

    const token = jwt.sign({ id: user.id, ad: user.ad, email: user.email, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    await db.query("INSERT INTO analytics_events (tip, kullanici_ad, detay) VALUES ('giris_yapildi', ?, ?)", [user.ad, email]);
    res.json({ token, user: { id: user.id, ad: user.ad, email: user.email, rol: user.rol } });
  } catch (e) {
    res.status(500).json({ error: 'Giris sirasinda hata olustu.' });
  }
});

router.get('/me', require('../middleware/auth').auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, ad, email, rol, created_at FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Kullanici bulunamadi.' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Sunucu hatasi.' });
  }
});

module.exports = router;
