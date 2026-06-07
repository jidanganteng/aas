import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  Modal,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BASE_URL } from '../src/api/index';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────
type Report = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'proses' | 'selesai' | 'ditolak';
  images?: string[];
  createdAt: string;
  author: { name: string };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CATEGORY_ICONS: Record<string, string> = {
  infrastruktur: '🏗️',
  kebersihan: '🧹',
  keamanan: '🛡️',
  kesehatan: '🏥',
  pendidikan: '📚',
  lainnya: '📋',
};

const CATEGORY_COLORS: Record<string, string> = {
  infrastruktur: '#6366F1',
  kebersihan:    '#10B981',
  keamanan:      '#EF4444',
  kesehatan:     '#EC4899',
  pendidikan:    '#F59E0B',
  lainnya:       '#0EA5E9',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending:  { label: 'Menunggu',  color: '#F59E0B', bg: 'rgba(245,158,11,0.15)',  dot: '#F59E0B' },
  proses:   { label: 'Diproses',  color: '#6366F1', bg: 'rgba(99,102,241,0.15)', dot: '#6366F1' },
  selesai:  { label: 'Selesai',   color: '#10B981', bg: 'rgba(16,185,129,0.15)', dot: '#10B981' },
  ditolak:  { label: 'Ditolak',   color: '#EF4444', bg: 'rgba(239,68,68,0.15)',  dot: '#EF4444' },
};

function normalizeImageUrl(uri: string): string {
  if (!uri) return '';
  if (uri.startsWith('http://') || uri.startsWith('https://')) return uri;
  const clean = uri.startsWith('/') ? uri : `/${uri}`;
  return `${BASE_URL}${clean}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function getCatColor(cat?: string) {
  return CATEGORY_COLORS[cat ?? ''] ?? '#6366F1';
}

// ─── Report Image Component ───────────────────────────────────────────────────
function ReportImage({ uri, onPress }: { uri: string; onPress: () => void }) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const normalized = normalizeImageUrl(uri);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.reportImageWrap}>
      {!error ? (
        <>
          <Image
            source={{ uri: normalized }}
            style={styles.reportImage}
            resizeMode="cover"
            onLoad={() => setLoading(false)}
            onError={() => { setError(true); setLoading(false); }}
          />
          {loading && (
            <View style={styles.imageLoading}>
              <ActivityIndicator size="small" color="#6366F1" />
            </View>
          )}
          <View style={styles.imageOverlay}>
            <Text style={styles.imageOverlayText}>🔍</Text>
          </View>
        </>
      ) : (
        <View style={styles.imageFallback}>
          <Text style={styles.imageFallbackIcon}>🖼️</Text>
          <Text style={styles.imageFallbackText}>Gambar tidak tersedia</Text>
          <Text style={styles.imageFallbackUrl} numberOfLines={1}>{normalized}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DetailScreen() {
  const router = useRouter();
  const { reportId, item: itemParam } = useLocalSearchParams<{ reportId?: string; item?: string }>();

  const parsedItem: Report | null = (() => {
    if (!itemParam) return null;
    try {
      const raw = typeof itemParam === 'string' ? JSON.parse(itemParam) : itemParam;
      return {
        ...raw,
        title:       raw.title       || raw.judul      || '(Tanpa judul)',
        description: raw.description || raw.isi        || '',
        category:    raw.category    || raw.kategori   || 'lainnya',
        status:      raw.status      || 'pending',
        createdAt:   raw.createdAt   || raw.created_at || '',
        author:      raw.author      ?? (raw.user ?? { name: raw.user_name || 'Anonim' }),
        images:      raw.images      || [],
      } as Report;
    } catch { return null; }
  })();

  const [report, setReport] = useState<Report | null>(parsedItem ?? null);
  const [lightboxUri, setLightboxUri] = useState<string | null>(null);
  const [lightboxError, setLightboxError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getReportId = useCallback(() => {
    return reportId ?? parsedItem?.id ?? report?.id;
  }, [reportId, parsedItem?.id, report?.id]);

  const fetchDetail = useCallback(async () => {
    const id = getReportId();
    if (!id) {
      setError('ID laporan tidak ditemukan');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data);
        setError(null);
      } else {
        setError('Laporan tidak ditemukan');
      }
    } catch (e) {
      console.error(e);
      setError('Gagal memuat laporan');
    }
  }, [getReportId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: '#EF4444', marginBottom: 12 }]}>{error}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnInline}>
          <Text style={styles.backBtnInlineText}>← Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Memuat laporan...</Text>
      </View>
    );
  }

  const safeCategory = report.category ?? 'lainnya';
  const safeStatus   = report.status   ?? 'pending';
  const status   = STATUS_CONFIG[safeStatus]   ?? STATUS_CONFIG.pending;
  const catIcon  = CATEGORY_ICONS[safeCategory] ?? '📋';
  const catColor = getCatColor(safeCategory);
  const images = Array.isArray(report.images) ? report.images : [];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* ── Hero ── */}
      <LinearGradient
        colors={['#1E1B4B', '#312E81', '#4338CA']}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.heroCircle1} />
        <View style={styles.heroCircle2} />

        {/* Tombol Kembali ke Home */}
        <TouchableOpacity
          onPress={() => router.push('/screens/HomeScreen')}
          style={styles.homeButton}
          activeOpacity={0.8}
        >
          <Text style={styles.homeButtonText}>🏠 Home</Text>
        </TouchableOpacity>

        <View style={styles.metaRow}>
          <View style={[styles.categoryBadge, { backgroundColor: catColor + '28' }]}>
            <Text style={styles.badgeIcon}>{catIcon}</Text>
            <Text style={[styles.categoryBadgeText, { color: catColor === '#6366F1' ? '#A5B4FC' : '#fff' }]}>
              {safeCategory.charAt(0).toUpperCase() + safeCategory.slice(1)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: status.dot }]} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <Text style={styles.heroTitle}>{report.title}</Text>

        <View style={styles.authorRow}>
          <LinearGradient colors={[catColor, catColor + 'AA']} style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {(report.author?.name ?? 'A').charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
          <View>
            <Text style={styles.authorName}>{report.author?.name ?? 'Anonim'}</Text>
            <Text style={styles.authorDate}>{formatDate(report.createdAt)}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── Deskripsi ── */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <View style={[styles.cardTitleDot, { backgroundColor: catColor }]} />
          <Text style={styles.sectionTitle}>Deskripsi</Text>
        </View>
        <Text style={styles.descriptionText}>{report.description}</Text>
      </View>

      {/* ── Foto ── */}
      {images.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <View style={[styles.cardTitleDot, { backgroundColor: catColor }]} />
            <Text style={styles.sectionTitle}>Foto</Text>
            <View style={styles.imageBadge}>
              <Text style={styles.imageBadgeText}>{images.length}</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imageScrollContent}
          >
            {images.map((uri, i) => (
              <ReportImage
                key={i}
                uri={uri}
                onPress={() => {
                  setLightboxError(false);
                  setLightboxUri(normalizeImageUrl(uri));
                }}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── Lightbox Modal ── */}
      <Modal visible={!!lightboxUri} transparent animationType="fade">
        <View style={styles.lightbox}>
          <TouchableOpacity
            style={styles.lightboxCloseBtn}
            onPress={() => setLightboxUri(null)}
            activeOpacity={0.8}
          >
            <Text style={styles.lightboxCloseText}>✕</Text>
          </TouchableOpacity>

          {lightboxUri && !lightboxError ? (
            <Image
              source={{ uri: lightboxUri }}
              style={styles.lightboxImage}
              resizeMode="contain"
              onError={() => setLightboxError(true)}
            />
          ) : (
            <View style={styles.lightboxFallback}>
              <Text style={styles.lightboxFallbackIcon}>🖼️</Text>
              <Text style={styles.lightboxFallbackText}>Gambar tidak dapat dimuat</Text>
            </View>
          )}

          <TouchableOpacity onPress={() => setLightboxUri(null)} style={styles.lightboxDismiss}>
            <Text style={styles.lightboxDismissText}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F8FAFC', gap: 12,
  },
  loadingText: { fontSize: 14, color: '#94A3B8', fontWeight: '500' },

  hero: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 28,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  heroCircle1: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)', top: -70, right: -50,
  },
  heroCircle2: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.04)', bottom: -30, left: 10,
  },
  homeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    zIndex: 10,
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap',
  },
  categoryBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, gap: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  badgeIcon: { fontSize: 13 },
  categoryBadgeText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, gap: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '700' },
  heroTitle: {
    fontSize: 22, fontWeight: '800', color: '#fff',
    lineHeight: 30, letterSpacing: -0.3, marginBottom: 18,
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarCircle: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { color: '#fff', fontSize: 16, fontWeight: '800' },
  authorName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  authorDate: { color: 'rgba(199,210,254,0.7)', fontSize: 12, marginTop: 1 },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16, marginTop: 14,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12,
    elevation: 2,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitleDot: { width: 4, height: 16, borderRadius: 2 },
  sectionTitle: {
    fontSize: 12, fontWeight: '800', color: '#475569',
    letterSpacing: 1, textTransform: 'uppercase',
  },
  descriptionText: {
    fontSize: 15, color: '#334155', lineHeight: 25,
  },

  imageBadge: {
    marginLeft: 4, backgroundColor: '#EEF2FF',
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2,
  },
  imageBadgeText: { fontSize: 11, fontWeight: '700', color: '#6366F1' },
  imageScrollContent: { paddingRight: 4, gap: 10 },
  reportImageWrap: {
    width: 200, height: 145,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  reportImage: {
    width: '100%',
    height: '100%',
  },
  imageLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  imageOverlay: {
    position: 'absolute', bottom: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 8, padding: 4,
  },
  imageOverlayText: { fontSize: 12 },
  imageFallback: {
    width: '100%', height: '100%',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F1F5F9', padding: 12,
  },
  imageFallbackIcon: { fontSize: 28, marginBottom: 6 },
  imageFallbackText: { fontSize: 11, color: '#94A3B8', textAlign: 'center', fontWeight: '600' },
  imageFallbackUrl: { fontSize: 9, color: '#CBD5E1', textAlign: 'center', marginTop: 4 },

  lightbox: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.94)',
    alignItems: 'center', justifyContent: 'center',
  },
  lightboxCloseBtn: {
    position: 'absolute', top: Platform.OS === 'ios' ? 56 : 36, right: 20,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  lightboxCloseText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  lightboxImage: {
    width: SCREEN_WIDTH - 16,
    height: '72%',
    borderRadius: 16,
  },
  lightboxFallback: { alignItems: 'center', gap: 12 },
  lightboxFallbackIcon: { fontSize: 48 },
  lightboxFallbackText: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  lightboxDismiss: { marginTop: 24 },
  lightboxDismissText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '600' },

  backBtnInline: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#EEF2FF',
    borderRadius: 24,
  },
  backBtnInlineText: {
    color: '#6366F1',
    fontWeight: '600',
    fontSize: 14,
  },
});