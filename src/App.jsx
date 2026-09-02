import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import { ToastProvider, useToast } from './components/Toast';
import Heartbeat, { sendEvent } from './components/Heartbeat';
import { api } from './utils/api';
import Home from './pages/Home';
import AdminPanel from './pages/admin/AdminPanel';

function fiyatFormatla(n) {
  return n.toLocaleString('tr-TR') + ' TL';
}

function AuthModal({ open, onClose, initialMode }) {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ ad: '', email: '', sifre: '' });
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const { login, register } = useAuth();

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setHata('');
      setForm({ ad: '', email: '', sifre: '' });
    }
  }, [open, initialMode]);

  if (!open) return null;

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHata('');
    setYukleniyor(true);
    try {
      if (mode === 'login') {
        await login(form.email.trim(), form.sifre);
        sendEvent('giris');
      } else {
        await register(form.ad.trim(), form.email.trim(), form.sifre);
        sendEvent('kayit');
      }
      onClose();
    } catch (err) {
      setHata(err.message || 'Bir hata olustu');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <div className="modal-head">
          <span className="modal-logo">&#127807;</span>
          <h2>{mode === 'login' ? 'Tekrar Hos Geldiniz' : 'Hesap Olustur'}</h2>
          <p>{mode === 'login' ? 'Sanal Orman hesabiniza giris yapin' : 'Birkac saniyede yeni hesabinizi olusturun'}</p>
        </div>
        <div className="auth-tabs">
          <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Giris</button>
          <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>Kayit</button>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label>
              Ad Soyad
              <input value={form.ad} onChange={(e) => set('ad', e.target.value)} required placeholder="Adiniz" autoFocus />
            </label>
          )}
          <label>
            E-posta
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required placeholder="ornek@mail.com" autoFocus={mode === 'login'} />
          </label>
          <label>
            Sifre
            <input type="password" value={form.sifre} onChange={(e) => set('sifre', e.target.value)} required placeholder="Sifreniz" minLength={4} />
          </label>
          {hata && <div className="form-error">{hata}</div>}
          <button type="submit" className="btn btn-primary btn-block" disabled={yukleniyor}>
            {yukleniyor ? 'Yukleniyor...' : mode === 'login' ? 'Giris Yap' : 'Kayit Ol'}
          </button>
        </form>
      </div>
    </div>
  );
}

function CartModal({ open, onClose }) {
  const { items, updateQty, removeFromCart, total, itemCount, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [odeme, setOdeme] = useState(false);
  const [form, setForm] = useState({ adres: '', sehir: '', telefon: '' });
  const [yukleniyor, setYukleniyor] = useState(false);

  if (!open) return null;

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!user) {
      onClose();
      addToast('Odeme icin giris yapmaniz gerekiyor', 'error');
      return;
    }
    setYukleniyor(true);
    try {
      const data = await api.post('/orders', {
        adres: form.adres,
        sehir: form.sehir,
        telefon: form.telefon,
      });
      sendEvent('odeme', { siparis: data.siparis ? data.siparis.id : null });
      clearCart();
      setOdeme(false);
      addToast('Siparisiniz alindi, tesekkurler!', 'success');
      onClose();
    } catch (err) {
      addToast(err.message || 'Siparis olusturulamadi', 'error');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal cart-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <div className="modal-head">
          <span className="modal-logo">&#128722;</span>
          <h2>{odeme ? 'Siparisi Tamamla' : 'Sepetiniz'}</h2>
          <p>{odeme ? 'Teslimat bilgilerinizi girin' : itemCount + ' urun, ' + fiyatFormatla(total)}</p>
        </div>

        {!odeme ? (
          <>
            <div className="cart-items">
              {items.length === 0 && (
                <div className="cart-empty">
                  <span className="cart-empty-icon">&#127793;</span>
                  <p>Sepetiniz henuz bos. Fidanlari kesfetmeye baslayin!</p>
                  <button className="btn btn-primary" onClick={onClose}>Katalogu Gor</button>
                </div>
              )}
              {items.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-thumb">
                    {item.image_url && item.image_url.trim() ? (
                      <img src={item.image_url} alt={item.ad} />
                    ) : (
                      <span className="cart-item-emoji">&#127795;</span>
                    )}
                  </div>
                  <div className="cart-item-info">
                    <h4>{item.ad}</h4>
                    <span className="cart-item-price">{fiyatFormatla(item.fiyat)}</span>
                  </div>
                  <div className="cart-item-actions">
                    <div className="qty-control">
                      <button onClick={() => updateQty(item.id, Math.max(1, item.adet - 1))}>-</button>
                      <span>{item.adet}</span>
                      <button onClick={() => updateQty(item.id, item.adet + 1)}>+</button>
                    </div>
                    <button className="cart-remove" onClick={() => removeFromCart(item.id)}>Sil</button>
                  </div>
                </div>
              ))}
            </div>
            {items.length > 0 && (
              <div className="cart-footer">
                <button className="btn btn-primary btn-block" onClick={() => setOdeme(true)}>
                  Odemeye Gec - {fiyatFormatla(total)}
                </button>
              </div>
            )}
          </>
        ) : (
          <form className="checkout-form" onSubmit={handleCheckout}>
            <label>
              Adres
              <textarea rows="2" value={form.adres} onChange={(e) => set('adres', e.target.value)} required placeholder="Kapi / apartman, sokak, mahalle..." />
            </label>
            <label>
              Sehir
              <input value={form.sehir} onChange={(e) => set('sehir', e.target.value)} required placeholder="Ornegin: Istanbul" />
            </label>
            <label>
              Telefon
              <input type="tel" value={form.telefon} onChange={(e) => set('telefon', e.target.value)} required placeholder="05xx xxx xx xx" />
            </label>
            <div className="checkout-summary">
              <div className="cs-row"><span>Urun Adeti</span><strong>{itemCount}</strong></div>
              <div className="cs-row cs-total"><span>Toplam</span><strong>{fiyatFormatla(total)}</strong></div>
            </div>
            <div className="checkout-actions">
              <button type="button" className="btn btn-outline" onClick={() => setOdeme(false)}>Geri</button>
              <button type="submit" className="btn btn-primary" disabled={yukleniyor}>
                {yukleniyor ? 'Isleniyor...' : 'Siparisi Onayla'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Navbar({ onLoginClick, onCartClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();

  const handleLogout = () => {
    sendEvent('cikis');
    logout();
  };

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-logo">&#127807;</span>
          <span className="brand-text">Sanal <strong>Orman</strong></span>
        </Link>

        <nav className={`nav ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Ana Sayfa</Link>
          <a href="/#urunler" className="nav-link" onClick={() => setMenuOpen(false)}>Urunler</a>
          <a href="/#saticilar" className="nav-link" onClick={() => setMenuOpen(false)}>Saticilar</a>
          {isAdmin && <Link to="/admin" className="nav-link nav-admin" onClick={() => setMenuOpen(false)}>&#129513; Admin Paneli</Link>}
        </nav>

        <div className="header-actions">
          <button className="cart-btn" onClick={onCartClick} aria-label="Sepet">
            <span className="cart-icon">&#128722;</span>
            {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
          </button>

          {user ? (
            <div className="user-area">
              <span className="user-avatar">{user.ad.charAt(0).toUpperCase()}</span>
              <span className="user-name">{user.ad}</span>
              <button className="btn btn-outline btn-xs" onClick={handleLogout}>Cikis</button>
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={onLoginClick}>Giris Yap</button>
          )}

          <button className="hamburger" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [cartOpen, setCartOpen] = useState(false);
  const { user } = useAuth();
  const { loadCart } = useCart();

  useEffect(() => {
    loadCart();
  }, [user, loadCart]);

  return (
    <ToastProvider>
      <Heartbeat />
      <ScrollToTop />
      <Navbar
        onLoginClick={() => { setAuthMode('login'); setAuthOpen(true); }}
        onCartClick={() => setCartOpen(true)}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <AuthModal open={authOpen} initialMode={authMode} onClose={() => setAuthOpen(false)} />
      <CartModal open={cartOpen} onClose={() => setCartOpen(false)} />
    </ToastProvider>
  );
}