// app/user/comments/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function MyCommentsPage() {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [deletingId, setDeletingId] = useState(null);

  const fetchComments = async (page = 1) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/comments/my-comments?page=${page}&limit=10`);
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
  }, []);

  const handleDelete = async (commentId) => {
    if (!confirm('Hapus komentar ini?')) return;
    setDeletingId(commentId);
    try {
      await apiFetch(`/comments/${commentId}`, { method: 'DELETE' });
      setComments(prev => prev.filter(c => c.id !== commentId));
      // update total count if needed
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="p-8 text-center">Memuat komentar Anda...</div>;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">Komentar Saya</h1>
      <p className="text-gray-600 mb-6">Semua komentar yang pernah Anda tulis.</p>

      {comments.length === 0 ? (
        <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800">
          Anda belum pernah berkomentar. <Link href="/reports" className="underline">Lihat laporan</Link> dan berikan tanggapan.
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <Link href={`/report/${comment.reportId}`} className="text-blue-600 font-medium hover:underline">
                      {comment.report_title}
                    </Link>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(comment.createdAt).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={deletingId === comment.id}
                    className="text-red-500 text-sm hover:text-red-700 disabled:opacity-50"
                  >
                    {deletingId === comment.id ? '...' : 'Hapus'}
                  </button>
                </div>
                <p className="text-gray-700 mt-2">{comment.content}</p>
              </div>
            ))}
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
              <span className="px-3 py-1">Halaman {pagination.page} dari {pagination.totalPages}</span>
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