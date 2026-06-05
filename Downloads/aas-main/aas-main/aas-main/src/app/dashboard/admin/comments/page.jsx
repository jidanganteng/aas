// app/admin/comments/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AdminCommentsPage() {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ reportId: '', userId: '' });
  const [deletingId, setDeletingId] = useState(null);

  const fetchComments = async (page = 1) => {
    setLoading(true);
    try {
      let url = `/comments/all?page=${page}&limit=15`;
      if (filters.reportId) url += `&reportId=${filters.reportId}`;
      if (filters.userId) url += `&userId=${filters.userId}`;
      const res = await apiFetch(url);
      setComments(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [filters]);

  const handleDelete = async (commentId) => {
    if (!confirm('Hapus komentar ini? (Tindakan permanen)')) return;
    setDeletingId(commentId);
    try {
      await apiFetch(`/comments/${commentId}`, { method: 'DELETE' });
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ reportId: '', userId: '' });
  };

  if (loading) return <div className="p-8 text-center">Memuat seluruh komentar...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Komentar</h1>
        <p className="text-sm text-gray-500">Total semua komentar: {pagination.total}</p>
      </div>

      {/* Filter */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium">Report ID</label>
          <input
            type="text"
            name="reportId"
            value={filters.reportId}
            onChange={handleFilterChange}
            placeholder="ID laporan"
            className="border p-2 rounded w-40"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">User ID</label>
          <input
            type="text"
            name="userId"
            value={filters.userId}
            onChange={handleFilterChange}
            placeholder="ID user"
            className="border p-2 rounded w-40"
          />
        </div>
        <button onClick={clearFilters} className="bg-gray-300 px-3 py-2 rounded hover:bg-gray-400">
          Reset Filter
        </button>
      </div>

      {comments.length === 0 ? (
        <div className="text-center py-10 text-gray-500">Tidak ada komentar ditemukan.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">ID</th>
                  <th className="px-4 py-2 border">Laporan</th>
                  <th className="px-4 py-2 border">User</th>
                  <th className="px-4 py-2 border">Komentar</th>
                  <th className="px-4 py-2 border">Dibuat</th>
                  <th className="px-4 py-2 border">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {comments.map(comment => (
                  <tr key={comment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border text-center">{comment.id}</td>
                    <td className="px-4 py-2 border">
                      <Link href={`/report/${comment.reportId}`} className="text-blue-600 underline">
                        {comment.report_title?.slice(0, 40)}
                      </Link>
                    </td>
                    <td className="px-4 py-2 border">{comment.user_name} <br/><span className="text-xs text-gray-400">(ID: {comment.userId})</span></td>
                    <td className="px-4 py-2 border max-w-xs">{comment.content}</td>
                    <td className="px-4 py-2 border text-sm">
                      {new Date(comment.createdAt).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <button
                        onClick={() => handleDelete(comment.id)}
                        disabled={deletingId === comment.id}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        {deletingId === comment.id ? '...' : 'Hapus'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                disabled={pagination.page === 1}
                onClick={() => fetchComments(pagination.page - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-3 py-1">
                Halaman {pagination.page} dari {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() => fetchComments(pagination.page + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}