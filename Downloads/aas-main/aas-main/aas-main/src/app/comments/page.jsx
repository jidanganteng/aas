// app/comments/page.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PublicCommentsPage() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchComments = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/public?page=${page}&limit=15`);
      const data = await res.json();
      setComments(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Gagal mengambil komentar:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p>Memuat komentar...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">Semua Komentar</h1>
      <p className="text-gray-600 mb-6">
        Komentar terbaru dari seluruh laporan yang masuk.
      </p>

      {comments.length === 0 ? (
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          Belum ada komentar. Jadilah yang pertama!
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <Link
                      href={`/report/${comment.report_id}`}
                      className="text-blue-600 font-medium hover:underline"
                    >
                      {comment.report_title}
                    </Link>
                    <p className="text-xs text-gray-400 mt-1">
                      Oleh: {comment.user_name} • {new Date(comment.createdAt).toLocaleString('id-ID')}
                    </p>
                  </div>
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