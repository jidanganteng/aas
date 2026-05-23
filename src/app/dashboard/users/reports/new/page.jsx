// src/app/dashboard/user/reports/new/page.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Sparkles,
  Send,
  SmilePlus,
  Loader2,
  Info,
  Maximize2,
  Plus
} from 'lucide-react';

export default function NewReportPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: ''
  });
  const [images, setImages] = useState([]); // array of { file, preview, size }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Ambil kategori
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

  // Deteksi perubahan untuk konfirmasi leave
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Anda memiliki perubahan yang belum disimpan. Yakin ingin keluar?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setHasUnsavedChanges(true);
    if (name === 'description') {
      setCharCount(value.length);
    }
  };

  const validateAndAddImages = (fileList) => {
    const newImages = [];
    const maxFiles = 5;
    const maxSizeMB = 2;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

    const currentCount = images.length;
    const totalToAdd = fileList.length;
    if (currentCount + totalToAdd > maxFiles) {
      setError(`Maksimal ${maxFiles} gambar. Anda sudah punya ${currentCount} gambar.`);
      return;
    }

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!allowedTypes.includes(file.type)) {
        setError(`File "${file.name}" format tidak didukung. Gunakan JPG, PNG, atau WEBP.`);
        continue;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File "${file.name}" melebihi ${maxSizeMB}MB.`);
        continue;
      }
      newImages.push({
        file: file,
        preview: URL.createObjectURL(file),
        size: (file.size / 1024).toFixed(1) + ' KB',
        name: file.name
      });
    }

    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages]);
      setHasUnsavedChanges(true);
      setError('');
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length) {
      validateAndAddImages(Array.from(e.target.files));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      validateAndAddImages(Array.from(e.dataTransfer.files));
    }
  };

  const removeImage = (index) => {
    const removed = images[index];
    if (removed.preview) URL.revokeObjectURL(removed.preview);
    setImages(prev => prev.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validasi
    const titleTrim = form.title.trim();
    if (!titleTrim) {
      setError('Judul laporan harus diisi');
      setLoading(false);
      return;
    }
    if (titleTrim.length < 5) {
      setError('Judul minimal 5 karakter');
      setLoading(false);
      return;
    }
    const descriptionTrim = form.description.trim();
    if (!descriptionTrim) {
      setError('Deskripsi harus diisi');
      setLoading(false);
      return;
    }
    if (descriptionTrim.length < 10) {
      setError('Deskripsi minimal 10 karakter');
      setLoading(false);
      return;
    }
    if (descriptionTrim.length > 2000) {
      setError('Deskripsi maksimal 2000 karakter');
      setLoading(false);
      return;
    }
    if (!form.categoryId) {
      setError('Pilih kategori laporan');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', titleTrim);
      formData.append('description', descriptionTrim);
      formData.append('categoryId', form.categoryId);
      // Tambahkan semua gambar
      images.forEach(img => {
        formData.append('images', img.file);
      });

      const response = await apiFetch('/reports', {
        method: 'POST',
        body: formData,
      });
      
      setSuccess(true);
      setHasUnsavedChanges(false);
      
      setTimeout(() => {
        router.push(`/dashboard/users/reports/succeed`);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Gagal mengirim laporan');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (confirm('Anda memiliki perubahan yang belum disimpan. Yakin ingin membatalkan?')) {
        router.push('/dashboard/user');
      }
    } else {
      router.push('/dashboard/user');
    }
  };

  return (
    <AuthGuard roles={['USER']}>
      <DashboardLayout>
        <div className="max-w-3xl mx-auto px-4 sm:px-0 font-sans">
          <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/dashboard/user" className="hover:text-blue-600 transition">Dashboard</Link>
            <span>›</span>
            <span className="text-gray-800 font-medium">Buat Laporan Baru</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full mb-4 animate-bounce-subtle">
              <Sparkles className="w-8 h-8 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Adukan Masalahmu!</h1>
            <p className="text-gray-500 mt-1 text-base">Ceritakan keluhan atau aspirasimu. Sertakan foto untuk memperkuat laporan (maksimal 5 gambar).</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-red-700 text-sm font-medium">{error}</div>
                </div>
              )}
              {success && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="text-green-700 text-sm font-medium">Laporan berhasil dikirim! Mengalihkan...</div>
                </div>
              )}

              {/* Judul */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Judul Laporan <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Contoh: Jalan Rusak di depan sekolah"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800"
                  required
                  maxLength={100}
                />
                <div className="text-xs text-gray-400 mt-1">Maksimal 100 karakter</div>
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Kategori <span className="text-red-500">*</span></label>
                {loadingCategories ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memuat kategori...</span>
                  </div>
                ) : (
                  <select
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
                    required
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi <span className="text-red-500">*</span></label>
                <textarea
                  name="description"
                  rows="6"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Ceritakan secara detail masalah yang Anda alami... (minimal 10 karakter)"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-800"
                  required
                  maxLength={2000}
                />
                <div className="flex justify-between text-xs mt-1">
                  <span className={charCount < 10 ? 'text-red-500' : 'text-gray-400'}>
                    {charCount < 10 ? `Minimal 10 karakter (${charCount}/10)` : '✓ Minimal terpenuhi'}
                  </span>
                  <span className={charCount > 1900 ? 'text-orange-500' : 'text-gray-400'}>
                    {charCount}/2000 karakter
                  </span>
                </div>
              </div>

              {/* Upload Gambar Multiple */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Foto Pendukung (Opsional, maksimal 5 gambar)</label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  <label className="cursor-pointer block">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-10 h-10 text-gray-400" />
                      <p className="text-sm text-gray-500">Klik atau seret gambar ke sini (JPG, PNG, WEBP, maks 2MB per file)</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Info size={12} /> Anda dapat memilih beberapa file sekaligus
                      </p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/webp" 
                      multiple 
                      className="hidden" 
                      onChange={handleImageChange} 
                    />
                  </label>
                </div>

                {/* Galeri Preview */}
                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        <img src={img.preview} alt={`preview-${idx}`} className="w-full h-32 object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                        >
                          <X size={14} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center truncate">
                          {img.size}
                        </div>
                      </div>
                    ))}
                    {images.length < 5 && (
                      <label className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition bg-gray-50 h-32">
                        <Plus className="w-6 h-6 text-gray-400" />
                        <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
                      </label>
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">{images.length}/5 gambar terpilih</p>
              </div>

              {/* Tombol */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 text-base"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send size={18} /> Kirim Laporan</>}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 text-center bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition text-base"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 text-center text-sm text-gray-400 flex items-center justify-center gap-1">
            <SmilePlus size={16} />
            <span>Suaramu berarti! Jangan ragu untuk melaporkan.</span>
          </div>
        </div>

        <style jsx global>{`
          body { font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, sans-serif; }
          @keyframes bounce-subtle { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
          .animate-bounce-subtle { animation: bounce-subtle 1.5s ease infinite; }
        `}</style>
      </DashboardLayout>
    </AuthGuard>
  );
}