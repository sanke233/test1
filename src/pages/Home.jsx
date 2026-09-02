import { Link } from 'react-router-dom';
import Shop from './Shop';
import Sellers from './Sellers';
import { useToast } from '../components/Toast';

const OZELLIKLER = [
  {
    ikon: '\u{1F334}',
    baslik: 'Guvenilir Saticilar',
    aciklama: 'Turkiyenin oncu fidan saticilarindan guvenli alisveris.',
  },
  {
    ikon: '\u{1F913}',
    baslik: 'Canli Takip',
    aciklama: 'Siparislerinizi her asamada canli olarak takip edin.',
  },
  {
    ikon: '\u{1F331}',
    baslik: 'Kaliteli Fidanlar',
    aciklama: 'Saglam koklu, asili ve bol verimli fidanlar.',
  },
  {
    ikon: '\u{1F3E1}',
    baslik: 'Kapiya Teslimat',
    aciklama: 'Hizli ve ozel ambalajla guvenli kargo teslimati.',
  },
];

export default function Home() {
  const { addToast } = useToast();

  const handleNewsletter = (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    if (!email) return;
    addToast('Bultenimize kayit oldunuz!', 'success');
    e.target.reset();
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-badge">&#127807; 100% Dogal Fidanlar</div>
          <h1 className="hero-title">
            Sanal <span className="hero-accent">Orman</span>
          </h1>
          <p className="hero-subtitle">
            Fidanlari sanal ortamda secin, dogaya ufak ama guclu bir adim atin. El degmemis kalite,
            guvenilir saticilar ve canli takip ile alisveris hayalinize orman katarken.
          </p>
          <div className="hero-actions">
            <a href="#urunler" className="btn btn-primary btn-lg">
              Fidanlari Kesfet
            </a>
            <a href="#saticilar" className="btn btn-outline btn-lg">
              Saticilari Gor
            </a>
          </div>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hs-value">10.000+</span>
            <span className="hs-label">Mutlu Musteri</span>
          </div>
          <div className="hero-stat">
            <span className="hs-value">250+</span>
            <span className="hs-label">Fidan Cesidi</span>
          </div>
          <div className="hero-stat">
            <span className="hs-value">%98</span>
            <span className="hs-label">Canli Kalma</span>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="features-grid">
          {OZELLIKLER.map((o) => (
            <div className="feature-card" key={o.baslik}>
              <span className="feature-icon">{o.ikon}</span>
              <h3 className="feature-title">{o.baslik}</h3>
              <p className="feature-desc">{o.aciklama}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="shop-wrapper" id="urunler">
        <Shop />
      </div>

      <div className="sellers-wrapper" id="saticilar">
        <Sellers />
      </div>

      <section className="newsletter">
        <div className="newsletter-inner">
          <div className="newsletter-icon">&#9961;</div>
          <h2 className="newsletter-title">Yeni Fidanlardan Haberdar Olun</h2>
          <p className="newsletter-desc">
            Kampanyalardan yararlanan avantajli fidanlari ve sezon indirimlerini epostaniza alin.
          </p>
          <form className="newsletter-form" onSubmit={handleNewsletter}>
            <input type="email" name="email" placeholder="E-posta adresiniz" required />
            <button type="submit" className="btn btn-primary">Kaydol</button>
          </form>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="footer-logo">&#127807;</span>
            <h3>Sanal Orman</h3>
            <p>Fidanlari sanal ortamda secin, dogaya guclu bir adim atin.</p>
          </div>
          <div className="footer-col">
            <h4>Site</h4>
            <Link to="/">Ana Sayfa</Link>
            <a href="#urunler">Urunler</a>
            <a href="#saticilar">Saticilar</a>
          </div>
          <div className="footer-col">
            <h4>Destek</h4>
            <span>Iletisim</span>
            <span>Kargo ve Teslimat</span>
            <span>Iade Kosullari</span>
          </div>
          <div className="footer-col">
            <h4>Iletisim</h4>
            <span>&#127968; Istanbul, Turkiye</span>
            <span>&#9993; destek@sanalorman.com</span>
            <span>&#128222; 0850 000 00 00</span>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Sanal Orman. Tum haklari saklidir.</p>
        </div>
      </footer>
    </div>
  );
}