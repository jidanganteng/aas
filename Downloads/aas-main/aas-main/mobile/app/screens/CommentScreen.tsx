import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────
type Comment = {
  id: string | number;
  user?: { name?: string };
  isi: string;
  createdAt: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} mnt lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getInitial(name?: string) {
  return (name ?? 'A').charAt(0).toUpperCase();
}

// Deterministic avatar color per initial
const AVATAR_COLORS = ['#4F46E5', '#0891B2', '#059669', '#D97706', '#DC2626', '#7C3AED', '#DB2777'];
function avatarColor(name?: string) {
  const code = (name ?? 'A').charCodeAt(0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CommentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const fetchComments = useCallback(async (silent = false) => {
    if (!silent) setInitialLoading(true);
    setErrorMsg('');
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`http://192.168.1.12:5000/api/reports/${id}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setComments(Array.isArray(data) ? data : []);
      } else {
        setErrorMsg('Gagal memuat komentar');
      }
    } catch {
      setErrorMsg('Tidak dapat terhubung ke server');
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  const postComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`http://192.168.1.12:5000/api/reports/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isi: newComment.trim() }),
      });
      if (res.ok) {
        const created: Comment = await res.json();
        setComments(prev => [...prev, created]);
        setNewComment('');
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      } else {
        setErrorMsg('Komentar tidak terkirim');
      }
    } catch {
      setErrorMsg('Koneksi gagal, coba lagi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComments(); }, [fetchComments]);

  // ── Render item ──────────────────────────────────────────────────────────
  const renderComment = ({ item, index }: { item: Comment; index: number }) => {
    const name = item.user?.name;
    const color = avatarColor(name);
    return (
      <View style={styles.commentItem}>
        <View style={[styles.commentAvatar, { backgroundColor: color + '22' }]}>
          <Text style={[styles.commentAvatarText, { color }]}>{getInitial(name)}</Text>
        </View>
        <View style={styles.commentBubble}>
          <View style={styles.commentBubbleTop}>
            <Text style={styles.commentName}>{name ?? 'Anonim'}</Text>
            <Text style={styles.commentTime}>{timeAgo(item.createdAt)}</Text>
          </View>
          <Text style={styles.commentText}>{item.isi}</Text>
        </View>
      </View>
    );
  };

  // ── Empty state ──────────────────────────────────────────────────────────
  const ListEmpty = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <Text style={styles.emptyIcon}>💬</Text>
      </View>
      <Text style={styles.emptyTitle}>Belum ada komentar</Text>
      <Text style={styles.emptySubtitle}>Jadilah yang pertama memberi tanggapan</Text>
    </View>
  );

  // ── Header ───────────────────────────────────────────────────────────────
  const ListHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.commentCountLabel}>
        {comments.length > 0 ? `${comments.length} komentar` : 'Diskusi'}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* ── Page Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Komentar</Text>
        <Text style={styles.headerSub}>Laporan #{id}</Text>
      </View>

      {/* ── Error banner ── */}
      {!!errorMsg && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
          <TouchableOpacity onPress={() => { setErrorMsg(''); fetchComments(true); }}>
            <Text style={styles.errorRetry}>Coba lagi</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── List ── */}
      {initialLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Memuat komentar...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={comments}
          keyExtractor={item => item.id.toString()}
          renderItem={renderComment}
          ListEmptyComponent={<ListEmpty />}
          ListHeaderComponent={<ListHeader />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchComments(true); }}
              tintColor="#4F46E5"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ── Input Bar ── */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Tulis komentar..."
          placeholderTextColor="#9CA3AF"
          value={newComment}
          onChangeText={setNewComment}
          multiline
          maxLength={500}
          returnKeyType="default"
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            (!newComment.trim() || loading) && styles.sendBtnDisabled,
          ]}
          onPress={postComment}
          disabled={!newComment.trim() || loading}
          activeOpacity={0.8}
        >
          {loading
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.sendBtnText}>Kirim</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  // Header
  header: {
    backgroundColor: '#1A1A2E',
    paddingTop: 60,
    paddingBottom: 22,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 2,
  },

  // Error
  errorBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FECACA',
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    flex: 1,
  },
  errorRetry: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
    marginLeft: 12,
  },

  // Loading
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#9CA3AF',
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  listHeader: {
    paddingTop: 20,
    paddingBottom: 12,
  },
  commentCountLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  // Comment item
  commentItem: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  commentAvatarText: {
    fontSize: 14,
    fontWeight: '700',
  },
  commentBubble: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderTopLeftRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  commentBubbleTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  commentName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  commentTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 21,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },

  // Input bar
  inputBar: {
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
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 100,
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
    height: 42,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
  },
  sendBtnDisabled: {
    opacity: 0.38,
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});