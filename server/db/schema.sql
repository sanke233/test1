-- ============================================
--  SANAL ORMAN - MySQL Veritabanı Şeması
--  Bu dosyayı MySQL'de çalıştırarak tüm tabloları oluşturun.
--  Kullanım: mysql -u kullanici -p < schema.sql
-- ============================================

CREATE DATABASE IF NOT EXISTS ormanweb
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ormanweb;

-- KULLANICILAR (üyeler + yönetici)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ad VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  sifre_hash VARCHAR(255) NOT NULL,
  rol ENUM('user','admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- KATEGORİLER
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ad VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- ÜRÜNLER (fidanlar)
CREATE TABLE IF NOT EXISTS products (
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
) ENGINE=InnoDB;

-- SİPARİŞLER
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  siparis_no VARCHAR(20) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  toplam DECIMAL(10,2) NOT NULL,
  kargo DECIMAL(10,2) DEFAULT 0,
  durum ENUM('hazirlaniyor','kargoda','teslim') DEFAULT 'hazirlaniyor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- SİPARİŞ ÜRÜNLERİ
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  adet INT NOT NULL DEFAULT 1,
  birim_fiyat DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- SE PET (kullanıcı sepeti)
CREATE TABLE IF NOT EXISTS cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- AKTİF ZİYARETÇİLER (canlı izleme)
CREATE TABLE IF NOT EXISTS visits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  oturum_id VARCHAR(50) NOT NULL,
  kullanici_ad VARCHAR(100) DEFAULT 'Misafir',
  sayfa VARCHAR(100) DEFAULT 'anasayfa',
  son_guncelleme TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_oturum (oturum_id),
  INDEX idx_son_guncelleme (son_guncelleme)
) ENGINE=InnoDB;

-- OLAY AKIŞI (canlı izleme - üyelik/giriş/sipariş/gezinme)
CREATE TABLE IF NOT EXISTS analytics_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tip VARCHAR(50) NOT NULL,
  kullanici_ad VARCHAR(100) DEFAULT 'Misafir',
  detay TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tip (tip),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================
--  ÖN TANIMLI VERİLER
-- ============================================

-- Kategoriler
INSERT IGNORE INTO categories (id, ad) VALUES
  (1, 'Meyve Fidanlari'),
  (2, 'Sus Bitkileri'),
  (3, 'Cali ve Cit'),
  (4, 'Orman Agaclari');

-- Yönetici hesabı
-- Şifre (bcrypt hash): admin123
-- NOT: Setup.js bunu otomatik oluşturur; gerekiyorsa aşağıdakini de kullanın.
-- INSERT INTO users (ad, email, sifre_hash, rol) VALUES ('Yonetici', 'admin@sanalorman.com', '$2a$12$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'admin');
