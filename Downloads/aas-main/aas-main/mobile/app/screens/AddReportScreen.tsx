import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  ScrollView, Image, ActivityIndicator, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { BASE_URL } from '../../src/api/index';

const CATEGORY_ICONS: Record<string, string> = {
  infrastruktur: '🏗️',
  kebersihan:    '🧹',
  keamanan:      '🛡️',
  kesehatan:     '🏥',
  pendidikan:    '📚',
  lainnya:       '📋',
};

interface Category { id: number; name: string; }

export default function AddReportScreen() {
  const router = useRouter();
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId]   = useState<number | null>(null);
  const [categories, setCategories]   = useState<Category[]>([]);
  const [images, setImages]           = useState<string[]>([]);
  const [loading, setLoading]         = useState(false);
  const [loadingCat, setLoadingCat]   = useState(true);

  // ── Ambil kategori dari backend ──────────────────────────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch(`${BASE_URL}/api/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch {
        Alert.alert('Peringatan', 'Gagal memuat kategori dari server');
      } finally {
        setLoadingCat(false);
      }
    };
    fetchCategories();
  }, []);

  const pickImage = async () => {
    if (images.length >= 3) {
      Alert.alert('Batas Foto', 'Maksimal 3 foto per laporan');
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Diperlukan', 'Izinkan akses galeri');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.5,
    });
    if (!result.canceled && result.assets[0]) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim())       return Alert.alert('Perhatian', 'Judul wajib diisi');
    if (!description.trim()) return Alert.alert('Perhatian', 'Deskripsi wajib diisi');
    if (!categoryId)         return Alert.alert('Perhatian', 'Pilih kategori terlebih dahulu');

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Sesi habis, silakan login ulang');

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('categoryId', String(categoryId));

      images.forEach((uri, index) => {
        const filename = uri.split('/').pop() || `photo_${index}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        // @ts-ignore
        formData.append('images', { uri, name: filename, type });
      });

      const response = await fetch(`${BASE_URL}/api/reports`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        Alert.alert('Berhasil! ✅', 'Laporan berhasil dikirim', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        const err = await response.json().catch(() => ({}));
        Alert.alert('Gagal', err.message || `Server error (${response.status})`);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message === 'Network request failed'
        ? 'Tidak dapat terhubung ke server. Cek IP dan koneksi WiFi.'
        : error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Buat Laporan</Text>
        <Text style={styles.headerSubtitle}>Sampaikan keluhan atau saran Anda</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Kategori *</Text>
        {loadingCat ? (
          <ActivityIndicator color="#4F46E5" style={{ marginVertical: 12 }} />
        ) : (
          <View style={styles.categoryGrid}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryItem, categoryId === cat.id && styles.categoryItemActive]}
                onPress={() => setCategoryId(cat.id)}
              >
                <Text style={styles.categoryIcon}>
                  {CATEGORY_ICONS[cat.name.toLowerCase()] || '📋'}
                </Text>
                <Text style={[styles.categoryLabel, categoryId === cat.id && styles.categoryLabelActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Judul Laporan *</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} maxLength={100} />
        <Text style={styles.charCount}>{title.length}/100</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Deskripsi *</Text>
        <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline maxLength={500} />
        <Text style={styles.charCount}>{description.length}/500</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Foto Pendukung (Opsional, maks. 3)</Text>
        <View style={styles.imageRow}>
          {images.map((uri, idx) => (
            <View key={idx} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(idx)}>
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 3 && (
            <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
              <Text style={styles.addImageIcon}>📷</Text>
              <Text style={styles.addImageText}>Tambah Foto</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity style={[styles.submitBtn, loading && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Kirim Laporan</Text>}
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { backgroundColor: '#1A1A2E', paddingTop: 60, paddingBottom: 28, paddingHorizontal: 24 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#FFF' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.55)', marginTop: 4 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 10 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB', gap: 6 },
  categoryItemActive: { backgroundColor: '#EEF2FF', borderColor: '#4F46E5' },
  categoryIcon: { fontSize: 16 },
  categoryLabel: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  categoryLabelActive: { color: '#4F46E5', fontWeight: '600' },
  input: { backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#111827' },
  textArea: { height: 120, paddingTop: 14 },
  charCount: { fontSize: 12, color: '#9CA3AF', textAlign: 'right', marginTop: 6 },
  imageRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  imageWrapper: { width: 90, height: 90, borderRadius: 12, position: 'relative' },
  imagePreview: { width: 90, height: 90, borderRadius: 12, backgroundColor: '#E5E7EB' },
  removeImageBtn: { position: 'absolute', top: -8, right: -8, backgroundColor: '#EF4444', width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  removeImageText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  addImageBtn: { width: 90, height: 90, borderRadius: 12, borderWidth: 1.5, borderColor: '#D1D5DB', borderStyle: 'dashed', backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', gap: 4 },
  addImageIcon: { fontSize: 22 },
  addImageText: { fontSize: 11, color: '#9CA3AF', textAlign: 'center' },
  submitBtn: { backgroundColor: '#4F46E5', marginHorizontal: 20, marginTop: 32, paddingVertical: 16, borderRadius: 14, alignItems: 'center', elevation: 6 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});