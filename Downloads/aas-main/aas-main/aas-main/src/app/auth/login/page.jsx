'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      router.push('/homepage');
    } catch (err) {
      setError(err.message || 'Email atau password salah');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'DM Sans, sans-serif', background: '#F5F0E8' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=DM+Sans:wght@300;400;500;600&display=swap');

        .auth-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E");
          background-size: 200px;
          position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: .45;
        }

        .auth-input {
          width: 100%; padding: 13px 16px 13px 44px;
          border: 2px solid rgba(26,26,26,.15);
          background: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 14px; color: #1A1A1A;
          outline: none; transition: border-color .2s, box-shadow .2s;
          box-sizing: border-box;
        }
        .auth-input:focus { border-color: #C8391A; box-shadow: 0 0 0 3px rgba(200,57,26,.07); }
        .auth-input::placeholder { color: rgba(26,26,26,.35); }

        .auth-label {
          font-family: 'DM Sans'; font-size: 10px; font-weight: 700;
          letter-spacing: .2em; text-transform: uppercase; color: #1A1A1A;
          display: block; margin-bottom: 8px;
        }

        .auth-btn {
          width: 100%; padding: 14px;
          background: #C8391A; color: #F5F0E8;
          border: 2px solid #C8391A;
          font-family: 'DM Sans'; font-size: 12px; font-weight: 700;
          letter-spacing: .14em; text-transform: uppercase;
          cursor: pointer; transition: background .2s, border-color .2s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .auth-btn:hover:not(:disabled) { background: #1A1A1A; border-color: #1A1A1A; }
        .auth-btn:disabled { opacity: .55; cursor: not-allowed; }

        @keyframes auth-spin { to { transform: rotate(360deg); } }
        .auth-spin {
          width: 15px; height: 15px;
          border: 2px solid rgba(245,240,232,.35);
          border-top-color: #F5F0E8;
          border-radius: 50%;
          animation: auth-spin .7s linear infinite;
        }

        .auth-check {
          width: 16px; height: 16px; flex-shrink: 0;
          border: 2px solid rgba(26,26,26,.3);
          appearance: none; -webkit-appearance: none;
          cursor: pointer; position: relative; background: #fff;
          transition: background .15s, border-color .15s;
        }
        .auth-check:checked { background: #C8391A; border-color: #C8391A; }
        .auth-check:checked::after {
          content: ''; position: absolute;
          left: 3px; top: 0px; width: 5px; height: 9px;
          border: 2px solid #fff; border-top: none; border-left: none;
          transform: rotate(45deg);
        }

        .left-feat {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 18px 0;
          border-bottom: 1px solid rgba(245,240,232,.1);
        }
        .left-feat:last-child { border-bottom: none; }

        .marquee-auth { display: flex; width: max-content; animation: mqa 30s linear infinite; }
        @keyframes mqa { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        .stripe-auth {
          background: repeating-linear-gradient(-45deg, #C8391A, #C8391A 2px, transparent 2px, transparent 10px);
        }

        @media (max-width: 1023px) { .auth-left { display: none !important; } }
      `}</style>

      <div className="auth-noise" aria-hidden />

      {/* ── LEFT PANEL ── */}
      <div className="auth-left" style={{ width: '48%', background: '#1A1A1A', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', zIndex: 1 }}>

        {/* Ghost letter */}
        <div style={{ position: 'absolute', right: -40, bottom: -40, fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: 320, lineHeight: 1, color: 'transparent', WebkitTextStroke: '1.5px rgba(200,57,26,.12)', userSelect: 'none', pointerEvents: 'none' }}>M</div>

        {/* Top logo bar */}
        <div style={{ padding: '32px 40px', borderBottom: '1px solid rgba(245,240,232,.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: '#C8391A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: 17, color: '#F5F0E8' }}>P</span>
          </div>
          <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 14, color: '#F5F0E8', letterSpacing: '-.01em' }}>
            Pengaduan <span style={{ color: '#C8391A' }}>Publik</span>
          </span>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: '48px 40px', position: 'relative', zIndex: 2 }}>
          <span style={{ fontFamily: 'DM Sans', fontSize: 10, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(245,240,232,.4)' }}>Selamat Datang</span>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: 'clamp(32px,3.5vw,52px)', lineHeight: 1.05, color: '#F5F0E8', marginTop: 10, marginBottom: 16 }}>
            Platform<br /><em style={{ color: '#C8391A', fontStyle: 'italic' }}>Rakyat</em><br />Bersuara.
          </h2>
          <p style={{ fontFamily: 'DM Sans', fontSize: 14, color: 'rgba(245,240,232,.55)', lineHeight: 1.75, maxWidth: 340, marginBottom: 40 }}>
            Proses transparan, respons cepat, dan solusi nyata untuk setiap pengaduan masyarakat Indonesia.
          </p>

          <div style={{ borderTop: '1px solid rgba(245,240,232,.08)' }}>
            {[
              { icon: '🔒', title: 'Laporan Aman',       sub: 'Data terlindungi enkripsi tingkat enterprise.' },
              { icon: '👁️', title: 'Proses Transparan',  sub: 'Pantau status laporan Anda secara real-time.' },
              { icon: '⚡', title: 'Dukungan 24/7',      sub: 'Tim support siap membantu Anda kapan saja.' },
            ].map((f, i) => (
              <div key={i} className="left-feat">
                <div style={{ width: 36, height: 36, background: 'rgba(200,57,26,.15)', border: '1px solid rgba(200,57,26,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>{f.icon}</div>
                <div>
                  <p style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 13, color: '#F5F0E8', marginBottom: 3 }}>{f.title}</p>
                  <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(245,240,232,.45)', lineHeight: 1.6 }}>{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Marquee ticker */}
        <div style={{ background: '#C8391A', padding: '9px 0', overflow: 'hidden' }}>
          <div className="marquee-auth">
            {Array(6).fill('TRANSPARAN → AMAN → GRATIS → UNTUK RAKYAT →').map((t, i) => (
              <span key={i} style={{ fontFamily: 'DM Sans', color: '#F5F0E8', fontSize: 9, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', whiteSpace: 'nowrap', paddingRight: 40 }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Mobile logo */}
          <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ width: 32, height: 32, background: '#C8391A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: 15, color: '#F5F0E8' }}>P</span>
            </div>
            <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>Pengaduan <span style={{ color: '#C8391A' }}>Publik</span></span>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 32, borderBottom: '2px solid #1A1A1A', paddingBottom: 20 }}>
            <span style={{ fontFamily: 'DM Sans', fontSize: 10, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', color: '#C8391A' }}>Autentikasi</span>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: 'clamp(26px,3vw,38px)', lineHeight: 1.05, marginTop: 8 }}>
              Masuk ke Akun<br /><em style={{ color: '#C8391A', fontStyle: 'italic' }}>Anda.</em>
            </h1>
            <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#4A4A4A', marginTop: 8 }}>Gunakan kredensial untuk mengakses platform.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Error */}
            {error && (
              <div style={{ background: '#FEE2E2', border: '2px solid #EF4444', borderLeft: '4px solid #C8391A', padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <svg width="14" height="14" fill="none" stroke="#C8391A" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#991B1B', fontWeight: 600 }}>{error}</span>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="auth-label">Email</label>
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="15" height="15" fill="none" stroke="rgba(26,26,26,.4)" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input type="email" placeholder="nama@example.com" className="auth-input" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="auth-label">Password</label>
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="15" height="15" fill="none" stroke="rgba(26,26,26,.4)" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="auth-input" style={{ paddingRight: 44 }} value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                  {showPassword
                    ? <svg width="15" height="15" fill="none" stroke="rgba(26,26,26,.5)" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="15" height="15" fill="none" stroke="rgba(26,26,26,.5)" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {/* Remember + forgot */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
                <input type="checkbox" className="auth-check" />
                <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#4A4A4A' }}>Ingat saya</span>
              </label>
              <a href="#" style={{ fontFamily: 'DM Sans', fontSize: 12, fontWeight: 700, letterSpacing: '.06em', color: '#C8391A', textDecoration: 'none' }}>Lupa password?</a>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading} className="auth-btn">
              {isLoading ? <><div className="auth-spin" /> Memproses...</> : 'Masuk →'}
            </button>
          </form>

          {/* Register link */}
          <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#4A4A4A', textAlign: 'center', marginTop: 24 }}>
            Belum punya akun?{' '}
            <Link href="/auth/register" style={{ fontFamily: 'DM Sans', fontWeight: 700, color: '#C8391A', textDecoration: 'none', letterSpacing: '.04em' }}>Daftar sekarang →</Link>
          </p>

          {/* Demo info */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1.5px solid rgba(26,26,26,.1)', textAlign: 'center' }}>
            <span style={{ fontFamily: 'DM Sans', fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(26,26,26,.3)' }}>Demo: demo@example.com / password123</span>
          </div>
        </div>
      </div>
    </div>
  );
}