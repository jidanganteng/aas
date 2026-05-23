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
  ChevronLeft, Clock, User, Trash2, Edit2, Send 
} from 'lucide-react';

export default function UserReportDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    processed: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700'
  };

  const statusLabels = {
    pending: 'Menunggu',
    processed: 'Diproses',
    completed: 'Selesai',
    rejected: 'Ditolak'
  };

  useEffect(() => {
    if (!id) return;
    apiFetch(`/reports/${id}`)
      .then((reportData) => {
        setReport(reportData);
      })
      .catch(err => setError('Gagal memuat laporan'))
      .finally(() => setLoading(false));
  }, [id]);



  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  if (loading) return (
    <AuthGuard roles={['USER']}>
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );

  if (error || !report) return (
    <AuthGuard roles={['USER']}>
      <DashboardLayout>
        <div className="text-center py-16">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error || 'Laporan tidak ditemukan'}</p>
          <Link href="/dashboard/users/reports" className="mt-4 inline-block text-blue-600 hover:underline">
            Kembali ke daftar laporan
          </Link>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );

  return (
    <AuthGuard roles={['USER']}>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <Link
            href="/dashboard/users/reports"
            className="inline-flex items-center gap-1 text-gray-600 hover:text-blue-600 mb-4"
          >
            <ChevronLeft size={18} /> Kembali
          </Link>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Kolom Kiri - Detail Laporan (2 kolom) */}
            <div className="lg:col-span-2">
              {/* Kartu Detail Laporan */}
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                {/* Header dengan status */}
                <div className="border-b p-5">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <h1 className="text-2xl font-bold text-gray-800">{report.title}</h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[report.status] || statusColors.pending}`}>
                      {statusLabels[report.status] || report.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} /> {formatDate(report.created_at)}
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

                {/* Foto jika ada */}
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
                    <MessageCircle size={20} className="text-blue-600" />
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