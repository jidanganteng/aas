'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { apiFetch } from '@/lib/api';
import { User, Mail, Phone, MapPin, Calendar, Save, Loader2, Briefcase, Building } from 'lucide-react';

export default function AdminProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    address: '',
    position: '',
    department: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiFetch('/profile/admin/profile')
      .then(data => {
        setProfile(data);
        setForm({ 
          name: data.name || '', 
          email: data.email || '', 
          phone: data.phone || '', 
          address: data.address || '',
          position: data.position || '',
          department: data.department || ''
        });
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/profile/admin/profile', { method: 'PUT', body: JSON.stringify(form) });
      setMessage('Profil berhasil diperbarui');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Gagal update profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <AuthGuard roles={['ADMIN', 'SUPER_ADMIN']}>
      <DashboardLayout><div className="text-center py-10">Memuat profil...</div></DashboardLayout>
    </AuthGuard>
  );

  return (
    <AuthGuard roles={['ADMIN', 'SUPER_ADMIN']}>
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <User size={32} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Profil Admin</h1>
                  <p className="text-purple-100">Kelola informasi akun administrator</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {message && <div className="bg-green-100 text-green-700 p-3 rounded-lg text-center">{message}</div>}
              <div>
                <label className="block font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    name="name" 
                    value={form.name} 
                    onChange={handleChange} 
                    className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-purple-500 overflow-visible" 
                    required 
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    name="email" 
                    type="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    className="w-full pl-10 pr-4 py-2 border rounded-xl bg-gray-100 overflow-x-auto" 
                    disabled 
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah</p>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Nomor Telepon</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    name="phone" 
                    value={form.phone} 
                    onChange={handleChange} 
                    placeholder="08123456789" 
                    className="w-full pl-10 pr-4 py-2 border rounded-xl overflow-visible" 
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Jabatan</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    name="position" 
                    value={form.position} 
                    onChange={handleChange} 
                    placeholder="Kepala Dinas, Admin Lapangan, dll." 
                    className="w-full pl-10 pr-4 py-2 border rounded-xl overflow-visible" 
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Unit Kerja / Departemen</label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    name="department" 
                    value={form.department} 
                    onChange={handleChange} 
                    placeholder="Dinas Pekerjaan Umum, Sekretariat, dll." 
                    className="w-full pl-10 pr-4 py-2 border rounded-xl overflow-visible" 
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Alamat</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                  <textarea 
                    name="address" 
                    value={form.address} 
                    onChange={handleChange} 
                    rows="3" 
                    placeholder="Jl. Contoh No. 123, Kota" 
                    className="w-full pl-10 pr-4 py-2 border rounded-xl resize-y overflow-visible whitespace-normal break-words"
                  ></textarea>
                </div>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Bergabung Sejak</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString('id-ID') : '-'} 
                    disabled 
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border rounded-xl overflow-x-auto" 
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={saving} 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Simpan Perubahan
              </button>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}