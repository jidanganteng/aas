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
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Menunggu',  color: '#D97706', bg: '#FEF3C7' },
  proses:   { label: 'Diproses',  color: '#2563EB', bg: '#DBEAFE' },
  selesai:  { label: 'Selesai',   color: '#059669', bg: '#D1FAE5' },
  ditolak:  { label: 'Ditolak',   color: '#DC2626', bg: '#FEE2E2' },
};

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

// ─── Component ────────────────────────────────────────────────────────────────
export default function DetailScreen({ route }: any) {
  const { reportId, item } = route.params ?? {};

  const [report, setReport] = useState<Report | null>(item ?? null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const id = reportId ?? item?.id;
      if (!id) return;
      const res = await fetch(`http://192.168.1.12:5000/api/reports/${id}`, {
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
  }, [reportId, item?.id]);

  const fetchComments = useCallback(async () => {
    try {
      setLoadingComments(true);
      const token = await AsyncStorage.getItem('token');
      const id = reportId ?? item?.id ?? report?.id;
      if (!id) return;
      const res = await fetch(`http://192.168.1.12:5000/api/reports/${id}/comments`, {
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
  }, [reportId, item?.id, report?.id]);

  useEffect(() => {
    fetchDetail();
    fetchComments();
  }, [fetchDetail, fetchComments]);

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    setSendingComment(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const id = report?.id ?? reportId ?? item?.id;
      const res = await fetch(`http://192.168.1.12:5000/api/reports/${id}/comments`, {
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
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  const status = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.pending;
  const catIcon = CATEGORY_ICONS[report.category] ?? '📋';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* ── Hero/Header ── */}
        <View style={styles.hero}>
          <View style={styles.metaRow}>
            <View style={styles.categoryBadge}>
              <Text>{catIcon}</Text>
              <Text style={styles.categoryBadgeText}>
                {report.category.charAt(0).toUpperCase() + report.category.slice(1)}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: status.color }]} />
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>{report.title}</Text>

          <View style={styles.authorRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>
                {(report.author?.name ?? 'A').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.authorName}>{report.author?.name ?? 'Anonim'}</Text>
              <Text style={styles.authorDate}>{formatDate(report.createdAt)}</Text>
            </View>
          </View>
        </View>

        {/* ── Deskripsi ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Deskripsi</Text>
          <Text style={styles.descriptionText}>{report.description}</Text>
        </View>

        {/* ── Foto ── */}
        {report.images && report.images.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Foto ({report.images.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              {report.images.map((uri, i) => (
                <TouchableOpacity key={i} onPress={() => setLightboxImage(uri)} activeOpacity={0.85}>
                  <Image source={{ uri }} style={styles.reportImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Komentar ── */}
        <View style={[styles.card, { marginBottom: 16 }]}>
          <View style={styles.commentHeader}>
            <Text style={styles.sectionTitle}>Komentar</Text>
            <Text style={styles.commentCount}>{comments.length}</Text>
          </View>

          {loadingComments ? (
            <ActivityIndicator color="#4F46E5" style={{ marginVertical: 20 }} />
          ) : comments.length === 0 ? (
            <View style={styles.emptyComments}>
              <Text style={styles.emptyCommentIcon}>💬</Text>
              <Text style={styles.emptyCommentText}>Belum ada komentar. Jadilah yang pertama!</Text>
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

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Input Komentar (sticky) ── */}
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Tulis komentar..."
          placeholderTextColor="#9CA3AF"
          value={commentText}
          onChangeText={setCommentText}
          multiline
          maxLength={300}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!commentText.trim() || sendingComment) && styles.sendBtnDisabled]}
          onPress={handleSendComment}
          disabled={!commentText.trim() || sendingComment}
        >
          {sendingComment
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.sendBtnText}>Kirim</Text>
          }
        </TouchableOpacity>
      </View>

      {/* ── Lightbox ── */}
      <Modal visible={!!lightboxImage} transparent animationType="fade">
        <TouchableOpacity
          style={styles.lightbox}
          activeOpacity={1}
          onPress={() => setLightboxImage(null)}
        >
          {lightboxImage && (
            <Image
              source={{ uri: lightboxImage }}
              style={styles.lightboxImage}
              resizeMode="contain"
            />
          )}
          <Text style={styles.lightboxClose}>✕ Tutup</Text>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
  },

  // Hero
  hero: {
    backgroundColor: '#1A1A2E',
    paddingTop: 60,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 30,
    letterSpacing: -0.3,
    marginBottom: 16,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  authorName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  authorDate: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 1,
  },

  // Cards
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },

  // Images
  imageScroll: {
    marginHorizontal: -4,
  },
  reportImage: {
    width: 200,
    height: 140,
    borderRadius: 10,
    marginHorizontal: 4,
    backgroundColor: '#F1F3F5',
  },

  // Comments
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  commentCount: {
    backgroundColor: '#EEF2FF',
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  commentList: {
    gap: 14,
  },
  commentItem: {
    flexDirection: 'row',
    gap: 10,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  commentAvatarText: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '700',
  },
  commentBubble: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  commentBubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  commentTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  emptyComments: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyCommentIcon: {
    fontSize: 32,
  },
  emptyCommentText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },

  // Comment input
  commentInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
  },
  commentInput: {
    flex: 1,
    minHeight: 42,
    maxHeight: 90,
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  sendBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },

  // Lightbox
  lightbox: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxImage: {
    width: '92%',
    height: '70%',
    borderRadius: 12,
  },
  lightboxClose: {
    color: 'rgba(255,255,255,0.6)',
    marginTop: 20,
    fontSize: 14,
    fontWeight: '600',
  },
});