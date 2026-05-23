// src/app/dashboard/user/reports/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Search,
  Filter,
  PlusCircle,
  AlertCircle
} from 'lucide-react';

export default function UserReportsPage() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    let filtered = reports;
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    setFilteredReports(filtered);
  }, [searchTerm, statusFilter, reports]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/reports');
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Gagal mengambil laporan:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING':
        return { text: 'Menunggu', color: 'bg-yellow-100 text-yellow-700', icon: Clock };
      case 'APPROVED':
        return { text: 'Disetujui', color: 'bg-green-100 text-green-700', icon: CheckCircle };
      case 'REJECTED':
        return { text: 'Ditolak', color: 'bg-red-100 text-red-700', icon: XCircle };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-700', icon: FileText };
    }
  };

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'PENDING').length,
    approved: reports.filter(r => r.status === 'APPROVED').length,
    rejected: reports.filter(r => r.status === 'REJECTED').length,
  };

  return (
    <AuthGuard roles={['USER']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">History Laporan Saya</h1>
              <p className="text-gray-500 mt-1">Lihat dan pantau semua laporan yang telah Anda buat</p>
            </div>
            <Link
              href="/dashboard/users/reports/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition"
            >
              <PlusCircle size={18} />
              Buat Laporan Baru
            </Link>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Total Laporan</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <div className="bg-blue-50 p-2 rounded-xl"><FileText className="w-5 h-5 text-blue-600" /></div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div><p className="text-xs text-gray-500">Menunggu</p><p className="text-2xl font-bold text-yellow-600">{stats.pending}</p></div>
                <div className="bg-yellow-50 p-2 rounded-xl"><Clock className="w-5 h-5 text-yellow-600" /></div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div><p className="text-xs text-gray-500">Disetujui</p><p className="text-2xl font-bold text-green-600">{stats.approved}</p></div>
                <div className="bg-green-50 p-2 rounded-xl"><CheckCircle className="w-5 h-5 text-green-600" /></div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div><p className="text-xs text-gray-500">Ditolak</p><p className="text-2xl font-bold text-red-600">{stats.rejected}</p></div>
                <div className="bg-red-50 p-2 rounded-xl"><XCircle className="w-5 h-5 text-red-600" /></div>
              </div>
            </div>
          </div>

          {/* Filter dan Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Cari judul atau deskripsi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="PENDING">Menunggu</option>
                  <option value="APPROVED">Disetujui</option>
                  <option value="REJECTED">Ditolak</option>
                </select>
              </div>
            </div>
          </div>

          {/* Daftar Laporan (Card style) */}
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
          ) : filteredReports.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-16">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada laporan yang ditemukan</p>
              <Link href="/dashboard/users/reports/new" className="inline-block mt-2 text-blue-600 hover:underline">Buat laporan sekarang</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => {
                const status = getStatusBadge(report.status);
                const StatusIcon = status.icon;
                return (
                  <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h3 className="font-semibold text-gray-800 text-lg">{report.title}</h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            <StatusIcon size={12} />
                            {status.text}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2">{report.description}</p>
                        <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-400">
                          <span>🕒 {new Date(report.createdAt).toLocaleDateString('id-ID')}</span>
                          {report.category_name && <span>📁 {report.category_name}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 self-end sm:self-center">
                        <Link
                          href={`/dashboard/users/reports/${report.id}`}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Detail"
                        >
                          <Eye size={18} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}