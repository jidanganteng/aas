'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import DashboardLayout from '@/components/DashboardLayout';
import CommentSection from '@/components/CommentSection';
import { apiFetch } from '@/lib/api';
import { 
  Calendar, MapPin, Tag, AlertCircle, MessageCircle, 
  ChevronLeft, Clock, User, CheckCircle, XCircle, 
  RefreshCw, Send, Edit2, Trash2 
} from 'lucide-react';

export default function AdminReportDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'Menunggu', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'processed', label: 'Diproses', color: 'bg-blue-100 text-blue-700' },
    { value: 'completed', label: 'Selesai', color: 'bg-green-100 text-green-700' },
    { value: 'rejected', label: 'Ditolak', color: 'bg-red-100 text-red-700' }
  ];

  useEffect(() => {
    if (!id) return;
    apiFetch(`/reports/${id}`)
      .then((reportData) => {
        setReport(reportData);
      })
      .catch(err => setError('Gagal memuat laporan'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const updated = await apiFetch(`/reports/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      setReport({ ...report, status: newStatus });
    } catch (err) {
      setError('Gagal mengupdate status');
    } finally {
      setUpdatingStatus(false);
    }
  };



  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  if (loading) return (
    <AuthGuard roles={['ADMIN', 'SUPER_ADMIN']}>
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );

  if (error || !report) return (
    <AuthGuard roles={['ADMIN', 'SUPER_ADMIN']}>
      <DashboardLayout>
        <div className="text-center py-16">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error || 'Laporan tidak ditemukan'}</p>
          <Link href="/dashboard/admin/reports" className="mt-4 inline-block text-purple-600 hover:underline">
            Kembali ke daftar laporan
          </Link>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );

  const currentStatus = statusOptions.find(s => s.value === report.status) || statusOptions[0];

  return (
    <AuthGuard roles={['ADMIN', 'SUPER_ADMIN']}>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          {/* Tombol kembali */}
          <Link
            href="/dashboard/admin/reports"
            className="inline-flex items-center gap-1 text-gray-600 hover:text-purple-600 mb-4"
          >
            <ChevronLeft size={18} /> Kembali
          </Link>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Kolom Kiri - Detail Laporan (2 kolom) */}
            <div className="lg:col-span-2">
              {/* Kartu Detail Laporan */}
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                {/* Header */}
                <div className="border-b p-5">
                  <div className="flex justify-between items-start flex-wrap gap-3">
                    <h1 className="text-2xl font-bold text-gray-800">{report.title}</h1>
                    
                    {/* Dropdown update status */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Status:</span>
                      <select
                        value={report.status}
                        onChange={(e) => handleUpdateStatus(e.target.value)}
                        disabled={updatingStatus}
                        className={`px-3 py-1 rounded-full text-sm font-semibold border-0 focus:ring-2 focus:ring-purple-500 ${currentStatus.color}`}
                      >
                        {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {updatingStatus && <RefreshCw size={14} className="animate-spin text-gray-400" />}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} /> {formatDate(report.created_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      <User size={14} /> {report.user_name || 'Pengguna'}
                    </div>
                    {report.category && (
                      <div className="flex items-center gap-1">
                        <Tag size={14} /> {report.category}
                      </div>
                    )}
                    {report.location && (
                      <div className="flex items-center gap-1">
                        <MapPin size={14} /> {report.location}
                      </div>
                    )}
                  </div>
                </div>

                {/* Deskripsi */}
                <div className="p-5 bg-gray-50">
                  <h3 className="font-semibold text-gray-700 mb-2">Deskripsi</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{report.description}</p>
                </div>

                {/* Foto */}
                {report.image_url && (
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-700 mb-2">Foto Pendukung</h3>
                    <img
                      src={report.image_url}
                      alt="Bukti laporan"
                      className="max-w-full h-auto rounded-lg shadow max-h-96 object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Kolom Kanan - Sidebar Komentar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-md overflow-hidden sticky top-6">
                <div className="p-5 border-b">
                  <div className="flex items-center gap-2">
                    <MessageCircle size={20} className="text-purple-600" />
                    <h3 className="font-semibold text-gray-800">Kotom Komentar</h3>
                  </div>
                </div>
                <div className="p-5">
                  <CommentSection reportId={id} />
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </DashboardLayout>
    </AuthGuard>
  );
}