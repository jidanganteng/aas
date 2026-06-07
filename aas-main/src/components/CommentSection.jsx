'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function CommentSection({ reportId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Penyesuaian endpoint sesuai backend: GET /comments/report/:reportId
  useEffect(() => {
    apiFetch(`/comments/report/${reportId}`)
      .then((data) => setComments(data)) // backend langsung mengembalikan array comments
      .catch(console.error);
  }, [reportId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      // Penyesuaian endpoint POST /comments/report/:reportId, body { content }
      const newComment = await apiFetch(`/comments/report/${reportId}`, {
        method: 'POST',
        body: JSON.stringify({ content: text }), // perhatikan: content, bukan text
      });
      // backend mengembalikan object comment yang baru (dengan user_name)
      setComments((prev) => [...prev, newComment]);
      setText('');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Opsional: handle delete comment (jika diperlukan)
  const handleDelete = async (commentId) => {
    if (!confirm('Hapus komentar ini?')) return;
    try {
      await apiFetch(`/comments/${commentId}`, { method: 'DELETE' });
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Form Komentar */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-4">
          <textarea
            placeholder="Tulis komentar atau tanggapan..."
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows="3"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm transition"
          >
            {loading ? 'Mengirim...' : 'Kirim Komentar'}
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-500 text-center py-3 bg-gray-50 rounded-lg">Silakan login untuk berkomentar.</p>
      )}

      {/* Daftar Komentar */}
      <div className="flex-1 min-h-0">
        <div className="text-xs text-gray-500 mb-3 font-semibold uppercase">Komentar ({comments.length})</div>
        <div className="space-y-3 overflow-y-auto h-96 pr-2">
          {comments.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-4">Belum ada komentar</div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-700">
                    {c.user_name || `User #${c.userId}`}
                  </p>
                  {(user?.id === c.userId || user?.role === 'SUPER_ADMIN') && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-xs text-red-500 hover:text-red-700 transition"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <p className="text-gray-700 text-sm mb-1">{c.content}</p>
                <p className="text-xs text-gray-400">
                  {new Date(c.createdAt).toLocaleString('id-ID')}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
