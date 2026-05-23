'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, FileText, CheckCircle, MessageSquare, Shield, TrendingUp, Zap, Award, MapPin, Clock, Users, ArrowRight, ChevronRight } from 'lucide-react';

export default function Homepage() {
  const { user, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">PB</div>
            <span className="font-bold text-lg hidden sm:inline">Pengaduan</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#statistik" className="text-gray-600 hover:text-blue-600 transition">Statistik</a>
            <a href="#manfaat" className="text-gray-600 hover:text-blue-600 transition">Manfaat</a>
            <a href="#laporan" className="text-gray-600 hover:text-blue-600 transition">Laporan</a>
            <a href="#contact" className="text-gray-600 hover:text-blue-600 transition">Kontak</a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {!loading && !user ? (
              <>
                <Link href="/auth/login" className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">Masuk</Link>
                <Link href="/auth/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Daftar</Link>
              </>
            ) : !loading && user ? (
              <Link href="/dashboard" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Dashboard</Link>
            ) : (
              <div className="w-24 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4">
            <a href="#statistik" className="block text-gray-600 hover:text-blue-600">Statistik</a>
            <a href="#manfaat" className="block text-gray-600 hover:text-blue-600">Manfaat</a>
            <a href="#laporan" className="block text-gray-600 hover:text-blue-600">Laporan</a>
            <a href="#contact" className="block text-gray-600 hover:text-blue-600">Kontak</a>
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <Link href="/auth/login" className="block px-4 py-2 text-blue-600 text-center border border-blue-600 rounded-lg hover:bg-blue-50">Masuk</Link>
              <Link href="/auth/register" className="block px-4 py-2 bg-blue-600 text-white rounded-lg text-center hover:bg-blue-700">Daftar</Link>
            </div>
          </div>
        )}
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-20 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block mb-4 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">🎯 Suara Rakyat, Aksi Nyata</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Platform Pengaduan Publik Indonesia
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-xl">
                Laporkan masalah Anda, pantau progresnya, dan saksikan perubahan nyata. Platform yang menghubungkan rakyat dengan pihak berwenang secara transparan.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                  Mulai Lapor Sekarang <ArrowRight size={20} />
                </Link>
                <Link href="/" className="inline-flex items-center justify-center gap-2 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition font-semibold">
                  Jelajahi Platform
                </Link>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center">
              <div className="w-full h-96 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 rounded-2xl flex items-center justify-center border border-blue-200">
                <div className="text-center">
                  <FileText className="w-32 h-32 text-blue-400 mx-auto mb-4 opacity-30" />
                  <p className="text-gray-500 font-medium">Dashboard Pengaduan</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistik Section */}
        <section id="statistik" className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Dampak Nyata Dari Komunitas</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { value: '10K+', label: 'Laporan Terkirim', icon: FileText },
                { value: '95%', label: 'Tingkat Respons', icon: CheckCircle },
                { value: '500+', label: 'Masalah Terselesaikan', icon: TrendingUp },
                { value: '50K+', label: 'Pengguna Aktif', icon: Users }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <stat.icon className="w-12 h-12 mx-auto mb-3 opacity-80" />
                  <div className="text-4xl font-bold">{stat.value}</div>
                  <p className="text-white/80 mt-2">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Manfaat Section */}
        <section id="manfaat" className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Mengapa Memilih Pengaduan?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Solusi lengkap untuk menyampaikan aspirasi dan melihat dampak nyata</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Aman & Terpercaya', desc: 'Data Anda dilindungi dengan enkripsi enterprise dan privasi terjamin.' },
              { icon: Zap, title: 'Proses Cepat', desc: 'Laporan diproses dalam 24 jam dengan notifikasi real-time.' },
              { icon: MessageSquare, title: 'Transparansi Penuh', desc: 'Pantau setiap tahap proses dan komunikasi langsung dengan petugas.' },
              { icon: MapPin, title: 'Jangkauan Nasional', desc: 'Menghubungkan Anda dengan instansi terkait di seluruh Indonesia.' },
              { icon: Award, title: 'Verifikasi Profesional', desc: 'Tim ahli memvalidasi setiap laporan sebelum ditindaklanjuti.' },
              { icon: TrendingUp, title: 'Dampak Terukur', desc: 'Lihat statistik dan hasil tindakan dari setiap laporan Anda.' }
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Jenis Laporan */}
        <section id="laporan" className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Jenis Pengaduan yang Kami Terima</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Pelayanan Publik', icon: '🏛️', desc: 'Keluhan terkait layanan dari instansi pemerintah' },
                { title: 'Infrastruktur', icon: '🏗️', desc: 'Laporan kerusakan jalan, jembatan, dan fasilitas umum' },
                { title: 'Lingkungan', icon: '🌍', desc: 'Pencemaran, banjir, dan masalah lingkungan lainnya' },
                { title: 'Pendidikan', icon: '📚', desc: 'Isu kualitas pendidikan dan fasilitas sekolah' },
                { title: 'Kesehatan', icon: '⚕️', desc: 'Akses dan kualitas layanan kesehatan' },
                { title: 'Keamanan', icon: '🚔', desc: 'Laporan terkait keamanan dan ketertiban umum' }
              ].map((cat, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
                  <div className="text-3xl mb-3">{cat.icon}</div>
                  <h3 className="font-bold text-lg mb-2">{cat.title}</h3>
                  <p className="text-gray-600 text-sm">{cat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Proses Section */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Langkah Mudah Melaporkan</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { num: '1', title: 'Buat Akun', desc: 'Daftar gratis dengan email Anda' },
              { num: '2', title: 'Isi Laporan', desc: 'Deskripsikan masalah dengan detail' },
              { num: '3', title: 'Unggah Bukti', desc: 'Tambahkan foto atau video' },
              { num: '4', title: 'Pantau', desc: 'Terima update secara real-time' }
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-4">
                  {step.num}
                </div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute top-6 left-16 w-full h-0.5 bg-blue-200 -z-10">
                    <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-200 rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Kisah Dari Pengguna</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: 'Budi Santoso', city: 'Jakarta', quote: 'Laporan saya tentang jalan rusak ditindaklanjuti dalam 2 minggu. Transparan dan responsif!' },
                { name: 'Siti Nurhaliza', city: 'Bandung', quote: 'Platform ini memudahkan saya melaporkan masalah lingkungan di lingkungan saya.' },
                { name: 'Ahmad Wijaya', city: 'Surabaya', quote: 'Akhirnya ada platform yang benar-benar mengdengarkan suara rakyat dengan serius.' }
              ].map((testi, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <span key={j} className="text-yellow-400">⭐</span>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testi.quote}"</p>
                  <p className="font-semibold text-sm">{testi.name}</p>
                  <p className="text-gray-500 text-xs">{testi.city}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Siap Membuat Perubahan?</h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Bergabunglah dengan ribuan pengguna yang telah berhasil mengubah sistem menjadi lebih responsif dan transparan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition font-bold">
                Daftar Gratis Sekarang <ArrowRight size={20} />
              </Link>
              <Link href="/" className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white/10 transition font-bold">
                Pelajari Lebih Lanjut <ChevronRight size={20} />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="contact" className="max-w-4xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Pertanyaan Umum</h2>
          <div className="space-y-4">
            {[
              { q: 'Berapa biaya untuk menggunakan platform ini?', a: 'Gratis 100%. Tidak ada biaya tersembunyi atau langganan.' },
              { q: 'Berapa lama proses respons dari pihak terkait?', a: 'Rata-rata 24-48 jam. Anda akan mendapat notifikasi untuk setiap update.' },
              { q: 'Bisakah saya melaporkan secara anonim?', a: 'Ya, Anda bisa memilih untuk tidak menyebutkan identitas saat laporan.' },
              { q: 'Apa yang dilakukan dengan data saya?', a: 'Data Anda aman, dienkripsi, dan hanya digunakan untuk memproses laporan Anda.' },
              { q: 'Bagaimana cara menghubungi support?', a: 'Hubungi kami melalui email support@pengaduan.com atau live chat di aplikasi.' }
            ].map((item, i) => (
              <details key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <summary className="font-bold cursor-pointer flex items-center justify-between">
                  {item.q}
                  <span className="text-gray-400">+</span>
                </summary>
                <p className="mt-3 text-gray-600">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold">PB</div>
                <span className="font-bold">Pengaduan</span>
              </div>
              <p className="text-gray-400 text-sm">Platform pengaduan publik yang transparan, terpercaya, dan responsif untuk semua rakyat Indonesia.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm">Layanan</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Cara Kerja</a></li>
                <li><a href="#" className="hover:text-white transition">Fitur</a></li>
                <li><a href="#" className="hover:text-white transition">Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm">Perusahaan</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Tentang Kami</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Karir</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Privasi</a></li>
                <li><a href="#" className="hover:text-white transition">Syarat & Ketentuan</a></li>
                <li><a href="#" className="hover:text-white transition">Hubungi Kami</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} Pengaduan Indonesia. Semua hak dilindungi.</p>
            <div className="flex gap-6 mt-4 md:mt-0 text-gray-400 text-sm">
              <a href="#" className="hover:text-white transition">Twitter</a>
              <a href="#" className="hover:text-white transition">Facebook</a>
              <a href="#" className="hover:text-white transition">Instagram</a>
              <a href="#" className="hover:text-white transition">TikTok</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
