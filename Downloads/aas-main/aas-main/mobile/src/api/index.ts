import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
// ⚠️  GANTI IP INI dengan IP komputer kamu (jalankan ipconfig)
//     Pastikan HP dan laptop terhubung ke WiFi yang SAMA
// ============================================================
export const BASE_URL = 'http://192.168.1.12:5000';
export const API_URL = `${BASE_URL}/api`;

// Axios instance dengan base URL terpusat
export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: otomatis sisipkan Bearer token di setiap request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});