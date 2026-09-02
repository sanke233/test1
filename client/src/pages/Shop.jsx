import { useState, useEffect, useMemo } from 'react';
import { api } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { sendEvent } from '../components/Heartbeat';

const KATEGORILER = ['Tumu', 'Meyve Fidanlari', 'Sus Bitkileri', 'Cali ve Cit', 'Orman Agaclari'];

const EMOJI = {
  'Meyve Fidanlari': '\u{1F34E}',
  'Sus Bitkileri': '\u{1F33F}',
  'Cali ve Cit': '\u{1F332}',
  'Orman Agaclari': '\u{1F333}',
};

function fiyatFormatla(n) {
  return n.toLocaleString('tr-TR') + ' TL';
}

function formatEth(cat, name) {
  return EMOJI[cat] || '\u{1F333}';
}

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kategori, setKategori] = useState('Tumu');
  const [arama, setArama] = useState('');
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [eklenen, setEklenen] = useState({});

  useEffect(() => {
    api.get('/products')
      .then((data) => setProducts(data.urunler || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (kategori !== 'Tumu') list = list.filter((p) => p.kategori === kategori);
    if (arama.trim()) {
      const q = arama.trim().toLowerCase();
      list = list.filter((p) => (p.ad || '').toLowerCase().includes(q) || (p.aciklama || '').toLowerCase().includes(q));
    }
    return list;
  }, [products, kategori, arama]);

  const handleAdd = async (product) => {
    if (!user) {
      addToast('Sepete eklemek icin giris yapin', 'error');
      return;
    }
    try {
      await addToCart(product.id, 1);
      sendEvent('sepet', { urun: product.ad });
      setEklenen((prev) => ({ ...prev, [product.id]: true }));
      addToast(product.ad + ' sepete eklendi', 'success');
      setTimeout(() => setEklenen((prev) => ({ ...prev, [product.id]: false })), 1500);
    } catch (err) {
      addToast(err.message || 'Urun eklenemedi', 'error');
    }
  };

  return (
    <section className="shop-section">
      <div className="section-head">
        <h2 className="section-title">Fidan Katalogu</h2>
        <p className="section-subtitle">Bahcenize ve bahceniz icin en kaliteli fidanlar</p>
      </div>

      <div className="shop-toolbar">
        <div className="category-tabs">
          {KATEGORILER.map((k) => (
            <button
              key={k}
              className={`cat-tab ${kategori === k ? 'active' : ''}`}
              onClick={() => setKategori(k)}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="search-box">
          <span className="search-icon">&#128269;</span>
          <input
            type="text"
            placeholder="Fidan arayin..."
            value={arama}
            onChange={(e) => setArama(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="products-loading">
          <div className="spinner"></div>
          <p>Urunler yukleniyor...</p>
        </div>
      ) : (
        <div className="product-grid">
          {filtered.map((p, i) => (
            <div className="product-card" key={p.id} style={{ animationDelay: (i % 8) * 60 + 'ms' }}>
              <div className="product-media">
                {p.indirim && <span className="badge badge-indirim">%{p.indirim} INDIRIM</span>}
                {p.yeni && <span className="badge badge-yeni">YENI</span>}
                {p.image_url && p.image_url.trim() ? (
                  <img src={p.image_url} alt={p.ad} loading="lazy" />
                ) : (
                  <div className="product-emoji">{formatEth(p.kategori, p.ad)}</div>
                )}
              </div>
              <div className="product-body">
                <span className="product-category">{p.kategori}</span>
                <h3 className="product-name">{p.ad}</h3>
                <p className="product-desc">{p.aciklama}</p>
                <div className="product-footer">
                  <span className="product-price">{fiyatFormatla(p.fiyat)}</span>
                  <button
                    className={`btn btn-primary btn-add ${eklenen[p.id] ? 'added' : ''}`}
                    onClick={() => handleAdd(p)}
                  >
                    {eklenen[p.id] ? '\u2713 Eklendi' : 'Sepete Ekle'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="no-results">
              <span className="no-results-emoji">&#127810;</span>
              <p>Arama kriterlerinize uygun fidan bulunamadi.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}