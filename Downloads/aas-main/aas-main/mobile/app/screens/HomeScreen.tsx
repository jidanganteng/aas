import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Animated, Dimensions, Alert, Modal, TextInput,
  ScrollView, RefreshControl, StatusBar, Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// ─── Types ───────────────────────────────────────────────────────────────────
interface Comment { id: number; user: string; text: string; time: string; }
interface Report {
  id: number;
  judul: string;
  isi: string;
  status?: string;
  created_at?: string;
  kategori?: string;
  user?: { name: string };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  menunggu:  { label: 'Menunggu',  color: '#d97706', bg: '#fef3c7' },
  disetujui: { label: 'Disetujui', color: '#059669', bg: '#d1fae5' },
  ditolak:   { label: 'Ditolak',   color: '#dc2626', bg: '#fee2e2' },
};
const getStatus = (s?: string) => STATUS_MAP[s?.toLowerCase() ?? ''] ?? { label: 'Menunggu', color: '#d97706', bg: '#fef3c7' };

const formatDate = (d?: string) => {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, color, delta, deltaUp, ghost }: {
  label: string; value: number; color: string;
  delta: string; deltaUp: boolean; ghost: string;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, tension: 55, friction: 8, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[styles.statCard, { opacity: anim, transform: [{ scale: anim }] }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statDelta, { color: deltaUp ? '#059669' : '#dc2626' }]}>
        {deltaUp ? '↑' : '↓'} {delta}
      </Text>
      <Text style={[styles.statGhost, { color: color + '22' }]}>{ghost}</Text>
    </Animated.View>
  );
}

// ─── Report Card ─────────────────────────────────────────────────────────────
function ReportCard({ item, onDetail, onDelete, onComment }: {
  item: Report;
  onDetail: () => void;
  onDelete: () => void;
  onComment: () => void;
}) {
  const status = getStatus(item.status);
  const slideAnim = useRef(new Animated.Value(30)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.reportCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {/* Header */}
      <View style={styles.rcHeader}>
        <View style={[styles.rcStatusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.rcStatusText, { color: status.color }]}>{status.label}</Text>
        </View>
        <Text style={styles.rcDate}>{formatDate(item.created_at)}</Text>
      </View>

      {/* Body */}
      <Text style={styles.rcTitle} numberOfLines={2}>{item.judul}</Text>
      {item.kategori && (
        <View style={styles.rcCatRow}>
          <Text style={styles.rcCatIcon}>🏷️</Text>
          <Text style={styles.rcCat}>{item.kategori}</Text>
        </View>
      )}
      <Text style={styles.rcIsi} numberOfLines={3}>{item.isi}</Text>

      {item.user?.name && (
        <View style={styles.rcUserRow}>
          <View style={styles.rcAvatar}>
            <Text style={styles.rcAvatarText}>{item.user.name[0].toUpperCase()}</Text>
          </View>
          <Text style={styles.rcUserName}>{item.user.name}</Text>
        </View>
      )}

      {/* Divider */}
      <View style={styles.rcDivider} />

      {/* Actions */}
      <View style={styles.rcActions}>
        <TouchableOpacity style={styles.rcActionBtn} onPress={onDetail} activeOpacity={0.75}>
          <Text style={styles.rcActionIcon}>📄</Text>
          <Text style={styles.rcActionText}>Detail</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rcActionBtn} onPress={onComment} activeOpacity={0.75}>
          <Text style={styles.rcActionIcon}>💬</Text>
          <Text style={styles.rcActionText}>Komentar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.rcActionBtn, styles.rcDeleteBtn]} onPress={onDelete} activeOpacity={0.75}>
          <Text style={styles.rcActionIcon}>🗑️</Text>
          <Text style={[styles.rcActionText, { color: '#dc2626' }]}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ item, visible, onClose }: { item: Report | null; visible: boolean; onClose: () => void }) {
  if (!item) return null;
  const status = getStatus(item.status);
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={[styles.modalStatusBadge, { backgroundColor: status.bg }]}>
              <Text style={[styles.modalStatusText, { color: status.color }]}>{status.label}</Text>
            </View>
            <Text style={styles.modalTitle}>{item.judul}</Text>
            {item.kategori && <Text style={styles.modalKat}>🏷️ {item.kategori}</Text>}
            <Text style={styles.modalDate}>📅 {formatDate(item.created_at)}</Text>
            {item.user?.name && <Text style={styles.modalUser}>👤 {item.user.name}</Text>}
            <View style={styles.modalDivider} />
            <Text style={styles.modalSectionLabel}>ISI LAPORAN</Text>
            <Text style={styles.modalBody}>{item.isi}</Text>
          </ScrollView>
          <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
            <LinearGradient colors={['#f7971e', '#ffd200']} style={styles.modalCloseBtnGrad}>
              <Text style={styles.modalCloseBtnText}>Tutup</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Comment Modal ────────────────────────────────────────────────────────────
function CommentModal({ item, visible, onClose }: { item: Report | null; visible: boolean; onClose: () => void }) {
  const [comments, setComments] = useState<Comment[]>([
    { id: 1, user: 'Admin', text: 'Laporan sedang diproses.', time: '10:30' },
    { id: 2, user: 'Petugas', text: 'Terima kasih atas laporan Anda.', time: '11:00' },
  ]);
  const [newComment, setNewComment] = useState('');

  const sendComment = () => {
    if (!newComment.trim()) return;
    setComments(prev => [...prev, {
      id: Date.now(), user: 'Saya', text: newComment.trim(),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    }]);
    setNewComment('');
  };

  if (!item) return null;
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, { paddingBottom: 0 }]}>
          <View style={styles.modalHandle} />
          <View style={styles.cmHeader}>
            <Text style={styles.cmTitle}>💬 Komentar</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.cmClose}>✕</Text></TouchableOpacity>
          </View>
          <Text style={styles.cmSubtitle} numberOfLines={1}>{item.judul}</Text>
          <FlatList
            data={comments}
            keyExtractor={c => c.id.toString()}
            style={{ maxHeight: 280 }}
            renderItem={({ item: c }) => (
              <View style={[styles.cmBubble, c.user === 'Saya' && styles.cmBubbleMine]}>
                <Text style={styles.cmUser}>{c.user}</Text>
                <Text style={styles.cmText}>{c.text}</Text>
                <Text style={styles.cmTime}>{c.time}</Text>
              </View>
            )}
          />
          <View style={styles.cmInputRow}>
            <TextInput
              style={styles.cmInput}
              placeholder="Tulis komentar..."
              placeholderTextColor="#999"
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity style={styles.cmSendBtn} onPress={sendComment} activeOpacity={0.8}>
              <LinearGradient colors={['#f7971e', '#ffd200']} style={styles.cmSendGrad}>
                <Text style={styles.cmSendText}>➤</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Settings Modal ───────────────────────────────────────────────────────────
function SettingsModal({ visible, onClose, onLogout }: { visible: boolean; onClose: () => void; onLogout: () => void }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.settingsTitle}>⚙️ Pengaturan</Text>

          {[
            { icon: '👤', label: 'Profil Saya', action: onClose },
            { icon: '🔔', label: 'Notifikasi', action: onClose },
            { icon: '🔒', label: 'Ubah Password', action: onClose },
            { icon: '📋', label: 'Syarat & Ketentuan', action: onClose },
            { icon: '❓', label: 'Bantuan', action: onClose },
          ].map((s, i) => (
            <TouchableOpacity key={i} style={styles.settingsItem} onPress={s.action} activeOpacity={0.7}>
              <Text style={styles.settingsIcon}>{s.icon}</Text>
              <Text style={styles.settingsLabel}>{s.label}</Text>
              <Text style={styles.settingsChevron}>›</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.modalDivider} />

          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.85}>
            <Text style={styles.logoutText}>🚪 Keluar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
            <View style={styles.settingsCancelBtn}>
              <Text style={styles.settingsCancelText}>Batal</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main HomeScreen ──────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const [data, setData]         = useState<Report[]>([]);
  const [loading, setLoading]   = useState(false);
  const [userName, setUserName] = useState('');
  const [detailItem, setDetailItem]   = useState<Report | null>(null);
  const [commentItem, setCommentItem] = useState<Report | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showDetail,   setShowDetail]   = useState(false);
  const [showComment,  setShowComment]  = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current;

  // Marquee
  const marqueeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(marqueeAnim, { toValue: 1, duration: 12000, useNativeDriver: true })
    ).start();
  }, []);
  const marqueeX = marqueeAnim.interpolate({ inputRange: [0, 1], outputRange: [width, -width * 2] });

  useEffect(() => {
    AsyncStorage.getItem('userName').then(n => { if (n) setUserName(n); });
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('http://10.2.10.245:5000/api/pengaduan', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      console.log('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const handleDelete = (id: number) => {
    Alert.alert('Hapus Laporan', 'Yakin ingin menghapus laporan ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            await fetch(`http://192.168.1.12:5000/api/pengaduan/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
            setData(prev => prev.filter(r => r.id !== id));
          } catch { Alert.alert('Error', 'Gagal menghapus laporan'); }
        },
      },
    ]);
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['token', 'userRole', 'userName']);
    router.replace('/login');
  };

  // Stats
  const total     = data.length;
  const menunggu  = data.filter(r => !r.status || r.status.toLowerCase() === 'menunggu').length;
  const disetujui = data.filter(r => r.status?.toLowerCase() === 'disetujui').length;
  const ditolak   = data.filter(r => r.status?.toLowerCase() === 'ditolak').length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ── */}
      <LinearGradient colors={['#0f0c29', '#302b63']} style={styles.header}>
        <Animated.View style={{ opacity: headerAnim }}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerGreet}>Selamat datang 👋</Text>
              <Text style={styles.headerName}>{userName || 'Pengguna'}</Text>
            </View>
            <TouchableOpacity style={styles.settingsBtn} onPress={() => setShowSettings(true)}>
              <Text style={styles.settingsIcon2}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* ── Marquee ticker ── */}
      <View style={styles.ticker}>
        <Animated.Text style={[styles.tickerText, { transform: [{ translateX: marqueeX }] }]}>
          PANTAU STATUS  ·  RESPONS CEPAT  ·  TRANSPARANSI PENUH  ·  LAPORAN AKTIF  ·  PANTAU STATUS  ·  RESPONS CEPAT  ·  TRANSPARANSI PENUH  ·
        </Animated.Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={item => item.id.toString()}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} tintColor="#ffd200" />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* ── Stat Cards ── */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsRow}>
              <StatCard label="TOTAL LAPORAN" value={total}     color="#1a1a2e" delta="+2.5%" deltaUp ghost="T" />
              <StatCard label="MENUNGGU"       value={menunggu}  color="#d97706" delta="-1.2%" deltaUp={false} ghost="M" />
              <StatCard label="DISETUJUI"      value={disetujui} color="#059669" delta="+8.3%" deltaUp ghost="D" />
              <StatCard label="DITOLAK"        value={ditolak}   color="#dc2626" delta="-0.5%" deltaUp={false} ghost="D" />
            </ScrollView>

            {/* ── Section Header ── */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Daftar Laporan</Text>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => router.push('/screens/AddReportScreen')}
                activeOpacity={0.85}
              >
                <LinearGradient colors={['#f7971e', '#ffd200']} style={styles.addBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.addBtnText}>+ Tambah</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {data.length === 0 && !loading && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📭</Text>
                <Text style={styles.emptyText}>Belum ada laporan</Text>
                <Text style={styles.emptySubtext}>Ketuk tombol + Tambah untuk membuat laporan baru</Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <ReportCard
            item={item}
            onDetail={() => { setDetailItem(item); setShowDetail(true); }}
            onComment={() => { setCommentItem(item); setShowComment(true); }}
            onDelete={() => handleDelete(item.id)}
          />
        )}
      />

      {/* ── Modals ── */}
      <DetailModal  item={detailItem}  visible={showDetail}   onClose={() => setShowDetail(false)} />
      <CommentModal item={commentItem} visible={showComment}  onClose={() => setShowComment(false)} />
      <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} onLogout={handleLogout} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f4f0' },

  // Header
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingBottom: 18, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerGreet: { color: 'rgba(255,255,255,0.55)', fontSize: 12, letterSpacing: 0.5 },
  headerName:  { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 2 },
  settingsBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  settingsIcon2: { fontSize: 20 },

  // Ticker
  ticker: { backgroundColor: '#1a1a2e', height: 34, justifyContent: 'center', overflow: 'hidden' },
  tickerText: { color: '#ffd200', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, whiteSpace: 'nowrap' } as any,

  // Stats
  statsRow: { paddingHorizontal: 16, paddingVertical: 16 },
  statCard: {
    width: 140, backgroundColor: '#fff', borderRadius: 0,
    borderWidth: 1.5, borderColor: '#1a1a2e',
    padding: 16, marginRight: 10,
    position: 'relative', overflow: 'hidden',
  },
  statLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1.2, color: '#888', textTransform: 'uppercase', marginBottom: 8 },
  statValue: { fontSize: 44, fontWeight: '900', lineHeight: 48 },
  statDelta: { fontSize: 11, fontWeight: '600', marginTop: 4 },
  statGhost: { position: 'absolute', bottom: -8, right: 8, fontSize: 70, fontWeight: '900' },

  // Section
  listContent: { paddingBottom: 32 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a2e' },
  addBtn: { borderRadius: 10, overflow: 'hidden' },
  addBtnGrad: { paddingHorizontal: 16, paddingVertical: 9 },
  addBtnText: { color: '#1a1a2e', fontWeight: '800', fontSize: 13 },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText:    { fontSize: 18, fontWeight: '700', color: '#1a1a2e', marginBottom: 8 },
  emptySubtext: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 },

  // Report Card
  reportCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16, marginBottom: 14,
    borderRadius: 0,
    borderWidth: 1.5, borderColor: '#1a1a2e',
    padding: 16,
    shadowColor: '#1a1a2e',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.12, shadowRadius: 0,
    elevation: 4,
  },
  rcHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  rcStatusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 4 },
  rcStatusText:  { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  rcDate: { fontSize: 11, color: '#aaa' },
  rcTitle: { fontSize: 16, fontWeight: '800', color: '#1a1a2e', lineHeight: 22, marginBottom: 6 },
  rcCatRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  rcCatIcon: { fontSize: 12, marginRight: 4 },
  rcCat: { fontSize: 11, color: '#888', fontWeight: '600' },
  rcIsi: { fontSize: 13, color: '#555', lineHeight: 20, marginBottom: 12 },
  rcUserRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rcAvatar: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#ffd200', alignItems: 'center', justifyContent: 'center' },
  rcAvatarText: { fontSize: 12, fontWeight: '800', color: '#1a1a2e' },
  rcUserName: { fontSize: 12, color: '#888', fontWeight: '600' },
  rcDivider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 12 },
  rcActions: { flexDirection: 'row', gap: 8 },
  rcActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 8, backgroundColor: '#f8f8f8' },
  rcDeleteBtn: { backgroundColor: '#fff5f5' },
  rcActionIcon: { fontSize: 14 },
  rcActionText: { fontSize: 12, fontWeight: '700', color: '#1a1a2e' },

  // Modal base
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#ddd', alignSelf: 'center', marginBottom: 20 },

  // Detail Modal
  modalStatusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6, marginBottom: 12 },
  modalStatusText:  { fontSize: 12, fontWeight: '700' },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a2e', lineHeight: 28, marginBottom: 10 },
  modalKat:   { fontSize: 13, color: '#888', marginBottom: 6 },
  modalDate:  { fontSize: 13, color: '#888', marginBottom: 6 },
  modalUser:  { fontSize: 13, color: '#888', marginBottom: 6 },
  modalDivider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 16 },
  modalSectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, color: '#aaa', marginBottom: 10 },
  modalBody: { fontSize: 15, color: '#444', lineHeight: 24 },
  modalCloseBtn: { marginTop: 20, borderRadius: 12, overflow: 'hidden' },
  modalCloseBtnGrad: { paddingVertical: 14, alignItems: 'center' },
  modalCloseBtnText: { color: '#1a1a2e', fontWeight: '800', fontSize: 15 },

  // Comment Modal
  cmHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cmTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a2e' },
  cmClose: { fontSize: 18, color: '#888', padding: 4 },
  cmSubtitle: { fontSize: 12, color: '#aaa', marginBottom: 16 },
  cmBubble: { backgroundColor: '#f5f5f5', borderRadius: 12, borderTopLeftRadius: 2, padding: 12, marginBottom: 10, maxWidth: '80%' },
  cmBubbleMine: { backgroundColor: '#fef3c7', alignSelf: 'flex-end', borderTopLeftRadius: 12, borderTopRightRadius: 2 },
  cmUser: { fontSize: 10, fontWeight: '700', color: '#888', marginBottom: 3 },
  cmText: { fontSize: 14, color: '#333', lineHeight: 20 },
  cmTime: { fontSize: 10, color: '#bbb', marginTop: 4, textAlign: 'right' },
  cmInputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingTop: 12, paddingBottom: 24, borderTopWidth: 1, borderTopColor: '#f0f0f0', marginTop: 8 },
  cmInput: { flex: 1, borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#333', maxHeight: 100 },
  cmSendBtn: { borderRadius: 14, overflow: 'hidden' },
  cmSendGrad: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  cmSendText: { fontSize: 18, color: '#1a1a2e' },

  // Settings Modal
  settingsTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a2e', marginBottom: 20 },
  settingsItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  settingsIcon:  { fontSize: 20, marginRight: 14 },
  settingsLabel: { flex: 1, fontSize: 15, color: '#1a1a2e', fontWeight: '600' },
  settingsChevron: { fontSize: 22, color: '#ccc', fontWeight: '300' },
  logoutBtn: { marginTop: 8, paddingVertical: 14, alignItems: 'center', backgroundColor: '#fff0f0', borderRadius: 12 },
  logoutText: { color: '#dc2626', fontWeight: '800', fontSize: 15 },
  settingsCancelBtn: { paddingVertical: 14, alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 12, marginTop: 10 },
  settingsCancelText: { color: '#888', fontWeight: '700', fontSize: 15 },
});