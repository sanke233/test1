const express = require('express');
const db = require('../db/connection');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { kategori, q } = req.query;
    let sql = `SELECT p.*, c.ad AS kategori_ad FROM products p LEFT JOIN categories c ON p.kategori_id = c.id WHERE p.durum = 'aktif'`;
    const params = [];
    if (kategori && kategori !== 'all') { sql += ' AND c.ad = ?'; params.push(kategori); }
    if (q) { sql += ' AND (p.ad LIKE ? OR p.aciklama LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }
    sql += ' ORDER BY p.created_at DESC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Urunler yuklenemedi.' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Kategoriler yuklenemedi.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT p.*, c.ad AS kategori_ad FROM products p LEFT JOIN categories c ON p.kategori_id = c.id WHERE p.id = ?`, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Urun bulunamadi.' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Urun yuklenemedi.' });
  }
});

module.exports = router;
