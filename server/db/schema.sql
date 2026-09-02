-- ============================================
--  SANAL ORMAN - Cloudflare D1 Veritabanı Şeması
--  Kullanım: wrangler d1 execute ormanweb --file=schema.sql
--  D1 = SQLite tabanlı (MySQL değil!)
-- ============================================

-- KULLANICILAR (üyeler + yönetici)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ad TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  sifre_hash TEXT NOT NULL,
  rol TEXT NOT NULL DEFAULT 'user' CHECK (rol IN ('user','admin')),
  created_at TEXT DEFAULT (datetime('now'))
);

-- KATEGORİLER
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ad TEXT NOT NULL
);

-- ÜRÜNLER (fidanlar)
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ad TEXT NOT NULL,
  kategori_id INTEGER,
  emoji TEXT,
  image_url TEXT,
  fiyat REAL NOT NULL,
  eski_fiyat REAL,
  birim TEXT DEFAULT 'adet',
  aciklama TEXT,
  durum TEXT NOT NULL DEFAULT 'aktif' CHECK (durum IN ('aktif','pasif')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (kategori_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- SİPARİŞLER
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  siparis_no TEXT NOT NULL UNIQUE,
  user_id INTEGER NOT NULL,
  toplam REAL NOT NULL,
  kargo REAL DEFAULT 0,
  durum TEXT NOT NULL DEFAULT 'hazirlaniyor' CHECK (durum IN ('hazirlaniyor','kargoda','teslim')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- SİPARİŞ ÜRÜNLERİ
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  adet INTEGER NOT NULL DEFAULT 1,
  birim_fiyat REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- SEPET
CREATE TABLE IF NOT EXISTS cart (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  qty INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- AKTİF ZİYARETÇİLER (canlı izleme)
CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  oturum_id TEXT NOT NULL,
  kullanici_ad TEXT DEFAULT 'Misafir',
  sayfa TEXT DEFAULT 'anasayfa',
  son_guncelleme TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_oturum ON visits (oturum_id);
CREATE INDEX IF NOT EXISTS idx_son_guncelleme ON visits (son_guncelleme);

-- OLAY AKIŞI (canlı izleme)
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tip TEXT NOT NULL,
  kullanici_ad TEXT DEFAULT 'Misafir',
  detay TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_tip ON analytics_events (tip);
CREATE INDEX IF NOT EXISTS idx_created_at ON analytics_events (created_at);
