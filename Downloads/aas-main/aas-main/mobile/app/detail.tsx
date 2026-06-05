import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { BASE_URL } from '../src/api/index';
import { useLocalSearchParams } from 'expo-router';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────
type Comment = {
  id: string;
  user: { name: string; avatar?: string };
  text: string;
  createdAt: string;
};

type Report = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'proses' | 'selesai' | 'ditolak';
  images?: string[];
  createdAt: string;
  author: { name: string };
  comments?: Comment[];
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

// Normalize image URL — handles relative paths from backend
function normalizeImageUrl(uri: string): string {
  if (!uri) return '';
  if (uri.startsWith('http://') || uri.startsWith('https://')) return uri;
  // strip leading slash if present
  const clean = uri.startsWith('/') ? uri : `/${uri}`;
  return `${BASE_URL}${clean}`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} mnt lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  return `${Math.floor(hrs / 24)} hari lalu`;
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
// Separate component so each image can independently track load/error state
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
          {/* Tap indicator overlay */}
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
  const { reportId, item: itemParam } = useLocalSearchParams<{ reportId?: string; item?: string }>();
  // Expo Router passes params as strings — parse and normalize field names.
  // HomeScreen maps fields differently (judul/isi/kategori) vs DetailScreen (title/description/category).
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

  const [report, setReport]               = useState<Report | null>(parsedItem ?? null);
  const [comments, setComments]           = useState<Comment[]>([]);
  const [commentText, setCommentText]     = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingComment, setSendingComment]   = useState(false);
  const [lightboxUri, setLightboxUri]     = useState<string | null>(null);
  const [lightboxError, setLightboxError] = useState(false);

  const fetchDetail = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const id = reportId ?? parsedItem?.id;
      if (!id) return;
      const res = await fetch(`${BASE_URL}/api/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data);
        setComments(data.comments ?? []);
      }
    } catch (e) {
      console.error(e);
    }
  }, [reportId, parsedItem?.id]);

  const fetchComments = useCallback(async () => {
    try {
      setLoadingComments(true);
      const token = await AsyncStorage.getItem('token');
      const id = reportId ?? parsedItem?.id ?? report?.id;
      if (!id) return;
      const res = await fetch(`${BASE_URL}/api/reports/${id}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingComments(false);
    }
  }, [reportId, parsedItem?.id, report?.id]);

  useEffect(() => {
    fetchDetail();
    fetchComments();
  }, [fetchDetail, fetchComments]);

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    setSendingComment(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const id = report?.id ?? reportId ?? parsedItem?.id;
      const res = await fetch(`${BASE_URL}/api/reports/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: commentText.trim() }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments(prev => [...prev, newComment]);
        setCommentText('');
      } else {
        Alert.alert('Gagal', 'Tidak dapat mengirim komentar');
      }
    } catch (e) {
      Alert.alert('Error', 'Koneksi gagal');
    } finally {
      setSendingComment(false);
    }
  };

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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Hero ── */}
        <LinearGradient
          colors={['#1E1B4B', '#312E81', '#4338CA']}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Decorative circles */}
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />

          {/* Badges */}
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

          {/* Author */}
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

        {/* ── Komentar ── */}
        <View style={styles.card}>
          <View style={styles.commentHeaderRow}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.cardTitleDot, { backgroundColor: catColor }]} />
              <Text style={styles.sectionTitle}>Komentar</Text>
            </View>
            <View style={styles.commentCountBadge}>
              <Text style={styles.commentCountText}>{comments.length}</Text>
            </View>
          </View>

          {loadingComments ? (
            <View style={styles.commentsLoading}>
              <ActivityIndicator color="#6366F1" />
              <Text style={styles.commentsLoadingText}>Memuat komentar...</Text>
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.emptyComments}>
              <View style={styles.emptyCommentIconWrap}>
                <Text style={styles.emptyCommentIcon}>💬</Text>
              </View>
              <Text style={styles.emptyCommentText}>Belum ada komentar</Text>
              <Text style={styles.emptyCommentSub}>Jadilah yang pertama berkomentar!</Text>
            </View>
          ) : (
            <View style={styles.commentList}>
              {comments.map(comment => (
                <View key={comment.id} style={styles.commentItem}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>
                      {(comment.user?.name ?? 'A').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.commentBubble}>
                    <View style={styles.commentBubbleHeader}>
                      <Text style={styles.commentAuthor}>{comment.user?.name ?? 'Anonim'}</Text>
                      <Text style={styles.commentTime}>{timeAgo(comment.createdAt)}</Text>
                    </View>
                    <Text style={styles.commentText}>{comment.text}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Sticky comment input ── */}
      <View style={styles.commentInputBar}>
        <TextInput
          style={styles.commentInput}
          placeholder="Tulis komentar..."
          placeholderTextColor="#94A3B8"
          value={commentText}
          onChangeText={setCommentText}
          multiline
          maxLength={300}
        />
        <TouchableOpacity
          onPress={handleSendComment}
          disabled={!commentText.trim() || sendingComment}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={!commentText.trim() || sendingComment
              ? ['#CBD5E1', '#CBD5E1']
              : ['#6366F1', '#818CF8']
            }
            style={styles.sendBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {sendingComment
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.sendBtnText}>Kirim</Text>
            }
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ── Lightbox ── */}
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
    </KeyboardAvoidingView>
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

  // ── Hero ──────────────────────────────────────────────────────────────────
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

  // ── Card ──────────────────────────────────────────────────────────────────
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

  // ── Images ────────────────────────────────────────────────────────────────
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

  // ── Comments ──────────────────────────────────────────────────────────────
  commentHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 0,
  },
  commentCountBadge: {
    backgroundColor: '#EEF2FF', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  commentCountText: { fontSize: 12, fontWeight: '700', color: '#6366F1' },
  commentsLoading: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  commentsLoadingText: { fontSize: 13, color: '#94A3B8' },
  commentList: { gap: 12, marginTop: 4 },
  commentItem: { flexDirection: 'row', gap: 10 },
  commentAvatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  commentAvatarText: { color: '#6366F1', fontSize: 14, fontWeight: '800' },
  commentBubble: {
    flex: 1, backgroundColor: '#F8FAFC', borderRadius: 14,
    padding: 12, borderWidth: 1, borderColor: '#F1F5F9',
  },
  commentBubbleHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 5,
  },
  commentAuthor: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  commentTime: { fontSize: 11, color: '#94A3B8' },
  commentText: { fontSize: 14, color: '#334155', lineHeight: 20 },
  emptyComments: { alignItems: 'center', paddingVertical: 28 },
  emptyCommentIconWrap: {
    width: 60, height: 60, borderRadius: 18,
    backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  emptyCommentIcon: { fontSize: 28 },
  emptyCommentText: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  emptyCommentSub: { fontSize: 12, color: '#94A3B8' },

  // ── Comment Input Bar ─────────────────────────────────────────────────────
  commentInputBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 16, paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05, shadowRadius: 10,
    elevation: 8,
  },
  commentInput: {
    flex: 1, minHeight: 44, maxHeight: 90,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 14, color: '#1E293B',
  },
  sendBtn: {
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 22, minHeight: 44,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },

  // ── Lightbox ──────────────────────────────────────────────────────────────
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
});