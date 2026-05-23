// src/app/dashboard/user/reports/success/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  CheckCircle, FileText, Home, PlusCircle, Share2, Copy, 
  Calendar, AlertCircle, Printer, Download, Mail, 
  Hash, Clock 
} from 'lucide-react';// ← Hapus Facebook & Twitter

export default function ReportSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reportId = searchParams.get('id');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (!reportId) {
      router.push('/dashboard/users/reports/new');
      return;
    }
    apiFetch(`/reports/${reportId}`)
      .then(data => setReport(data))
      .catch(err => {
        console.error(err);
        setError(err.message || 'Gagal memuat laporan');
      })
      .finally(() => setLoading(false));
  }, [reportId, router]);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const getShareUrl = () => `${window.location.origin}/dashboard/user/reports/succees`;
  const shareText = `Saya baru saja membuat laporan: ${report?.title || ''}. Lihat detailnya di sini:`;

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <AuthGuard roles={['USER']}>
        <DashboardLayout>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  if (error || !report) {
    return (
      <AuthGuard roles={['USER']}>
        <DashboardLayout>
          <div className="max-w-md mx-auto text-center py-16 bg-white rounded-2xl shadow p-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-700 font-medium mb-2">
              {error || 'Laporan tidak ditemukan.'}
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Mungkin laporan telah dihapus atau Anda tidak memiliki akses.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard/user" className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                Kembali ke Dashboard
              </Link>
              <Link href="/dashboard/user/reports/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Buat Laporan Baru
              </Link>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  const formattedDate = report.created_at 
    ? new Date(report.created_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })
    : 'Tanggal tidak tersedia';

  return (
    <AuthGuard roles={['USER']}>
      <DashboardLayout>
        <div className="max-w-3xl mx-auto px-4 sm:px-0">
          {/* Kartu Sukses */}
          <div className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4 animate-bounce">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-white">Laporan Berhasil Dikirim!</h1>
              <p className="text-green-100 mt-2">Terima kasih atas partisipasi Anda. Laporan akan segera kami proses.</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Ringkasan Laporan */}
              <div className="text-left bg-gray-50 rounded-xl p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                  <FileText size={18} /> Detail Laporan
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex flex-wrap gap-1">
                    <span className="text-gray-500 w-28">Judul:</span>
                    <span className="font-medium flex-1">{report.title}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-gray-500 w-28">Kategori:</span>
                    <span>{report.category_name || '-'}</span>
                  </div>
                  {report.description && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-gray-500 w-28">Deskripsi:</span>
                      <span className="flex-1">{report.description.length > 150 ? report.description.slice(0, 150) + '…' : report.description}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1">
                    <span className="text-gray-500 w-28">ID Laporan:</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded inline-flex items-center gap-1">
                      <Hash size={12} /> #{report.id}
                      <button onClick={() => copyToClipboard(report.id.toString(), 'id')} className="ml-1 text-gray-400 hover:text-blue-600">
                        <Copy size={12} />
                      </button>
                      {copiedId && <span className="text-green-600 text-xs ml-1">(tersalin!)</span>}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-gray-500 w-28">Tanggal:</span>
                    <span className="flex items-center gap-1"><Calendar size={14} /> {formattedDate}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-gray-500 w-28">Status:</span>
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">Menunggu Verifikasi</span>
                  </div>
                  {report.location && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-gray-500 w-28">Lokasi:</span>
                      <span>{report.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Langkah Selanjutnya */}
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <Clock size={18} /> Apa yang akan terjadi selanjutnya?
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Admin akan memverifikasi laporan Anda dalam waktu maksimal 2x24 jam.</li>
                  <li>Anda akan mendapatkan notifikasi via email/dashboard ketika status berubah.</li>
                  <li>Jika diperlukan informasi tambahan, admin akan menghubungi Anda melalui email atau telepon.</li>
                  <li>Pantau terus halaman detail laporan atau dashboard Anda.</li>
                </ol>
              </div>

              {/* Tombol Aksi */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/dashboard/user" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition">
                  <Home size={18} /> Dashboard
                </Link>
                <Link href={`/dashboard/user/reports/${report.id}`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md">
                  <FileText size={18} /> Detail Laporan
                </Link>
                <Link href="/dashboard/user/reports/new" className="inline-flex items-center gap-2 px-5 py-2.5 border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition">
                  <PlusCircle size={18} /> Laporan Baru
                </Link>
                <button onClick={handlePrint} className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition">
                  <Printer size={18} /> Cetak
                </button>
              </div>

              {/* Bagikan & Salin Link - tanpa Facebook & Twitter, gunakan Share2 sebagai pengganti */}
              <div className="border-t border-gray-100 pt-5">
                <p className="text-xs text-gray-500 mb-3 text-center">Bagikan laporan ini (hanya bisa diakses oleh Anda & admin)</p>
                
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button onClick={() => copyToClipboard(getShareUrl(), 'link')} className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition bg-gray-100 px-3 py-1.5 rounded-full">
                    <Copy size={14} />
                    {copiedLink ? 'Tersalin!' : 'Salin link'}
                  </button>
                  
                  <a href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + getShareUrl())}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600 transition bg-gray-100 px-3 py-1.5 rounded-full">
                    <Share2 size={14} /> WhatsApp
                  </a>
                  
                  <a href={`mailto:?subject=Laporan Saya: ${report.title}&body=${shareText}%0A${getShareUrl()}`} className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-500 transition bg-gray-100 px-3 py-1.5 rounded-full">
                    <Mail size={14} /> Email
                  </a>
                  
                  {/* Tombol bagikan ke Facebook & Twitter menggunakan Share2 */}
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-700 transition bg-gray-100 px-3 py-1.5 rounded-full">
                    <Share2 size={14} /> Facebook
                  </a>
                  
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(getShareUrl())}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-400 transition bg-gray-100 px-3 py-1.5 rounded-full">
                    <Share2 size={14} /> Twitter
                  </a>
                </div>
                
                <div className="text-center mt-3">
                  <button onClick={handlePrint} className="text-xs text-gray-400 hover:text-gray-600 inline-flex items-center gap-1">
                    <Download size={12} /> Simpan sebagai PDF (gunakan Cetak)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Pesan penutup */}
          <div className="text-center text-xs text-gray-400 mt-6 space-y-1">
            <p>⚡ Laporan Anda akan segera ditindaklanjuti. Pantau statusnya di halaman detail.</p>
            <p>💬 Butuh bantuan? Hubungi kami di <a href="mailto:support@example.com" className="text-blue-500">support@example.com</a></p>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}