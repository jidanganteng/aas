'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { 
  FileText, 
  PlusCircle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Trash2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Calendar,
  Download,
  Send
} from 'lucide-react';

export default function UserDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    apiFetch('/reports?my=true')
      .then((data) => {
        const reportsData = data.reports || data || [];
        setReports(reportsData);
        const pending = reportsData.filter(r => r.status === 'PENDING').length;
        const approved = reportsData.filter(r => r.status === 'APPROVED').length;
        const rejected = reportsData.filter(r => r.status === 'REJECTED').length;
        setStats({ pending, approved, rejected, total: reportsData.length });
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
    } catch (err) {
      alert(err.message);
    }
  };

  const statCards = [
    { title: 'Total Laporan', value: stats.total, icon: FileText, gradient: 'from-blue-500 to-blue-600', badge: 'bg-blue-50 text-blue-600', change: '+2.5%', trend: 'up', subtitle: 'Laporan Anda' },
    { title: 'Menunggu Verifikasi', value: stats.pending, icon: Clock, gradient: 'from-yellow-400 to-yellow-500', badge: 'bg-yellow-50 text-yellow-700', change: '-1.2%', trend: 'down', subtitle: 'Perlu ditindaklanjuti' },
    { title: 'Terselesaikan', value: stats.approved, icon: CheckCircle, gradient: 'from-green-500 to-green-600', badge: 'bg-green-50 text-green-700', change: '+8.3%', trend: 'up', subtitle: 'Disetujui & diproses' },
    { title: 'Ditolak', value: stats.rejected, icon: XCircle, gradient: 'from-red-500 to-red-600', badge: 'bg-red-50 text-red-600', change: '-0.5%', trend: 'down', subtitle: 'Tidak disetujui' },
  ];

  const filtered = reports.filter(r => 
    (statusFilter === 'ALL' || r.status === statusFilter) &&
    (!query || (r.title || '').toLowerCase().includes(query.toLowerCase()))
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'APPROVED': return 'bg-green-100 text-green-800 border border-green-300';
      case 'REJECTED': return 'bg-red-100 text-red-800 border border-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBgColor = (status) => {
    switch(status) {
      case 'PENDING': return 'from-yellow-50 to-yellow-100';
      case 'APPROVED': return 'from-green-50 to-green-100';
      case 'REJECTED': return 'from-red-50 to-red-100';
      default: return 'from-gray-50 to-gray-100';
    }
  };

  if (loading) {
    return (
      <AuthGuard roles={["USER"]}>
        <DashboardLayout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Memuat dashboard...</p>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard roles={["USER"]}>
      <DashboardLayout>
        <div className="w-full px-4 sm:px-6 py-6 sm:py-8 bg-gray-50 min-h-screen">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Dashboard Saya</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Kelola laporan Anda, pantau status, dan lihat hasil tindak lanjut</p>
          </div>

          {/* KPI Cards - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">
            {statCards.map((card, idx) => (
              <div key={idx} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 rounded-2xl blur-lg transition duration-300"
                  style={{ background: `linear-gradient(135deg, ${card.gradient.split(' to ')[0]} 0%, ${card.gradient.split(' to ')[1]} 100%)` }}>
                </div>
                <div className="relative bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition duration-300 border border-gray-100">
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 font-medium">{card.title}</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                    </div>
                    <div className={`p-2 sm:p-3 rounded-xl ${card.badge}`}>
                      <card.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{card.subtitle}</span>
                    <div className="flex items-center gap-1">
                      {card.trend === 'up' ? (
                        <ArrowUp size={14} className="text-green-500" />
                      ) : (
                        <ArrowDown size={14} className="text-red-500" />
                      )}
                      <span className={`text-xs font-semibold ${card.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {card.change}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content - Laporan */}
            <div className="lg:col-span-3">
              {/* Search & Filters */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                  <div className="flex-1">
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Cari Laporan</label>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ketik judul atau deskripsi..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                  <div className="w-full sm:w-48">
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Filter Status</label>
                    <select 
                      value={statusFilter} 
                      onChange={e => setStatusFilter(e.target.value)} 
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    >
                      <option value="ALL">Semua Status</option>
                      <option value="PENDING">Menunggu</option>
                      <option value="APPROVED">Disetujui</option>
                      <option value="REJECTED">Ditolak</option>
                    </select>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Menampilkan <span className="font-semibold">{filtered.length}</span> dari <span className="font-semibold">{stats.total}</span> laporan
                </div>
              </div>

              {/* Daftar Laporan */}
              {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-gray-100 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-lg font-semibold">Tidak ada laporan</p>
                  <p className="text-gray-500 mt-1">Coba ubah filter atau buat laporan baru</p>
                  <Link href="/dashboard/users/reports/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg hover:bg-blue-700 transition font-semibold mt-6">
                    <PlusCircle size={18} />
                    Buat Laporan Baru
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filtered.map((report) => (
                    <div key={report.id} className={`bg-gradient-to-br ${getStatusBgColor(report.status)} rounded-2xl p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition group`}>
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                          <FileText size={20} className="sm:w-6 sm:h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 text-base sm:text-lg">{report.title}</h4>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{report.description || 'Tidak ada deskripsi'}</p>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${getStatusColor(report.status)}`}>
                              {report.status === 'PENDING' ? 'Menunggu' : report.status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-gray-600">
                            {report.category && (
                              <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-full">
                                <span className="font-semibold text-gray-700">{report.category.name}</span>
                              </span>
                            )}
                            <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-full">
                              <Calendar size={14} />
                              {report.createdAt ? new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/40">
                        {/* Perbaikan navigasi detail */}
                        <Link href={`/dashboard/users/reports/${report.id}`} className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/60 hover:bg-white text-gray-700 rounded-lg transition font-semibold text-sm">
                          <Eye size={16} />
                          Lihat Detail
                        </Link>
                        <button onClick={() => handleDelete(report.id)} className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/60 hover:bg-red-100 text-red-600 rounded-lg transition font-semibold text-sm">
                          <Trash2 size={16} />
                          Hapus
                        </button>
                        <div className="flex-1"></div>
                        <button className="p-2 hover:bg-white rounded-lg transition text-gray-600">
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar Kanan - Responsif */}
            <div className="space-y-6">
              {/* CTA Buat Laporan */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 sm:p-6 text-white shadow-sm">
                <PlusCircle size={28} className="mb-3" />
                <h3 className="text-lg font-bold mb-2">Buat Laporan Baru</h3>
                <p className="text-white/80 text-sm mb-4">Laporkan masalah atau keluhan Anda sekarang</p>
                <Link href="/dashboard/users/reports/new" className="block w-full bg-white text-blue-600 font-semibold py-2.5 sm:py-3 rounded-lg hover:bg-gray-50 transition text-center text-sm sm:text-base">
                  Buat Sekarang
                </Link>
              </div>

              {/* Ringkasan Status */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Ringkasan Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <span className="text-sm font-semibold text-yellow-900">Menunggu</span>
                    <span className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-sm font-semibold text-green-900">Disetujui</span>
                    <span className="text-xl sm:text-2xl font-bold text-green-600">{stats.approved}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <span className="text-sm font-semibold text-red-900">Ditolak</span>
                    <span className="text-xl sm:text-2xl font-bold text-red-600">{stats.rejected}</span>
                  </div>
                </div>
              </div>

              {/* Aksi Cepat */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Aksi Cepat</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition font-semibold text-sm">
                    <Download size={16} />
                    Export Laporan
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition font-semibold text-sm">
                    <Send size={16} />
                    Hubungi Admin
                  </button>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-2">💡 Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Lengkapi data laporan dengan detail</li>
                  <li>• Sertakan bukti/foto yang jelas</li>
                  <li>• Periksa status secara berkala</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}