'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import DashboardLayout from '@/components/DashboardLayout';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReports: 0,
    pendingReports: 0,
    approvedReports: 0,
    rejectedReports: 0,
    recentReports: []
  });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    Promise.all([
      apiFetch('/users?limit=1').catch(() => ({ total: 0 })),
      apiFetch('/reports?limit=20').catch(() => ({ reports: [], total: 0 })),
      apiFetch('/reports/status/count').catch(() => ({})),
    ]).then(([usersData, reportsData, statusData]) => {
      setStats({
        totalUsers: usersData.total || usersData.users?.length || 0,
        totalReports: reportsData.total || reportsData.reports?.length || 0,
        pendingReports: statusData.pending || 0,
        approvedReports: statusData.approved || 0,
        rejectedReports: statusData.rejected || 0,
        recentReports: reportsData.reports || reportsData || []
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredReports = stats.recentReports.filter(r =>
    (statusFilter === 'ALL' || r.status === statusFilter) &&
    (!query || (r.title || '').toLowerCase().includes(query.toLowerCase()))
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING':  return { background: '#FEF3C7', color: '#92400E', border: '1.5px solid #F59E0B' };
      case 'APPROVED': return { background: '#D1FAE5', color: '#065F46', border: '1.5px solid #10B981' };
      case 'REJECTED': return { background: '#FEE2E2', color: '#991B1B', border: '1.5px solid #EF4444' };
      default:         return { background: '#F3F4F6', color: '#374151' };
    }
  };

  const getStatusLabel = (status) => {
    if (status === 'PENDING') return 'Menunggu';
    if (status === 'APPROVED') return 'Disetujui';
    if (status === 'REJECTED') return 'Ditolak';
    return status;
  };

  if (loading) {
    return (
      <AuthGuard roles={["ADMIN", "SUPER_ADMIN"]}>
        <DashboardLayout>
          <div style={styles.loadingWrap}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Memuat dashboard...</p>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  const kpiCards = [
    { title: 'Total Pengguna',        value: stats.totalUsers,      change: '+5.2%',  up: true,  sub: 'Pengguna aktif',      num: '01' },
    { title: 'Total Laporan',         value: stats.totalReports,    change: '+12.5%', up: true,  sub: 'Laporan masuk',       num: '02' },
    { title: 'Menunggu Verifikasi',   value: stats.pendingReports,  change: '-3.1%',  up: false, sub: 'Perlu tindakan',      num: '03' },
    { title: 'Terselesaikan',         value: stats.approvedReports, change: '+18.3%', up: true,  sub: 'Laporan disetujui',   num: '04' },
  ];

  const distItems = [
    { label: 'Menunggu',   value: stats.pendingReports,  color: '#F59E0B', pct: stats.totalReports ? (stats.pendingReports  / stats.totalReports * 100).toFixed(1) : 0 },
    { label: 'Disetujui',  value: stats.approvedReports, color: '#10B981', pct: stats.totalReports ? (stats.approvedReports / stats.totalReports * 100).toFixed(1) : 0 },
    { label: 'Ditolak',    value: stats.rejectedReports, color: '#C8391A', pct: stats.totalReports ? (stats.rejectedReports / stats.totalReports * 100).toFixed(1) : 0 },
  ];

  return (
    <AuthGuard roles={["ADMIN", "SUPER_ADMIN"]}>
      <DashboardLayout>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

          .adm-root { background: #F5F0E8; min-height: 100vh; padding: 32px 24px 64px; }

          /* spinner */
          @keyframes spin { to { transform: rotate(360deg); } }
          .adm-spin { width: 48px; height: 48px; border: 3px solid rgba(200,57,26,.15); border-top-color: #C8391A; border-radius: 50%; animation: spin .8s linear infinite; }

          /* marquee */
          .adm-marquee-track { display: flex; width: max-content; animation: mq 28s linear infinite; }
          @keyframes mq { from { transform: translateX(0); } to { transform: translateX(-50%); } }

          /* KPI card */
          .adm-kpi {
            background: #fff; border: 2px solid #1A1A1A;
            padding: 28px 24px; position: relative; overflow: hidden;
            transition: transform .22s ease, box-shadow .22s ease;
          }
          .adm-kpi:hover { transform: translateY(-4px) rotate(-.3deg); box-shadow: 5px 5px 0 #1A1A1A; }
          .adm-kpi-ghost {
            position: absolute; right: -10px; bottom: -20px;
            font-family: 'Playfair Display', serif; font-weight: 900;
            font-size: 72px; line-height: 1; color: transparent;
            -webkit-text-stroke: 1.5px rgba(200,57,26,.1);
            user-select: none; pointer-events: none;
          }

          /* progress bar */
          .adm-bar-track { height: 6px; background: rgba(26,26,26,.1); width: 100%; overflow: hidden; }
          .adm-bar-fill  { height: 100%; transition: width .6s ease; }

          /* table row */
          .adm-tr { border-top: 1.5px solid rgba(26,26,26,.08); transition: background .15s; }
          .adm-tr:hover { background: rgba(200,57,26,.03); }

          /* feat row */
          .adm-feat-row { display: flex; align-items: flex-start; gap: 16px; padding: 16px 0; border-top: 1.5px solid rgba(26,26,26,.1); }
          .adm-feat-row:last-child { border-bottom: 1.5px solid rgba(26,26,26,.1); }

          /* input / select */
          .adm-input {
            width: 100%; padding: 10px 14px; border: 2px solid rgba(26,26,26,.15);
            background: #F5F0E8; font-family: 'DM Sans', sans-serif; font-size: 13px;
            color: #1A1A1A; outline: none; transition: border-color .2s;
          }
          .adm-input:focus { border-color: #C8391A; }

          /* btn */
          .adm-btn-red {
            display: inline-flex; align-items: center; gap: 8px;
            background: #C8391A; color: #F5F0E8; border: 2px solid #C8391A;
            font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600;
            letter-spacing: .1em; text-transform: uppercase; padding: 11px 20px; cursor: pointer;
            transition: background .2s, border-color .2s; width: 100%; justify-content: center;
          }
          .adm-btn-red:hover { background: #1A1A1A; border-color: #1A1A1A; }

          .adm-btn-dark {
            display: inline-flex; align-items: center; gap: 8px;
            background: transparent; color: #1A1A1A; border: 2px solid rgba(26,26,26,.2);
            font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600;
            letter-spacing: .1em; text-transform: uppercase; padding: 11px 20px; cursor: pointer;
            transition: background .2s, border-color .2s, color .2s; width: 100%; justify-content: center;
          }
          .adm-btn-dark:hover { background: #1A1A1A; color: #F5F0E8; border-color: #1A1A1A; }

          .adm-icon-btn {
            width: 34px; height: 34px; border: 1.5px solid rgba(26,26,26,.15);
            background: transparent; display: inline-flex; align-items: center; justify-content: center;
            cursor: pointer; transition: background .15s, border-color .15s;
            text-decoration: none; color: inherit;
          }
          .adm-icon-btn:hover { background: #1A1A1A; border-color: #1A1A1A; }
          .adm-icon-btn:hover svg { stroke: #F5F0E8; }

          .adm-stamp {
            display: inline-block; border: 2px solid #C8391A; color: #C8391A;
            font-family: 'DM Sans', sans-serif; font-size: 9px; font-weight: 700;
            letter-spacing: .2em; text-transform: uppercase; padding: 3px 8px; transform: rotate(-1.5deg);
          }

          .adm-label {
            font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 600;
            letter-spacing: .2em; text-transform: uppercase; color: #C8391A;
          }

          .adm-section { background: #fff; border: 2px solid #1A1A1A; padding: 28px; }

          .adm-noise {
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
            background-size: 200px; position: fixed; inset: 0; pointer-events: none; z-index: 999; opacity: .4;
          }

          .adm-stripe {
            background: repeating-linear-gradient(-45deg, #C8391A, #C8391A 2px, transparent 2px, transparent 10px);
          }

          @media (max-width: 1023px) {
            .adm-grid-main { grid-template-columns: 1fr !important; }
          }
          @media (max-width: 767px) {
            .adm-grid-kpi { grid-template-columns: 1fr 1fr !important; }
            .adm-root { padding: 16px 12px 48px; }
          }
          @media (max-width: 480px) {
            .adm-grid-kpi { grid-template-columns: 1fr !important; }
          }
        `}</style>

        <div className="adm-noise" aria-hidden />

        <div className="adm-root">

          {/* ── Masthead ── */}
          <div style={{ borderBottom: '2px solid #1A1A1A', paddingBottom: 16, marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <span className="adm-label">Panel Kontrol Admin</span>
            <span className="adm-stamp">Live Dashboard</span>
            <span className="adm-label" style={{ fontFamily: 'DM Sans' }}>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>

          {/* ── Page title ── */}
          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: 'clamp(32px, 4vw, 52px)', lineHeight: 1.05, color: '#1A1A1A' }}>
              Dashboard <em style={{ fontStyle: 'italic', color: '#C8391A' }}>Admin.</em>
            </h1>
            <p style={{ fontFamily: 'DM Sans', fontSize: 14, color: '#4A4A4A', marginTop: 8 }}>
              Pantau aktivitas pengaduan dan kelola laporan secara efisien.
            </p>
          </div>

          {/* ── KPI Cards ── */}
          <div className="adm-grid-kpi" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
            {kpiCards.map((card, i) => (
              <div key={i} className="adm-kpi">
                <div className="adm-kpi-ghost">{card.num}</div>
                <div className="adm-label" style={{ marginBottom: 10 }}>{card.title}</div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: 'clamp(36px, 4vw, 52px)', lineHeight: 1, color: '#1A1A1A' }}>
                  {card.value.toLocaleString()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
                  <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#4A4A4A' }}>{card.sub}</span>
                  <span style={{ fontFamily: 'DM Sans', fontSize: 11, fontWeight: 700, color: card.up ? '#059669' : '#C8391A', display: 'flex', alignItems: 'center', gap: 3 }}>
                    {card.up ? '↑' : '↓'} {card.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Marquee ── */}
          <div style={{ background: '#1A1A1A', padding: '10px 0', overflow: 'hidden', marginBottom: 32 }}>
            <div className="adm-marquee-track">
              {Array(6).fill('TOTAL LAPORAN → PENGGUNA AKTIF → RESPONS CEPAT → TRANSPARANSI PENUH → KELOLA EFISIEN →').map((t, i) => (
                <span key={i} style={{ fontFamily: 'DM Sans', color: '#F5F0E8', fontSize: 10, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', whiteSpace: 'nowrap', paddingRight: 40 }}>{t}</span>
              ))}
            </div>
          </div>

          {/* ── Main Grid ── */}
          <div className="adm-grid-main" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>

            {/* ── Left Column ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Status Distribution */}
              <div className="adm-section">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <div>
                    <span className="adm-label">Distribusi</span>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 20, marginTop: 4 }}>Status Laporan</h2>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="adm-icon-btn" title="Chart">
                      <svg width="14" height="14" fill="none" stroke="#1A1A1A" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="12" width="4" height="9"/><rect x="10" y="6" width="4" height="15"/><rect x="17" y="3" width="4" height="18"/></svg>
                    </button>
                    <button className="adm-icon-btn" title="Download">
                      <svg width="14" height="14" fill="none" stroke="#1A1A1A" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {distItems.map((item, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontFamily: 'DM Sans', fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{item.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 18, color: '#1A1A1A' }}>{item.value}</span>
                          <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#4A4A4A' }}>{item.pct}%</span>
                        </div>
                      </div>
                      <div className="adm-bar-track">
                        <div className="adm-bar-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ borderTop: '1.5px solid rgba(26,26,26,.1)', paddingTop: 16 }}>
                    <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#4A4A4A' }}>
                      Total <strong style={{ color: '#1A1A1A' }}>{stats.totalReports}</strong> laporan diterima
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="adm-section">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div>
                    <span className="adm-label">Terbaru</span>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 20, marginTop: 4 }}>Aktivitas Laporan</h2>
                  </div>
                  <button style={{ fontFamily: 'DM Sans', fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#C8391A', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Lihat Semua →
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {filteredReports.slice(0, 5).map((report, idx) => (
                    <div key={report.id || idx} className="adm-feat-row">
                      <div style={{ width: 40, height: 40, background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="16" height="16" fill="none" stroke="#F5F0E8" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 14, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{report.title || '—'}</p>
                        <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#4A4A4A', marginTop: 2 }}>
                          {report.createdAt ? new Date(report.createdAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                        </p>
                      </div>
                      <span style={{ fontFamily: 'DM Sans', fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', padding: '4px 10px', flexShrink: 0, ...getStatusStyle(report.status) }}>
                        {getStatusLabel(report.status)}
                      </span>
                    </div>
                  ))}
                  {filteredReports.length === 0 && (
                    <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#4A4A4A', textAlign: 'center', padding: '32px 0' }}>Tidak ada aktivitas terbaru.</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Right Column ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Quick Actions */}
              <div className="adm-section">
                <span className="adm-label" style={{ display: 'block', marginBottom: 8 }}>Aksi Cepat</span>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Kontrol Panel</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button className="adm-btn-red">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Buat Laporan
                  </button>
                  <button className="adm-btn-dark">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Export Data
                  </button>
                  <button className="adm-btn-dark">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    Laporan Analitik
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="adm-section">
                <span className="adm-label" style={{ display: 'block', marginBottom: 8 }}>Filter</span>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Cari & Saring</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontFamily: 'DM Sans', fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#4A4A4A', display: 'block', marginBottom: 6 }}>Cari Laporan</label>
                    <input
                      type="text"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Ketik judul..."
                      className="adm-input"
                    />
                  </div>
                  <div>
                    <label style={{ fontFamily: 'DM Sans', fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#4A4A4A', display: 'block', marginBottom: 6 }}>Status</label>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="adm-input">
                      <option value="ALL">Semua Status</option>
                      <option value="PENDING">Menunggu</option>
                      <option value="APPROVED">Disetujui</option>
                      <option value="REJECTED">Ditolak</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontFamily: 'DM Sans', fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#4A4A4A', display: 'block', marginBottom: 6 }}>Rentang Waktu</label>
                    <select value={timeRange} onChange={e => setTimeRange(e.target.value)} className="adm-input">
                      <option value="week">Minggu Ini</option>
                      <option value="month">Bulan Ini</option>
                      <option value="quarter">Kuartal Ini</option>
                      <option value="year">Tahun Ini</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Weekly Summary — dark card */}
              <div style={{ background: '#1A1A1A', border: '2px solid #1A1A1A', padding: 28, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: -12, bottom: -20, fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: 100, lineHeight: 1, color: 'transparent', WebkitTextStroke: '1.5px rgba(200,57,26,.2)', userSelect: 'none', pointerEvents: 'none' }}>W</div>
                <span className="adm-label" style={{ color: 'rgba(245,240,232,.5)', display: 'block', marginBottom: 6 }}>Minggu Ini</span>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 20, color: '#F5F0E8', marginBottom: 20 }}>Ringkasan</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Laporan Baru',    val: `+${Math.floor(Math.random() * 30) + 10}` },
                    { label: 'Terverifikasi',   val: `${Math.floor(Math.random() * 20) + 15}` },
                    { label: 'Pengguna Baru',   val: `+${Math.floor(Math.random() * 10) + 3}` },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(245,240,232,.08)', paddingBottom: 12 }}>
                      <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(245,240,232,.55)' }}>{s.label}</span>
                      <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 24, color: '#C8391A' }}>{s.val}</span>
                    </div>
                  ))}
                </div>
                <button className="adm-btn-dark" style={{ marginTop: 16, borderColor: 'rgba(245,240,232,.2)', color: '#F5F0E8' }}>
                  Lihat Detail →
                </button>
              </div>
            </div>
          </div>

          {/* ── Reports Table ── */}
          <div style={{ marginTop: 32 }}>
            <div className="adm-section" style={{ padding: 0, overflow: 'hidden' }}>

              <div style={{ padding: '20px 28px', borderBottom: '2px solid #1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span className="adm-label">Tabel Data</span>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 20, marginTop: 4 }}>Daftar Laporan Lengkap</h2>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="adm-icon-btn" title="Filter">
                    <svg width="14" height="14" fill="none" stroke="#1A1A1A" strokeWidth="2" viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                  </button>
                  <button className="adm-icon-btn" title="Download">
                    <svg width="14" height="14" fill="none" stroke="#1A1A1A" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'DM Sans', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#F5F0E8', borderBottom: '2px solid #1A1A1A' }}>
                      {['Judul', 'Kategori', 'Status', 'Tanggal', 'Aksi'].map((h, i) => (
                        <th key={i} style={{ padding: '14px 24px', textAlign: 'left', fontWeight: 700, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: '#1A1A1A', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.slice(0, 10).map((report, idx) => (
                      <tr key={report.id || idx} className="adm-tr">
                        <td style={{ padding: '14px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 34, height: 34, background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <svg width="14" height="14" fill="none" stroke="#F5F0E8" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            </div>
                            <span style={{ fontWeight: 600, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{report.title || '—'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 24px', color: '#4A4A4A' }}>{report.category?.name || '—'}</td>
                        <td style={{ padding: '14px 24px' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', padding: '4px 10px', ...getStatusStyle(report.status) }}>
                            {getStatusLabel(report.status)}
                          </span>
                        </td>
                        <td style={{ padding: '14px 24px', color: '#4A4A4A', whiteSpace: 'nowrap' }}>
                          {report.createdAt ? new Date(report.createdAt).toLocaleDateString('id-ID') : '—'}
                        </td>
                        <td style={{ padding: '14px 24px' }}>
                          <Link href={`/dashboard/admin/reports/${report.id}`} className="adm-icon-btn" title="Lihat">
                            <svg width="14" height="14" fill="none" stroke="#1A1A1A" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredReports.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 48, color: 'rgba(26,26,26,.1)', marginBottom: 12 }}>!</div>
                  <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#4A4A4A' }}>Tidak ada laporan ditemukan.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

const styles = {
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, background: '#F5F0E8' },
  spinner: { width: 48, height: 48, border: '3px solid rgba(200,57,26,.15)', borderTopColor: '#C8391A', borderRadius: '50%', animation: 'spin .8s linear infinite', marginBottom: 16 },
  loadingText: { fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#4A4A4A', letterSpacing: '.1em', textTransform: 'uppercase' },
};