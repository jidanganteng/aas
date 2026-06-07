import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  ScrollView, Image, ActivityIndicator, Animated, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { BASE_URL } from '../../src/api/index';

const { width } = Dimensions.get('window');

const CATEGORY_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  infrastruktur: { icon: '🏗️', color: '#F97316', bg: '#FFF7ED' },
  kebersihan:    { icon: '🧹', color: '#10B981', bg: '#ECFDF5' },
  keamanan:      { icon: '🛡️', color: '#3B82F6', bg: '#EFF6FF' },
  kesehatan:     { icon: '🏥', color: '#EF4444', bg: '#FEF2F2' },
  pendidikan:    { icon: '📚', color: '#8B5CF6', bg: '#F5F3FF' },
  lainnya:       { icon: '📋', color: '#6B7280', bg: '#F9FAFB' },
};

interface Category { id: number; name: string; }

function CategoryCard({ cat, isActive, onPress }: {
  cat: Category; isActive: boolean; onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const cfg = CATEGORY_CONFIG[cat.name.toLowerCase()] || CATEGORY_CONFIG.lainnya;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.92, useNativeDriver: true, speed: 50 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePress}
        style={[
          styles.categoryCard,
          { backgroundColor: isActive ? cfg.color : '#FFF' },
          isActive && styles.categoryCardActive,
        ]}
      >
        <View style={[styles.categoryIconWrap, { backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : cfg.bg }]}>
          <Text style={styles.categoryIcon}>{cfg.icon}</Text>
        </View>
        <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
          {cat.name}
        </Text>
        {isActive && (
          <View style={styles.categoryCheck}>
            <Text style={styles.categoryCheckText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

function FloatingLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <View style={styles.floatingLabelRow}>
      <Text style={styles.floatingLabel}>{label}</Text>
      {required && <Text style={styles.requiredBadge}>wajib</Text>}
    </View>
  );
}

export default function AddReportScreen() {
  const router = useRouter();
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId]   = useState<number | null>(null);
  const [categories, setCategories]   = useState<Category[]>([]);
  const [images, setImages]           = useState<string[]>([]);
  const [loading, setLoading]         = useState(false);
  const [loadingCat, setLoadingCat]   = useState(true);
  const [titleFocused, setTitleFocused]       = useState(false);
  const [descFocused, setDescFocused]         = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

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

  const selectedCat = categories.find(c => c.id === categoryId);
  const selectedCfg = selectedCat
    ? (CATEGORY_CONFIG[selectedCat.name.toLowerCase()] || CATEGORY_CONFIG.lainnya)
    : null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        {/* Decorative blobs */}
        <View style={styles.blob1} />
        <View style={styles.blob2} />
        <View style={styles.blob3} />

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>📢  Laporan Baru</Text>
          </View>
          <Text style={styles.headerTitle}>Sampaikan{'\n'}Aspirasimu</Text>
          <Text style={styles.headerSubtitle}>
            Bersama kita wujudkan lingkungan yang lebih baik
          </Text>

          {/* Progress dots */}
          <View style={styles.progressRow}>
            {['Kategori', 'Detail', 'Foto', 'Kirim'].map((step, i) => (
              <View key={i} style={styles.progressItem}>
                <View style={[styles.progressDot, i < 2 && styles.progressDotDone]} />
                <Text style={styles.progressLabel}>{step}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </View>

      {/* ── CATEGORY ───────────────────────────────────────────────────── */}
      <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <FloatingLabel label="Pilih Kategori" required />
        {loadingCat ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#F97316" size="large" />
            <Text style={styles.loadingText}>Memuat kategori...</Text>
          </View>
        ) : (
          <View style={styles.categoryGrid}>
            {categories.map(cat => (
              <CategoryCard
                key={cat.id}
                cat={cat}
                isActive={categoryId === cat.id}
                onPress={() => setCategoryId(cat.id)}
              />
            ))}
          </View>
        )}
      </Animated.View>

      {/* ── TITLE INPUT ────────────────────────────────────────────────── */}
      <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
        <FloatingLabel label="Judul Laporan" required />
        <View style={[styles.inputWrap, titleFocused && styles.inputWrapFocused]}>
          <Text style={styles.inputIcon}>✏️</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
            placeholder="Contoh: Jalan berlubang di RT 03..."
            placeholderTextColor="#CBD5E1"
            onFocus={() => setTitleFocused(true)}
            onBlur={() => setTitleFocused(false)}
          />
        </View>
        <View style={styles.charRow}>
          <View style={[styles.charBar, { width: `${(title.length / 100) * 100}%` }]} />
          <Text style={styles.charCount}>{title.length}/100</Text>
        </View>
      </Animated.View>

      {/* ── DESCRIPTION INPUT ──────────────────────────────────────────── */}
      <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
        <FloatingLabel label="Deskripsi Lengkap" required />
        <View style={[styles.inputWrap, styles.textAreaWrap, descFocused && styles.inputWrapFocused]}>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={500}
            placeholder="Jelaskan secara rinci situasi yang terjadi, lokasi, waktu kejadian, dan dampaknya..."
            placeholderTextColor="#CBD5E1"
            onFocus={() => setDescFocused(true)}
            onBlur={() => setDescFocused(false)}
            textAlignVertical="top"
          />
        </View>
        <View style={styles.charRow}>
          <View style={[styles.charBar, styles.charBarDesc, { width: `${(description.length / 500) * 100}%` }]} />
          <Text style={styles.charCount}>{description.length}/500</Text>
        </View>
      </Animated.View>

      {/* ── PHOTO SECTION ──────────────────────────────────────────────── */}
      <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
        <View style={styles.photoHeaderRow}>
          <FloatingLabel label="Foto Pendukung" />
          <Text style={styles.photoBadge}>{images.length}/3</Text>
        </View>
        <View style={styles.imageRow}>
          {images.map((uri, idx) => (
            <View key={idx} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.imagePreview} />
              <View style={styles.imageOverlay} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(idx)}>
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.imageIndex}>#{idx + 1}</Text>
            </View>
          ))}
          {images.length < 3 && (
            <TouchableOpacity style={styles.addImageBtn} onPress={pickImage} activeOpacity={0.8}>
              <View style={styles.addImageInner}>
                <Text style={styles.addImageIcon}>📷</Text>
                <Text style={styles.addImageText}>Tambah{'\n'}Foto</Text>
              </View>
            </TouchableOpacity>
          )}
          {images.length === 0 && (
            <View style={styles.photoHint}>
              <Text style={styles.photoHintText}>
                Foto membantu tim menangani laporan lebih cepat
              </Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* ── SUMMARY CARD ───────────────────────────────────────────────── */}
      {(title || categoryId) && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📋  Ringkasan Laporan</Text>
          {selectedCat && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Kategori</Text>
              <View style={[styles.summaryTag, { backgroundColor: selectedCfg?.bg }]}>
                <Text style={{ color: selectedCfg?.color, fontWeight: '700', fontSize: 13 }}>
                  {selectedCfg?.icon} {selectedCat.name}
                </Text>
              </View>
            </View>
          )}
          {title ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Judul</Text>
              <Text style={styles.summaryValue} numberOfLines={1}>{title}</Text>
            </View>
          ) : null}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Foto</Text>
            <Text style={styles.summaryValue}>{images.length} terlampir</Text>
          </View>
        </View>
      )}

      {/* ── SUBMIT BUTTON ──────────────────────────────────────────────── */}
      <View style={styles.submitSection}>
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.88}
        >
          <View style={styles.submitBtnInner}>
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>Kirim Laporan</Text>
                <View style={styles.submitArrow}>
                  <Text style={styles.submitArrowText}>→</Text>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelBtnText}>Batalkan</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    backgroundColor: '#0F172A',
    paddingTop: 64,
    paddingBottom: 36,
    paddingHorizontal: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  blob1: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: '#6366F1', opacity: 0.35, top: -40, right: -40,
  },
  blob2: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#F97316', opacity: 0.25, bottom: -20, left: 40,
  },
  blob3: {
    position: 'absolute', width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#10B981', opacity: 0.2, top: 30, left: width * 0.45,
  },
  headerBadge: {
    backgroundColor: 'rgba(99,102,241,0.3)',
    borderWidth: 1, borderColor: 'rgba(99,102,241,0.6)',
    borderRadius: 20, alignSelf: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 6, marginBottom: 14,
  },
  headerBadgeText: { color: '#A5B4FC', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  headerTitle: { fontSize: 34, fontWeight: '800', color: '#F8FAFC', lineHeight: 42, marginBottom: 8 },
  headerSubtitle: { fontSize: 14, color: '#94A3B8', lineHeight: 20, marginBottom: 20 },
  progressRow: { flexDirection: 'row', gap: 0, alignItems: 'center' },
  progressItem: { alignItems: 'center', marginRight: 20 },
  progressDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 4,
  },
  progressDotDone: { backgroundColor: '#6366F1' },
  progressLabel: { fontSize: 10, color: '#64748B', fontWeight: '600' },

  // ── Section ─────────────────────────────────────────────────────────────
  section: {
    marginHorizontal: 16, marginTop: 20,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  floatingLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  floatingLabel: { fontSize: 13, fontWeight: '700', color: '#1E293B', letterSpacing: 0.3 },
  requiredBadge: {
    fontSize: 10, fontWeight: '700', color: '#EF4444',
    backgroundColor: '#FEF2F2', paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 6, overflow: 'hidden',
  },

  // ── Loading ──────────────────────────────────────────────────────────────
  loadingBox: { alignItems: 'center', paddingVertical: 24, gap: 10 },
  loadingText: { color: '#94A3B8', fontSize: 13 },

  // ── Category Grid ────────────────────────────────────────────────────────
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 13,
    borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0',
    position: 'relative',
  },
  categoryCardActive: { borderColor: 'transparent', elevation: 4, shadowColor: '#6366F1', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6 },
  categoryIconWrap: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  categoryIcon: { fontSize: 15 },
  categoryLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  categoryLabelActive: { color: '#FFF', fontWeight: '700' },
  categoryCheck: {
    position: 'absolute', top: -6, right: -6,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 3, elevation: 2,
  },
  categoryCheckText: { fontSize: 9, fontWeight: '900', color: '#22C55E' },

  // ── Input ────────────────────────────────────────────────────────────────
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14,
    backgroundColor: '#F8FAFC', paddingHorizontal: 14,
    gap: 8,
  },
  textAreaWrap: { alignItems: 'flex-start', paddingTop: 14, paddingBottom: 4 },
  inputWrapFocused: { borderColor: '#6366F1', backgroundColor: '#FAFAFF' },
  inputIcon: { fontSize: 16 },
  input: { flex: 1, fontSize: 15, color: '#1E293B', paddingVertical: 14 },
  textArea: { height: 120, paddingTop: 0 },
  charRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  charBar: {
    height: 3, borderRadius: 2,
    backgroundColor: '#6366F1', maxWidth: '80%',
  },
  charBarDesc: { backgroundColor: '#10B981' },
  charCount: { fontSize: 11, color: '#94A3B8', marginLeft: 'auto' },

  // ── Photo ────────────────────────────────────────────────────────────────
  photoHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  photoBadge: {
    fontSize: 12, fontWeight: '700', color: '#6366F1',
    backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 10, overflow: 'hidden',
  },
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  imageWrapper: { width: 88, height: 88, borderRadius: 14, position: 'relative', overflow: 'hidden' },
  imagePreview: { width: 88, height: 88 },
  imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.12)', borderRadius: 14 },
  removeImageBtn: {
    position: 'absolute', top: 5, right: 5,
    backgroundColor: '#EF4444', width: 20, height: 20,
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  removeImageText: { color: '#FFF', fontSize: 9, fontWeight: '800' },
  imageIndex: {
    position: 'absolute', bottom: 5, left: 6,
    fontSize: 10, color: '#FFF', fontWeight: '700',
  },
  addImageBtn: {
    width: 88, height: 88, borderRadius: 14,
    borderWidth: 2, borderColor: '#C7D2FE', borderStyle: 'dashed',
    backgroundColor: '#EEF2FF', overflow: 'hidden',
  },
  addImageInner: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  addImageIcon: { fontSize: 22 },
  addImageText: { fontSize: 11, color: '#6366F1', fontWeight: '600', textAlign: 'center', lineHeight: 15 },
  photoHint: { flex: 1, justifyContent: 'center', paddingLeft: 6 },
  photoHintText: { fontSize: 12, color: '#94A3B8', lineHeight: 18, fontStyle: 'italic' },

  // ── Summary Card ─────────────────────────────────────────────────────────
  summaryCard: {
    marginHorizontal: 16, marginTop: 20,
    backgroundColor: '#0F172A', borderRadius: 20,
    padding: 18,
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 12, elevation: 8,
  },
  summaryTitle: { fontSize: 13, fontWeight: '700', color: '#94A3B8', marginBottom: 14, letterSpacing: 0.4 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  summaryKey: { fontSize: 12, color: '#475569', fontWeight: '600' },
  summaryTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  summaryValue: { fontSize: 13, color: '#F8FAFC', fontWeight: '500', flex: 1, textAlign: 'right' },

  // ── Submit ───────────────────────────────────────────────────────────────
  submitSection: { marginHorizontal: 16, marginTop: 24, gap: 12 },
  submitBtn: {
    borderRadius: 18, overflow: 'hidden',
    backgroundColor: '#4F46E5',
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  submitBtnDisabled: { opacity: 0.55 },
  submitBtnInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 18, paddingHorizontal: 24, gap: 12,
  },
  submitBtnText: { fontSize: 16, fontWeight: '800', color: '#FFF', letterSpacing: 0.3 },
  submitArrow: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  submitArrowText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  cancelBtn: { alignItems: 'center', paddingVertical: 14 },
  cancelBtnText: { fontSize: 14, color: '#94A3B8', fontWeight: '600' },
}); 