import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { useToast } from '../../components/Toast';

const DURUMLAR = [
  { deger: 'hazirlaniyor', etiket: 'Hazirlaniyor' },
  { deger: 'kargoda', etiket: 'Kargoda' },
  { deger: 'teslim', etiket: 'Teslim Edildi' },
  { deger: 'iptal', etiket: 'Iptal Edildi' },
];

const KATEGORILER = ['Meyve Fidanlari', 'Sus Bitkileri', 'Cali ve Cit', 'Orman Agaclari'];

function fiyatFormatla(n) {
  return n.toLocaleString('tr-TR') + ' TL';
}

function Modal({ baslik, onClose, children }) {
  return (
    <div className="amodal-backdrop" onClick={onClose}>
      <div className="amodal" onClick={(e) => e.stopPropagation()}>
        <div className="amodal-head">
          <h3>{baslik}</h3>
          <button className="amodal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="amodal-body">{children}</div>
      </div>
    </div>
  );
}

function ProductForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    initial || { ad: '', kategori: KATEGORILER[0], fiyat: '', stok: '', aciklama: '', image_url: '', indirim: 0, yeni: false }
  );

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      fiyat: parseFloat(form.fiyat) || 0,
      stok: parseInt(form.stok, 10) || 0,
      indirim: parseInt(form.indirim, 10) || 0,
    });
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <label>
        Urun Adi
        <input value={form.ad} onChange={(e) => set('ad', e.target.value)} required placeholder="Ornegin: Gemlik Zeytin Fidani" />
      </label>
      <label>
        Kategori
        <select value={form.kategori} onChange={(e) => set('kategori', e.target.value)}>
          {KATEGORILER.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </label>
      <div className="product-form-row">
        <label>
          Fiyat (TL)
          <input type="number" min="0" step="0.01" value={form.fiyat} onChange={(e) => set('fiyat', e.target.value)} required />
        </label>
        <label>
          Stok
          <input type="number" min="0" value={form.stok} onChange={(e) => set('stok', e.target.value)} required />
        </label>
      </div>
      <div className="product-form-row">
        <label>
          Indirim (%)
          <input type="number" min="0" max="90" value={form.indirim} onChange={(e) => set('indirim', e.target.value)} />
        </label>
        <label className="form-label-check">
          <input type="checkbox" checked={form.yeni} onChange={(e) => set('yeni', e.target.checked)} />
Yeni Urun
        </label>
      </div>
      <label>
        Gorsel URL (bos birakilirsa emoji gosterilir)
        <input value={form.image_url} onChange={(e) => set('image_url', e.target.value)} placeholder="https://..." />
      </label>
      <label>
        Aciklama
        <textarea rows="3" value={form.aciklama} onChange={(e) => set('aciklama', e.target.value)} required placeholder="Urun hakkinda kisa bilgi..." />
      </label>
      <div className="product-form-actions">
        <button type="submit" className="btn btn-primary">{initial ? 'Guncelle' : 'Ekle'}</button>
        <button type="button" className="btn btn-outline" onClick={onCancel}>Vazgec</button>
      </div>
    </form>
  );
}

function Duration({ olay, z }) {
  const [dur, setDur] = useState(0);
  useEffect(() => {
    if (olay !== 'heartbeat') return undefined;
    const t = setInterval(() => {
      setDur(Math.max(0, Math.floor(5 - (Date.now() - z) / 1000)));
    }, 1000);
    return () => clearInterval(t);
  }, [olay, z]);
  return <span className="ev-dur">+{dur}s</span>;
}

export default function AdminPanel() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [tab, setTab] = useState('canli');

  const [stats, setStats] = useState({ ziyaretci: 0, uye: 0, siparis: 0 });
  const [visitors, setVisitors] = useState([]);
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const [editing, setEditing] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [loading, isAdmin, navigate]);

  const loadMembers = useCallback(async () => {
    try {
      const data = await api.get('/admin/uyeler');
      setMembers(data.uyeler || []);
    } catch { }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const data = await api.get('/admin/siparisler');
      setOrders(data.siparisler || []);
    } catch { }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const data = await api.get('/products');
      setProducts(data.urunler || []);
    } catch { }
  }, []);

  const loadLive = useCallback(async () => {
    try {
      const data = await api.get('/analytics/canli');
      if (data.stats) setStats(data.stats);
      if (data.ziyaretciler) setVisitors(data.ziyaretciler);
      if (data.olaylar) setEvents(data.olaylar);
    } catch { }
  }, []);

  useEffect(() => {
    if (tab === 'canli') {
      loadLive();
      const t = setInterval(loadLive, 1000);
      return () => clearInterval(t);
    }
    if (tab === 'uyeler') loadMembers();
    if (tab === 'siparisler') loadOrders();
    if (tab === 'urunler') loadProducts();
    return undefined;
  }, [tab, loadLive, loadMembers, loadOrders, loadProducts]);

  if (!isAdmin) return null;

  const handleOrderStatus = async (oid, durum) => {
    try {
      await api.put('/admin/siparis/' + oid + '/durum', { durum });
      loadOrders();
      addToast('Siparis durumu guncellendi', 'success');
      setEditingOrder(null);
    } catch (err) {
      addToast(err.message || 'Guncelleme basarisiz', 'error');
    }
  };

  const handleProductSubmit = async (form) => {
    try {
      if (editing) {
        await api.put('/admin/urun/' + editing.id, form);
        addToast(editing.ad + ' guncellendi', 'success');
      } else {
        await api.post('/admin/urun', form);
        addToast('Urun eklendi', 'success');
      }
      setShowForm(false);
      setEditing(null);
      loadProducts();
    } catch (err) {
      addToast(err.message || 'Hata olustu', 'error');
    }
  };

  const handleProductDelete = async (p) => {
    if (!window.confirm(p.ad + ' silinsin mi?')) return;
    try {
      await api.delete('/admin/urun/' + p.id);
      addToast(p.ad + ' silindi', 'success');
      loadProducts();
    } catch (err) {
      addToast(err.message || 'Silme basarisiz', 'error');
    }
  };

  const tabs = [
    { id: 'canli', label: 'Canli Izleme', ikon: '\u26AB' },
    { id: 'uyeler', label: 'Uyeler', ikon: '\u{1F465}' },
    { id: 'siparisler', label: 'Siparisler', ikon: '\u{1F4E6}' },
    { id: 'urunler', label: 'Urunler', ikon: '\u{1F334}' },
  ];

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <div className="admin-brand">
          <span className="admin-logo">&#127807;</span>
          <div>
            <h1>Sanal Orman Admin</h1>
            <p>Hoş geldiniz, {user?.ad}</p>
          </div>
        </div>
        <div className="admin-tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`admin-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <span className="admin-tab-icon">{t.ikon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="admin-content">
        {tab === 'canli' && (
          <div className="live-tab">
            <div className="stats-grid">
              <div className="stat-card stat-visitors">
                <span className="stat-icon">&#128100;</span>
                <span className="stat-value">{stats.ziyaretci}</span>
                <span className="stat-label">Aktif Ziyaretci</span>
                <span className="live-dot"></span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">&#128100;</span>
                <span className="stat-value">{stats.uye}</span>
                <span className="stat-label">Toplam Uye</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">&#128222;</span>
                <span className="stat-value">{stats.siparis}</span>
                <span className="stat-label">Toplam Siparis</span>
              </div>
            </div>

            <div className="live-columns">
              <div className="live-panel">
                <div className="live-panel-head">
                  <h3>Aktif Ziyaretciler</h3>
                  <span className="live-count">{visitors.length} kisi</span>
                </div>
                <div className="visitors-list">
                  {visitors.length === 0 && <p className="empty-hint">Simdiye kadar ziyaretci yok.</p>}
                  {visitors.map((v) => (
                    <div className="visitor-row" key={v.id}>
                      <span className="visitor-avatar">{v.ad.charAt(0).toUpperCase()}</span>
                      <div className="visitor-info">
                        <strong>{v.ad}</strong>
                        <span>{v.sayfa}</span>
                      </div>
                      <span className="visitor-time">{v.sure || '0dk'}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="live-panel">
                <div className="live-panel-head">
                  <h3>Canli Olaylar</h3>
                  <span className="live-stream-ind">{events.length} olay</span>
                </div>
                <div className="events-list">
                  {events.length === 0 && <p className="empty-hint">Henuz olay yok.</p>}
                  {events.map((e) => (
                    <div className="event-row" key={e.id}>
                      <span className="event-user">{e.ad}</span>
                      <span className="event-action">{e.olay}</span>
                      <span className="event-page">{e.sayfa}</span>
                      {e.olay === 'heartbeat' && <Duration olay={e.olay} z={Date.now()} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'uyeler' && (
          <div className="admin-table-wrap">
            <div className="admin-panel-head">
              <h3>Uyeler</h3>
              <span>{members.length} uye</span>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ad</th>
                  <th>E-posta</th>
                  <th>Rol</th>
                  <th>Kayit</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td>#{m.id}</td>
                    <td>{m.ad}</td>
                    <td>{m.email}</td>
                    <td><span className={`role-tag ${m.rol === 'admin' ? 'role-admin' : 'role-user'}`}>{m.rol}</span></td>
                    <td>{m.kayit_tarihi ? new Date(m.kayit_tarihi).toLocaleString('tr-TR') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'siparisler' && (
          <div className="admin-table-wrap">
            <div className="admin-panel-head">
              <h3>Siparisler</h3>
              <span>{orders.length} siparis</span>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Musteri</th>
                  <th>Urunler</th>
                  <th>Toplam</th>
                  <th>Tarih</th>
                  <th>Durum</th>
                  <th>Islem</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{o.kullanici ? o.kullanici.ad : 'Misafir'}</td>
                    <td className="order-items">
                      {(o.urunler || []).map((u, i) => (
                        <span key={i} className="order-item-chip">{u.ad} x{u.adet}</span>
                      ))}
                      {(!o.urunler || o.urunler.length === 0) && '-'}
                    </td>
                    <td>{fiyatFormatla(o.toplam)}</td>
                    <td>{new Date(o.tarih || o.created_at).toLocaleString('tr-TR')}</td>
                    <td>
                      <span className={`order-status status-${o.durum}`}>{o.durum}</span>
                    </td>
                    <td>
                      <button className="btn btn-small" onClick={() => setEditingOrder(o)}>Durum Guncelle</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'urunler' && (
          <div className="admin-table-wrap">
            <div className="admin-panel-head">
              <h3>Urunler</h3>
              <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ Yeni Urun</button>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Gorsel</th>
                  <th>Ad</th>
                  <th>Kategori</th>
                  <th>Fiyat</th>
                  <th>Stok</th>
                  <th>Islemler</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td>
                      {p.image_url && p.image_url.trim() ? (
                        <img className="admin-thumb" src={p.image_url} alt={p.ad} />
                      ) : (
                        <span className="admin-thumb admin-thumb-emoji">&#127795;</span>
                      )}
                    </td>
                    <td>{p.ad}</td>
                    <td>{p.kategori}</td>
                    <td>{fiyatFormatla(p.fiyat)}</td>
                    <td>{p.stok}</td>
                    <td className="row-actions">
                      <button className="btn btn-small btn-edit" onClick={() => { setEditing(p); setShowForm(true); }}>Duzenle</button>
                      <button className="btn btn-small btn-del" onClick={() => handleProductDelete(p)}>Sil</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showForm && (
        <Modal baslik={editing ? 'Urunu Duzenle' : 'Yeni Urun Ekle'} onClose={() => { setShowForm(false); setEditing(null); }}>
          <ProductForm
            initial={editing}
            onSubmit={handleProductSubmit}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </Modal>
      )}

      {editingOrder && (
        <Modal baslik={'Siparis #' + editingOrder.id + ' Durumu'} onClose={() => setEditingOrder(null)}>
          <div className="order-durum-actions">
            {DURUMLAR.map((d) => (
              <button
                key={d.deger}
                className={`btn durum-btn ${editingOrder.durum === d.deger ? 'active' : ''}`}
                onClick={() => handleOrderStatus(editingOrder.id, d.deger)}
              >
                {d.etiket}
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}