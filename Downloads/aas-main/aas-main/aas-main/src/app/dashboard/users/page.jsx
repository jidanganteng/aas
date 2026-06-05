'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';

export default function UserDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    apiFetch('/reports?my=true')
      .then((data) => {
        const r = data.reports || data || [];
        setReports(r);
        setStats({
          pending:  r.filter(x => x.status === 'PENDING').length,
          approved: r.filter(x => x.status === 'APPROVED').length,
          rejected: r.filter(x => x.status === 'REJECTED').length,
          total:    r.length,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus laporan ini?')) return;
    try {
      await apiFetch(`/reports/${id}`, { method: 'DELETE' });
      setReports(prev => prev.filter(r => r.id !== id));
      setStats(prev => ({ ...prev, total: prev.total - 1 }));
    } catch (err) { alert(err.message); }
  };

  const getStatus = (status) => {
    switch (status) {
      case 'PENDING':  return { text: 'Menunggu',  bg: '#FEF3C7', color: '#92400E', border: '#F59E0B' };
      case 'APPROVED': return { text: 'Disetujui', bg: '#D1FAE5', color: '#065F46', border: '#10B981' };
      case 'REJECTED': return { text: 'Ditolak',   bg: '#FEE2E2', color: '#991B1B', border: '#EF4444' };
      default:         return { text: status,      bg: '#F3F4F6', color: '#374151', border: '#D1D5DB' };
    }
  };

  const filtered = reports.filter(r =>
    (statusFilter === 'ALL' || r.status === statusFilter) &&
    (!query || (r.title || '').toLowerCase().includes(query.toLowerCase()))
  );

  if (loading) {
    return (
      <AuthGuard roles={['USER']}>
        <DashboardLayout>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, background: '#F5F0E8', flexDirection: 'column', gap: 16 }}>
            <div style={{ width: 44, height: 44, border: '3px solid rgba(200,57,26,.15)', borderTopColor: '#C8391A', borderRadius: '50%', animation: 'uds 0.8s linear infinite' }} />
            <style>{`@keyframes uds{to{transform:rotate(360deg)}}`}</style>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', color: '#4A4A4A' }}>Memuat dashboard...</p>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard roles={['USER']}>
      <DashboardLayout>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
          .ud-root { background:#F5F0E8; min-height:100vh; padding:32px 24px 64px; font-family:'DM Sans',sans-serif; }
          .ud-noise { background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E"); background-size:200px; position:fixed; inset:0; pointer-events:none; z-index:999; opacity:.4; }
          .ud-label { font-family:'DM Sans'; font-size:10px; font-weight:600; letter-spacing:.22em; text-transform:uppercase; color:#C8391A; }
          .ud-kpi { background:#fff; border:2px solid #1A1A1A; padding:24px 22px; position:relative; overflow:hidden; transition:transform .22s,box-shadow .22s; cursor:default; }
          .ud-kpi:hover { transform:translateY(-4px) rotate(-.3deg); box-shadow:5px 5px 0 #1A1A1A; }
          .ud-kpi-ghost { position:absolute; right:-8px; bottom:-18px; font-family:'Playfair Display',serif; font-weight:900; font-size:72px; line-height:1; color:transparent; -webkit-text-stroke:1.5px rgba(200,57,26,.1); user-select:none; pointer-events:none; }
          .ud-card { background:#fff; border:2px solid rgba(26,26,26,.1); padding:22px; transition:border-color .2s,transform .2s,box-shadow .2s; }
          .ud-card:hover { border-color:#1A1A1A; transform:translateY(-2px); box-shadow:4px 4px 0 #1A1A1A; }
          .ud-section { background:#fff; border:2px solid #1A1A1A; padding:24px; }
          .ud-input { width:100%; padding:10px 14px; border:2px solid rgba(26,26,26,.15); background:#F5F0E8; font-family:'DM Sans'; font-size:13px; color:#1A1A1A; outline:none; transition:border-color .2s; box-sizing:border-box; }
          .ud-input:focus { border-color:#C8391A; }
          .ud-btn-red { display:inline-flex; align-items:center; gap:8px; background:#C8391A; color:#F5F0E8; border:2px solid #C8391A; font-family:'DM Sans'; font-size:12px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; padding:12px 22px; cursor:pointer; transition:background .2s,border-color .2s; text-decoration:none; }
          .ud-btn-red:hover { background:#1A1A1A; border-color:#1A1A1A; }
          .ud-btn-dark { display:inline-flex; align-items:center; gap:8px; background:transparent; color:#1A1A1A; border:2px solid rgba(26,26,26,.2); font-family:'DM Sans'; font-size:12px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; padding:10px 18px; cursor:pointer; transition:background .2s,color .2s; text-decoration:none; }
          .ud-btn-dark:hover { background:#1A1A1A; color:#F5F0E8; border-color:#1A1A1A; }
          .ud-btn-ghost-danger { display:inline-flex; align-items:center; gap:6px; background:transparent; color:#C8391A; border:1.5px solid rgba(200,57,26,.25); font-family:'DM Sans'; font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; padding:7px 14px; cursor:pointer; transition:background .2s,border-color .2s; }
          .ud-btn-ghost-danger:hover { background:#FEE2E2; border-color:#C8391A; }
          .ud-icon-btn { width:32px; height:32px; border:1.5px solid rgba(26,26,26,.15); background:transparent; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; transition:background .15s,border-color .15s; text-decoration:none; }
          .ud-icon-btn:hover { background:#1A1A1A; border-color:#1A1A1A; }
          .ud-icon-btn:hover svg { stroke:#F5F0E8!important; }
          .ud-marquee { display:flex; width:max-content; animation:udm 28s linear infinite; }
          @keyframes udm { from{transform:translateX(0)} to{transform:translateX(-50%)} }
          .ud-bar { height:4px; background:rgba(26,26,26,.08); width:100%; }
          .ud-bar-fill { height:100%; transition:width .6s ease; }
          @media(max-width:1023px){ .ud-grid-main{grid-template-columns:1fr!important} }
          @media(max-width:767px){ .ud-grid-kpi{grid-template-columns:1fr 1fr!important} .ud-root{padding:16px 12px 48px} }
          @media(max-width:480px){ .ud-grid-kpi{grid-template-columns:1fr!important} }
        `}</style>

        <div className="ud-noise" aria-hidden />
        <div className="ud-root">

          {/* ── Masthead ── */}
          <div style={{ borderBottom: '2px solid #1A1A1A', paddingBottom: 14, marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <span className="ud-label">Dashboard Pengguna</span>
            <span style={{ fontFamily: 'DM Sans', fontSize: 9, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#F5F0E8', background: '#1A1A1A', padding: '4px 10px' }}>{stats.total} Laporan</span>
          </div>

          {/* ── Title + CTA ── */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontFamily: 'Playfair Display,serif', fontWeight: 900, fontSize: 'clamp(28px,4vw,48px)', lineHeight: 1.05 }}>
                Dashboard <em style={{ fontStyle: 'italic', color: '#C8391A' }}>Saya.</em>
              </h1>
              <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#4A4A4A', marginTop: 6 }}>Kelola laporan, pantau status, dan lihat hasil tindak lanjut.</p>
            </div>
            <Link href="/dashboard/users/reports/new" className="ud-btn-red">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Buat Laporan Baru
            </Link>
          </div>

          {/* ── KPI Cards ── */}
          <div className="ud-grid-kpi" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 28 }}>
            {[
              { label: 'Total Laporan', val: stats.total,    ghost: 'T', accent: '#1A1A1A', change: '+2.5%', up: true },
              { label: 'Menunggu',      val: stats.pending,  ghost: 'M', accent: '#F59E0B', change: '-1.2%', up: false },
              { label: 'Disetujui',     val: stats.approved, ghost: 'D', accent: '#10B981', change: '+8.3%', up: true },
              { label: 'Ditolak',       val: stats.rejected, ghost: 'X', accent: '#C8391A', change: '-0.5%', up: false },
            ].map((c, i) => (
              <div key={i} className="ud-kpi">
                <div className="ud-kpi-ghost">{c.ghost}</div>
                <span className="ud-label" style={{ display: 'block', marginBottom: 8 }}>{c.label}</span>
                <div style={{ fontFamily: 'Playfair Display,serif', fontWeight: 900, fontSize: 'clamp(32px,4vw,52px)', lineHeight: 1, color: c.accent }}>{c.val}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10 }}>
                  <span style={{ fontFamily: 'DM Sans', fontSize: 11, fontWeight: 700, color: c.up ? '#059669' : '#C8391A' }}>{c.up ? '↑' : '↓'} {c.change}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Marquee ── */}
          <div style={{ background: '#1A1A1A', padding: '9px 0', overflow: 'hidden', marginBottom: 28 }}>
            <div className="ud-marquee">
              {Array(6).fill('LAPORAN AKTIF → PANTAU STATUS → RESPONS CEPAT → TRANSPARANSI PENUH →').map((t, i) => (
                <span key={i} style={{ fontFamily: 'DM Sans', color: '#F5F0E8', fontSize: 10, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', whiteSpace: 'nowrap', paddingRight: 40 }}>{t}</span>
              ))}
            </div>
          </div>

          {/* ── Main Grid ── */}
          <div className="ud-grid-main" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>

            {/* ── LEFT: Reports ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Filter bar */}
              <div className="ud-section" style={{ padding: '18px 24px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
                    <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="13" height="13" fill="none" stroke="#4A4A4A" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" placeholder="Cari laporan..." value={query} onChange={e => setQuery(e.target.value)} className="ud-input" style={{ paddingLeft: 36 }} />
                  </div>
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="ud-input" style={{ width: 'auto', minWidth: 150 }}>
                    <option value="ALL">Semua Status</option>
                    <option value="PENDING">Menunggu</option>
                    <option value="APPROVED">Disetujui</option>
                    <option value="REJECTED">Ditolak</option>
                  </select>
                </div>
                <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#4A4A4A' }}>
                  Menampilkan <strong>{filtered.length}</strong> dari <strong>{stats.total}</strong> laporan
                </span>
              </div>

              {/* Report cards */}
              {filtered.length === 0 ? (
                <div className="ud-section" style={{ textAlign: 'center', padding: '56px 24px' }}>
                  <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 64, color: 'rgba(26,26,26,.08)', lineHeight: 1, marginBottom: 12 }}>!</div>
                  <p style={{ fontFamily: 'DM Sans', fontSize: 14, color: '#4A4A4A', marginBottom: 16 }}>Tidak ada laporan ditemukan.</p>
                  <Link href="/dashboard/users/reports/new" className="ud-btn-red" style={{ display: 'inline-flex' }}>Buat Laporan Pertama →</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filtered.map((report) => {
                    const s = getStatus(report.status);
                    const pct = report.status === 'APPROVED' ? 100 : report.status === 'REJECTED' ? 100 : 45;
                    const barColor = report.status === 'APPROVED' ? '#10B981' : report.status === 'REJECTED' ? '#C8391A' : '#F59E0B';
                    return (
                      <div key={report.id} className="ud-card">
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                          {/* Icon box */}
                          <div style={{ width: 42, height: 42, background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="16" height="16" fill="none" stroke="#F5F0E8" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {/* Title + badge */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                              <h3 style={{ fontFamily: 'Playfair Display,serif', fontWeight: 700, fontSize: 16, color: '#1A1A1A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 360 }}>{report.title}</h3>
                              <span style={{ fontFamily: 'DM Sans', fontSize: 9, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', padding: '3px 9px', background: s.bg, color: s.color, border: `1.5px solid ${s.border}`, flexShrink: 0 }}>{s.text}</span>
                            </div>
                            <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#4A4A4A', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {report.description || 'Tidak ada deskripsi'}
                            </p>
                            {/* Progress bar */}
                            <div style={{ marginTop: 12 }}>
                              <div className="ud-bar"><div className="ud-bar-fill" style={{ width: `${pct}%`, background: barColor }} /></div>
                            </div>
                            {/* Meta */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 10 }}>
                              {report.category && (
                                <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#4A4A4A', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <svg width="10" height="10" fill="none" stroke="#C8391A" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                                  {report.category.name}
                                </span>
                              )}
                              <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#4A4A4A', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <svg width="10" height="10" fill="none" stroke="#C8391A" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                {report.createdAt ? new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1.5px solid rgba(26,26,26,.08)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <Link href={`/dashboard/users/reports/${report.id}`} className="ud-btn-dark" style={{ padding: '8px 16px' }}>
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            Lihat Detail
                          </Link>
                          <button onClick={() => handleDelete(report.id)} className="ud-btn-ghost-danger">
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                            Hapus
                          </button>
                          <div style={{ flex: 1 }} />
                          <button className="ud-icon-btn" title="Download">
                            <svg width="12" height="12" fill="none" stroke="#1A1A1A" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── RIGHT: Sidebar ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* CTA dark card */}
              <div style={{ background: '#1A1A1A', border: '2px solid #1A1A1A', padding: 24, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: -16, bottom: -20, fontFamily: 'Playfair Display,serif', fontWeight: 900, fontSize: 100, color: 'transparent', WebkitTextStroke: '1.5px rgba(200,57,26,.18)', userSelect: 'none', pointerEvents: 'none', lineHeight: 1 }}>+</div>
                <span className="ud-label" style={{ color: 'rgba(245,240,232,.5)', display: 'block', marginBottom: 8 }}>Aksi</span>
                <h3 style={{ fontFamily: 'Playfair Display,serif', fontWeight: 700, fontSize: 20, color: '#F5F0E8', marginBottom: 10 }}>Buat Laporan Baru</h3>
                <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(245,240,232,.5)', lineHeight: 1.65, marginBottom: 18 }}>Laporkan masalah atau keluhan Anda sekarang juga.</p>
                <Link href="/dashboard/users/reports/new" className="ud-btn-red" style={{ width: '100%', justifyContent: 'center', boxSizing: 'border-box' }}>
                  Buat Sekarang →
                </Link>
              </div>

              {/* Status summary */}
              <div className="ud-section" style={{ padding: 22 }}>
                <span className="ud-label" style={{ display: 'block', marginBottom: 10 }}>Ringkasan Status</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Menunggu',  val: stats.pending,  color: '#F59E0B', bg: '#FEF3C7' },
                    { label: 'Disetujui', val: stats.approved, color: '#10B981', bg: '#D1FAE5' },
                    { label: 'Ditolak',   val: stats.rejected, color: '#C8391A', bg: '#FEE2E2' },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: s.bg, border: `1.5px solid ${s.color}` }}>
                      <span style={{ fontFamily: 'DM Sans', fontSize: 12, fontWeight: 700, color: '#1A1A1A' }}>{s.label}</span>
                      <span style={{ fontFamily: 'Playfair Display,serif', fontWeight: 900, fontSize: 22, color: s.color }}>{s.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick actions */}
              <div className="ud-section" style={{ padding: 22 }}>
                <span className="ud-label" style={{ display: 'block', marginBottom: 12 }}>Aksi Cepat</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button className="ud-btn-dark" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px' }}>
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Export Laporan
                  </button>
                  <button className="ud-btn-dark" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px' }}>
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    Hubungi Admin
                  </button>
                </div>
              </div>

              {/* Tips */}
              <div style={{ background: '#1A1A1A', border: '2px solid #1A1A1A', padding: 22 }}>
                <span className="ud-label" style={{ color: '#C8391A', display: 'block', marginBottom: 10 }}>💡 Tips</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Lengkapi data laporan dengan detail', 'Sertakan bukti/foto yang jelas', 'Periksa status secara berkala'].map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ width: 4, height: 4, background: '#C8391A', flexShrink: 0, marginTop: 6 }} />
                      <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(245,240,232,.6)', lineHeight: 1.6 }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}