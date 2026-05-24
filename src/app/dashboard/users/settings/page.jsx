// src/app/dashboard/user/settings/page.jsx
'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Info, FileText, Shield, Mail, Sun, Moon, Globe, Type, ExternalLink,
  CheckCircle, AlertCircle, X
} from 'lucide-react';

export default function UserSettingsPage() {
  // State untuk preferensi
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('id');
  const [fontSize, setFontSize] = useState('medium');
  
  // State modal untuk kebijakan & syarat
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Load preferensi dari localStorage saat pertama render
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedLanguage = localStorage.getItem('language') || 'id';
    const savedFontSize = localStorage.getItem('fontSize') || 'medium';
    
    setDarkMode(savedDarkMode);
    setLanguage(savedLanguage);
    setFontSize(savedFontSize);
    
    // Terapkan tema ke root HTML
    applyTheme(savedDarkMode, savedFontSize);
  }, []);

  const applyTheme = (isDark, size) => {
    const root = document.documentElement;
    if (isDark) {
      root.style.setProperty('--bg-color', '#1a1a1a');
      root.style.setProperty('--text-color', '#f5f0e8');
    } else {
      root.style.setProperty('--bg-color', '#f5f0e8');
      root.style.setProperty('--text-color', '#1a1a1a');
    }
    // Ukuran font
    if (size === 'small') root.style.fontSize = '12px';
    else if (size === 'medium') root.style.fontSize = '14px';
    else if (size === 'large') root.style.fontSize = '16px';
  };

  const handleDarkModeToggle = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    applyTheme(newMode, fontSize);
    showMessage(`Mode ${newMode ? 'gelap' : 'terang'} diaktifkan`, 'success');
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    showMessage(`Bahasa diubah menjadi ${lang === 'id' ? 'Indonesia' : 'English'}`, 'success');
    // Di sini Anda bisa memanggil fungsi untuk mengganti konten i18n
  };

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
    applyTheme(darkMode, size);
    showMessage(`Ukuran font diubah menjadi ${size === 'small' ? 'Kecil' : size === 'medium' ? 'Sedang' : 'Besar'}`, 'success');
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  // Data statis
  const appVersion = '1.2.0';
  const appName = 'Pengaduan Publik';
  const devEmail = 'dev@pengaduan.com';
  const devWebsite = 'https://pengaduan.com';

  return (
    <AuthGuard roles={['USER']}>
      <DashboardLayout>
        <style jsx global>{`
          :root {
            --bg-color: #f5f0e8;
            --text-color: #1a1a1a;
          }
          body {
            background-color: var(--bg-color);
            color: var(--text-color);
          }
          .settings-card {
            background: white;
            border: 1px solid rgba(0,0,0,0.1);
            transition: background 0.2s, border 0.2s;
          }
          .dark .settings-card {
            background: #2a2a2a;
            border-color: rgba(255,255,255,0.1);
          }
        `}</style>
        
        <div className={`max-w-3xl mx-auto space-y-6 ${darkMode ? 'dark' : ''}`}>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Pengaturan Aplikasi</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Sesuaikan tampilan dan informasi aplikasi</p>
          </div>

          {/* Notifikasi */}
          {message.text && (
            <div className={`p-3 rounded-lg flex items-center gap-2 ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
              {message.text}
            </div>
          )}

          {/* 1. Tema & Tampilan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Sun size={18} /> Tema & Tampilan
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Mode Gelap</span>
                <button
                  onClick={handleDarkModeToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${darkMode ? 'bg-purple-600' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Ukuran Font</label>
                <select
                  value={fontSize}
                  onChange={(e) => handleFontSizeChange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="small">Kecil</option>
                  <option value="medium">Sedang</option>
                  <option value="large">Besar</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Bahasa</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLanguageChange('id')}
                    className={`px-3 py-1 rounded-lg ${language === 'id' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    Indonesia
                  </button>
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`px-3 py-1 rounded-lg ${language === 'en' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    English
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Tentang Aplikasi */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Info size={18} /> Tentang Aplikasi
            </h2>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p><strong>Nama:</strong> {appName}</p>
              <p><strong>Versi:</strong> {appVersion}</p>
              <p><strong>Deskripsi:</strong> Platform pengaduan publik yang transparan dan responsif.</p>
            </div>
          </div>

          {/* 3. Kebijakan Privasi */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Shield size={18} /> Kebijakan Privasi
            </h2>
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="text-purple-600 hover:text-purple-800 flex items-center gap-1"
            >
              Baca selengkapnya <ExternalLink size={14} />
            </button>
          </div>

          {/* 4. Syarat & Ketentuan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <FileText size={18} /> Syarat & Ketentuan
            </h2>
            <button
              onClick={() => setShowTermsModal(true)}
              className="text-purple-600 hover:text-purple-800 flex items-center gap-1"
            >
              Baca selengkapnya <ExternalLink size={14} />
            </button>
          </div>

          {/* 5. Kontak Developer */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Mail size={18} /> Kontak Developer
            </h2>
            <div className="space-y-1 text-gray-700 dark:text-gray-300">
              <p>Email: <a href={`mailto:${devEmail}`} className="text-purple-600">{devEmail}</a></p>
              <p>Website: <a href={devWebsite} target="_blank" rel="noopener noreferrer" className="text-purple-600">{devWebsite}</a></p>
            </div>
          </div>
        </div>

        {/* Modal Kebijakan Privasi */}
        {showPrivacyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPrivacyModal(false)}>
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-bold">Kebijakan Privasi</h3>
                <button onClick={() => setShowPrivacyModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 text-gray-700 space-y-3">
                <p>Kami menghormati privasi Anda. Data pribadi Anda hanya digunakan untuk memproses laporan dan tidak akan dibagikan kepada pihak ketiga tanpa izin.</p>
                <p>Kami menggunakan enkripsi untuk melindungi data Anda. Anda dapat meminta penghapusan data kapan saja.</p>
                <p>Cookie digunakan hanya untuk sesi login. Tidak ada pelacak pihak ketiga.</p>
                <p>Untuk pertanyaan lebih lanjut, hubungi support@pengaduan.com.</p>
              </div>
            </div>
          </div>
        )}

        {/* Modal Syarat & Ketentuan */}
        {showTermsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTermsModal(false)}>
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-bold">Syarat & Ketentuan</h3>
                <button onClick={() => setShowTermsModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 text-gray-700 space-y-3">
                <p>Dengan menggunakan aplikasi ini, Anda setuju untuk memberikan informasi yang benar dan tidak menyalahgunakan fitur pelaporan.</p>
                <p>Laporan yang mengandung SARA, hoaks, atau tidak sesuai fakta dapat dihapus dan akun Anda dapat ditangguhkan.</p>
                <p>Kami berhak mengubah ketentuan sewaktu-waktu dan akan memberitahukan melalui email.</p>
                <p>Laporan anonim tetap diproses, namun prioritas diberikan kepada pelapor terverifikasi.</p>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </AuthGuard>
  );
}