import { notFound } from 'next/navigation';
import Link from 'next/link'; // perbaikan typo: tidak ada spasi
import AuthGuard from '@/components/AuthGuard';
import CommentSection from '@/components/CommentSection';

// Fungsi ambil data laporan dari API
async function getReport(id) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/reports/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Gagal fetch: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error getReport:', error);
    return null;
  }
}

// Halaman detail (Server Component)
export default async function ReportDetailPage({ params }) {
  const { id } = params;
  const report = await getReport(id);

  if (!report) {
    notFound();
  }

  // Badge status
  const statusConfig = {
    selesai: { bg: 'bg-green-100', text: 'text-green-800', label: 'Selesai' },
    resolved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Selesai' },
    proses: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Diproses' },
    processing: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Diproses' },
  };
  const defaultStatus = { bg: 'bg-red-100', text: 'text-red-800', label: 'Menunggu' };
  const status = statusConfig[report.status?.toLowerCase()] || defaultStatus;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Tombol kembali */}
          <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
            ← Kembali ke Dashboard
          </Link>

          {/* Kartu laporan */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border">
            <div className="border-b px-6 py-5 bg-gray-50">
              <div className="flex justify-between items-start flex-wrap gap-3">
                <h1 className="text-2xl font-bold text-gray-800">{report.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${status.bg} ${status.text}`}>
                  {status.label}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                📅 {new Date(report.createdAt).toLocaleDateString('id-ID')}
              </p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Deskripsi</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{report.description}</p>
              </div>

              {report.location && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-700 mb-2">Lokasi</h2>
                  <p className="text-gray-600">📍 {report.location}</p>
                </div>
              )}

              {report.imageUrl && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-700 mb-2">Lampiran</h2>
                  <img src={report.imageUrl} alt="Lampiran" className="max-w-full h-auto rounded-lg border" />
                </div>
              )}
            </div>
          </div>

          {/* Komentar */}
          <div className="mt-8">
            <CommentSection reportId={report.id} />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}