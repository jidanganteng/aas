import { Platform } from 'react-native';

// Ganti IP ini sesuai laptop kamu (lihat ipconfig)
const LOCAL_IP = '10.2.10.245';

export const API_URL =
  Platform.OS === 'web'
    ? 'http://localhost:5000'
    : `http://192.168.1.12:5000`;