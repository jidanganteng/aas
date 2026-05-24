'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

// ── SVG Icons (no lucide dependency needed) ──────────────────────────────────
const IconDashboard  = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
const IconReports    = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const IconAllReports = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
const IconUsers      = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconSettings   = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const IconLogout     = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconBell       = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IconMenu       = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IconX          = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Tentukan href untuk Pengaturan berdasarkan role
  const getSettingsHref = () => {
    if (!user) return '/dashboard';
    if (user.role === 'USER') return '/dashboard/users/settings';
    return '/dashboard/admin/settings'; // untuk ADMIN dan SUPER_ADMIN
  };

  // Tentukan href untuk Profile berdasarkan role
  const getProfileHref = () => {
    if (!user) return '/dashboard';
    if (user.role === 'USER') return '/dashboard/users/profile';
    return '/dashboard/admin/profile';
  };

  const navItems = [
    { name: 'Dashboard',      href: '/dashboard',                  Icon: IconDashboard,  roles: ['USER', 'ADMIN', 'SUPER_ADMIN'] },
    { name: 'Laporan Saya',   href: '/dashboard/users/reports',    Icon: IconReports,    roles: ['USER'] },
    { name: 'Semua Laporan',  href: '/dashboard/admin/reports',    Icon: IconAllReports, roles: ['ADMIN', 'SUPER_ADMIN'] },
    { name: 'Kelola User',    href: '/dashboard/admin/users',      Icon: IconUsers,      roles: ['SUPER_ADMIN'] },
    { name: 'Pengaturan',     href: getSettingsHref(),             Icon: IconSettings,   roles: ['USER', 'ADMIN', 'SUPER_ADMIN'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(user?.role));

  const handleLogout = async () => {
    logout();
    router.push('/auth/login');
  };

  const roleColor = user?.role === 'SUPER_ADMIN' ? '#C8391A' : user?.role === 'ADMIN' ? '#1A1A1A' : '#4A4A4A';

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

        /* ── Sidebar nav link ── */
        .dl-nav-link {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 14px;
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600;
          letter-spacing: .1em; text-transform: uppercase;
          color: rgba(245,240,232,.5); text-decoration: none;
          border-left: 2px solid transparent;
          transition: color .2s, border-color .2s, background .2s;
        }
        .dl-nav-link:hover {
          color: #F5F0E8;
          border-left-color: rgba(200,57,26,.4);
          background: rgba(245,240,232,.04);
        }
        .dl-nav-link.active {
          color: #F5F0E8;
          border-left-color: #C8391A;
          background: rgba(200,57,26,.08);
        }

        /* ── Top bar icon btn ── */
        .dl-top-btn {
          width: 36px; height: 36px;
          background: transparent; border: 1.5px solid rgba(26,26,26,.15);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background .15s, border-color .15s;
          position: relative;
        }
        .dl-top-btn:hover { background: #1A1A1A; border-color: #1A1A1A; }
        .dl-top-btn:hover svg { stroke: #F5F0E8; }

        /* ── Logout btn ── */
        .dl-logout {
          display: flex; align-items: center; gap: 12px; width: 100%;
          padding: 10px 14px; background: none; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600;
          letter-spacing: .1em; text-transform: uppercase;
          color: rgba(245,240,232,.4); border-left: 2px solid transparent;
          transition: color .2s, border-color .2s, background .2s;
        }
        .dl-logout:hover {
          color: #C8391A; border-left-color: #C8391A;
          background: rgba(200,57,26,.08);
        }

        /* ── Noise overlay ── */
        .dl-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          background-size: 200px; position: fixed; inset: 0; pointer-events: none; z-index: 999; opacity: .4;
        }

        /* ── Mobile overlay ── */
        .dl-overlay {
          position: fixed; inset: 0; background: rgba(26,26,26,.7); z-index: 40;
        }

        @media (min-width: 1024px) {
          .dl-sidebar { transform: translateX(0) !important; }
          .dl-main { margin-left: 240px; }
        }
      `}</style>

      <div className="dl-noise" aria-hidden />

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div className="dl-overlay lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ══════════════════════════════════
          SIDEBAR
      ══════════════════════════════════ */}
      <aside
        className="dl-sidebar"
        style={{
          position: 'fixed', top: 0, left: 0, zIndex: 50,
          width: 240, height: '100%',
          background: '#1A1A1A',
          borderRight: '2px solid rgba(200,57,26,.2)',
          display: 'flex', flexDirection: 'column',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform .3s ease',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(245,240,232,.08)' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, background: '#C8391A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: 17, color: '#F5F0E8' }}>P</span>
            </div>
            <div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 14, color: '#F5F0E8', letterSpacing: '-.01em' }}>
                Pengaduan <span style={{ color: '#C8391A' }}>Publik</span>
              </div>
              <div style={{ fontFamily: 'DM Sans', fontSize: 9, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(245,240,232,.3)', marginTop: 2 }}>
                Panel Kontrol
              </div>
            </div>
          </Link>
        </div>

        {/* Section label */}
        <div style={{ padding: '20px 20px 8px' }}>
          <span style={{ fontFamily: 'DM Sans', fontSize: 9, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(245,240,232,.25)' }}>Navigasi</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`dl-nav-link${isActive ? ' active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.Icon />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '16px 8px', borderTop: '1px solid rgba(245,240,232,.08)' }}>
          <Link
            href={getProfileHref()}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', textDecoration: 'none', marginBottom: 4, transition: 'background .15s', borderLeft: '2px solid transparent' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,240,232,.05)'; e.currentTarget.style.borderLeftColor = 'rgba(245,240,232,.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeftColor = 'transparent'; }}
          >
            {/* Avatar */}
            <div style={{ width: 34, height: 34, background: '#C8391A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: 15, color: '#F5F0E8' }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, color: '#F5F0E8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'User'}
              </p>
              <p style={{ fontFamily: 'DM Sans', fontSize: 10, color: 'rgba(245,240,232,.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </p>
              <span style={{ fontFamily: 'DM Sans', fontSize: 8, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: roleColor, marginTop: 2, display: 'inline-block' }}>
                {user?.role}
              </span>
            </div>
          </Link>

          <button className="dl-logout" onClick={handleLogout}>
            <IconLogout />
            Keluar
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════
          MAIN
      ══════════════════════════════════ */}
      <div className="dl-main" style={{ transition: 'margin-left .3s ease' }}>

        {/* Top bar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: 'rgba(245,240,232,.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '2px solid rgba(26,26,26,.1)',
          padding: '0 24px',
          height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Left: hamburger + breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              className="dl-top-btn lg:hidden"
              onClick={() => setSidebarOpen(s => !s)}
              style={{ border: '1.5px solid rgba(26,26,26,.2)' }}
            >
              {sidebarOpen ? <IconX /> : <IconMenu />}
            </button>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {pathname?.split('/').filter(Boolean).map((seg, i, arr) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {i > 0 && <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(26,26,26,.3)' }}>/</span>}
                  <span style={{
                    fontFamily: 'DM Sans', fontSize: 11, fontWeight: 600,
                    letterSpacing: '.12em', textTransform: 'uppercase',
                    color: i === arr.length - 1 ? '#C8391A' : 'rgba(26,26,26,.4)',
                  }}>
                    {seg}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Right: bell + user */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="dl-top-btn" title="Notifikasi" style={{ position: 'relative' }}>
              <IconBell />
              {/* dot */}
              <span style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, background: '#C8391A', borderRadius: '50%', border: '1.5px solid #F5F0E8' }} />
            </button>

            {/* User chip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px 4px 6px', border: '1.5px solid rgba(26,26,26,.12)', background: '#fff' }}>
              <div style={{ width: 26, height: 26, background: '#C8391A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: 12, color: '#F5F0E8' }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="hidden sm:block">
                <p style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 12, color: '#1A1A1A', lineHeight: 1.2 }}>{user?.name}</p>
                <p style={{ fontFamily: 'DM Sans', fontSize: 9, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: roleColor, lineHeight: 1.2 }}>{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ minHeight: 'calc(100vh - 56px)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}