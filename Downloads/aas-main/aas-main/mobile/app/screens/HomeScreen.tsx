import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Animated, Dimensions, Alert, Modal, TextInput,
  ScrollView, RefreshControl, StatusBar, Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { BASE_URL } from '../../src/api/index';

const { width } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────
interface Comment { id: number; user: string; text: string; time: string; }
interface Report {
  id: number;
  title?: string;
  description?: string;
  category_name?: string;
  createdAt?: string;
  status?: string;
  user_name?: string;
  judul: string;
  isi: string;
  created_at?: string;
  kategori?: string;
  user?: { name: string };
    images?: any[]; 
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  menunggu:  { label: 'Menunggu',  color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  dot: '#F59E0B' },
  disetujui: { label: 'Disetujui', color: '#10B981', bg: 'rgba(16,185,129,0.12)', dot: '#10B981' },
  ditolak:   { label: 'Ditolak',   color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  dot: '#EF4444' },
};
const getStatus = (s?: string) =>
  STATUS_MAP[s?.toLowerCase() ?? ''] ?? { label: 'Menunggu', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', dot: '#F59E0B' };

const formatDate = (d?: string) => {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ─── Category colors ─────────────────────────────────────────────────────────
const CAT_COLORS = ['#6366F1', '#EC4899', '#0EA5E9', '#F97316', '#14B8A6'];
const getCatColor = (name?: string) => {
  if (!name) return CAT_COLORS[0];
  return CAT_COLORS[name.charCodeAt(0) % CAT_COLORS.length];
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, icon }: {
  label: string; value: number; color: string; icon: string;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={{ opacity: anim, transform: [{ scale: anim }] }}>
      <LinearGradient
        colors={[color + '22', color + '08']}
        style={styles.statCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[styles.statIconCircle, { backgroundColor: color + '20' }]}>
          <Text style={styles.statIconText}>{icon}</Text>
        </View>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        <View style={[styles.statBar, { backgroundColor: color + '30' }]}>
          <View style={[styles.statBarFill, { backgroundColor: color, width: `${Math.min(value * 12, 100)}%` as any }]} />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

// ─── Report Card ──────────────────────────────────────────────────────────────
function ReportCard({ item, onDetail, onDelete, onComment }: {
  item: Report;
  onDetail: () => void;
  onDelete: () => void;
  onComment: () => void;
}) {
  const status = getStatus(item.status);
  const catColor = getCatColor(item.kategori);
  const slideAnim = useRef(new Animated.Value(24)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 11, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <TouchableOpacity onPress={onDetail} activeOpacity={0.92} style={styles.reportCard}>
        {/* Left accent bar */}
        <View style={[styles.rcAccent, { backgroundColor: catColor }]} />

        <View style={styles.rcContent}>
          {/* Top row */}
          <View style={styles.rcTopRow}>
            <View style={[styles.rcStatusPill, { backgroundColor: status.bg }]}>
              <View style={[styles.rcStatusDot, { backgroundColor: status.dot }]} />
              <Text style={[styles.rcStatusText, { color: status.color }]}>{status.label}</Text>
            </View>
            <Text style={styles.rcDate}>{formatDate(item.created_at)}</Text>
          </View>

          {/* Title */}
          <Text style={styles.rcTitle} numberOfLines={2}>{item.judul}</Text>

          {/* Category chip */}
          {item.kategori ? (
            <View style={[styles.rcCatChip, { backgroundColor: catColor + '18', borderColor: catColor + '40' }]}>
              <Text style={[styles.rcCatText, { color: catColor }]}>{item.kategori}</Text>
            </View>
          ) : null}

          {/* Excerpt */}
          <Text style={styles.rcIsi} numberOfLines={2}>{item.isi}</Text>

          {/* Footer */}
          <View style={styles.rcFooter}>
            {item.user?.name ? (
              <View style={styles.rcUserRow}>
                <LinearGradient colors={[catColor, catColor + 'AA']} style={styles.rcAvatar}>
                  <Text style={styles.rcAvatarText}>{item.user.name[0].toUpperCase()}</Text>
                </LinearGradient>
                <Text style={styles.rcUserName}>{item.user.name}</Text>
              </View>
            ) : <View />}

            {/* Action buttons */}
            <View style={styles.rcActions}>
              <TouchableOpacity style={styles.rcIconBtn} onPress={onComment} activeOpacity={0.7}>
                <Text style={styles.rcIconBtnText}>💬</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.rcIconBtn, styles.rcDeleteIconBtn]} onPress={onDelete} activeOpacity={0.7}>
                <Text style={styles.rcIconBtnText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ item, visible, onClose }: { item: Report | null; visible: boolean; onClose: () => void }) {
  if (!item) return null;
  const status = getStatus(item.status);
  const catColor = getCatColor(item.kategori);
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeaderRow}>
              <View style={[styles.rcStatusPill, { backgroundColor: status.bg }]}>
                <View style={[styles.rcStatusDot, { backgroundColor: status.dot }]} />
                <Text style={[styles.rcStatusText, { color: status.color }]}>{status.label}</Text>
              </View>
              {item.kategori ? (
                <View style={[styles.rcCatChip, { backgroundColor: catColor + '18', borderColor: catColor + '40' }]}>
                  <Text style={[styles.rcCatText, { color: catColor }]}>{item.kategori}</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.modalTitle}>{item.judul}</Text>

            <View style={styles.modalMetaRow}>
              <View style={styles.modalMetaItem}>
                <Text style={styles.modalMetaIcon}>📅</Text>
                <Text style={styles.modalMetaText}>{formatDate(item.created_at)}</Text>
              </View>
              {item.user?.name && (
                <View style={styles.modalMetaItem}>
                  <LinearGradient colors={[catColor, catColor + 'AA']} style={styles.modalAvatar}>
                    <Text style={styles.modalAvatarText}>{item.user.name[0].toUpperCase()}</Text>
                  </LinearGradient>
                  <Text style={styles.modalMetaText}>{item.user.name}</Text>
                </View>
              )}
            </View>

            <View style={styles.modalDivider} />

            <Text style={styles.modalSectionLabel}>ISI LAPORAN</Text>
            <Text style={styles.modalBody}>{item.isi}</Text>
          </ScrollView>

          <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose} activeOpacity={0.85}>
            <LinearGradient colors={['#6366F1', '#818CF8']} style={styles.modalCloseBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
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
            <View>
              <Text style={styles.cmTitle}>Komentar</Text>
              <Text style={styles.cmSubtitle} numberOfLines={1}>{item.judul}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.cmCloseBtn}>
              <Text style={styles.cmClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={comments}
            keyExtractor={c => c.id.toString()}
            style={{ maxHeight: 280 }}
            contentContainerStyle={{ paddingVertical: 8 }}
            renderItem={({ item: c }) => (
              <View style={[styles.cmBubble, c.user === 'Saya' && styles.cmBubbleMine]}>
                <Text style={[styles.cmUser, c.user === 'Saya' && styles.cmUserMine]}>{c.user}</Text>
                <Text style={styles.cmText}>{c.text}</Text>
                <Text style={styles.cmTime}>{c.time}</Text>
              </View>
            )}
          />
          <View style={styles.cmInputRow}>
            <TextInput
              style={styles.cmInput}
              placeholder="Tulis komentar..."
              placeholderTextColor="#94A3B8"
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity onPress={sendComment} activeOpacity={0.8}>
              <LinearGradient colors={['#6366F1', '#818CF8']} style={styles.cmSendGrad}>
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
  const items = [
    { icon: '👤', label: 'Profil Saya',       color: '#6366F1' },
    { icon: '🔔', label: 'Notifikasi',         color: '#F59E0B' },
    { icon: '🔒', label: 'Ubah Password',      color: '#10B981' },
    { icon: '📋', label: 'Syarat & Ketentuan', color: '#0EA5E9' },
    { icon: '❓', label: 'Bantuan',            color: '#EC4899' },
  ];
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.settingsTitle}>Pengaturan</Text>
          {items.map((s, i) => (
            <TouchableOpacity key={i} style={styles.settingsItem} onPress={onClose} activeOpacity={0.7}>
              <View style={[styles.settingsIconWrap, { backgroundColor: s.color + '18' }]}>
                <Text style={styles.settingsIconText}>{s.icon}</Text>
              </View>
              <Text style={styles.settingsLabel}>{s.label}</Text>
              <Text style={styles.settingsChevron}>›</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.modalDivider} />
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.85}>
            <Text style={styles.logoutText}>🚪  Keluar dari Akun</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.cancelText}>Batal</Text>
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
  const [commentItem, setCommentItem] = useState<Report | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showComment,  setShowComment]  = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current;

  // Marquee
  const marqueeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(marqueeAnim, { toValue: 1, duration: 14000, useNativeDriver: true })
    ).start();
  }, []);
  const marqueeX = marqueeAnim.interpolate({ inputRange: [0, 1], outputRange: [width, -width * 2.2] });

  useEffect(() => {
    AsyncStorage.getItem('userName').then(n => { if (n) setUserName(n); });
    Animated.timing(headerAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      const mapped = (Array.isArray(result) ? result : []).map((r: any) => ({
        ...r,
        judul:      r.title       || r.judul       || '(Tanpa judul)',
        isi:        r.description || r.isi         || '',
        kategori:   r.category_name || r.kategori  || '',
        created_at: r.createdAt   || r.created_at  || '',
        status:     r.status?.toLowerCase() || 'menunggu',
        user:       r.user_name ? { name: r.user_name } : r.user,
      }));
      setData(mapped);
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
            const res = await fetch(`${BASE_URL}/api/reports/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              setData(prev => prev.filter(r => r.id !== id));
            } else {
              Alert.alert('Error', 'Gagal menghapus laporan');
            }
          } catch { Alert.alert('Error', 'Gagal menghapus laporan'); }
        },
      },
    ]);
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['token', 'userRole', 'userName']);
    router.replace('/login');
  };

  const total     = data.length;
  const menunggu  = data.filter(r => !r.status || r.status.toLowerCase() === 'menunggu').length;
  const disetujui = data.filter(r => r.status?.toLowerCase() === 'disetujui').length;
  const ditolak   = data.filter(r => r.status?.toLowerCase() === 'ditolak').length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ── */}
      <LinearGradient
        colors={['#1E1B4B', '#312E81', '#4338CA']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative circles */}
        <View style={styles.headerCircle1} />
        <View style={styles.headerCircle2} />

        <Animated.View style={[styles.headerInner, { opacity: headerAnim }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerGreet}>Selamat datang kembali 👋</Text>
              <Text style={styles.headerName}>{userName || 'Pengguna'}</Text>
            </View>
            <TouchableOpacity style={styles.settingsBtn} onPress={() => setShowSettings(true)} activeOpacity={0.8}>
              <Text style={styles.settingsBtnText}>⚙️</Text>
            </TouchableOpacity>
          </View>

          {/* Summary pill */}
          <View style={styles.headerSummaryRow}>
            <View style={styles.headerSummaryPill}>
              <View style={styles.headerSummaryDot} />
              <Text style={styles.headerSummaryText}>{total} laporan aktif</Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* ── Ticker ── */}
      <View style={styles.ticker}>
        <Animated.Text style={[styles.tickerText, { transform: [{ translateX: marqueeX }] }]}>
          ● PANTAU STATUS  ·  RESPONS CEPAT  ·  TRANSPARANSI PENUH  ·  LAPORAN AKTIF  ·  PANTAU STATUS  ·  RESPONS CEPAT  ·  TRANSPARANSI PENUH  ·
        </Animated.Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={item => item.id.toString()}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} tintColor="#6366F1" />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* ── Stat Cards ── */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statsScrollContent}
              style={styles.statsRow}
            >
              <StatCard label="Total"     value={total}     color="#6366F1" icon="📊" />
              <StatCard label="Menunggu"  value={menunggu}  color="#F59E0B" icon="⏳" />
              <StatCard label="Disetujui" value={disetujui} color="#10B981" icon="✅" />
              <StatCard label="Ditolak"   value={ditolak}   color="#EF4444" icon="❌" />
            </ScrollView>

            {/* ── Section Header ── */}
            <View style={styles.sectionRow}>
              <View>
                <Text style={styles.sectionTitle}>Daftar Laporan</Text>
                <Text style={styles.sectionSub}>{total} laporan ditemukan</Text>
              </View>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => router.push('/screens/AddReportScreen')}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#6366F1', '#818CF8']}
                  style={styles.addBtnGrad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.addBtnText}>＋ Tambah</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {data.length === 0 && !loading && (
              <View style={styles.emptyState}>
                <LinearGradient colors={['#EEF2FF', '#E0E7FF']} style={styles.emptyIconWrap}>
                  <Text style={styles.emptyEmoji}>📭</Text>
                </LinearGradient>
                <Text style={styles.emptyText}>Belum ada laporan</Text>
                <Text style={styles.emptySubtext}>Ketuk tombol + Tambah untuk membuat laporan baru</Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <ReportCard
            item={item}
            onDetail={() => {
              router.push({
                pathname: '/detail',
                params: {
                  reportId: String(item.id),
                  item: JSON.stringify({
                    id:          item.id,
                    title:       item.judul,
                    description: item.isi,
                    category:    (item.kategori || '').toLowerCase(),
                    status:      (item.status   || 'pending').toLowerCase(),
                    createdAt:   item.created_at || item.createdAt || '',
                    author:      { name: item.user?.name || 'Anonim' },
                    images:      item.images || [],
                    
                    
                  }),
                },
              });
            }}
            onComment={() => { setCommentItem(item); setShowComment(true); }}
            onDelete={() => handleDelete(item.id)}
          />
        )}
      />

      {/* ── Modals ── */}
      <CommentModal item={commentItem} visible={showComment}  onClose={() => setShowComment(false)} />
      <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} onLogout={handleLogout} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    paddingTop: Platform.OS === 'ios' ? 58 : 38,
    paddingBottom: 24,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  headerCircle1: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -80, right: -60,
  },
  headerCircle2: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -40, left: 20,
  },
  headerInner: { zIndex: 1 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerGreet: { color: 'rgba(199,210,254,0.8)', fontSize: 12, letterSpacing: 0.4, marginBottom: 4 },
  headerName: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  settingsBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  settingsBtnText: { fontSize: 20 },
  headerSummaryRow: { marginTop: 16 },
  headerSummaryPill: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  headerSummaryDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#A5F3FC', marginRight: 6 },
  headerSummaryText: { color: '#E0E7FF', fontSize: 12, fontWeight: '600' },

  // ── Ticker ──────────────────────────────────────────────────────────────────
  ticker: {
    backgroundColor: '#1E1B4B',
    height: 32, justifyContent: 'center', overflow: 'hidden',
  },
  tickerText: {
    color: 'rgba(165,180,252,0.85)',
    fontSize: 10, fontWeight: '700', letterSpacing: 2,
    whiteSpace: 'nowrap',
  } as any,

  // ── Stats ───────────────────────────────────────────────────────────────────
  statsRow: { marginTop: 4 },
  statsScrollContent: { paddingHorizontal: 16, paddingVertical: 16, gap: 10 },
  statCard: {
    width: 128,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  statIconCircle: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  statIconText: { fontSize: 18 },
  statValue: { fontSize: 36, fontWeight: '900', lineHeight: 40, letterSpacing: -1 },
  statLabel: { fontSize: 11, color: '#64748B', fontWeight: '600', marginTop: 2, marginBottom: 10 },
  statBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
  statBarFill: { height: '100%', borderRadius: 2 },

  // ── Section ─────────────────────────────────────────────────────────────────
  listContent: { paddingBottom: 40 },
  sectionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', letterSpacing: -0.3 },
  sectionSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  addBtn: { borderRadius: 14, overflow: 'hidden' },
  addBtnGrad: { paddingHorizontal: 16, paddingVertical: 10 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // ── Empty ───────────────────────────────────────────────────────────────────
  emptyState: { alignItems: 'center', paddingVertical: 52, paddingHorizontal: 32 },
  emptyIconWrap: {
    width: 88, height: 88, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  emptySubtext: { fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 20 },

  // ── Report Card ─────────────────────────────────────────────────────────────
  reportCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16, marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 12,
    elevation: 3,
  },
  rcAccent: { width: 4 },
  rcContent: { flex: 1, padding: 16 },
  rcTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  rcStatusPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  rcStatusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  rcStatusText: { fontSize: 11, fontWeight: '700' },
  rcDate: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
  rcTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', lineHeight: 21, marginBottom: 8 },
  rcCatChip: {
    alignSelf: 'flex-start',
    borderRadius: 8, borderWidth: 1,
    paddingHorizontal: 8, paddingVertical: 3,
    marginBottom: 8,
  },
  rcCatText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  rcIsi: { fontSize: 13, color: '#64748B', lineHeight: 19, marginBottom: 12 },
  rcFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rcUserRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rcAvatar: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rcAvatarText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  rcUserName: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  rcActions: { flexDirection: 'row', gap: 6 },
  rcIconBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center', justifyContent: 'center',
  },
  rcDeleteIconBtn: { backgroundColor: '#FEF2F2' },
  rcIconBtnText: { fontSize: 15 },

  // ── Modal Base ──────────────────────────────────────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.55)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, maxHeight: '88%',
  },
  modalHandle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0',
    alignSelf: 'center', marginBottom: 24,
  },

  // ── Detail Modal ─────────────────────────────────────────────────────────────
  modalHeaderRow: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A', lineHeight: 30, marginBottom: 14 },
  modalMetaRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap', marginBottom: 4 },
  modalMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  modalMetaIcon: { fontSize: 14 },
  modalMetaText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  modalAvatar: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  modalAvatarText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  modalDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 18 },
  modalSectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, color: '#94A3B8', marginBottom: 10 },
  modalBody: { fontSize: 15, color: '#334155', lineHeight: 26 },
  modalCloseBtn: { marginTop: 24, borderRadius: 16, overflow: 'hidden' },
  modalCloseBtnGrad: { paddingVertical: 16, alignItems: 'center' },
  modalCloseBtnText: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 0.2 },

  // ── Comment Modal ────────────────────────────────────────────────────────────
  cmHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cmTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  cmSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 3 },
  cmCloseBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
  },
  cmClose: { fontSize: 14, color: '#64748B', fontWeight: '700' },
  cmBubble: {
    backgroundColor: '#F8FAFC', borderRadius: 16, borderTopLeftRadius: 4,
    padding: 12, marginBottom: 8, maxWidth: '78%',
    alignSelf: 'flex-start',
  },
  cmBubbleMine: {
    backgroundColor: '#EEF2FF', alignSelf: 'flex-end',
    borderTopLeftRadius: 16, borderTopRightRadius: 4,
  },
  cmUser: { fontSize: 10, fontWeight: '700', color: '#94A3B8', marginBottom: 3 },
  cmUserMine: { color: '#6366F1' },
  cmText: { fontSize: 14, color: '#1E293B', lineHeight: 20 },
  cmTime: { fontSize: 10, color: '#CBD5E1', marginTop: 4, textAlign: 'right' },
  cmInputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingTop: 14, paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopWidth: 1, borderTopColor: '#F1F5F9', marginTop: 8,
  },
  cmInput: {
    flex: 1,
    borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, color: '#1E293B', maxHeight: 100,
    backgroundColor: '#F8FAFC',
  },
  cmSendGrad: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cmSendText: { fontSize: 18, color: '#fff' },

  // ── Settings Modal ───────────────────────────────────────────────────────────
  settingsTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 20 },
  settingsItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
  },
  settingsIconWrap: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  settingsIconText: { fontSize: 18 },
  settingsLabel: { flex: 1, fontSize: 15, color: '#1E293B', fontWeight: '600' },
  settingsChevron: { fontSize: 22, color: '#CBD5E1' },
  logoutBtn: {
    marginTop: 8, paddingVertical: 15,
    alignItems: 'center', borderRadius: 16,
    backgroundColor: '#FEF2F2',
  },
  logoutText: { color: '#EF4444', fontWeight: '800', fontSize: 15 },
  cancelBtn: {
    marginTop: 10, paddingVertical: 14,
    alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 16,
  },
  cancelText: { color: '#94A3B8', fontWeight: '700', fontSize: 15 },
});