// src/components/AdminUsersPage.jsx
'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Trash2, Edit2, Shield, User, Users, RefreshCw, X, Check, Plus } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [addingUser, setAddingUser] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'USER', password: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Gagal mengambil user:', error);
      alert('Gagal memuat data user');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin hapus user ini? Aksi tidak dapat dibatalkan.')) return;
    try {
      await apiFetch(`/users/${id}`, { method: 'DELETE' });
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      alert(err.message || 'Gagal menghapus user');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, role: user.role, password: '' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: form.name, email: form.email, role: form.role };
      if (form.password) payload.password = form.password;
      await apiFetch(`/users/${editingUser.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Gagal memperbarui user');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      alert('Nama, email, dan password wajib diisi');
      return;
    }
    try {
      await apiFetch('/users', { method: 'POST', body: JSON.stringify(form) });
      setAddingUser(false);
      setForm({ name: '', email: '', role: 'USER', password: '' });
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Gagal menambahkan user');
    }
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case 'SUPER_ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-red-50 text-[#C8391A] border border-red-200">
            <Shield size={12} /> Super Admin
          </span>
        );
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-gray-100 text-[#1A1A1A] border border-gray-300">
            <User size={12} /> Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-gray-50 text-gray-600 border border-gray-200">
            <Users size={12} /> User
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-2 border-[#C8391A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 font-dm-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">Kelola User</h1>
          <p className="text-gray-500 text-sm mt-0.5">Tambah, edit, hapus user dan atur role akses</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchUsers}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A] transition-all duration-200"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            onClick={() => setAddingUser(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[#C8391A] rounded-md bg-white text-[#C8391A] hover:bg-[#C8391A] hover:text-white transition-all duration-200"
          >
            <Plus size={14} />
            Tambah User
          </button>
        </div>
      </div>

      {/* Tabel User - Gaya Industrial Minimalis */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F0E8] border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">ID</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">Nama</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">Role</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">Tanggal Daftar</th>
                <th className="px-5 py-3 text-center font-semibold text-gray-600 text-xs uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-gray-400">
                    Belum ada user terdaftar
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3 font-mono text-xs text-gray-400">#{user.id}</td>
                    <td className="px-5 py-3 font-medium text-[#1A1A1A]">{user.name}</td>
                    <td className="px-5 py-3 text-gray-500">{user.email}</td>
                    <td className="px-5 py-3">{getRoleBadge(user.role)}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-1 text-gray-400 hover:text-[#1A1A1A] transition"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1 text-gray-400 hover:text-[#C8391A] transition"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit User */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingUser(null)}>
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-gray-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-[#1A1A1A]">Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nama</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#C8391A] focus:border-[#C8391A]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#C8391A] focus:border-[#C8391A]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm({...form, role: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#C8391A] focus:border-[#C8391A]"
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Password (kosongkan jika tidak diubah)</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#C8391A] focus:border-[#C8391A]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-[#C8391A] text-white rounded-md text-sm font-medium hover:bg-[#A52F12] transition flex items-center gap-2">
                  <Check size={14} />
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah User */}
      {addingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setAddingUser(false)}>
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-gray-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-[#1A1A1A]">Tambah User Baru</h3>
              <button onClick={() => setAddingUser(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nama</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#C8391A] focus:border-[#C8391A]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#C8391A] focus:border-[#C8391A]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm({...form, role: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#C8391A] focus:border-[#C8391A]"
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#C8391A] focus:border-[#C8391A]"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setAddingUser(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-[#C8391A] text-white rounded-md text-sm font-medium hover:bg-[#A52F12] transition flex items-center gap-2">
                  <Check size={14} />
                  Tambah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}