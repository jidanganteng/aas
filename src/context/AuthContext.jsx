'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ambil user dari token yang tersimpan
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    fetch('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          // Jika response 401 atau error lain, hapus token
          if (res.status === 401) {
            localStorage.removeItem('token');
          }
          throw new Error('Token invalid');
        }
        return res.json();
      })
      .then((data) => {
        if (data.user || data) {
          setUser(data.user || data);
        } else {
          localStorage.removeItem('token');
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    email = email.trim();
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Login gagal');
    }

    localStorage.setItem('token', data.token);

    // Ambil data user dari /auth/me
    const meRes = await fetch('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${data.token}` },
    });
    if (!meRes.ok) {
      // Jika /me gagal, tetap set user dari data login
      setUser(data.user);
    } else {
      const meData = await meRes.json();
      setUser(meData.user || meData);
    }
  };

  const register = async (name, email, password) => {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registrasi gagal');
    }

    // Jika register mengembalikan token, simpan
    if (data.token) {
      localStorage.setItem('token', data.token);
      setUser(data.user);
    } else {
      // Jika tidak ada token, arahkan ke login
      throw new Error('Silakan login setelah registrasi');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // Optional: arahkan ke halaman login
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}