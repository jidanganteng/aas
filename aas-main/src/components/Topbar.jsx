'use client';

import Link from 'next/link';

export default function Topbar() {
  return (
    <header className="w-full bg-white shadow px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-bold">Dashboard</h1>

      <div className="flex gap-3">
        <Link
          href="/"
          className="px-4 py-2 rounded-lg border hover:bg-gray-100"
        >
          Home
        </Link>

        <button className="px-4 py-2 bg-red-500 text-white rounded-lg">
          Logout
        </button>
      </div>
    </header>
  );
}