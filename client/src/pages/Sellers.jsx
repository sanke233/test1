const SATICILAR = [
  {
    id: 1,
    ad: 'Kaptan Tarim',
    konum: 'Antalya',
    web: 'kaptantarim.com.tr',
    ikon: '\u2699',
    tel: '+90 242 000 00 01',
    email: 'info@kaptantarim.com.tr',
    urunler: [
      { ad: 'Satsuma Mandalina Fidani', fiyat: 120 },
      { ad: 'Valencia Portakal Fidani', fiyat: 140 },
      { ad: 'Antalya Limon Fidani', fiyat: 110 },
      { ad: 'Cokurova Hibrit Zeytin', fiyat: 95 },
      { ad: 'Buyuk Yaprakli Avokado', fiyat: 180 },
    ],
  },
  {
    id: 2,
    ad: 'Fidanistanbul',
    konum: 'Istanbul / Yalova',
    web: 'fidanistanbul.com',
    ikon: '\u2699',
    tel: '+90 216 000 00 02',
    email: 'info@fidanistanbul.com',
    urunler: [
      { ad: 'Maviyemis Fidani', fiyat: 85 },
      { ad: 'Surekli Meyve Veren Ahududu', fiyat: 65 },
      { ad: 'Gocek Bogurtlen Fidani', fiyat: 55 },
      { ad: 'Marmara Turlu Fistik Cami', fiyat: 250 },
      { ad: 'Sari Erik Fidani', fiyat: 90 },
    ],
  },
  {
    id: 3,
    ad: 'Fidan Deposu',
    konum: 'Odemis / Izmir',
    web: 'fidandeposu.com',
    ikon: '\u2699',
    tel: '+90 232 000 00 03',
    email: 'info@fidandeposu.com',
    urunler: [
      { ad: 'Bursa Sallama Seker Erik', fiyat: 100 },
      { ad: 'Truva Seftali Fidani', fiyat: 110 },
      { ad: 'Kirmizi Incir Fidani', fiyat: 125 },
      { ad: 'Bayram Karpuzu Tohumu', fiyat: 40 },
      { ad: 'Maras Kestane Fidani', fiyat: 160 },
    ],
  },
  {
    id: 4,
    ad: 'Fidan Diyari',
    konum: 'Odemis / Izmir',
    web: 'fidandiyarim.com',
    ikon: '\u2699',
    tel: '+90 232 000 00 04',
    email: 'info@fidandiyarim.com',
    urunler: [
      { ad: 'Can Cekirdek Narenciye', fiyat: 90 },
      { ad: 'Odemis Kirazi Fidani', fiyat: 135 },
      { ad: 'Hicaz Nar Fidani', fiyat: 105 },
      { ad: 'Sarilop Incir Fidani', fiyat: 120 },
      { ad: 'Erkenci Mersin Mandalina', fiyat: 115 },
    ],
  },
  {
    id: 5,
    ad: 'HasFidan',
    konum: '81 Ilde',
    web: 'hasfidan.com',
    ikon: '\u2699',
    tel: '0850 000 00 05',
    email: 'info@hasfidan.com',
    urunler: [
      { ad: 'Modern Kayisi (Canan) Fidani', fiyat: 75 },
      { ad: '8001 Eksi Namrun Nar', fiyat: 95 },
      { ad: 'Cankaya Armut Fidani', fiyat: 85 },
      { ad: 'Honeycrisp Elma Fidani', fiyat: 90 },
      { ad: 'Juliette Aspir Fidani', fiyat: 45 },
    ],
  },
  {
    id: 6,
    ad: '1001 Fidan',
    konum: 'Yalova',
    web: '1001fidan.com',
    ikon: '\u2699',
    tel: '+90 226 000 00 06',
    email: 'info@1001fidan.com',
    urunler: [
      { ad: 'Yalova Inciri Fidani', fiyat: 130 },
      { ad: 'Gemlik Zeytin Fidani', fiyat: 70 },
      { ad: 'Kivi (Hayward) Fidani', fiyat: 110 },
      { ad: 'Sultan Cinari Fidani', fiyat: 200 },
      { ad: 'Frenk Uzumu Fidani', fiyat: 60 },
    ],
  },
];

function fiyatFormatla(n) {
  return n.toLocaleString('tr-TR') + ' TL';
}

export default function Sellers() {
  return (
    <section className="sellers-section">
      <div className="section-head">
        <h2 className="section-title">Guvenilir Saticilar</h2>
        <p className="section-subtitle">Turkiye'nin oncu fidan saticilari tek cati altinda</p>
      </div>

      <div className="sellers-grid">
        {SATICILAR.map((s, i) => (
          <div className="seller-card" key={s.id} style={{ animationDelay: (i % 3) * 80 + 'ms' }}>
            <div className="seller-card-head">
              <div className="seller-icon">{s.ikon}</div>
              <div className="seller-meta">
                <h3 className="seller-name">{s.ad}</h3>
                <span className="seller-location">&#128205; {s.konum}</span>
              </div>
            </div>

            <div className="seller-contact">
              <span className="contact-row">&#128222; {s.tel}</span>
              <span className="contact-row">&#9993; {s.email}</span>
              <span className="contact-row">&#127760; {s.web}</span>
            </div>

            <div className="seller-products">
              <h4 className="seller-products-title">Top 5 Urun</h4>
              <ul className="seller-product-list">
                {s.urunler.map((u, j) => (
                  <li key={j} className="seller-product">
                    <span className="sp-name">{u.ad}</span>
                    <span className="sp-price">{fiyatFormatla(u.fiyat)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              className="btn btn-outline btn-visit"
              onClick={() => window.open('https://' + s.web, '_blank')}
            >
              Siteyi Ziyaret Et
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}