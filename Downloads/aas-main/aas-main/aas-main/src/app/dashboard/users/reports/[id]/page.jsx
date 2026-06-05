'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import DashboardLayout from '@/components/DashboardLayout';
import CommentSection from '@/components/CommentSection';
import { apiFetch } from '@/lib/api';

export default function UserReportDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const statusMap = {
    pending:   { text: 'Menunggu',  bg: '#FEF3C7', color: '#92400E', border: '#F59E0B' },
    processed: { text: 'Diproses',  bg: '#DBEAFE', color: '#1E40AF', border: '#3B82F6' },
    completed: { text: 'Selesai',   bg: '#D1FAE5', color: '#065F46', border: '#10B981' },
    rejected:  { text: 'Ditolak',   bg: '#FEE2E2', color: '#991B1B', border: '#EF4444' },
  };

  useEffect(() => {
    if (!id) return;
    apiFetch(`/reports/${id}`)
      .then((d) => setReport(d.data || d))
      .catch(err => { console.error(err); setError('Gagal memuat laporan'); })
      .finally(() => setLoading(false));
  }, [id]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const getImageUrls = () => {
    if (!report) return [];
    let images = report.images || report.image_urls || [];
    if (typeof images === 'string') { try { images = JSON.parse(images); } catch { images = []; } }
    if (!Array.isArray(images)) return [];
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/';
    return images.map(img => img.startsWith('http') ? img : `${base}${img.replace(/^\/+/, '')}`);
  };

  const imageUrls = getImageUrls();
  const s = statusMap[report?.status] || statusMap.pending;

  if (loading) return (
    <AuthGuard roles={['USER']}>
      <DashboardLayout>
        <style>{`@keyframes rds{to{transform:rotate(360deg)}}`}</style>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 320, background: '#F5F0E8', gap: 14 }}>
          <div style={{ width: 44, height: 44, border: '3px solid rgba(200,57,26,.15)', borderTopColor: '#C8391A', borderRadius: '50%', animation: 'rds .8s linear infinite' }} />
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#4A4A4A' }}>Memuat laporan...</p>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );

  if (error || !report) return (
    <AuthGuard roles={['USER']}>
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: '64px 24px', background: '#F5F0E8', minHeight: 320 }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 72, color: 'rgba(26,26,26,.08)', lineHeight: 1, marginBottom: 14 }}>!</div>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#4A4A4A', marginBottom: 16 }}>{error || 'Laporan tidak ditemukan'}</p>
          <Link href="/dashboard/users/reports" style={{ fontFamily: 'DM Sans', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#C8391A', textDecoration: 'none' }}>← Kembali ke daftar</Link>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );

  return (
    <AuthGuard roles={['USER']}>
      <DashboardLayout>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
          .rd-root { background:#F5F0E8; min-height:100vh; padding:28px 24px 64px; font-family:'DM Sans',sans-serif; }
          .rd-noise { background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E"); background-size:200px; position:fixed; inset:0; pointer-events:none; z-index:999; opacity:.4; }
          .rd-label { font-family:'DM Sans'; font-size:10px; font-weight:600; letter-spacing:.22em; text-transform:uppercase; color:#C8391A; }
          .rd-section { background:#fff; border:2px solid #1A1A1A; }
          .rd-back { font-family:'DM Sans'; font-size:11px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:#4A4A4A; text-decoration:none; display:inline-flex; align-items:center; gap:6px; transition:color .2s; margin-bottom:20px; }
          .rd-back:hover { color:#C8391A; }
          .rd-img-thumb { position:relative; overflow:hidden; border:2px solid rgba(26,26,26,.12); aspect-ratio:1; cursor:pointer; transition:border-color .2s,transform .2s; }
          .rd-img-thumb:hover { border-color:#1A1A1A; transform:scale(1.02); }
          .rd-img-overlay { position:absolute; inset:0; background:rgba(26,26,26,0); display:flex; align-items:center; justify-content:center; transition:background .2s; }
          .rd-img-thumb:hover .rd-img-overlay { background:rgba(26,26,26,.4); }
          .rd-img-label { font-family:'DM Sans'; font-size:9px; fontWeight:700; letterSpacing:'.14em'; textTransform:'uppercase'; color:#F5F0E8; opacity:0; transition:opacity .2s; padding:4px 10px; background:rgba(26,26,26,.7); }
          .rd-img-thumb:hover .rd-img-label { opacity:1; }
          .rd-lightbox { position:fixed; inset:0; background:rgba(26,26,26,.92); z-index:1000; display:flex; align-items:center; justify-content:center; padding:16px; }
          .rd-close { position:absolute; top:16px; right:16px; width:40px; height:40px; background:rgba(245,240,232,.1); border:1.5px solid rgba(245,240,232,.2); color:#F5F0E8; font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .15s; }
          .rd-close:hover { background:rgba(200,57,26,.7); border-color:#C8391A; }
          .rd-meta-item { display:flex; align-items:center; gap:7px; font-family:'DM Sans'; font-size:12px; color:#4A4A4A; }
          @media(max-width:1023px){ .rd-grid{grid-template-columns:1fr!important} }
          @media(max-width:767px){ .rd-root{padding:16px 12px 48px} }
        `}</style>

        <div className="rd-noise" aria-hidden />
        <div className="rd-root">

          {/* Back */}
          <Link href="/dashboard/users/reports" className="rd-back">
            ← Kembali ke Daftar Laporan
          </Link>

          {/* Masthead */}
          <div style={{ borderBottom: '2px solid #1A1A1A', paddingBottom: 14, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <span className="rd-label">Detail Laporan</span>
            <span style={{ fontFamily: 'DM Sans', fontSize: 9, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', padding: '3px 10px', background: s.bg, color: s.color, border: `1.5px solid ${s.border}` }}>{s.text}</span>
          </div>

          {/* Page title */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontFamily: 'Playfair Display,serif', fontWeight: 900, fontSize: 'clamp(24px,3.5vw,40px)', lineHeight: 1.05 }}>
              {report.title}
            </h1>
          </div>

          {/* Grid */}
          <div className="rd-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>

            {/* ── LEFT ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Meta info */}
              <div className="rd-section" style={{ padding: '18px 24px' }}>
                <span className="rd-label" style={{ display: 'block', marginBottom: 12 }}>Informasi Laporan</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                  <div className="rd-meta-item">
                    <svg width="13" height="13" fill="none" stroke="#C8391A" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {formatDate(report.created_at)}
                  </div>
                  {report.category && (
                    <div className="rd-meta-item">
                      <svg width="13" height="13" fill="none" stroke="#C8391A" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                      {report.category}
                    </div>
                  )}
                  {report.location && (
                    <div className="rd-meta-item">
                      <svg width="13" height="13" fill="none" stroke="#C8391A" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {report.location}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="rd-section" style={{ padding: '22px 24px' }}>
                <span className="rd-label" style={{ display: 'block', marginBottom: 12 }}>Deskripsi</span>
                <p style={{ fontFamily: 'DM Sans', fontSize: 14, color: '#4A4A4A', lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0 }}>{report.description}</p>
              </div>

              {/* Image gallery */}
              {imageUrls.length > 0 && (
                <div className="rd-section" style={{ padding: '22px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span className="rd-label">Foto Pendukung</span>
                    <span style={{ fontFamily: 'DM Sans', fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#F5F0E8', background: '#1A1A1A', padding: '3px 9px' }}>{imageUrls.length} foto</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                    {imageUrls.map((url, idx) => (
                      <div key={idx} className="rd-img-thumb" onClick={() => setSelectedImage(url)}>
                        <img src={url} alt={`Bukti ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        <div className="rd-img-overlay">
                          <span className="rd-img-label">Perbesar</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT: Comments ── */}
            <div style={{ position: 'sticky', top: 24 }}>
              <div className="rd-section" style={{ overflow: 'hidden' }}>
                {/* Comment header */}
                <div style={{ padding: '16px 22px', borderBottom: '2px solid #1A1A1A', background: '#1A1A1A' }}>
                  <span style={{ fontFamily: 'DM Sans', fontSize: 9, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(245,240,232,.5)' }}>Diskusi</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <svg width="14" height="14" fill="none" stroke="#C8391A" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <span style={{ fontFamily: 'Playfair Display,serif', fontWeight: 700, fontSize: 16, color: '#F5F0E8' }}>Kotak Komentar</span>
                  </div>
                </div>
                <div style={{ padding: '20px 22px' }}>
                  <CommentSection reportId={id} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lightbox */}
        {selectedImage && (
          <div className="rd-lightbox" onClick={() => setSelectedImage(null)}>
            <button className="rd-close" onClick={() => setSelectedImage(null)}>✕</button>
            <img src={selectedImage} alt="Preview" style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', border: '2px solid rgba(245,240,232,.1)' }} onClick={e => e.stopPropagation()} />
          </div>
        )}
      </DashboardLayout>
    </AuthGuard>
  );
}