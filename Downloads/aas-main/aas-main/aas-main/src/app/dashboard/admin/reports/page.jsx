// src/app/dashboard/admin/reports/page.jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  MessageCircle
} from 'lucide-react';

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State untuk modal alasan penolakan
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReportId, setRejectReportId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    let filtered = reports;
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    setFilteredReports(filtered);
    setCurrentPage(1);
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

  const updateStatus = async (id, newStatus, reason = null) => {
    try {
      const payload = { status: newStatus };
      if (newStatus === 'REJECTED' && reason) {
        payload.rejectionReason = reason;
      }
      await apiFetch(`/reports/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      // Update local state
      setReports(prev => 
        prev.map(r => r.id === id ? { 
          ...r, 
          status: newStatus,
          rejectionReason: newStatus === 'REJECTED' ? reason : r.rejectionReason
        } : r)
      );
      return true;
    } catch (error) {
      alert('Gagal mengupdate status');
      return false;
    }
  };

  const handleStatusChange = (reportId, newStatus) => {
    if (newStatus === 'REJECTED') {
      setRejectReportId(reportId);
      setRejectionReason('');
      setRejectModalOpen(true);
    } else if (newStatus === 'APPROVED') {
      updateStatus(reportId, 'APPROVED');
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      alert('Harap masukkan alasan penolakan');
      return;
    }
    const success = await updateStatus(rejectReportId, 'REJECTED', rejectionReason);
    if (success) {
      setRejectModalOpen(false);
      setRejectionReason('');
      setRejectReportId(null);
    }
  };

  const deleteReport = async (id) => {
    if (!confirm('Yakin ingin menghapus laporan ini?')) return;
    try {
      await apiFetch(`/reports/${id}`, { method: 'DELETE' });
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      alert('Gagal menghapus laporan');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING': return { text: 'Menunggu', color: 'bg-yellow-100 text-yellow-700', icon: Clock };
      case 'APPROVED': return { text: 'Disetujui', color: 'bg-green-100 text-green-700', icon: CheckCircle };
      case 'REJECTED': return { text: 'Ditolak', color: 'bg-red-100 text-red-700', icon: XCircle };
      default: return { text: status, color: 'bg-gray-100 text-gray-700', icon: AlertTriangle };
    }
  };

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AuthGuard roles={['ADMIN', 'SUPER_ADMIN']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Semua Laporan</h1>
              <p className="text-gray-500 mt-1">Kelola dan pantau seluruh laporan pengaduan masyarakat</p>
            </div>
            <button 
              onClick={fetchReports}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Cari judul atau pelapor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="PENDING">Menunggu</option>
                  <option value="APPROVED">Disetujui</option>
                  <option value="REJECTED">Ditolak</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : paginatedReports.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <AlertTriangle className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">Belum ada laporan yang ditemukan</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="p-4 text-left font-semibold text-gray-600">ID</th>
                        <th className="p-4 text-left font-semibold text-gray-600">Judul</th>
                        <th className="p-4 text-left font-semibold text-gray-600">Pelapor</th>
                        <th className="p-4 text-left font-semibold text-gray-600">Kategori</th>
                        <th className="p-4 text-left font-semibold text-gray-600">Status</th>
                        <th className="p-4 text-left font-semibold text-gray-600">Tanggal</th>
                        <th className="p-4 text-center font-semibold text-gray-600">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedReports.map((report) => {
                        const status = getStatusBadge(report.status);
                        const StatusIcon = status.icon;
                        return (
                          <tr key={report.id} className="hover:bg-gray-50 transition">
                            <td className="p-4 font-mono text-xs text-gray-500">#{report.id}</td>
                            <td className="p-4 font-medium text-gray-800 max-w-xs truncate">{report.title}</td>
                            <td className="p-4 text-gray-600">{report.user_name || '-'}</td>
                            <td className="p-4 text-gray-600">{report.category_name || '-'}</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                <StatusIcon size={12} />
                                {status.text}
                              </span>
                            </td>
                            <td className="p-4 text-gray-500 text-xs">
                              {new Date(report.createdAt).toLocaleDateString('id-ID')}
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex justify-center gap-2">
                                {/* 👁️ Tombol mata → halaman detail */}
                                <Link
                                  href={`/dashboard/admin/reports/${report.id}`}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                  title="Detail"
                                >
                                  <Eye size={16} />
                                </Link>
                                <select
                                  value={report.status}
                                  onChange={(e) => handleStatusChange(report.id, e.target.value)}
                                  className="text-xs border rounded px-2 py-1 bg-white"
                                >
                                  <option value="PENDING">Menunggu</option>
                                  <option value="APPROVED">Setujui</option>
                                  <option value="REJECTED">Tolak</option>
                                </select>
                                <button
                                  onClick={() => deleteReport(report.id)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="Hapus"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p-1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-50"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-gray-600">
                      Halaman {currentPage} dari {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-50"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modal Input Alasan Penolakan */}
        {rejectModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setRejectModalOpen(false)}>
            <div className="bg-white rounded-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
              <div className="border-b border-gray-100 px-6 py-4">
                <h3 className="text-lg font-bold text-gray-800">Alasan Penolakan</h3>
                <p className="text-sm text-gray-500">Berikan alasan mengapa laporan ini ditolak</p>
              </div>
              <div className="p-6">
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Contoh: Laporan tidak lengkap, foto bukti kurang jelas, atau masalah lain..."
                  autoFocus
                />
              </div>
              <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
                <button onClick={() => setRejectModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Batal</button>
                <button onClick={handleRejectConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Tolak Laporan</button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </AuthGuard>
  );
}