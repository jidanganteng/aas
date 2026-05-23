'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  // Jika belum login
  if (!user) {
    return (
      <nav className="bg-white shadow px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-700">
          PengaduanApp
        </Link>
        <Link href="/auth/login" className="text-blue-600 hover:underline">
          Login
        </Link>
      </nav>
    );
  }

  const isUser = user.role === 'USER';
  const isAdmin = user.role === 'ADMIN';
  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const canManageUsers = isAdmin || isSuperAdmin;
  const canManageComments = isAdmin || isSuperAdmin;

  return (
    <nav className="bg-white shadow px-6 py-3">
      <div className="flex flex-wrap justify-between items-center gap-4">
        {/* Left menu */}
        <div className="flex items-center gap-6 flex-wrap">
          <Link href="/" className="text-xl font-bold text-blue-700">
            PengaduanApp
          </Link>

          <Link href="/dashboard" className="hover:text-blue-600">
            Dashboard
          </Link>

          {isUser && (
            <>
              <Link href="/dashboard/user/reports/new" className="hover:text-blue-600">
                Buat Laporan
              </Link>
              <Link href="/user/comments" className="hover:text-blue-600">
                Komentar Saya
              </Link>
            </>
          )}

          {canManageUsers && (
            <Link href="/dashboard/admin/users" className="hover:text-blue-600">
              Kelola User
            </Link>
          )}

          {canManageComments && (
            <Link href="/admin/comments" className="hover:text-blue-600">
              Kelola Komentar
            </Link>
          )}
        </div>

        {/* Right profile & logout */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">
            {user.name} <span className="text-xs text-gray-500">({user.role})</span>
          </span>
          <button
            onClick={handleLogout}
            className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}