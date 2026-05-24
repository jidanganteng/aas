'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#1A1A1A]" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .font-display { font-family: 'Playfair Display', Georgia, serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }

        /* ── Marquee ── */
        .marquee-wrap { overflow: hidden; }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* ── Ghost Big Letter ── */
        .ghost-char {
          font-family: 'Playfair Display', serif;
          font-weight: 900;
          font-size: clamp(160px, 28vw, 340px);
          line-height: 0.82;
          color: transparent;
          -webkit-text-stroke: 1.5px rgba(200,57,26,0.18);
          user-select: none;
          pointer-events: none;
          position: absolute;
        }

        /* ── Section label ── */
        .label {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #C8391A;
        }

        /* ── Buttons ── */
        .btn-red {
          display: inline-flex; align-items: center; gap: 10px;
          background: #C8391A; color: #F5F0E8;
          font-family: 'DM Sans', sans-serif; font-weight: 600;
          font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;
          padding: 15px 36px; border: 2px solid #C8391A;
          transition: background .2s, color .2s; text-decoration: none; cursor: pointer;
        }
        .btn-red:hover { background: #1A1A1A; border-color: #1A1A1A; }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: 10px;
          background: transparent; color: #1A1A1A;
          font-family: 'DM Sans', sans-serif; font-weight: 600;
          font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;
          padding: 15px 36px; border: 2px solid #1A1A1A;
          transition: background .2s, color .2s; text-decoration: none; cursor: pointer;
        }
        .btn-ghost:hover { background: #1A1A1A; color: #F5F0E8; }

        .btn-white {
          display: inline-flex; align-items: center; gap: 10px;
          background: #F5F0E8; color: #C8391A;
          font-family: 'DM Sans', sans-serif; font-weight: 600;
          font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;
          padding: 15px 36px; border: 2px solid #F5F0E8;
          transition: background .2s, color .2s; text-decoration: none; cursor: pointer;
        }
        .btn-white:hover { background: #1A1A1A; border-color: #1A1A1A; color: #F5F0E8; }

        /* ── Nav link ── */
        .nav-lnk {
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase; color: #1A1A1A;
          text-decoration: none; position: relative; padding-bottom: 3px;
          transition: color .2s;
        }
        .nav-lnk::after {
          content: ''; position: absolute; bottom: 0; left: 0;
          width: 0; height: 1.5px; background: #C8391A; transition: width .25s;
        }
        .nav-lnk:hover { color: #C8391A; }
        .nav-lnk:hover::after { width: 100%; }

        /* ── Card hover ── */
        .lift {
          transition: transform .22s ease, box-shadow .22s ease;
        }
        .lift:hover {
          transform: translateY(-5px) rotate(-0.3deg);
          box-shadow: 5px 5px 0 #1A1A1A;
        }

        /* ── Diagonal stripe ── */
        .stripe {
          background: repeating-linear-gradient(-45deg, #C8391A, #C8391A 2px, transparent 2px, transparent 12px);
        }

        /* ── Stamp ── */
        .stamp {
          display: inline-block;
          border: 2.5px solid #C8391A; color: #C8391A;
          font-family: 'DM Sans', sans-serif; font-size: 10px;
          font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
          padding: 4px 10px; transform: rotate(-1.8deg);
        }

        /* ── Pull quote ── */
        .pull { border-left: 3.5px solid #C8391A; padding-left: 20px; }

        /* ── Noise overlay ── */
        .noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E");
          background-size: 200px;
          position: fixed; inset: 0; pointer-events: none; z-index: 100; opacity: .45;
        }

        .rule { border-top: 1.5px solid rgba(26,26,26,.13); }
        .rule-dark { border-top: 2px solid #1A1A1A; }

        /* ── Step number ── */
        .step-n {
          font-family: 'Playfair Display', serif;
          font-size: clamp(52px, 7vw, 80px);
          font-weight: 900; line-height: 1;
          color: #C8391A;
        }

        /* ── Feature row hover ── */
        .feat-row {
          display: flex; align-items: flex-start; gap: 20px;
          padding: 22px 0; border-top: 1.5px solid rgba(26,26,26,.12);
          transition: padding-left .2s;
          cursor: default;
        }
        .feat-row:last-child { border-bottom: 1.5px solid rgba(26,26,26,.12); }
        .feat-row:hover { padding-left: 10px; }
        .feat-row:hover .feat-icon { background: #C8391A; color: #F5F0E8; }
        .feat-icon {
          width: 42px; height: 42px; background: #1A1A1A; color: #F5F0E8;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
          transition: background .2s, color .2s;
        }

        /* ── Stat big ── */
        .stat-big {
          font-family: 'Playfair Display', serif;
          font-size: clamp(52px, 8vw, 96px);
          font-weight: 900; line-height: 1; color: #C8391A;
        }

        /* ── FAQ ── */
        .faq-item { border-top: 1.5px solid rgba(26,26,26,.15); padding: 20px 0; }
        .faq-item:last-child { border-bottom: 1.5px solid rgba(26,26,26,.15); }

        @media (max-width: 767px) {
          .ghost-char { font-size: clamp(100px, 32vw, 180px); }
        }
      `}</style>

      <div className="noise" aria-hidden />

      {/* ════════════════ NAV ════════════════ */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#F5F0E8]/96 backdrop-blur-sm border-b border-[#1A1A1A]/10' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, background: '#C8391A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="font-display" style={{ fontWeight: 900, fontSize: 17, color: '#F5F0E8' }}>P</span>
            </div>
            <span className="font-display" style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1A', letterSpacing: '-0.02em' }}>
              Pengaduan <span style={{ color: '#C8391A' }}>Publik</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#fitur"      className="nav-lnk">Fitur</a>
            <a href="#cara-kerja" className="nav-lnk">Cara Kerja</a>
            <a href="#faq"        className="nav-lnk">FAQ</a>
          </nav>

          {/* CTA */}
          <div className="hidden sm:flex items-center gap-3">
            {!loading && !user ? (
              <>
                <Link href="/auth/login"    className="btn-ghost" style={{ padding: '10px 22px' }}>Masuk</Link>
                <Link href="/auth/register" className="btn-red"   style={{ padding: '10px 22px' }}>Daftar →</Link>
              </>
            ) : !loading && user ? (
              <Link href="/dashboard" className="btn-red" style={{ padding: '10px 22px' }}>Dashboard →</Link>
            ) : (
              <div style={{ width: 88, height: 38, background: 'rgba(26,26,26,.1)' }} className="animate-pulse" />
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen(o => !o)}
            className="md:hidden font-body"
            style={{ fontFamily: 'DM Sans', fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', border: '1.5px solid #1A1A1A', padding: '6px 14px', background: 'none', cursor: 'pointer' }}
          >
            {mobileMenuOpen ? 'Tutup' : 'Menu'}
          </button>
        </div>

        {mobileMenuOpen && (
          <div style={{ background: '#F5F0E8', borderTop: '1px solid rgba(26,26,26,.1)', padding: 24 }}>
            {['fitur','cara-kerja','faq'].map(id => (
              <a key={id} href={`#${id}`} className="nav-lnk" style={{ display: 'block', marginBottom: 16 }}>
                {id === 'fitur' ? 'Fitur' : id === 'cara-kerja' ? 'Cara Kerja' : 'FAQ'}
              </a>
            ))}
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/auth/login"    className="btn-ghost" style={{ justifyContent: 'center' }}>Masuk</Link>
              <Link href="/auth/register" className="btn-red"   style={{ justifyContent: 'center' }}>Daftar →</Link>
            </div>
          </div>
        )}
      </header>

      <main style={{ paddingTop: 80 }}>

        {/* ════════════════ HERO ════════════════ */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px 0', overflow: 'hidden' }}>

          {/* Masthead bar */}
          <div className="rule-dark" style={{ paddingBottom: 18, marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <span className="label">Platform Pengaduan Terpercaya</span>
            <span className="stamp">100% Gratis</span>
            <span className="label font-body" style={{ fontFamily: 'DM Sans' }}>Lapor. Pantau. Ubah.</span>
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 0, alignItems: 'end' }}>

            {/* Left — headline */}
            <div style={{ gridColumn: 'span 7', position: 'relative', paddingBottom: 40 }}>
              <div className="ghost-char" style={{ top: -20, left: -16 }}>L</div>

              <div style={{ position: 'relative', zIndex: 2, paddingTop: 32 }}>
                <h1 className="font-display" style={{ fontSize: 'clamp(40px, 6.5vw, 78px)', fontWeight: 900, lineHeight: 1.03, marginBottom: 24, maxWidth: 620 }}>
                  Lapor dengan Mudah,<br />
                  <em style={{ fontStyle: 'italic', color: '#C8391A' }}>Pantau Hasilnya.</em>
                </h1>
                <p className="font-body" style={{ fontSize: 16, color: '#4A4A4A', lineHeight: 1.75, maxWidth: 480, marginBottom: 36 }}>
                  Platform pengaduan publik yang transparan dan terpercaya. Kirim laporan, pantau progres, dan lihat tindakan nyata dari pihak berwenang.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                  <Link href="/auth/register" className="btn-red">Mulai Lapor →</Link>
                  <a href="#cara-kerja"        className="btn-ghost">Lihat Cara Kerja</a>
                </div>
              </div>
            </div>

            {/* Right — stats + pull quote */}
            <div className="hidden md:flex" style={{ gridColumn: 'span 5', flexDirection: 'column', gap: 0, paddingLeft: 40, paddingBottom: 40, borderLeft: '2px solid rgba(26,26,26,.1)', marginLeft: 16 }}>

              {/* Inline stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginBottom: 28 }}>
                {[
                  { n: '10K+', l: 'Laporan Terkirim', sub: 'dari berbagai daerah' },
                  { n: '95%',  l: 'Tingkat Respons',  sub: 'dalam 48 jam' },
                ].map((s, i) => (
                  <div key={i} style={{ background: i === 0 ? '#1A1A1A' : '#C8391A', padding: '20px 18px' }}>
                    <div className="font-display" style={{ fontSize: 38, fontWeight: 900, lineHeight: 1, color: '#F5F0E8' }}>{s.n}</div>
                    <div className="font-body"    style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,.7)', marginTop: 6 }}>{s.l}</div>
                    <div className="font-body"    style={{ fontSize: 10, color: 'rgba(245,240,232,.45)', marginTop: 2 }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Pull quote */}
              <div className="pull">
                <p className="font-body" style={{ fontSize: 13, fontStyle: 'italic', color: '#4A4A4A', lineHeight: 1.7 }}>
                  "Laporan saya tentang jalan rusak ditindaklanjuti dalam 2 minggu. Transparan dan responsif!"
                </p>
                <p className="font-body" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C8391A', marginTop: 8, fontStyle: 'normal' }}>
                  — Budi Santoso, Jakarta
                </p>
              </div>

              {/* Stripe accent */}
              <div className="stripe" style={{ height: 3, width: 64, marginTop: 20, opacity: 0.6 }} />
            </div>
          </div>
        </section>

        {/* ════════════════ MARQUEE ════════════════ */}
        <div style={{ background: '#1A1A1A', padding: '12px 0', overflow: 'hidden' }}>
          <div className="marquee-track">
            {Array(7).fill('LAPORKAN → TRANSPARAN → RESPONS 24 JAM → GRATIS 100% → AMAN & TERENKRIPSI → UNTUK RAKYAT INDONESIA →').map((t, i) => (
              <span key={i} className="font-body" style={{ color: '#F5F0E8', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', whiteSpace: 'nowrap', paddingRight: 40 }}>{t}</span>
            ))}
          </div>
        </div>

        {/* ════════════════ CARA KERJA ════════════════ */}
        <section id="cara-kerja" style={{ maxWidth: 1280, margin: '0 auto', padding: '88px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 56, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span className="label">Cara Kerja</span>
              <h2 className="font-display" style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 900, lineHeight: 1.08, marginTop: 8 }}>
                Tiga Langkah,<br /><em style={{ color: '#C8391A' }}>Satu Solusi.</em>
              </h2>
            </div>
            <Link href="/auth/register" className="btn-red" style={{ alignSelf: 'flex-end' }}>Coba Sekarang →</Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, borderTop: '2px solid #1A1A1A' }} className="grid-cols-1 md:grid-cols-3">
            {[
              { icon: '📄', title: 'Buat Laporan', desc: 'Isi detail masalah, unggah foto atau video, dan pilih kategori yang tepat dengan mudah.' },
              { icon: '✅', title: 'Validasi & Proses', desc: 'Tim terkait menerima dan memvalidasi laporan Anda untuk ditindaklanjuti oleh pihak berwenang.' },
              { icon: '📊', title: 'Pantau & Lihat Hasil', desc: 'Dapatkan update real-time setiap saat dan saksikan perubahan nyata di lapangan.' },
            ].map((s, i) => (
              <div key={i} className="lift" style={{ borderBottom: '2px solid #1A1A1A', borderRight: i < 2 ? '2px solid #1A1A1A' : 'none', padding: 36 }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{s.icon}</div>
                <div className="step-n">0{i + 1}</div>
                <h3 className="font-display" style={{ fontSize: 22, fontWeight: 700, marginTop: 12, marginBottom: 10 }}>{s.title}</h3>
                <p className="font-body"    style={{ fontSize: 14, color: '#4A4A4A', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════ FITUR ════════════════ */}
        <section id="fitur" style={{ background: '#1A1A1A', padding: '88px 0' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }} className="grid-cols-1 md:grid-cols-2">

              {/* Left sticky heading */}
              <div style={{ position: 'sticky', top: 120 }}>
                <span className="label" style={{ color: '#E8A090' }}>Fitur Lengkap</span>
                <h2 className="font-display" style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 900, lineHeight: 1.08, marginTop: 8, color: '#F5F0E8' }}>
                  Semua Yang<br />
                  <em style={{ color: '#C8391A' }}>Anda Butuhkan.</em>
                </h2>
                <p className="font-body" style={{ fontSize: 14, color: 'rgba(245,240,232,.5)', lineHeight: 1.75, marginTop: 16, maxWidth: 340 }}>
                  Fitur lengkap untuk melaporkan, memantau, dan memastikan setiap pengaduan ditindaklanjuti dengan serius.
                </p>
                <div className="stripe" style={{ height: 2, width: 56, marginTop: 24, opacity: 0.5 }} />
              </div>

              {/* Right — feature list */}
              <div>
                {[
                  { icon: '📎', title: 'Laporan Multimedia', desc: 'Sertakan foto, video, dan dokumen sebagai bukti pendukung laporan Anda.' },
                  { icon: '🔄', title: 'Pelacakan Real-time', desc: 'Pantau status laporan setiap saat melalui dashboard personal yang intuitif.' },
                  { icon: '🔒', title: 'Keamanan Data', desc: 'Enkripsi tingkat enterprise. Privasi Anda terjamin sepenuhnya.' },
                  { icon: '👥', title: 'Komunitas Transparan', desc: 'Lihat laporan dari warga lain dan bangun kesadaran kolektif bersama.' },
                  { icon: '🔔', title: 'Notifikasi Instan', desc: 'Update langsung ke genggaman Anda setiap ada perkembangan laporan.' },
                  { icon: '📈', title: 'Analytics Dashboard', desc: 'Statistik nyata dan dampak perubahan yang telah berhasil dicapai bersama.' },
                ].map((f, i) => (
                  <div key={i} className="feat-row">
                    <div className="feat-icon">{f.icon}</div>
                    <div>
                      <div className="font-display" style={{ fontSize: 17, fontWeight: 700, color: '#F5F0E8', marginBottom: 4 }}>{f.title}</div>
                      <div className="font-body"    style={{ fontSize: 13, color: 'rgba(245,240,232,.5)', lineHeight: 1.65 }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════ STATS BAND ════════════════ */}
        <section style={{ background: '#F5F0E8', borderTop: '2px solid #1A1A1A', borderBottom: '2px solid #1A1A1A' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }} className="grid-cols-2 md:grid-cols-4">
            {[
              { n: '10K+', l: 'Laporan Terkirim' },
              { n: '95%',  l: 'Tingkat Respons' },
              { n: '500+', l: 'Masalah Selesai' },
              { n: '50K+', l: 'Pengguna Aktif' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '44px 32px', borderRight: i < 3 ? '2px solid #1A1A1A' : 'none' }}>
                <div className="stat-big">{s.n}</div>
                <div className="font-body" style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#4A4A4A', marginTop: 8 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════ FAQ ════════════════ */}
        <section id="faq" style={{ maxWidth: 860, margin: '0 auto', padding: '88px 24px' }}>
          <span className="label">FAQ</span>
          <h2 className="font-display" style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, lineHeight: 1.08, marginTop: 8, marginBottom: 48 }}>
            Pertanyaan Yang<br /><em style={{ color: '#C8391A' }}>Sering Ditanyakan.</em>
          </h2>
          <div>
            {[
              { q: 'Apakah layanan ini benar-benar gratis?',        a: 'Ya, 100% gratis. Tidak ada biaya tersembunyi, tidak ada langganan. Akses ke keadilan adalah hak semua orang.' },
              { q: 'Berapa lama waktu respons dari pihak berwenang?', a: 'Rata-rata 24–48 jam. Setiap pembaruan status langsung dikirim ke email atau notifikasi HP Anda.' },
              { q: 'Apakah data saya aman?',                         a: 'Semua data dienkripsi dengan standar keamanan internasional. Kami tidak pernah menjual data ke pihak ketiga.' },
              { q: 'Bisakah saya melaporkan secara anonim?',         a: 'Ya. Anda bisa memilih tidak menyertakan identitas dalam laporan, meskipun laporan beridentitas cenderung lebih cepat diproses.' },
            ].map((item, i) => (
              <div key={i} className="faq-item">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <span className="font-display" style={{ fontSize: 17, fontWeight: 700 }}>{item.q}</span>
                  <span className="font-body" style={{ color: '#C8391A', fontSize: 22, flexShrink: 0, transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform .2s', display: 'inline-block' }}>+</span>
                </button>
                {openFaq === i && (
                  <p className="font-body" style={{ fontSize: 14, color: '#4A4A4A', lineHeight: 1.75, marginTop: 12 }}>{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════ CTA ════════════════ */}
        <section style={{ background: '#C8391A', padding: '88px 24px', position: 'relative', overflow: 'hidden' }}>
          <div className="ghost-char" style={{ right: -40, top: '50%', transform: 'translateY(-50%)', WebkitTextStroke: '1.5px rgba(245,240,232,.12)', opacity: 1 }}>!</div>
          <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <span className="label" style={{ color: 'rgba(245,240,232,.6)' }}>Bergabung Sekarang</span>
            <h2 className="font-display" style={{ fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 900, lineHeight: 1.05, color: '#F5F0E8', marginTop: 12, marginBottom: 16 }}>
              Siap Membuat<br />Perbedaan?
            </h2>
            <p className="font-body" style={{ fontSize: 15, color: 'rgba(245,240,232,.75)', lineHeight: 1.75, maxWidth: 460, margin: '0 auto 40px' }}>
              Bergabunglah dengan ribuan warga yang telah membantu mengubah sistem menjadi lebih responsif dan akuntabel.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
              <Link href="/auth/register" className="btn-white">Daftar Gratis →</Link>
              <a href="mailto:support@pengaduan.com" className="btn-ghost" style={{ borderColor: '#F5F0E8', color: '#F5F0E8' }}>Hubungi Support</a>
            </div>
          </div>
        </section>

      </main>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer style={{ background: '#1A1A1A', paddingTop: 64, paddingBottom: 32 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, paddingBottom: 48, borderBottom: '1px solid rgba(245,240,232,.1)' }} className="grid-cols-1 md:grid-cols-4">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, background: '#C8391A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="font-display" style={{ fontWeight: 900, fontSize: 17, color: '#F5F0E8' }}>P</span>
                </div>
                <span className="font-display" style={{ fontWeight: 700, fontSize: 15, color: '#F5F0E8' }}>Pengaduan <span style={{ color: '#C8391A' }}>Publik</span></span>
              </div>
              <p className="font-body" style={{ fontSize: 13, color: 'rgba(245,240,232,.4)', lineHeight: 1.7, maxWidth: 280 }}>
                Platform pengaduan publik yang transparan dan terpercaya untuk seluruh rakyat Indonesia.
              </p>
              <div className="stripe" style={{ height: 2, width: 48, marginTop: 20, opacity: 0.35 }} />
            </div>
            {[
              { title: 'Produk',     links: ['Fitur', 'Cara Kerja', 'Harga'] },
              { title: 'Perusahaan', links: ['Tentang', 'Blog', 'Kontak'] },
              { title: 'Legal',      links: ['Privasi', 'Syarat & Ketentuan', 'Lisensi'] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-body" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(245,240,232,.35)', marginBottom: 18 }}>{col.title}</h4>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {col.links.map(l => (
                    <li key={l} style={{ marginBottom: 10 }}>
                      <a href="#" className="font-body" style={{ fontSize: 13, color: 'rgba(245,240,232,.5)', textDecoration: 'none', transition: 'color .15s' }}
                        onMouseEnter={e => e.target.style.color = '#C8391A'}
                        onMouseLeave={e => e.target.style.color = 'rgba(245,240,232,.5)'}
                      >{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ paddingTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p className="font-body" style={{ fontSize: 11, color: 'rgba(245,240,232,.25)' }}>
              © {new Date().getFullYear()} Pengaduan Indonesia. Semua hak dilindungi undang-undang.
            </p>
            <div style={{ display: 'flex', gap: 24 }}>
              {['Twitter', 'Facebook', 'Instagram'].map(s => (
                <a key={s} href="#" className="font-body" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,240,232,.25)', textDecoration: 'none', transition: 'color .15s' }}
                  onMouseEnter={e => e.target.style.color = '#C8391A'}
                  onMouseLeave={e => e.target.style.color = 'rgba(245,240,232,.25)'}
                >{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}