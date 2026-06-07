'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';

export default function NewReportPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', categoryId: '' });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiFetch('/categories');
        setCategories(data.categories || data || []);
      } catch (err) {
        console.error('Gagal load kategori:', err);
        setError('Gagal memuat kategori. Silakan refresh halaman.');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Anda memiliki perubahan yang belum disimpan. Yakin ingin keluar?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setHasUnsavedChanges(true);
    if (name === 'description') setCharCount(value.length);
  };

  const validateAndAddImages = (fileList) => {
    const maxFiles = 5, maxSizeMB = 2;
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (images.length + fileList.length > maxFiles) {
      setError(`Maksimal ${maxFiles} gambar. Anda sudah punya ${images.length} gambar.`);
      return;
    }
    const newImgs = [];
    for (const file of fileList) {
      if (!allowed.includes(file.type)) { setError(`File "${file.name}" format tidak didukung.`); continue; }
      if (file.size > maxSizeMB * 1024 * 1024) { setError(`File "${file.name}" melebihi ${maxSizeMB}MB.`); continue; }
      newImgs.push({ file, preview: URL.createObjectURL(file), size: (file.size / 1024).toFixed(1) + ' KB', name: file.name });
    }
    if (newImgs.length) { setImages(prev => [...prev, ...newImgs]); setHasUnsavedChanges(true); setError(''); }
  };

  const handleImageChange = (e) => {
    if (e.target.files?.length) validateAndAddImages(Array.from(e.target.files));
  };

  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.length) validateAndAddImages(Array.from(e.dataTransfer.files));
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(images[index].preview);
    setImages(prev => prev.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess(false);
    const titleTrim = form.title.trim(), descTrim = form.description.trim();
    if (!titleTrim)          { setError('Judul laporan harus diisi'); setLoading(false); return; }
    if (titleTrim.length < 5) { setError('Judul minimal 5 karakter'); setLoading(false); return; }
    if (!descTrim)            { setError('Deskripsi harus diisi'); setLoading(false); return; }
    if (descTrim.length < 10) { setError('Deskripsi minimal 10 karakter'); setLoading(false); return; }
    if (descTrim.length > 2000){ setError('Deskripsi maksimal 2000 karakter'); setLoading(false); return; }
    if (!form.categoryId)     { setError('Pilih kategori laporan'); setLoading(false); return; }
    try {
      const fd = new FormData();
      fd.append('title', titleTrim);
      fd.append('description', descTrim);
      fd.append('categoryId', form.categoryId);
      images.forEach(img => fd.append('images', img.file));
      await apiFetch('/reports', { method: 'POST', body: fd });
      setSuccess(true); setHasUnsavedChanges(false);
      setTimeout(() => router.push('/dashboard/users/reports/succeed'), 1500);
    } catch (err) {
      setError(err.message || 'Gagal mengirim laporan'); setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges && !confirm('Anda memiliki perubahan yang belum disimpan. Yakin ingin membatalkan?')) return;
    router.push('/dashboard/user');
  };

  return (
    <AuthGuard roles={['USER']}>
      <DashboardLayout>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
          .nr-root { background:#F5F0E8; min-height:100vh; padding:32px 24px 64px; font-family:'DM Sans',sans-serif; }
          .nr-noise { background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E"); background-size:200px; position:fixed; inset:0; pointer-events:none; z-index:999; opacity:.4; }
          .nr-label { font-family:'DM Sans'; font-size:10px; font-weight:600; letter-spacing:.22em; text-transform:uppercase; color:#C8391A; }
          .nr-input { width:100%; padding:12px 16px; border:2px solid rgba(26,26,26,.15); background:#fff; font-family:'DM Sans'; font-size:14px; color:#1A1A1A; outline:none; transition:border-color .2s; box-sizing:border-box; }
          .nr-input:focus { border-color:#C8391A; box-shadow:0 0 0 3px rgba(200,57,26,.07); }
          .nr-input::placeholder { color:rgba(26,26,26,.35); }
          .nr-field-label { font-family:'DM Sans'; font-size:11px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:#1A1A1A; display:block; margin-bottom:8px; }
          .nr-btn-red { display:inline-flex; align-items:center; justify-content:center; gap:9px; background:#C8391A; color:#F5F0E8; border:2px solid #C8391A; font-family:'DM Sans'; font-size:13px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; padding:14px 32px; cursor:pointer; transition:background .2s,border-color .2s; width:100%; }
          .nr-btn-red:hover:not(:disabled) { background:#1A1A1A; border-color:#1A1A1A; }
          .nr-btn-red:disabled { opacity:.6; cursor:not-allowed; }
          .nr-btn-dark { display:inline-flex; align-items:center; justify-content:center; gap:9px; background:transparent; color:#1A1A1A; border:2px solid rgba(26,26,26,.2); font-family:'DM Sans'; font-size:13px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; padding:14px 32px; cursor:pointer; transition:background .2s,color .2s,border-color .2s; width:100%; }
          .nr-btn-dark:hover { background:#1A1A1A; color:#F5F0E8; border-color:#1A1A1A; }
          .nr-card { background:#fff; border:2px solid #1A1A1A; padding:32px; }
          .nr-drop { border:2px dashed rgba(26,26,26,.25); padding:32px; text-align:center; cursor:pointer; transition:border-color .2s,background .2s; }
          .nr-drop:hover, .nr-drop.drag { border-color:#C8391A; background:rgba(200,57,26,.03); }
          .nr-img-thumb { position:relative; border:2px solid rgba(26,26,26,.15); overflow:hidden; }
          .nr-img-remove { position:absolute; top:6px; right:6px; width:22px; height:22px; background:#C8391A; color:#fff; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .15s; font-size:12px; }
          .nr-img-thumb:hover .nr-img-remove { opacity:1; }
          @keyframes nr-spin { to{transform:rotate(360deg)} }
          .nr-spin { width:16px; height:16px; border:2px solid rgba(245,240,232,.4); border-top-color:#F5F0E8; border-radius:50%; animation:nr-spin .7s linear infinite; }
          .nr-breadcrumb a { font-family:'DM Sans'; font-size:11px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:rgba(26,26,26,.4); text-decoration:none; }
          .nr-breadcrumb a:hover { color:#C8391A; }
          .nr-breadcrumb span { font-family:'DM Sans'; font-size:11px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:#C8391A; }
        `}</style>

        <div className="nr-noise" aria-hidden />
        <div className="nr-root">
          <div style={{ maxWidth: 720, margin: '0 auto' }}>

            {/* Breadcrumb */}
            <div className="nr-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <Link href="/dashboard/user">Dashboard</Link>
              <span style={{ color: 'rgba(26,26,26,.25)', fontFamily: 'DM Sans', fontSize: 11 }}>›</span>
              <span>Buat Laporan Baru</span>
            </div>

            {/* Page header */}
            <div style={{ borderBottom: '2px solid #1A1A1A', paddingBottom: 20, marginBottom: 28 }}>
              <span className="nr-label" style={{ display: 'block', marginBottom: 6 }}>Formulir Pengaduan</span>
              <h1 style={{ fontFamily: 'Playfair Display,serif', fontWeight: 900, fontSize: 'clamp(28px,4vw,44px)', lineHeight: 1.05 }}>
                Adukan <em style={{ fontStyle: 'italic', color: '#C8391A' }}>Masalahmu.</em>
              </h1>
              <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#4A4A4A', marginTop: 8 }}>
                Ceritakan keluhan atau aspirasimu. Sertakan foto untuk memperkuat laporan (maksimal 5 gambar).
              </p>
            </div>

            {/* Alert messages */}
            {error && (
              <div style={{ background: '#FEE2E2', border: '2px solid #EF4444', borderLeft: '4px solid #C8391A', padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <svg width="16" height="16" fill="none" stroke="#C8391A" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#991B1B', fontWeight: 600, margin: 0 }}>{error}</p>
              </div>
            )}
            {success && (
              <div style={{ background: '#D1FAE5', border: '2px solid #10B981', borderLeft: '4px solid #059669', padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <svg width="16" height="16" fill="none" stroke="#059669" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#065F46', fontWeight: 600, margin: 0 }}>Laporan berhasil dikirim! Mengalihkan...</p>
              </div>
            )}

            {/* Form card */}
            <div className="nr-card">
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

                {/* Judul */}
                <div>
                  <label className="nr-field-label">Judul Laporan <span style={{ color: '#C8391A' }}>*</span></label>
                  <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Contoh: Jalan rusak di depan sekolah" className="nr-input" required maxLength={100} />
                  <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(26,26,26,.4)', marginTop: 6 }}>{form.title.length}/100 karakter</p>
                </div>

                {/* Kategori */}
                <div>
                  <label className="nr-field-label">Kategori <span style={{ color: '#C8391A' }}>*</span></label>
                  {loadingCategories ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0' }}>
                      <div className="nr-spin" style={{ borderTopColor: '#C8391A', borderColor: 'rgba(200,57,26,.2)' }} />
                      <span style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#4A4A4A' }}>Memuat kategori...</span>
                    </div>
                  ) : (
                    <select name="categoryId" value={form.categoryId} onChange={handleChange} className="nr-input" required>
                      <option value="">— Pilih Kategori —</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  )}
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="nr-field-label">Deskripsi <span style={{ color: '#C8391A' }}>*</span></label>
                  <textarea name="description" rows={6} value={form.description} onChange={handleChange} placeholder="Ceritakan secara detail masalah yang Anda alami... (minimal 10 karakter)" className="nr-input" required maxLength={2000} style={{ resize: 'vertical' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: charCount < 10 ? '#C8391A' : '#10B981', fontWeight: 600 }}>
                      {charCount < 10 ? `Minimal 10 karakter (${charCount}/10)` : '✓ Minimal terpenuhi'}
                    </span>
                    <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: charCount > 1900 ? '#F59E0B' : 'rgba(26,26,26,.4)' }}>{charCount}/2000</span>
                  </div>
                </div>

                {/* Upload gambar */}
                <div>
                  <label className="nr-field-label">Foto Pendukung <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'rgba(26,26,26,.4)' }}>— Opsional, maks 5 gambar</span></label>

                  <div
                    className={`nr-drop${isDragging ? ' drag' : ''}`}
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                  >
                    <label style={{ cursor: 'pointer', display: 'block' }}>
                      <svg width="36" height="36" fill="none" stroke="rgba(26,26,26,.3)" strokeWidth="1.5" viewBox="0 0 24 24" style={{ margin: '0 auto 12px' }}><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
                      <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#4A4A4A', margin: '0 0 6px' }}>Klik atau seret gambar ke sini</p>
                      <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(26,26,26,.4)', margin: 0 }}>JPG, PNG, WEBP — maks 2MB per file</p>
                      <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleImageChange} style={{ display: 'none' }} />
                    </label>
                  </div>

                  {/* Thumbnails */}
                  {images.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10, marginTop: 14 }}>
                      {images.map((img, idx) => (
                        <div key={idx} className="nr-img-thumb" style={{ aspectRatio: '1', position: 'relative' }}>
                          <img src={img.preview} alt={`preview-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          <button type="button" className="nr-img-remove" onClick={() => removeImage(idx)}>✕</button>
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(26,26,26,.6)', fontFamily: 'DM Sans', fontSize: 9, color: '#F5F0E8', padding: '4px 6px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.size}</div>
                        </div>
                      ))}
                      {images.length < 5 && (
                        <label style={{ aspectRatio: '1', border: '2px dashed rgba(26,26,26,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'border-color .2s' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = '#C8391A'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(26,26,26,.2)'}
                        >
                          <svg width="20" height="20" fill="none" stroke="rgba(26,26,26,.3)" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          <input type="file" multiple accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleImageChange} />
                        </label>
                      )}
                    </div>
                  )}

                  <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(26,26,26,.4)', marginTop: 8 }}>
                    {images.length}/5 gambar terpilih
                  </p>
                </div>

                {/* Divider */}
                <div style={{ borderTop: '1.5px solid rgba(26,26,26,.1)' }} />

                {/* Submit buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <button type="submit" disabled={loading} className="nr-btn-red">
                    {loading
                      ? <><div className="nr-spin" /> Mengirim...</>
                      : <>
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                          Kirim Laporan
                        </>
                    }
                  </button>
                  <button type="button" onClick={handleCancel} className="nr-btn-dark">Batal</button>
                </div>
              </form>
            </div>

            {/* Footer note */}
            <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(26,26,26,.4)', textAlign: 'center', marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              Suaramu berarti! Setiap laporan membantu Indonesia lebih baik.
            </p>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}