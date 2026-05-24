// app/dashboard/admin/reports/[id]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { apiFetch } from '@/lib/api';

export default function AdminReportDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const statusOptions = [
    { value: 'pending',   label: 'Menunggu',  bg: '#FEF3C7', color: '#92400E', border: '#F59E0B' },
    { value: 'processed', label: 'Diproses',  bg: '#DBEAFE', color: '#1E40AF', border: '#3B82F6' },
    { value: 'completed', label: 'Selesai',   bg: '#D1FAE5', color: '#065F46', border: '#10B981' },
    { value: 'rejected',  label: 'Ditolak',   bg: '#FEE2E2', color: '#991B1B', border: '#EF4444' },
  ];

  useEffect(() => {
    if (!id) return;
    Promise.all([
      apiFetch(`/reports/${id}`),
      apiFetch(`/comments/report/${id}`),
    ])
      .then(([reportData, commentsData]) => {
        let reportObj = reportData.data || reportData;
        // ✅ Konversi status dari uppercase (database) ke lowercase (frontend)
        if (reportObj.status) {
          reportObj.status = reportObj.status.toLowerCase();
        }
        setReport(reportObj);
        setComments(commentsData.data || commentsData);
      })
      .catch(err => { console.error(err); setError('Gagal memuat laporan'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await apiFetch(`/reports/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
      setReport({ ...report, status: newStatus });
    } catch (err) {
      setError(err.message || 'Gagal mengupdate status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSendingComment(true);
    try {
      const newComment = await apiFetch(`/comments/report/${id}`, { method: 'POST', body: JSON.stringify({ content: commentText }) });
      setComments([newComment, ...comments]);
      setCommentText('');
    } catch { setError('Gagal mengirim komentar'); }
    finally { setSendingComment(false); }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const getImageUrls = () => {
    if (!report) return [];
    let images = report.images || report.image_urls || [];
    if (typeof images === 'string') { try { images = JSON.parse(images); } catch { images = []; } }
    if (!Array.isArray(images)) {
      if (report.image_url) return [report.image_url];
      return [];
    }
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/';
    return images.map(img => img.startsWith('http') ? img : `${base}${img.replace(/^\/+/, '')}`);
  };

  const imageUrls = getImageUrls();
  // report.status sudah dalam lowercase
  const currentStatus = statusOptions.find(s => s.value === report?.status) || statusOptions[0];

  if (loading) return (
    <AuthGuard roles={['ADMIN', 'SUPER_ADMIN']}>
      <DashboardLayout>
        <style>{`@keyframes ards{to{transform:rotate(360deg)}}`}</style>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 320, background: '#F5F0E8', gap: 14 }}>
          <div style={{ width: 44, height: 44, border: '3px solid rgba(200,57,26,.15)', borderTopColor: '#C8391A', borderRadius: '50%', animation: 'ards .8s linear infinite' }} />
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#4A4A4A' }}>Memuat laporan...</p>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );

  if (error || !report) return (
    <AuthGuard roles={['ADMIN', 'SUPER_ADMIN']}>
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: '64px 24px', background: '#F5F0E8', minHeight: 320 }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 72, color: 'rgba(26,26,26,.08)', lineHeight: 1, marginBottom: 14 }}>!</div>
          <p style={{ fontFamily: 'DM Sans', fontSize: 14, color: '#4A4A4A', marginBottom: 16 }}>{error || 'Laporan tidak ditemukan'}</p>
          <Link href="/dashboard/admin/reports" style={{ fontFamily: 'DM Sans', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#C8391A', textDecoration: 'none' }}>← Kembali ke daftar</Link>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );

  return (
    <AuthGuard roles={['ADMIN', 'SUPER_ADMIN']}>
      <DashboardLayout>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
          .ad-root { background:#F5F0E8; min-height:100vh; padding:28px 24px 64px; font-family:'DM Sans',sans-serif; }
          .ad-noise { background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E"); background-size:200px; position:fixed; inset:0; pointer-events:none; z-index:999; opacity:.4; }
          .ad-label { font-family:'DM Sans'; font-size:10px; font-weight:600; letter-spacing:.22em; text-transform:uppercase; color:#C8391A; }
          .ad-section { background:#fff; border:2px solid #1A1A1A; }
          .ad-back { font-family:'DM Sans'; font-size:11px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:#4A4A4A; text-decoration:none; display:inline-flex; align-items:center; gap:6px; transition:color .2s; margin-bottom:20px; }
          .ad-back:hover { color:#C8391A; }
          .ad-img-thumb { position:relative; overflow:hidden; border:2px solid rgba(26,26,26,.12); aspect-ratio:1; cursor:pointer; transition:border-color .2s,transform .2s; }
          .ad-img-thumb:hover { border-color:#1A1A1A; transform:scale(1.02); }
          .ad-img-overlay { position:absolute; inset:0; background:rgba(26,26,26,0); display:flex; align-items:center; justify-content:center; transition:background .2s; }
          .ad-img-thumb:hover .ad-img-overlay { background:rgba(26,26,26,.4); }
          .ad-img-label { font-family:'DM Sans'; font-size:9px; fontWeight:700; letterSpacing:'.14em'; color:#F5F0E8; opacity:0; transition:opacity .2s; padding:4px 10px; background:rgba(26,26,26,.7); }
          .ad-img-thumb:hover .ad-img-label { opacity:1; }
          .ad-lightbox { position:fixed; inset:0; background:rgba(26,26,26,.92); z-index:1000; display:flex; align-items:center; justify-content:center; padding:16px; }
          .ad-close { position:absolute; top:16px; right:16px; width:40px; height:40px; background:rgba(245,240,232,.1); border:1.5px solid rgba(245,240,232,.2); color:#F5F0E8; font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .15s; }
          .ad-close:hover { background:rgba(200,57,26,.7); border-color:#C8391A; }
          .ad-meta-item { display:flex; align-items:center; gap:7px; font-family:'DM Sans'; font-size:12px; color:#4A4A4A; }
          .ad-status-select { font-family:'DM Sans'; font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; padding:6px 12px; border:2px solid rgba(26,26,26,.2); background:#F5F0E8; color:#1A1A1A; outline:none; cursor:pointer; transition:border-color .2s; }
          .ad-status-select:focus { border-color:#C8391A; }
          .ad-comment-card { background:#F5F0E8; border:1.5px solid rgba(26,26,26,.1); padding:14px 16px; }
          .ad-textarea { width:100%; padding:12px 14px; border:2px solid rgba(26,26,26,.15); background:#F5F0E8; font-family:'DM Sans'; font-size:13px; color:#1A1A1A; outline:none; resize:vertical; transition:border-color .2s; box-sizing:border-box; }
          .ad-textarea:focus { border-color:#C8391A; }
          .ad-textarea::placeholder { color:rgba(26,26,26,.35); }
          .ad-btn-red { display:inline-flex; align-items:center; gap:8px; background:#C8391A; color:#F5F0E8; border:2px solid #C8391A; font-family:'DM Sans'; font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; padding:10px 20px; cursor:pointer; transition:background .2s,border-color .2s; }
          .ad-btn-red:hover:not(:disabled) { background:#1A1A1A; border-color:#1A1A1A; }
          .ad-btn-red:disabled { opacity:.55; cursor:not-allowed; }
          @keyframes ad-spin { to{transform:rotate(360deg)} }
          .ad-spinner { width:12px; height:12px; border:2px solid rgba(245,240,232,.3); border-top-color:#F5F0E8; border-radius:50%; animation:ad-spin .7s linear infinite; }
          @media(max-width:1023px){ .ad-grid{grid-template-columns:1fr!important} }
          @media(max-width:767px){ .ad-root{padding:16px 12px 48px} }
        `}</style>

        <div className="ad-noise" aria-hidden />
        <div className="ad-root">

          <Link href="/dashboard/admin/reports" className="ad-back">← Kembali ke Daftar Laporan</Link>

          <div style={{ borderBottom: '2px solid #1A1A1A', paddingBottom: 14, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <span className="ad-label">Detail Laporan — Admin</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {updatingStatus && <div className="ad-spinner" style={{ borderTopColor: '#C8391A', borderColor: 'rgba(200,57,26,.2)' }} />}
              <select value={report.status} onChange={e => handleUpdateStatus(e.target.value)} disabled={updatingStatus} className="ad-status-select"
                style={{ background: currentStatus.bg, color: currentStatus.color, borderColor: currentStatus.border }}>
                {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontFamily: 'Playfair Display,serif', fontWeight: 900, fontSize: 'clamp(24px,3.5vw,40px)', lineHeight: 1.05 }}>
              {report.title}
            </h1>
          </div>

          <div className="ad-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>

            {/* KIRI: Detail Laporan */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              <div className="ad-section" style={{ padding: '18px 24px' }}>
                <span className="ad-label" style={{ display: 'block', marginBottom: 12 }}>Informasi Laporan</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                  <div className="ad-meta-item">
                    <svg width="13" height="13" fill="none" stroke="#C8391A" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {formatDate(report.created_at)}
                  </div>
                  <div className="ad-meta-item">
                    <svg width="13" height="13" fill="none" stroke="#C8391A" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    {report.user_name || 'Pengguna'}
                  </div>
                  {report.category && (
                    <div className="ad-meta-item">
                      <svg width="13" height="13" fill="none" stroke="#C8391A" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                      {report.category}
                    </div>
                  )}
                  {report.location && (
                    <div className="ad-meta-item">
                      <svg width="13" height="13" fill="none" stroke="#C8391A" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {report.location}
                    </div>
                  )}
                </div>
              </div>

              <div className="ad-section" style={{ padding: '22px 24px' }}>
                <span className="ad-label" style={{ display: 'block', marginBottom: 12 }}>Deskripsi</span>
                <p style={{ fontFamily: 'DM Sans', fontSize: 14, color: '#4A4A4A', lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0 }}>{report.description}</p>
              </div>

              {/* Galeri Gambar */}
              {imageUrls.length > 0 && (
                <div className="ad-section" style={{ padding: '22px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span className="ad-label">Foto Pendukung</span>
                    <span style={{ fontFamily: 'DM Sans', fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#F5F0E8', background: '#1A1A1A', padding: '3px 9px' }}>{imageUrls.length} foto</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                    {imageUrls.map((url, idx) => (
                      <div key={idx} className="ad-img-thumb" onClick={() => setSelectedImage(url)}>
                        <img src={url} alt={`Bukti ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        <div className="ad-img-overlay">
                          <span className="ad-img-label">Perbesar</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Jika tidak ada gambar, tampilkan pesan debug */}
              {imageUrls.length === 0 && (
                <div className="ad-section" style={{ padding: '22px 24px', textAlign: 'center' }}>
                  <span className="ad-label">Foto Pendukung</span>
                  <p style={{ marginTop: 12, fontSize: 13, color: '#4A4A4A' }}>Tidak ada gambar yang dilampirkan.</p>
                  <pre style={{ fontSize: 10, color: '#aaa', background: '#eee', padding: 8, marginTop: 8, overflow: 'auto' }}>
                    Raw images: {JSON.stringify(report?.images)}
                  </pre>
                </div>
              )}
            </div>

            {/* KANAN: Komentar */}
            <div style={{ position: 'sticky', top: 24, height: 'fit-content' }}>
              <div className="ad-section" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '16px 22px', borderBottom: '2px solid #1A1A1A', background: '#1A1A1A' }}>
                  <span style={{ fontFamily: 'DM Sans', fontSize: 9, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(245,240,232,.5)' }}>Tanggapan Admin</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <svg width="14" height="14" fill="none" stroke="#C8391A" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <span style={{ fontFamily: 'Playfair Display,serif', fontWeight: 700, fontSize: 16, color: '#F5F0E8' }}>Komentar ({comments.length})</span>
                  </div>
                </div>

                <div style={{ padding: '20px 22px', borderBottom: '1.5px solid rgba(26,26,26,.1)' }}>
                  <form onSubmit={handleAddComment} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <textarea
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder="Tanggapi laporan ini..."
                      rows={3}
                      className="ad-textarea"
                    />
                    <button type="submit" disabled={sendingComment} className="ad-btn-red" style={{ alignSelf: 'flex-start' }}>
                      {sendingComment ? <><div className="ad-spinner" /> Mengirim...</> : <>✉️ Kirim Tanggapan</>}
                    </button>
                  </form>
                </div>

                <div style={{ padding: '16px 22px', maxHeight: 420, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {comments.length === 0 ? (
                    <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(26,26,26,.4)', textAlign: 'center', padding: '24px 0' }}>Belum ada tanggapan.</p>
                  ) : comments.map(comment => (
                    <div key={comment.id} className="ad-comment-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 28, height: 28, background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontFamily: 'Playfair Display,serif', fontWeight: 900, fontSize: 12, color: '#F5F0E8' }}>{(comment.user_name || 'A')[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <span style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 12, color: '#1A1A1A' }}>{comment.user_name}</span>
                          <span style={{ fontFamily: 'DM Sans', fontSize: 10, color: '#4A4A4A', display: 'block', marginTop: 1 }}>{formatDate(comment.created_at)}</span>
                        </div>
                      </div>
                      <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#4A4A4A', lineHeight: 1.65, margin: 0 }}>{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lightbox */}
        {selectedImage && (
          <div className="ad-lightbox" onClick={() => setSelectedImage(null)}>
            <button className="ad-close" onClick={() => setSelectedImage(null)}>✕</button>
            <img src={selectedImage} alt="Preview" style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', border: '2px solid rgba(245,240,232,.1)' }} onClick={e => e.stopPropagation()} />
          </div>
        )}
      </DashboardLayout>
    </AuthGuard>
  );
}