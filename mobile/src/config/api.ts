import { Platform } from 'react-native';

// Ganti IP ini sesuai laptop kamu (lihat ipconfig)
const LOCAL_IP = '192.168.0.114';

export const API_URL =
  Platform.OS === 'web'
    ? 'http://localhost:5000'
    : `http://192.168.0.114:5000`;