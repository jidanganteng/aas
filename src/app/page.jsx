'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, FileText, CheckCircle, BarChart3, Lock, Zap, Users, ArrowRight } from 'lucide-react';

export default function Home() {
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
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">PB</div>
            <span className="font-bold text-lg hidden sm:inline">Pengaduan</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition font-medium">Fitur</a>
            <a href="#howitworks" className="text-gray-600 hover:text-blue-600 transition font-medium">Cara Kerja</a>
            <a href="#faq" className="text-gray-600 hover:text-blue-600 transition font-medium">FAQ</a>
          </nav>

          {/* CTA Buttons - Always Visible */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/auth/login" className="px-3 sm:px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition font-semibold text-sm sm:text-base">Masuk</Link>
            <Link href="/auth/register" className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm sm:text-base shadow-md">Daftar</Link>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden ml-4">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-3">
            <a href="#features" className="block text-gray-600 hover:text-blue-600 font-medium">Fitur</a>
            <a href="#howitworks" className="block text-gray-600 hover:text-blue-600 font-medium">Cara Kerja</a>
            <a href="#faq" className="block text-gray-600 hover:text-blue-600 font-medium">FAQ</a>
          </div>
        )}
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-20 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block mb-4 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">🎯 Platform Pengaduan Terpercaya</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Lapor dengan Mudah, Pantau Hasilnya
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-xl">
                Platform pengaduan publik yang transparan dan terpercaya. Kirim laporan Anda, pantau progres, dan lihat tindakan nyata dari pihak berwenang.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                  Mulai Lapor <ArrowRight size={20} />
                </Link>
                <a href="#howitworks" className="inline-flex items-center justify-center gap-2 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition font-semibold">
                  Lihat Cara Kerja
                </a>
              </div>
              <div className="mt-10 flex flex-col sm:flex-row gap-6">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-blue-600">10K+</div>
                  <div>
                    <p className="font-semibold">Laporan Terkirim</p>
                    <p className="text-sm text-gray-500">Dari berbagai daerah</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-green-600">95%</div>
                  <div>
                    <p className="font-semibold">Tingkat Respons</p>
                    <p className="text-sm text-gray-500">Dalam 48 jam</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center">
              <div className="w-full aspect-square bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center">
                <div className="text-center p-8">
                  <FileText className="w-24 h-24 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Tangkapan layar aplikasi</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="howitworks" className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Cara Kerja Sederhana</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Tiga langkah mudah untuk melaporkan masalah dan melihat hasilnya</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: FileText, title: 'Buat Laporan', desc: 'Isi detail laporan, unggah foto/video, dan pilih kategori dengan mudah.' },
                { icon: CheckCircle, title: 'Validasi & Proses', desc: 'Tim terkait menerima dan memvalidasi laporan Anda untuk tindakan lanjut.' },
                { icon: BarChart3, title: 'Pantau & Lihat Hasil', desc: 'Dapatkan update real-time dan lihat perkembangan tindakan yang diambil.' }
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition">
                  <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <item.icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                  {i < 2 && <div className="mt-4 hidden md:block text-2xl text-gray-300">→</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Fitur Lengkap</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Semua yang Anda butuhkan untuk melaporkan dan memantau pengaduan</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: FileText, title: 'Laporan Multimedia', desc: 'Sertakan foto, video, dan dokumen untuk memberikan bukti yang lengkap.' },
              { icon: CheckCircle, title: 'Pelacakan Real-time', desc: 'Pantau status laporan Anda setiap saat melalui dashboard personal.' },
              { icon: Lock, title: 'Keamanan Data', desc: 'Data Anda dilindungi dengan enkripsi tingkat enterprise dan privasi terjamin.' },
              { icon: Users, title: 'Komunitas Transparan', desc: 'Lihat laporan dari pengguna lain dan bangun kesadaran bersama.' },
              { icon: Zap, title: 'Notifikasi Instan', desc: 'Dapatkan notifikasi segera saat ada update atau respon dari pihak terkait.' },
              { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Lihat statistik laporan dan dampak perubahan yang telah dicapai.' }
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="bg-gray-50 py-20">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Pertanyaan Umum</h2>
            <div className="space-y-4">
              {[
                { q: 'Apakah layanan ini benar-benar gratis?', a: 'Ya, 100% gratis. Tidak ada biaya tersembunyi atau langganan bulanan.' },
                { q: 'Berapa lama waktu respon dari pihak berwenang?', a: 'Rata-rata 24-48 jam. Anda akan mendapat notifikasi untuk setiap update.' },
                { q: 'Apakah data saya aman?', a: 'Ya, semua data dienkripsi dan dilindungi sesuai standar keamanan internasional.' },
                { q: 'Bisakah saya melaporkan secara anonim?', a: 'Ya, Anda bisa melaporkan tanpa mengungkapkan identitas jika diinginkan.' }
              ].map((item, i) => (
                <details key={i} className="bg-white rounded-lg p-4 shadow-sm">
                  <summary className="font-bold cursor-pointer flex items-center justify-between">
                    {item.q}
                    <span>+</span>
                  </summary>
                  <p className="mt-3 text-gray-600">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Siap Membuat Perbedaan?</h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Bergabunglah dengan ribuan pengguna yang telah membantu mengubah sistem menjadi lebih baik dan responsif.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition font-bold">
                Daftar Gratis <ArrowRight size={20} />
              </Link>
              <a href="mailto:support@pengaduan.com" className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white/10 transition font-bold">
                Hubungi Support
              </a>
            </div>
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
              <p className="text-gray-400">Platform pengaduan publik yang transparan dan terpercaya.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Produk</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition">Fitur</a></li>
                <li><a href="#howitworks" className="hover:text-white transition">Cara Kerja</a></li>
                <li><a href="#" className="hover:text-white transition">Harga</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Tentang</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Kontak</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Privasi</a></li>
                <li><a href="#" className="hover:text-white transition">Syarat & Ketentuan</a></li>
                <li><a href="#" className="hover:text-white transition">Lisensi</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400">&copy; {new Date().getFullYear()} Pengaduan. Semua hak dilindungi.</p>
            <div className="flex gap-6 mt-4 md:mt-0 text-gray-400">
              <a href="#" className="hover:text-white transition">Twitter</a>
              <a href="#" className="hover:text-white transition">Facebook</a>
              <a href="#" className="hover:text-white transition">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}