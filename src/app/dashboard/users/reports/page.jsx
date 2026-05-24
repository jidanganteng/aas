'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';

export default function UserReportsPage() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => { fetchReports(); }, []);

  useEffect(() => {
    let f = reports;
    if (searchTerm) f = f.filter(r =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (statusFilter !== 'ALL') f = f.filter(r => r.status === statusFilter);
    setFilteredReports(f);
  }, [searchTerm, statusFilter, reports]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/reports');
      setReports(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Gagal mengambil laporan:', e);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (status) => {
    switch (status) {
      case 'PENDING':  return { text: 'Menunggu',  bg: '#FEF3C7', color: '#92400E', border: '#F59E0B' };
      case 'APPROVED': return { text: 'Disetujui', bg: '#D1FAE5', color: '#065F46', border: '#10B981' };
      case 'REJECTED': return { text: 'Ditolak',   bg: '#FEE2E2', color: '#991B1B', border: '#EF4444' };
      default:         return { text: status,      bg: '#F3F4F6', color: '#374151', border: '#D1D5DB' };
    }
  };

  const stats = {
    total:    reports.length,
    pending:  reports.filter(r => r.status === 'PENDING').length,
    approved: reports.filter(r => r.status === 'APPROVED').length,
    rejected: reports.filter(r => r.status === 'REJECTED').length,
  };

  return (
    <AuthGuard roles={['USER']}>
      <DashboardLayout>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
          .ur-root { background: #F5F0E8; min-height: 100vh; padding: 32px 24px 64px; font-family: 'DM Sans', sans-serif; }
          .ur-label { font-family: 'DM Sans'; font-size: 10px; font-weight: 600; letter-spacing: .22em; text-transform: uppercase; color: #C8391A; }
          .ur-noise { background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E"); background-size:200px; position:fixed; inset:0; pointer-events:none; z-index:999; opacity:.4; }
          .ur-kpi { background:#fff; border:2px solid #1A1A1A; padding:24px 20px; position:relative; overflow:hidden; transition:transform .22s,box-shadow .22s; }
          .ur-kpi:hover { transform:translateY(-4px) rotate(-.3deg); box-shadow:5px 5px 0 #1A1A1A; }
          .ur-kpi-ghost { position:absolute; right:-8px; bottom:-18px; font-family:'Playfair Display',serif; font-weight:900; font-size:68px; line-height:1; color:transparent; -webkit-text-stroke:1.5px rgba(200,57,26,.1); user-select:none; pointer-events:none; }
          .ur-section { background:#fff; border:2px solid #1A1A1A; padding:28px; }
          .ur-input { width:100%; padding:10px 14px; border:2px solid rgba(26,26,26,.15); background:#F5F0E8; font-family:'DM Sans'; font-size:13px; color:#1A1A1A; outline:none; transition:border-color .2s; box-sizing:border-box; }
          .ur-input:focus { border-color:#C8391A; }
          .ur-btn-red { display:inline-flex; align-items:center; gap:8px; background:#C8391A; color:#F5F0E8; border:2px solid #C8391A; font-family:'DM Sans'; font-size:12px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; padding:12px 24px; cursor:pointer; transition:background .2s,border-color .2s; text-decoration:none; }
          .ur-btn-red:hover { background:#1A1A1A; border-color:#1A1A1A; }
          .ur-card { background:#fff; border:2px solid rgba(26,26,26,.1); padding:22px; transition:border-color .22s,transform .22s,box-shadow .22s; cursor:default; }
          .ur-card:hover { border-color:#1A1A1A; transform:translateY(-2px); box-shadow:4px 4px 0 #1A1A1A; }
          .ur-tr { border-top:1.5px solid rgba(26,26,26,.08); transition:background .15s; }
          .ur-tr:hover { background:rgba(200,57,26,.03); }
          .ur-icon-btn { width:32px; height:32px; border:1.5px solid rgba(26,26,26,.15); background:transparent; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background .15s,border-color .15s; text-decoration:none; }
          .ur-icon-btn:hover { background:#1A1A1A; border-color:#1A1A1A; }
          .ur-icon-btn:hover svg { stroke:#F5F0E8; }
          .ur-marquee-track { display:flex; width:max-content; animation:urm 28s linear infinite; }
          @keyframes urm { from{transform:translateX(0)} to{transform:translateX(-50%)} }
          @keyframes ur-spin { to{transform:rotate(360deg)} }
          .ur-spin { width:40px; height:40px; border:3px solid rgba(200,57,26,.15); border-top-color:#C8391A; border-radius:50%; animation:ur-spin .8s linear infinite; }
          @media(max-width:767px){ .ur-grid-kpi{grid-template-columns:1fr 1fr!important} .ur-root{padding:16px 12px 48px} }
          @media(max-width:480px){ .ur-grid-kpi{grid-template-columns:1fr!important} }
        `}</style>

        <div className="ur-noise" aria-hidden />
        <div className="ur-root">

          {/* Masthead */}
          <div style={{ borderBottom: '2px solid #1A1A1A', paddingBottom: 14, marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <span className="ur-label">Riwayat Laporan Saya</span>
            <span style={{ fontFamily: 'DM Sans', fontSize: 9, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#F5F0E8', background: '#1A1A1A', padding: '4px 10px' }}>{stats.total} Laporan</span>
          </div>

          {/* Title + CTA */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: 'clamp(28px,4vw,44px)', lineHeight: 1.05 }}>
                Laporan <em style={{ fontStyle: 'italic', color: '#C8391A' }}>Saya.</em>
              </h1>
              <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#4A4A4A', marginTop: 6 }}>Lihat dan pantau semua laporan yang telah Anda buat.</p>
            </div>
            <Link href="/dashboard/users/reports/new" className="ur-btn-red">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Buat Laporan Baru
            </Link>
          </div>

          {/* KPI Cards */}
          <div className="ur-grid-kpi" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 28 }}>
            {[
              { label: 'Total Laporan', val: stats.total,    ghost: 'T', accent: '#1A1A1A' },
              { label: 'Menunggu',      val: stats.pending,  ghost: 'M', accent: '#F59E0B' },
              { label: 'Disetujui',     val: stats.approved, ghost: 'D', accent: '#10B981' },
              { label: 'Ditolak',       val: stats.rejected, ghost: 'X', accent: '#C8391A' },
            ].map((c, i) => (
              <div key={i} className="ur-kpi">
                <div className="ur-kpi-ghost">{c.ghost}</div>
                <span className="ur-label" style={{ display: 'block', marginBottom: 8 }}>{c.label}</span>
                <div style={{ fontFamily: 'Playfair Display,serif', fontWeight: 900, fontSize: 'clamp(32px,4vw,48px)', lineHeight: 1, color: c.accent }}>{c.val}</div>
              </div>
            ))}
          </div>

          {/* Marquee */}
          <div style={{ background: '#1A1A1A', padding: '9px 0', overflow: 'hidden', marginBottom: 28 }}>
            <div className="ur-marquee-track">
              {Array(6).fill('LAPORAN AKTIF → PANTAU STATUS → RESPONS CEPAT → TRANSPARANSI PENUH →').map((t, i) => (
                <span key={i} style={{ fontFamily: 'DM Sans', color: '#F5F0E8', fontSize: 10, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', whiteSpace: 'nowrap', paddingRight: 40 }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Filter bar */}
          <div className="ur-section" style={{ marginBottom: 20, padding: '20px 24px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" fill="none" stroke="#4A4A4A" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" placeholder="Cari judul atau deskripsi..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="ur-input" style={{ paddingLeft: 36 }} />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="ur-input" style={{ width: 'auto', minWidth: 160 }}>
                <option value="ALL">Semua Status</option>
                <option value="PENDING">Menunggu</option>
                <option value="APPROVED">Disetujui</option>
                <option value="REJECTED">Ditolak</option>
              </select>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0' }}>
              <div className="ur-spin" />
              <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#4A4A4A', marginTop: 16, letterSpacing: '.12em', textTransform: 'uppercase' }}>Memuat laporan...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="ur-section" style={{ textAlign: 'center', padding: '56px 24px' }}>
              <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 64, color: 'rgba(26,26,26,.08)', lineHeight: 1, marginBottom: 12 }}>!</div>
              <p style={{ fontFamily: 'DM Sans', fontSize: 14, color: '#4A4A4A', marginBottom: 16 }}>Belum ada laporan yang ditemukan.</p>
              <Link href="/dashboard/users/reports/new" className="ur-btn-red" style={{ display: 'inline-flex' }}>Buat Laporan Pertama →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredReports.map((report) => {
                const s = getStatus(report.status);
                return (
                  <div key={report.id} className="ur-card">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Title row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                          <h3 style={{ fontFamily: 'Playfair Display,serif', fontWeight: 700, fontSize: 17, color: '#1A1A1A', margin: 0 }}>{report.title}</h3>
                          <span style={{ fontFamily: 'DM Sans', fontSize: 9, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', padding: '3px 9px', background: s.bg, color: s.color, border: `1.5px solid ${s.border}`, flexShrink: 0 }}>{s.text}</span>
                        </div>
                        <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#4A4A4A', lineHeight: 1.65, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{report.description}</p>
                        {/* Meta */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12 }}>
                          <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#4A4A4A', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <svg width="11" height="11" fill="none" stroke="#C8391A" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            {new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                          {report.category_name && (
                            <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#4A4A4A', display: 'flex', alignItems: 'center', gap: 5 }}>
                              <svg width="11" height="11" fill="none" stroke="#C8391A" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                              {report.category_name}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Action */}
                      <Link href={`/dashboard/users/reports/${report.id}`} className="ur-icon-btn" title="Lihat Detail">
                        <svg width="13" height="13" fill="none" stroke="#1A1A1A" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}