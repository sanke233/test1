require('dotenv').config({ path: __dirname + '/../../.env' });
const mysql = require('mysql2/promise');

async function setup() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    charset: 'utf8mb4'
  });

  const dbName = process.env.DB_NAME || 'ormanweb';
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.query(`USE \`${dbName}\``);

  const tablolar = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ad VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      sifre_hash VARCHAR(255) NOT NULL,
      rol ENUM('user','admin') DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ad VARCHAR(100) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ad VARCHAR(150) NOT NULL,
      kategori_id INT,
      emoji VARCHAR(10),
      image_url TEXT,
      fiyat DECIMAL(10,2) NOT NULL,
      eski_fiyat DECIMAL(10,2),
      birim VARCHAR(20) DEFAULT 'adet',
      aciklama TEXT,
      durum ENUM('aktif','pasif') DEFAULT 'aktif',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (kategori_id) REFERENCES categories(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      siparis_no VARCHAR(20) NOT NULL UNIQUE,
      user_id INT NOT NULL,
      toplam DECIMAL(10,2) NOT NULL,
      kargo DECIMAL(10,2) DEFAULT 0,
      durum ENUM('hazirlaniyor','kargoda','teslim') DEFAULT 'hazirlaniyor',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id INT NOT NULL,
      adet INT NOT NULL DEFAULT 1,
      birim_fiyat DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS visits (
      id INT AUTO_INCREMENT PRIMARY KEY,
      oturum_id VARCHAR(50) NOT NULL,
      kullanici_ad VARCHAR(100) DEFAULT 'Misafir',
      sayfa VARCHAR(100) DEFAULT 'anasayfa',
      son_guncelleme TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_oturum (oturum_id),
      INDEX idx_son_guncelleme (son_guncelleme)
    )`,
    `CREATE TABLE IF NOT EXISTS analytics_events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tip VARCHAR(50) NOT NULL,
      kullanici_ad VARCHAR(100) DEFAULT 'Misafir',
      detay TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_tip (tip),
      INDEX idx_created_at (created_at)
    )`
  ];

  for (const sql of tablolar) {
    await conn.query(sql);
  }

  const [cats] = await conn.query('SELECT COUNT(*) AS sayi FROM categories');
  if (cats[0].sayi === 0) {
    const kategoriler = ['Meyve Fidanlari', 'Sus Bitkileri', 'Cali ve Cit', 'Orman Agaclari'];
    for (const k of kategoriler) {
      await conn.query('INSERT INTO categories (ad) VALUES (?)', [k]);
    }
  }

  const [users] = await conn.query('SELECT COUNT(*) AS sayi FROM users WHERE rol="admin"');
  if (users[0].sayi === 0) {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('admin123', 10);
    await conn.query('INSERT INTO users (ad, email, sifre_hash, rol) VALUES (?, ?, ?, ?)', ['Yonetici', 'admin@sanalorman.com', hash, 'admin']);
    console.log('Admin hesabi olusturuldu: admin@sanalorman.com / admin123');
  }

  console.log('Veritabani hazir!');
  await conn.end();
}

setup().catch(e => { console.error('HATA:', e.message); process.exit(1); });
