'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  Clock,
  ArrowUp,
  ArrowDown,
  Eye,
  Download,
  Filter,
  AlertTriangle,
  Plus,
  Activity,
  BarChart3
} from 'lucide-react';

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

  const kpiCards = [
    { 
      title: 'Total Pengguna', 
      value: stats.totalUsers, 
      icon: Users, 
      gradient: 'from-blue-500 to-blue-600', 
      badge: 'bg-blue-50 text-blue-600',
      change: '+5.2%', 
      trend: 'up',
      subtitle: 'Pengguna aktif bulan ini'
    },
    { 
      title: 'Total Laporan', 
      value: stats.totalReports, 
      icon: FileText, 
      gradient: 'from-purple-500 to-purple-600', 
      badge: 'bg-purple-50 text-purple-600',
      change: '+12.5%', 
      trend: 'up',
      subtitle: 'Laporan masuk'
    },
    { 
      title: 'Menunggu Verifikasi', 
      value: stats.pendingReports, 
      icon: Clock, 
      gradient: 'from-yellow-400 to-yellow-500', 
      badge: 'bg-yellow-50 text-yellow-700',
      change: '-3.1%', 
      trend: 'down',
      subtitle: 'Perlu tindakan segera'
    },
    { 
      title: 'Terselesaikan', 
      value: stats.approvedReports, 
      icon: CheckCircle, 
      gradient: 'from-green-500 to-green-600', 
      badge: 'bg-green-50 text-green-700',
      change: '+18.3%', 
      trend: 'up',
      subtitle: 'Laporan yang disetujui'
    },
  ];

  const filteredReports = stats.recentReports.filter(r => 
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

  if (loading) {
    return (
      <AuthGuard roles={["ADMIN", "SUPER_ADMIN"]}>
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
    <AuthGuard roles={["ADMIN", "SUPER_ADMIN"]}>
      <DashboardLayout>
        <div className="w-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Dashboard Admin</h1>
            <p className="text-gray-600 mt-2">Pantau aktivitas pengaduan dan kelola laporan dengan efisien</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {kpiCards.map((card, idx) => (
              <div key={idx} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 rounded-2xl blur-lg transition duration-300"
                  style={{ background: `linear-gradient(135deg, ${card.gradient.split(' to ')[0]} 0%, ${card.gradient.split(' to ')[1]} 100%)` }}>
                </div>
                <div className="relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition duration-300 border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">{card.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{card.value.toLocaleString()}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${card.badge}`}>
                      <card.icon className="w-6 h-6" />
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

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Distribution */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Distribusi Status Laporan</h2>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                      <BarChart3 size={18} className="text-gray-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                      <Download size={18} className="text-gray-500" />
                    </button>
                  </div>
                </div>
                <div className="space-y-5">
                  {[
                    { label: 'Menunggu Verifikasi', value: stats.pendingReports, total: stats.totalReports, color: 'bg-yellow-500', percentage: stats.totalReports ? (stats.pendingReports / stats.totalReports * 100).toFixed(1) : 0 },
                    { label: 'Disetujui & Diproses', value: stats.approvedReports, total: stats.totalReports, color: 'bg-green-500', percentage: stats.totalReports ? (stats.approvedReports / stats.totalReports * 100).toFixed(1) : 0 },
                    { label: 'Ditolak', value: stats.rejectedReports, total: stats.totalReports, color: 'bg-red-500', percentage: stats.totalReports ? (stats.rejectedReports / stats.totalReports * 100).toFixed(1) : 0 }
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-semibold text-gray-700">{item.label}</label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{item.value}</span>
                          <span className="text-xs text-gray-500">({item.percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div className={`${item.color} h-full rounded-full transition-all duration-500`} 
                          style={{ width: `${item.percentage}%` }}>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">{stats.totalReports}</span> total laporan diterima
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Aktivitas Terbaru</h2>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold">Lihat Semua</button>
                </div>
                <div className="space-y-3">
                  {filteredReports.slice(0, 5).map((report, idx) => (
                    <div key={report.id || idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-200">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center flex-shrink-0">
                        <FileText size={20} className="text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{report.title || '—'}</p>
                        <p className="text-xs text-gray-500">{report.createdAt ? new Date(report.createdAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</p>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${getStatusColor(report.status)}`}>
                        {report.status === 'PENDING' ? 'Menunggu' : report.status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Aksi Cepat</h2>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
                    <Plus size={18} />
                    Buat Laporan
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition font-semibold">
                    <Download size={18} />
                    Export Data
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition font-semibold">
                    <Activity size={18} />
                    Laporan Analitik
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Filter & Cari</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Cari Laporan</label>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ketik judul..."
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Status</label>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="ALL">Semua Status</option>
                      <option value="PENDING">Menunggu</option>
                      <option value="APPROVED">Disetujui</option>
                      <option value="REJECTED">Ditolak</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Rentang Waktu</label>
                    <select value={timeRange} onChange={e => setTimeRange(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="week">Minggu Ini</option>
                      <option value="month">Bulan Ini</option>
                      <option value="quarter">Kuartal Ini</option>
                      <option value="year">Tahun Ini</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-sm">
                <h2 className="text-lg font-bold mb-4">Ringkasan Minggu Ini</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Laporan Baru</span>
                    <span className="text-2xl font-bold">+{Math.floor(Math.random() * 30) + 10}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Terverifikasi</span>
                    <span className="text-2xl font-bold">{Math.floor(Math.random() * 20) + 15}</span>
                  </div>
                  <div className="border-t border-white/20 pt-3 mt-3">
                    <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg transition font-semibold text-sm">
                      Lihat Detail Mingguan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reports Table */}
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Daftar Laporan Lengkap</h2>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <Filter size={18} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <Download size={18} className="text-gray-600" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Judul</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Kategori</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Tanggal</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.slice(0, 10).map((report) => (
                    <tr key={report.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <FileText size={16} className="text-blue-600" />
                          </div>
                          <span className="font-semibold text-gray-900 truncate">{report.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{report.category?.name || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(report.status)}`}>
                          {report.status === 'PENDING' ? 'Menunggu' : report.status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{report.createdAt ? new Date(report.createdAt).toLocaleDateString('id-ID') : '—'}</td>
                      <td className="px-6 py-4">
                        <button className="p-2 hover:bg-gray-200 rounded-lg transition text-gray-600 hover:text-gray-900">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredReports.length === 0 && (
              <div className="text-center py-12">
                <AlertTriangle size={40} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Tidak ada laporan ditemukan</p>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}