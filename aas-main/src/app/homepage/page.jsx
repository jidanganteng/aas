'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Homepage() {
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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; }

        .font-display { font-family: 'Playfair Display', Georgia, serif; }
        .font-body { font-family: 'DM Sans', sans-serif; }

        .hero-number {
          font-family: 'Playfair Display', serif;
          font-size: clamp(120px, 22vw, 280px);
          font-weight: 900;
          line-height: 0.85;
          color: transparent;
          -webkit-text-stroke: 2px #C8391A;
          user-select: none;
          pointer-events: none;
        }

        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 28s linear infinite;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .stat-number {
          font-family: 'Playfair Display', serif;
          font-size: clamp(48px, 7vw, 88px);
          font-weight: 900;
          line-height: 1;
          color: #C8391A;
        }

        .diagonal-stripe {
          background: repeating-linear-gradient(
            -45deg,
            #C8391A,
            #C8391A 2px,
            transparent 2px,
            transparent 14px
          );
        }

        .card-hover {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px) rotate(-0.4deg);
          box-shadow: 6px 6px 0 #1A1A1A;
        }

        .btn-primary {
          background: #C8391A;
          color: #F5F0E8;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-size: 13px;
          padding: 14px 32px;
          border: 2px solid #C8391A;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: background 0.2s, color 0.2s;
          cursor: pointer;
        }
        .btn-primary:hover { background: #1A1A1A; border-color: #1A1A1A; }

        .btn-outline {
          background: transparent;
          color: #1A1A1A;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-size: 13px;
          padding: 14px 32px;
          border: 2px solid #1A1A1A;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: background 0.2s, color 0.2s;
          cursor: pointer;
        }
        .btn-outline:hover { background: #1A1A1A; color: #F5F0E8; }

        .section-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #C8391A;
        }

        .nav-link {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #1A1A1A;
          position: relative;
          padding-bottom: 2px;
          text-decoration: none;
          transition: color 0.2s;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 0; height: 1.5px;
          background: #C8391A;
          transition: width 0.25s ease;
        }
        .nav-link:hover { color: #C8391A; }
        .nav-link:hover::after { width: 100%; }

        .tear-line {
          border-top: 2px dashed rgba(26,26,26,0.2);
        }

        details summary::-webkit-details-marker { display: none; }

        .noise-overlay {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 100;
          opacity: 0.4;
        }

        .stamp {
          display: inline-block;
          border: 3px solid #C8391A;
          color: #C8391A;
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 4px 10px;
          transform: rotate(-2deg);
        }

        .pull-quote {
          border-left: 4px solid #C8391A;
          padding-left: 24px;
        }

        .faq-item {
          border-top: 1.5px solid rgba(26,26,26,0.15);
          padding: 20px 0;
        }
        .faq-item:last-child { border-bottom: 1.5px solid rgba(26,26,26,0.15); }

        .grid-photo {
          background: #D9D4C7;
          position: relative;
          overflow: hidden;
        }
        .grid-photo::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(200,57,26,0.1), transparent);
        }

        @media (max-width: 768px) {
          .hero-number { font-size: clamp(80px, 28vw, 150px); }
        }
      `}</style>

      {/* Noise texture overlay */}
      <div className="noise-overlay" aria-hidden="true" />

      {/* ─── NAV ─── */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#F5F0E8]/95 backdrop-blur-sm border-b border-[#1A1A1A]/10' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#C8391A] flex items-center justify-center">
              <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: 16, color: '#F5F0E8' }}>P</span>
            </div>
            <span className="font-display font-bold text-base tracking-tight hidden sm:inline">Pengaduan <span style={{ color: '#C8391A' }}>Publik</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {['Statistik','Manfaat','Laporan','Kontak'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="nav-link">{item}</a>
            ))}
          </nav>

          <div className="hidden sm:flex items-center gap-3">
            {!loading && !user ? (
              <>
                <Link href="/auth/login" className="btn-outline" style={{ padding: '10px 22px' }}>Masuk</Link>
                <Link href="/auth/register" className="btn-primary" style={{ padding: '10px 22px' }}>Daftar →</Link>
              </>
            ) : !loading && user ? (
              <Link href="/dashboard" className="btn-primary" style={{ padding: '10px 22px' }}>Dashboard →</Link>
            ) : (
              <div className="w-24 h-9 bg-[#1A1A1A]/10 animate-pulse" />
            )}
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden font-body text-sm uppercase tracking-widest border border-[#1A1A1A] px-3 py-1.5">
            {mobileMenuOpen ? 'Tutup' : 'Menu'}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-[#F5F0E8] border-t border-[#1A1A1A]/10 p-6 space-y-4 font-body">
            {['Statistik','Manfaat','Laporan','Kontak'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="block text-sm uppercase tracking-widest text-[#1A1A1A] hover:text-[#C8391A]">{item}</a>
            ))}
            <div className="pt-4 border-t border-[#1A1A1A]/10 flex flex-col gap-3">
              <Link href="/auth/login" className="btn-outline text-center justify-center">Masuk</Link>
              <Link href="/auth/register" className="btn-primary text-center justify-center">Daftar Sekarang →</Link>
            </div>
          </div>
        )}
      </header>

      <main className="pt-20">
        {/* ─── HERO SECTION ─── */}
        <section className="max-w-7xl mx-auto px-6 pt-12 pb-0 overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8 tear-line pb-5">
            <span className="section-label">Est. 2024 — Indonesia</span>
            <span className="stamp">Gratis & Transparan</span>
            <span className="section-label font-body" style={{ fontFamily: 'DM Sans', fontSize: 11 }}>Vol. I — Ed. Digital</span>
          </div>

          {/* Hero grid */}
          <div className="grid grid-cols-12 gap-0 items-end">
            {/* Big ghost number */}
            <div className="col-span-12 md:col-span-7 relative" style={{ minHeight: 240 }}>
              <div className="hero-number leading-none select-none absolute top-0 left-0 z-0">01</div>
              <div className="relative z-10 pt-16 md:pt-24 pb-8">
                <h1 className="font-display" style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.05, maxWidth: 600 }}>
                  Suara Rakyat<br />
                  <em style={{ fontStyle: 'italic', color: '#C8391A' }}>Harus Didengar.</em>
                </h1>
                <p className="font-body mt-6 text-[#4A4A4A] leading-relaxed" style={{ fontSize: 16, maxWidth: 460 }}>
                  Platform pengaduan publik yang menghubungkan warga dengan pihak berwenang. Laporkan, pantau, dan saksikan perubahan nyata di lingkungan Anda.
                </p>
                <div className="flex flex-wrap gap-4 mt-10">
                  <Link href="/dashboard/users" className="btn-primary">Mulai Melapor →</Link>
                  <Link href="/" className="btn-outline">Jelajahi Platform</Link>
                </div>
              </div>
            </div>

            {/* Side column */}
            <div className="hidden md:flex col-span-5 flex-col gap-4 pb-8 pl-10 border-l-2 border-[#1A1A1A]/10 ml-4">
              <div className="pull-quote">
                <p className="font-body text-sm text-[#4A4A4A] leading-relaxed italic">"Platform ini memudahkan saya melaporkan masalah lingkungan di lingkungan saya dan hasilnya nyata."</p>
                <p className="font-body text-xs text-[#C8391A] mt-2 uppercase tracking-widest not-italic">— Siti Nurhaliza, Bandung</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { n: '10K+', l: 'Laporan' },
                  { n: '95%', l: 'Respons' },
                  { n: '500+', l: 'Selesai' },
                  { n: '50K+', l: 'Pengguna' },
                ].map((s, i) => (
                  <div key={i} className="bg-[#1A1A1A] p-4">
                    <div className="font-display text-[#F5F0E8]" style={{ fontSize: 32, fontWeight: 900, lineHeight: 1 }}>{s.n}</div>
                    <div className="font-body text-[#F5F0E8]/50 text-xs uppercase tracking-widest mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── MARQUEE ─── */}
        <div className="bg-[#C8391A] py-3 mt-0 overflow-hidden">
          <div className="marquee-track">
            {Array(6).fill('LAPORAN CEPAT → RESPONS 24 JAM → TRANSPARAN → AMAN → GRATIS → UNTUK SEMUA RAKYAT INDONESIA →').map((t, i) => (
              <span key={i} className="font-body text-[#F5F0E8] text-sm font-medium tracking-widest uppercase whitespace-nowrap px-6">{t}</span>
            ))}
          </div>
        </div>

        {/* ─── STATISTIK ─── */}
        <section id="statistik" className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-start justify-between mb-12 flex-wrap gap-4">
            <div>
              <span className="section-label">Dampak Terukur</span>
              <h2 className="font-display mt-2" style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, lineHeight: 1.1 }}>Angka Yang Bicara<br /><em style={{ color: '#C8391A' }}>Sendiri.</em></h2>
            </div>
            <Link href="/auth/register" className="btn-outline self-end">Bergabung →</Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t-2 border-[#1A1A1A]">
            {[
              { n: '10K+', l: 'Laporan Terkirim', desc: 'Dari seluruh penjuru Indonesia' },
              { n: '95%', l: 'Tingkat Respons', desc: 'Ditindaklanjuti dalam 48 jam' },
              { n: '500+', l: 'Masalah Selesai', desc: 'Perubahan nyata di lapangan' },
              { n: '50K+', l: 'Pengguna Aktif', desc: 'Warga yang peduli bersama' },
            ].map((s, i) => (
              <div key={i} className="border-b-2 border-r-2 border-[#1A1A1A] p-8 last:border-r-0 md:even:border-r-2">
                <div className="stat-number">{s.n}</div>
                <div className="font-body font-medium mt-2 text-sm uppercase tracking-wider">{s.l}</div>
                <div className="font-body text-xs text-[#4A4A4A] mt-1">{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── MANFAAT ─── */}
        <section id="manfaat" className="bg-[#1A1A1A] py-20">
          <div className="max-w-7xl mx-auto px-6">
            <span className="section-label" style={{ color: '#E8A090' }}>Keunggulan Platform</span>
            <h2 className="font-display text-[#F5F0E8] mt-2 mb-12" style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, lineHeight: 1.1 }}>
              Dibangun Untuk<br /><em style={{ color: '#C8391A' }}>Kepercayaan Anda.</em>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#F5F0E8]/10">
              {[
                { icon: '🔐', title: 'Aman & Terenkripsi', desc: 'Data Anda dilindungi enkripsi tingkat enterprise. Privasi adalah hak Anda.' },
                { icon: '⚡', title: 'Respons 24 Jam', desc: 'Laporan diproses cepat dengan notifikasi real-time ke genggaman Anda.' },
                { icon: '👁️', title: 'Transparansi Penuh', desc: 'Pantau setiap tahap proses dari awal hingga penyelesaian laporan.' },
                { icon: '🗺️', title: 'Seluruh Indonesia', desc: 'Terhubung ke instansi terkait di 500+ kota dan kabupaten.' },
                { icon: '✅', title: 'Verifikasi Profesional', desc: 'Tim ahli memvalidasi laporan sebelum diteruskan ke pejabat berwenang.' },
                { icon: '📊', title: 'Dampak Terukur', desc: 'Lihat data dan statistik nyata dari setiap laporan yang Anda kirim.' },
              ].map((item, i) => (
                <div key={i} className="bg-[#1A1A1A] p-8 card-hover border border-[#F5F0E8]/5 hover:border-[#C8391A]/40" style={{ transition: 'border-color 0.2s, transform 0.2s' }}>
                  <span style={{ fontSize: 28 }}>{item.icon}</span>
                  <h3 className="font-display text-[#F5F0E8] mt-4 mb-2" style={{ fontSize: 20, fontWeight: 700 }}>{item.title}</h3>
                  <p className="font-body text-[#F5F0E8]/50 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── JENIS LAPORAN ─── */}
        <section id="laporan" className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="sticky top-28">
              <span className="section-label">Kategori</span>
              <h2 className="font-display mt-2" style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, lineHeight: 1.1 }}>
                Semua Masalah<br /><em style={{ color: '#C8391A' }}>Kami Tampung.</em>
              </h2>
              <p className="font-body text-[#4A4A4A] mt-4 leading-relaxed" style={{ fontSize: 15 }}>
                Dari kerusakan jalan hingga pelayanan publik yang buruk — setiap laporan penting dan layak ditindaklanjuti.
              </p>
              <div className="mt-8 diagonal-stripe h-1 w-24" />
            </div>

            <div className="space-y-3">
              {[
                { icon: '🏛️', title: 'Pelayanan Publik', desc: 'Keluhan terkait layanan dari instansi pemerintah' },
                { icon: '🏗️', title: 'Infrastruktur', desc: 'Kerusakan jalan, jembatan, dan fasilitas umum' },
                { icon: '🌍', title: 'Lingkungan', desc: 'Pencemaran, banjir, dan masalah alam sekitar' },
                { icon: '📚', title: 'Pendidikan', desc: 'Kualitas pendidikan dan fasilitas sekolah' },
                { icon: '⚕️', title: 'Kesehatan', desc: 'Akses dan kualitas layanan kesehatan masyarakat' },
                { icon: '🚔', title: 'Keamanan', desc: 'Keamanan dan ketertiban umum di lingkungan Anda' },
              ].map((cat, i) => (
                <div key={i} className="flex items-center gap-5 p-5 border border-[#1A1A1A]/10 hover:border-[#C8391A] bg-white card-hover cursor-pointer group" style={{ borderRadius: 0 }}>
                  <span className="text-2xl w-10 text-center flex-shrink-0">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold" style={{ fontSize: 17 }}>{cat.title}</div>
                    <div className="font-body text-[#4A4A4A] text-sm">{cat.desc}</div>
                  </div>
                  <span className="text-[#C8391A] opacity-0 group-hover:opacity-100 transition-opacity font-body text-sm">→</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── PROSES ─── */}
        <section className="bg-[#F5F0E8] border-y-2 border-[#1A1A1A] py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-14">
              <span className="section-label">Cara Kerja</span>
              <h2 className="font-display mt-2" style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, lineHeight: 1.1 }}>
                Empat Langkah,<br /><em style={{ color: '#C8391A' }}>Satu Tujuan.</em>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border-t-2 border-[#1A1A1A]">
              {[
                { num: '01', title: 'Buat Akun', desc: 'Daftar gratis. Tidak perlu data berlebihan, cukup email Anda.' },
                { num: '02', title: 'Isi Laporan', desc: 'Deskripsikan masalah dengan lengkap dan jelas.' },
                { num: '03', title: 'Unggah Bukti', desc: 'Foto atau video memperkuat laporan Anda.' },
                { num: '04', title: 'Pantau', desc: 'Terima notifikasi real-time setiap ada perkembangan.' },
              ].map((s, i) => (
                <div key={i} className={`border-b-2 border-r-2 border-[#1A1A1A] p-8 ${i === 3 ? 'border-r-0' : ''}`}>
                  <div className="font-display text-[#C8391A]" style={{ fontSize: 56, fontWeight: 900, lineHeight: 1 }}>{s.num}</div>
                  <h3 className="font-display mt-4 mb-2" style={{ fontSize: 20, fontWeight: 700 }}>{s.title}</h3>
                  <p className="font-body text-[#4A4A4A] text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TESTIMONIAL ─── */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <span className="section-label">Kisah Nyata</span>
          <h2 className="font-display mt-2 mb-12" style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, lineHeight: 1.1 }}>
            Dari Mereka Yang<br /><em style={{ color: '#C8391A' }}>Sudah Merasakan.</em>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Budi Santoso', city: 'Jakarta Selatan', quote: 'Laporan saya tentang jalan rusak ditindaklanjuti dalam 2 minggu. Tidak pernah sesimpel ini sebelumnya.', rating: 5 },
              { name: 'Siti Nurhaliza', city: 'Bandung', quote: 'Platform ini memudahkan saya melaporkan masalah lingkungan. Petugas langsung merespons!', rating: 5 },
              { name: 'Ahmad Wijaya', city: 'Surabaya', quote: 'Akhirnya ada platform yang benar-benar mendengarkan suara rakyat. Transparan dan terpercaya.', rating: 5 },
            ].map((t, i) => (
              <div key={i} className={`p-8 border-2 border-[#1A1A1A] card-hover ${i === 1 ? 'bg-[#1A1A1A] text-[#F5F0E8]' : 'bg-white'}`}>
                <div className="flex gap-1 mb-6">
                  {Array(t.rating).fill(0).map((_, j) => (
                    <div key={j} className="w-3 h-3 bg-[#C8391A]" />
                  ))}
                </div>
                <p className="font-body leading-relaxed mb-6" style={{ fontSize: 15, fontStyle: 'italic', color: i === 1 ? '#F5F0E8' : '#1A1A1A' }}>
                  "{t.quote}"
                </p>
                <div className="tear-line pt-5">
                  <p className="font-display font-bold" style={{ fontSize: 15, color: i === 1 ? '#F5F0E8' : '#1A1A1A' }}>{t.name}</p>
                  <p className="font-body text-xs uppercase tracking-widest mt-1" style={{ color: '#C8391A' }}>{t.city}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="bg-[#C8391A] py-24 overflow-hidden relative">
          <div className="hero-number absolute -right-12 top-1/2 -translate-y-1/2 opacity-10" style={{ color: 'transparent', WebkitTextStroke: '2px #F5F0E8' }}>!</div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <span className="font-body text-[#F5F0E8]/70 text-xs uppercase tracking-[0.25em]">Bergabunglah Sekarang</span>
            <h2 className="font-display text-[#F5F0E8] mt-4 mb-4" style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.05 }}>
              Jadilah Bagian<br />Dari Perubahan.
            </h2>
            <p className="font-body text-[#F5F0E8]/80 mb-10 mx-auto leading-relaxed" style={{ fontSize: 16, maxWidth: 480 }}>
              50.000+ warga sudah bergabung. Bersama kita bisa membuat sistem yang lebih responsif dan akuntabel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="btn-primary" style={{ background: '#F5F0E8', color: '#C8391A', borderColor: '#F5F0E8', fontSize: 14, padding: '16px 40px' }}>
                Daftar Gratis Sekarang →
              </Link>
              <Link href="/" className="btn-outline" style={{ borderColor: '#F5F0E8', color: '#F5F0E8', fontSize: 14, padding: '16px 40px' }}>
                Pelajari Lebih Lanjut
              </Link>
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section id="kontak" className="max-w-3xl mx-auto px-6 py-20">
          <span className="section-label">FAQ</span>
          <h2 className="font-display mt-2 mb-10" style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, lineHeight: 1.1 }}>
            Ada Yang Ingin<br /><em style={{ color: '#C8391A' }}>Anda Tanyakan?</em>
          </h2>
          <div>
            {[
              { q: 'Berapa biaya untuk menggunakan platform ini?', a: 'Gratis 100%. Tidak ada biaya tersembunyi, tidak ada langganan. Kami percaya akses ke keadilan adalah hak semua orang.' },
              { q: 'Berapa lama proses respons dari pihak terkait?', a: 'Rata-rata 24–48 jam. Anda akan mendapat notifikasi langsung ke email atau HP setiap ada pembaruan status.' },
              { q: 'Bisakah saya melaporkan secara anonim?', a: 'Ya. Anda bisa memilih untuk tidak menyertakan identitas dalam laporan, meskipun laporan beridentitas cenderung lebih cepat diproses.' },
              { q: 'Apa yang dilakukan dengan data saya?', a: 'Data Anda dienkripsi dan hanya digunakan untuk memproses laporan. Kami tidak pernah menjual data ke pihak ketiga manapun.' },
              { q: 'Bagaimana cara menghubungi support?', a: 'Email kami di support@pengaduan.com atau gunakan live chat di dalam aplikasi. Tim kami siap membantu setiap hari.' },
            ].map((item, i) => (
              <div key={i} className="faq-item">
                <button
                  className="w-full text-left flex items-center justify-between gap-4 font-display font-bold"
                  style={{ fontSize: 17, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{item.q}</span>
                  <span className="font-body text-[#C8391A] text-xl flex-shrink-0" style={{ transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                </button>
                {openFaq === i && (
                  <p className="font-body text-[#4A4A4A] mt-3 leading-relaxed" style={{ fontSize: 15 }}>{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#1A1A1A] text-[#F5F0E8] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#F5F0E8]/10">
            <div className="md:col-span-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-[#C8391A] flex items-center justify-center">
                  <span className="font-display font-black text-[#F5F0E8]" style={{ fontSize: 18 }}>P</span>
                </div>
                <span className="font-display font-bold text-xl">Pengaduan <span style={{ color: '#C8391A' }}>Publik</span></span>
              </div>
              <p className="font-body text-[#F5F0E8]/50 text-sm leading-relaxed max-w-xs">
                Platform pengaduan publik yang transparan, terpercaya, dan responsif untuk seluruh rakyat Indonesia.
              </p>
              <div className="mt-6 diagonal-stripe h-0.5 w-16" style={{ opacity: 0.4 }} />
            </div>
            {[
              { title: 'Layanan', links: ['Cara Kerja', 'Fitur', 'Dashboard'] },
              { title: 'Perusahaan', links: ['Tentang Kami', 'Blog', 'Karir'] },
              { title: 'Legal', links: ['Privasi', 'Syarat & Ketentuan', 'Hubungi Kami'] },
            ].map((col, i) => (
              <div key={i} className="md:col-span-2">
                <h4 className="font-body font-medium text-xs uppercase tracking-[0.2em] mb-5 text-[#F5F0E8]/40">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map(l => (
                    <li key={l}><a href="#" className="font-body text-sm text-[#F5F0E8]/60 hover:text-[#C8391A] transition">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-body text-[#F5F0E8]/30 text-xs">© {new Date().getFullYear()} Pengaduan Indonesia. Semua hak dilindungi undang-undang.</p>
            <div className="flex gap-5">
              {['Twitter', 'Facebook', 'Instagram', 'TikTok'].map(s => (
                <a key={s} href="#" className="font-body text-xs text-[#F5F0E8]/30 hover:text-[#C8391A] transition uppercase tracking-widest">{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}