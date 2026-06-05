import AuthGuard from '@/components/AuthGuard';

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <main className="w-full min-h-screen px-6 py-6 bg-gray-100 dark:bg-gray-900">
        {children}
      </main>
    </AuthGuard>
  );
}