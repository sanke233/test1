-- ============================================
--  SANAL ORMAN - D1 Başlangıç Verileri
--  Kullanım: wrangler d1 execute ormanweb --file=seed.sql
-- ============================================

-- Kategoriler
INSERT INTO categories (id, ad) VALUES
  (1, 'Meyve Fidanlari'),
  (2, 'Sus Bitkileri'),
  (3, 'Cali ve Cit'),
  (4, 'Orman Agaclari');

-- Örnek ürünler
INSERT INTO products (ad, kategori_id, emoji, image_url, fiyat, eski_fiyat, birim, aciklama) VALUES
  ('Kirmizi Elma Fidani', 1, '🍎', 'https://images.unsplash.com/photo-1758467033099-6ee205d992ed?auto=format&fit=crop&w=600&q=80', 389, 430, 'adet', 'Red Chief bodur elma, 80-100 cm, tuplu/saksili.'),
  ('Golden Elma Fidani', 1, '🍏', NULL, 375, NULL, 'adet', 'Golden Delicious, yaribodur, 80-100 cm.'),
  ('Williams Armut Fidani', 1, '🍐', NULL, 405, NULL, 'adet', 'Williams armut, 80-120 cm.'),
  ('Domat Seftali Fidani', 1, '🍑', NULL, 410, NULL, 'adet', 'Domat seftali, 80-120 cm.'),
  ('0900 Ziraat Kiraz Fidani', 1, '🍒', NULL, 250, NULL, 'adet', 'Yaribodur anaca asili, tuplu.'),
  ('Lavanta Fidesi', 3, '💜', 'https://images.unsplash.com/photo-1465566829994-b8da8cae5909?auto=format&fit=crop&w=600&q=80', 40, NULL, 'adet', 'Ingiliz lavanta, tuplu, hos kokulu.'),
  ('Kizilcam Fidani', 4, '🌲', NULL, 40, NULL, 'adet', 'Kizilcam, 1+0, tuplu.'),
  ('Kirmizi Gul Fidani', 2, '🌹', 'https://images.unsplash.com/photo-1534700071278-9c56874f2e41?auto=format&fit=crop&w=600&q=80', 374, NULL, 'adet', 'Kirmizi gul, 40-50 cm.');

-- Yönetici hesabı (şifre: admin123)
-- DİKKAT: aşağıdaki bcrypt hash'i gerçek "admin123" şifresine karşılık gelmeyebilir.
-- Güvenilir yöntem: wrangler d1 execute ile değil, uygulama açılışında setup koduyla ekleyin.
-- INSERT INTO users (ad, email, sifre_hash, rol) VALUES
--   ('Yonetici', 'admin@sanalorman.com', '<HASH_BURAYA>', 'admin');
