// src/lib/api.js

// Ambil base URL dari environment variable, fallback ke localhost jika tidak ada
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

console.log('🔥 API_BASE:', API_BASE);

/**
 * Fungsi untuk melakukan fetch ke API backend
 * @param {string} endpoint - Endpoint API (contoh: '/auth/login')
 * @param {object} options - Opsi fetch seperti method, body, dll.
 * @returns {Promise<any>} - Response JSON dari server
 */
export async function apiFetch(endpoint, options = {}) {
  // Ambil token dari localStorage (hanya di client-side)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // Jika body adalah FormData, hapus Content-Type agar browser mengatur boundary sendiri
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const url = `${API_BASE}${endpoint}`;
  console.log('📡 Fetching:', url);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    // Cek apakah response berupa JSON
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await res.json();

      // Jika response status tidak OK (bukan 2xx)
      if (!res.ok) {
        // Jika 401 Unauthorized, hapus token dan arahkan ke login
        if (res.status === 401) {
          localStorage.removeItem('token');
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
            window.location.href = '/auth/login';
          }
          throw new Error('Sesi habis, silakan login kembali');
        }
        // Lempar error dengan pesan dari server
        throw new Error(data.message || `HTTP ${res.status}`);
      }
      return data;
    } else {
      // Response bukan JSON (biasanya error HTML dari server)
      const text = await res.text();
      console.error('Response bukan JSON:', text.substring(0, 200));
      throw new Error(`Server mengembalikan HTML (bukan JSON). Status: ${res.status}`);
    }
  } catch (error) {
    console.error('❌ apiFetch error:', error);
    throw error;
  }
}