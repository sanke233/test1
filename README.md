# 🌳 Sanal Orman — Node.js + React + MySQL

Modern ve güvenli e-ticaret sistemi. Python'dan tamamen vazgeçildi; yerine Node.js + React + MySQL mimarisi kuruldu.

## 📁 Klasör Yapısı

```
ormanweb/
├── package.json          (ana betikler)
├── .env                  (yapılandırma - gizli anahtarlar burada)
├── .env.example
├── server/               (Node.js + Express backend)
│   ├── index.js          (uygulama başlangıcı)
│   ├── db/
│   │   ├── connection.js (MySQL bağlantı havuzu)
│   │   ├── setup.js      (otomatik şema + örnek veri)
│   │   └── schema.sql    (manuel SQL şeması)
│   ├── middleware/auth.js (JWT + admin yetki)
│   └── routes/           (auth, products, cart, orders, analytics, admin)
└── client/               (React frontend - Vite)
    ├── index.html
    └── src/
        ├── App.jsx           (ana uygulama + router)
        ├── App.css           (tüm stiller)
        ├── main.jsx
        ├── components/       (Toast, Heartbeat)
        ├── context/          (Auth, Cart)
        ├── pages/            (Home, Shop, Sellers)
        ├── pages/admin/      (AdminPanel - canlı izleme)
        └── utils/api.js      (API yardımcı)
```

---

## 🚀 Kurulum ve Çalıştırma

### 1. Gerekli yazılımlar
- **Node.js** v18+ (kurulu: v24.19.0)
- **MySQL** 8+ (bilgisayara kurulması gerekiyor)

### 2. MySQL kurulumu
MySQL'i [dev.mysql.com/downloads/](https://dev.mysql.com/downloads/) adresinden kurun.
Kurulum sırasında bir **root şifresi** belirleyin.

### 3. Yapılandırma
`ormenweb/.env` dosyasında DB bilgilerini kendi MySQL bilgilerinle düzenle:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=SENIN_SIFREN
DB_NAME=ormanweb
JWT_SECRET=uzun_guvenli_rastgele_kelime
```

### 4. Paketleri kur
Kök klasörde:
```
npm run install:all
```

### 5. Veritabanını oluştur (iki yol var)
**A) Otomatik (kolay):**
```
cd server
npm run db:setup
```
Bu, tüm tabloları + kategorileri + admin hesabını otomatik oluşturur.

**B) Manuel SQL** — aşağıdaki full SQL'i MySQL'de çalıştır.

### 6. Çalıştır
```
npm run dev
```
- Site: http://localhost:5173
- API:  http://localhost:3001
- Yönetici paneli: http://localhost:5173/admin
  - Giriş: `admin@sanalorman.com` / `admin123`

---

## ⚠️ DİKKAT
- Başlangıç admin şifresi (`admin123`) ilk girişti hemen değiştir.
- `.env`'deki `JWT_SECRET`'i mutlaka uzun ve rastgele bir değerle değiştir.
- `.env` dosyasını asla GitHub'a yükleme (.gitignore'a eklendi).

---

# 🗄️ SQL KODLARI

## Veritabanı ve Tablolar

```sql
-- Veritabanını oluştur
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

-- SEPET
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

-- OLAY AKIŞI (canlı izleme)
CREATE TABLE IF NOT EXISTS analytics_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tip VARCHAR(50) NOT NULL,
  kullanici_ad VARCHAR(100) DEFAULT 'Misafir',
  detay TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tip (tip),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;
```

## Ön Tanımlı Veriler

```sql
-- Kategoriler
INSERT IGNORE INTO categories (id, ad) VALUES
  (1, 'Meyve Fidanlari'),
  (2, 'Sus Bitkileri'),
  (3, 'Cali ve Cit'),
  (4, 'Orman Agaclari');

-- Yönetici hesabı (şifre: admin123)
-- NOT: bcrypt hash'i setup.js otomatik üretir. Elle eklemek için:
-- Aşağıdaki hash değerini MySQL'de admin123 için üretilmiş hash ile değiştirin.
-- INSERT INTO users (ad, email, sifre_hash, rol)
--   VALUES ('Yonetici', 'admin@sanalorman.com', '<bcrypt_hash>', 'admin');
```

## Örnek Ürün Ekleme

```sql
INSERT INTO products (ad, kategori_id, emoji, image_url, fiyat, eski_fiyat, birim, aciklama) VALUES
('Kirmizi Elma Fidani', 1, '🍎', 'https://images.unsplash.com/photo-1758467033099-6ee205d992ed?auto=format&fit=crop&w=600&q=80', 389, 430, 'adet', 'Red Chief bodur elma, 80-100 cm, tup lu/saksılı.'),
('Golden Elma Fidani', 1, '🍏', NULL, 375, NULL, 'adet', 'Golden Delicious, yaribodur, 80-100 cm.'),
('Williams Armut Fidani', 1, '🍐', NULL, 405, NULL, 'adet', 'Williams armut, 80-120 cm.'),
('Domat Seftali Fidani', 1, '🍑', NULL, 410, NULL, 'adet', 'Dom at seftali, 80-120 cm.'),
('0900 Ziraat Kiraz Fidani', 1, '🍒', NULL, 250, NULL, 'adet', 'Yaribodur anaca asili, tuplu.'),
('Lavanta Fidesi', 3, '💜', 'https://images.unsplash.com/photo-1465566829994-b8da8cae5909?auto=format&fit=crop&w=600&q=80', 40, NULL, 'adet', 'Ingiliz lavanta, tuplu, hos kokulu.'),
('Kizilcam Fidani', 4, '🌲', NULL, 40, NULL, 'adet', 'Kizilcam, 1+0, tuplu.'),
('Kirmizi Gul Fidani', 2, '🌹', 'https://images.unsplash.com/photo-1534700071278-9c56874f2e41?auto=format&fit=crop&w=600&q=80', 374, NULL, 'adet', 'Kirmizi gul, 40-50 cm.');
```

---

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React 19 + Vite + React Router |
| Backend | Node.js + Express |
| Veritabanı | MySQL 8+ (mysql2) |
| Kimlik | JWT + bcrypt |
| Güvenlik | Helmet, CORS, Rate limit, girdi doğrulama |
| Canlı izleme | 1 saniyelik polling |

## 🔒 Güvenlik Özellikleri
- bcrypt ile şifre hash (düz metin asla saklanmaz)
- JWT tabanlı oturum (süreli, imzalı)
- Helmet güvenlik başlıkları
- Rate limiting (brute-force koruması)
- Parametreli SQL sorguları (injection koruması)
- Admin rolü yetkilendirme
- Girdi doğrulama (express-validator)

## ☁️ Bulut Hosting (ileride)
- **Backend**: Render / Railway (Node.js)
- **Frontend**: Vercel / Netlify (React build)
- **MySQL**: Aiven / PlanetScale / ClearDB (bulut veritabanı)
- Deploy: `git push` ile otomatik
