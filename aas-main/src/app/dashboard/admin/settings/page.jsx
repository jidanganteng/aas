// src/app/dashboard/admin/settings/page.jsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Users, Shield, FileCheck, BarChart3, UserPlus, Edit, Trash2,
  CheckCircle, XCircle, RefreshCw, Save, AlertCircle
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  
  // MOCK DATA (sama seperti sebelumnya)
  const [users, setUsers] = useState([
    { id: 1, name: 'Admin Utama', email: 'admin@example.com', role: 'SUPER_ADMIN' },
    { id: 2, name: 'Operator', email: 'operator@example.com', role: 'ADMIN' },
    { id: 3, name: 'Budi Santoso', email: 'budi@example.com', role: 'USER' },
    { id: 4, name: 'Siti Nurhaliza', email: 'siti@example.com', role: 'USER' },
  ]);
  const [roles, setRoles] = useState(['USER', 'ADMIN', 'SUPER_ADMIN']);
  const [pendingReports, setPendingReports] = useState([
    { id: 101, title: 'Jalan Rusak di Depan Sekolah', user_name: 'Budi Santoso', createdAt: '2026-05-20' },
    { id: 102, title: 'Lampu Jalan Mati', user_name: 'Siti Nurhaliza', createdAt: '2026-05-21' },
  ]);
  const [stats, setStats] = useState({
    totalUsers: 4,
    totalReports: 25,
    pendingReportsCount: 2,
    verifiedReports: 23
  });

  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [newRole, setNewRole] = useState('');
  const [verifyingId, setVerifyingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleUpdateRole = (userId, newRole) => {
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    setEditingUser(null);
    showMessage(`Role berhasil diubah menjadi ${newRole}`);
  };

  const handleDeleteUser = (userId) => {
    if (!confirm('Yakin ingin menghapus user ini?')) return;
    setUsers(users.filter(u => u.id !== userId));
    showMessage('User berhasil dihapus');
  };

  const handleAddRole = () => {
    if (!newRole.trim()) return;
    const upperRole = newRole.toUpperCase();
    if (roles.includes(upperRole)) {
      showMessage('Role sudah ada', 'error');
      return;
    }
    setRoles([...roles, upperRole]);
    setNewRole('');
    showMessage(`Role ${upperRole} ditambahkan`);
  };

  const handleVerifyReport = (reportId, status) => {
    setVerifyingId(reportId);
    setTimeout(() => {
      setPendingReports(pendingReports.filter(r => r.id !== reportId));
      setStats(prev => ({
        ...prev,
        pendingReportsCount: prev.pendingReportsCount - 1,
        verifiedReports: status === 'APPROVED' ? prev.verifiedReports + 1 : prev.verifiedReports
      }));
      showMessage(`Laporan ${status === 'APPROVED' ? 'disetujui' : 'ditolak'}`);
      setVerifyingId(null);
    }, 500);
  };

  return (
    <AuthGuard roles={['ADMIN', 'SUPER_ADMIN']}>
      <DashboardLayout>
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
            <Shield className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Pengaturan Sistem</h1>
              <p className="text-gray-500">
                {isSuperAdmin ? 'Kelola user, role, verifikasi laporan, dan pantau statistik' : 'Pantau statistik dan verifikasi laporan'}
              </p>
            </div>
          </div>

          {message.text && (
            <div className={`p-3 rounded-lg flex items-center gap-2 ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
              {message.text}
            </div>
          )}

          {/* Manajemen User - hanya untuk SUPER_ADMIN */}
          {isSuperAdmin && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users size={20} className="text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-800">Manajemen User</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr><th className="px-4 py-2 text-left">Nama</th><th className="px-4 py-2 text-left">Email</th><th className="px-4 py-2 text-left">Role</th><th className="px-4 py-2 text-center">Aksi</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map(user => (
                      <tr key={user.id}>
                        <td className="px-4 py-2 font-medium">{user.name}</td>
                        <td className="px-4 py-2 text-gray-600">{user.email}</td>
                        <td className="px-4 py-2">
                          {editingUser === user.id ? (
                            <select value={editRole} onChange={e => setEditRole(e.target.value)} className="border rounded px-2 py-1 text-sm">
                              {roles.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-semibold">{user.role}</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center space-x-2">
                          {editingUser === user.id ? (
                            <button onClick={() => handleUpdateRole(user.id, editRole)} className="text-green-600 hover:text-green-800"><Save size={16} /></button>
                          ) : (
                            <button onClick={() => { setEditingUser(user.id); setEditRole(user.role); }} className="text-blue-600 hover:text-blue-800"><Edit size={16} /></button>
                          )}
                          <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Hak Akses - hanya untuk SUPER_ADMIN */}
          {isSuperAdmin && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4"><Shield size={20} className="text-purple-600" /><h2 className="text-xl font-semibold">Hak Akses / Role</h2></div>
              <div className="flex flex-wrap gap-2 mb-4">{roles.map(role => <span key={role} className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">{role}</span>)}</div>
              <div className="flex gap-2">
                <input type="text" value={newRole} onChange={e => setNewRole(e.target.value.toUpperCase())} placeholder="Nama role baru" className="border rounded-lg px-3 py-1 flex-1" />
                <button onClick={handleAddRole} className="bg-purple-600 text-white px-4 py-1 rounded-lg hover:bg-purple-700 flex items-center gap-1"><UserPlus size={16} /> Tambah</button>
              </div>
            </div>
          )}

          {/* Verifikasi Laporan - untuk semua admin */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4"><FileCheck size={20} className="text-purple-600" /><h2 className="text-xl font-semibold">Verifikasi Laporan</h2></div>
            {pendingReports.length === 0 ? <p className="text-gray-500">Tidak ada laporan menunggu verifikasi.</p> : (
              <div className="space-y-3">
                {pendingReports.map(report => (
                  <div key={report.id} className="border rounded-lg p-3 flex justify-between items-center">
                    <div><p className="font-medium">{report.title}</p><p className="text-xs text-gray-500">Dari: {report.user_name} • {new Date(report.createdAt).toLocaleDateString()}</p></div>
                    <div className="flex gap-2">
                      <button onClick={() => handleVerifyReport(report.id, 'APPROVED')} disabled={verifyingId === report.id} className="bg-green-100 text-green-700 px-3 py-1 rounded-lg hover:bg-green-200 flex items-center gap-1"><CheckCircle size={14} /> Setujui</button>
                      <button onClick={() => handleVerifyReport(report.id, 'REJECTED')} disabled={verifyingId === report.id} className="bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 flex items-center gap-1"><XCircle size={14} /> Tolak</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Statistik Sistem - untuk semua admin */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4"><BarChart3 size={20} className="text-purple-600" /><h2 className="text-xl font-semibold">Statistik Sistem</h2></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg"><p className="text-gray-500 text-sm">Total Pengguna</p><p className="text-2xl font-bold text-purple-700">{stats.totalUsers}</p></div>
              <div className="bg-blue-50 p-4 rounded-lg"><p className="text-gray-500 text-sm">Total Laporan</p><p className="text-2xl font-bold text-blue-700">{stats.totalReports}</p></div>
              <div className="bg-yellow-50 p-4 rounded-lg"><p className="text-gray-500 text-sm">Menunggu Verifikasi</p><p className="text-2xl font-bold text-yellow-700">{stats.pendingReportsCount}</p></div>
              <div className="bg-green-50 p-4 rounded-lg"><p className="text-gray-500 text-sm">Terverifikasi</p><p className="text-2xl font-bold text-green-700">{stats.verifiedReports}</p></div>
            </div>
            <div className="mt-4 text-right">
              <button onClick={() => { showMessage('Data statistik diperbarui', 'success'); }} className="text-purple-600 hover:text-purple-800 flex items-center gap-1 ml-auto"><RefreshCw size={14} /> Refresh Data</button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}