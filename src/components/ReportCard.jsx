import Link from 'next/link';

export default function ReportCard({ report }) {
  const statusColor = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-lg">{report.title}</h3>
        <span
          className={`px-2 py-1 text-xs rounded-full ${statusColor[report.status]}`}
        >
          {report.status}
        </span>
      </div>
      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
        {report.description}
      </p>
      {report.image && (
        <img
          src={`http://localhost:5000/${report.image}`}
          alt="laporan"
          className="mt-2 w-full h-32 object-cover rounded"
        />
      )}
      <div className="mt-3 text-xs text-gray-500">
        {new Date(report.createdAt).toLocaleDateString('id-ID')}
      </div>
      <Link
        href={`/reports/${report.id}`}
        className="text-blue-600 text-sm mt-2 inline-block hover:underline"
      >
        Lihat Detail →
      </Link>
    </div>
  );
}