require('dotenv').config({ path: __dirname + '/../.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const db = require('./db/connection');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { error: 'Cok fazla istek gonderdiniz, lutfen bekleyin.' } });
app.use('/api/', limiter);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Cok fazla deneme. 15 dk bekleyin.' } });
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

const clientBuild = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuild));
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(clientBuild, 'index.html'));
  }
});

app.use((err, req, res, next) => {
  console.error('HATA:', err.message);
  res.status(500).json({ error: 'Sunucu hatasi olustu.' });
});

app.listen(PORT, () => {
  console.log(`Sunucu calisiyor: http://localhost:${PORT}`);
});

// MySQL bağlantısını beklemeden sunucu ayakta kalır.
// MySQL yoksa tablo olmayan sorgular hata döner (uygulama çökmez).
db.getConnection()
  .then((conn) => {
    console.log('MySQL baglandi.');
    conn.release();
  })
  .catch((err) => {
    console.error('MySQL baglantisi basarisiz:', err.message);
    console.log('Sunucu calisiyor ama veritabani yok. lütfen MySQL kurun ve schema.sql calistirin.');
  });
