'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  UserCircle,
  Shield,
  ClipboardList
} from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['USER', 'ADMIN', 'SUPER_ADMIN'] },
    { name: 'Laporan Saya', href: '/dashboard/users/reports', icon: FileText, roles: ['USER'] },
    { name: 'Semua Laporan', href: '/dashboard/admin/reports', icon: ClipboardList, roles: ['ADMIN', 'SUPER_ADMIN'] },
    { name: 'Kelola User', href: '/dashboard/admin/users', icon: Users, roles: ['SUPER_ADMIN'] },
    { name: 'Pengaturan', href: '/dashboard/settings', icon: Settings, roles: ['USER', 'ADMIN', 'SUPER_ADMIN'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(user?.role));

  const handleLogout = async () => {
    logout();
    router.push('/auth/login');
  };

  // Tentukan halaman profile berdasarkan role
  const getProfileHref = () => {
    if (!user) return '/dashboard';
    if (user.role === 'USER') return '/dashboard/users/profile';
    // Untuk ADMIN dan SUPER_ADMIN, bisa ke /dashboard/admin/profile atau /dashboard/profile
    return '/dashboard/admin/profile';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white/90 backdrop-blur-md shadow-xl transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-gray-800">PengaduanKu</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {filteredNav.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            {/* Area user info sekarang menjadi link ke profil */}
            <Link
              href={getProfileHref()}
              className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <UserCircle className="w-10 h-10 text-gray-500" />
              <div className="overflow-hidden">
                <p className="font-semibold text-sm truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700">
                  {user?.role}
                </span>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100 relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}