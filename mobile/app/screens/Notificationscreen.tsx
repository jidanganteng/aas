import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Platform, StatusBar, Animated, RefreshControl, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { BASE_URL } from '../../src/api/index';

// ─── Types ────────────────────────────────────────────────────────────────────
type NotifType = 'info' | 'success' | 'warning' | 'danger';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotifType;
  is_read: boolean;
  created_at: string;
  report_id?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TYPE_MAP: Record<NotifType, { icon: string; color: string; bg: string }> = {
  info:    { icon: 'ℹ️',  color: '#0EA5E9', bg: 'rgba(14,165,233,0.12)' },
  success: { icon: '✅',  color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  warning: { icon: '⚠️',  color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  danger:  { icon: '❌',  color: '#EF4444', bg: 'rgba(239,68,68,0.12)'  },
};
const getType = (t?: string) =>
  TYPE_MAP[(t as NotifType) ?? 'info'] ?? TYPE_MAP.info;

const formatRelative = (d?: string) => {
  if (!d) return '—';
  const diff = Date.now() - new Date(d).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'Baru saja';
  if (mins  < 60) return `${mins} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days  < 7)  return `${days} hari lalu`;
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
};

// ─── Notification Item ────────────────────────────────────────────────────────
function NotifItem({ item, onRead, onDelete }: {
  item: Notification;
  onRead: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const t        = getType(item.type);
  const slideAnim = useRef(new Animated.Value(30)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const deleteAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 12, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleDelete = () => {
    Animated.parallel([
      Animated.timing(fadeAnim,   { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(deleteAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => onDelete(item.id));
  };

  return (
    <Animated.View style={[
      { opacity: fadeAnim, transform: [{ translateX: slideAnim }, { scaleY: deleteAnim }] }
    ]}>
      <TouchableOpacity
        style={[styles.notifCard, !item.is_read && styles.notifCardUnread]}
        onPress={() => onRead(item.id)}
        activeOpacity={0.85}
      >
        {/* Unread dot */}
        {!item.is_read && <View style={styles.unreadDot} />}

        {/* Icon */}
        <View style={[styles.notifIconWrap, { backgroundColor: t.bg }]}>
          <Text style={styles.notifIcon}>{t.icon}</Text>
        </View>

        {/* Content */}
        <View style={styles.notifContent}>
          <View style={styles.notifTopRow}>
            <Text style={[styles.notifTitle, !item.is_read && styles.notifTitleBold]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.notifTime}>{formatRelative(item.created_at)}</Text>
          </View>
          <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
          <View style={[styles.notifTypePill, { backgroundColor: t.bg }]}>
            <Text style={[styles.notifTypeText, { color: t.color }]}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </Text>
          </View>
        </View>

        {/* Delete btn */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.7}>
          <Text style={styles.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Filter Tab ───────────────────────────────────────────────────────────────
function FilterTab({ label, active, onPress, count }: {
  label: string; active: boolean; onPress: () => void; count?: number;
}) {
  return (
    <TouchableOpacity style={[styles.filterTab, active && styles.filterTabActive]} onPress={onPress} activeOpacity={0.8}>
      {active ? (
        <LinearGradient colors={['#6366F1', '#818CF8'] as const} style={styles.filterTabGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Text style={[styles.filterTabText, styles.filterTabTextActive]}>{label}</Text>
          {count !== undefined && count > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{count > 99 ? '99+' : count}</Text>
            </View>
          )}
        </LinearGradient>
      ) : (
        <View style={styles.filterTabGrad}>
          <Text style={styles.filterTabText}>{label}</Text>
          {count !== undefined && count > 0 && (
            <View style={[styles.filterBadge, styles.filterBadgeInactive]}>
              <Text style={[styles.filterBadgeText, { color: '#6366F1' }]}>{count}</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ filter }: { filter: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[styles.emptyWrap, { opacity: anim, transform: [{ scale: anim }] }]}>
      <LinearGradient colors={['#EEF2FF', '#E0E7FF'] as const} style={styles.emptyIconWrap}>
        <Text style={styles.emptyEmoji}>🔔</Text>
      </LinearGradient>
      <Text style={styles.emptyTitle}>Tidak ada notifikasi</Text>
      <Text style={styles.emptySubtitle}>
        {filter === 'unread'
          ? 'Semua notifikasi sudah dibaca'
          : 'Belum ada notifikasi yang masuk'}
      </Text>
    </Animated.View>
  );
}

// ─── Dummy fallback data ──────────────────────────────────────────────────────
const DUMMY_NOTIFICATIONS: Notification[] = [
  {
    id: 1, title: 'Laporan Disetujui', type: 'success', is_read: false,
    message: 'Laporan Anda "Jalan Berlubang di Gang Mawar" telah disetujui oleh admin.',
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 2, title: 'Komentar Baru', type: 'info', is_read: false,
    message: 'Admin menambahkan komentar pada laporan Anda: "Sedang dalam penanganan."',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 3, title: 'Laporan Ditolak', type: 'danger', is_read: true,
    message: 'Laporan Anda "Lampu Jalan Mati" ditolak karena duplikasi data.',
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: 4, title: 'Status Diperbarui', type: 'warning', is_read: true,
    message: 'Status laporan Anda berubah menjadi "Sedang Ditinjau".',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 5, title: 'Laporan Baru Terkirim', type: 'info', is_read: true,
    message: 'Laporan Anda berhasil dikirim dan menunggu persetujuan.',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
];

// ─── Main NotificationScreen ──────────────────────────────────────────────────
export default function NotificationScreen() {
  const router = useRouter();
  const [notifs,   setNotifs]   = useState<Notification[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [filter,   setFilter]   = useState<'all' | 'unread'>('all');

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    fetchNotifications();
  }, []);

  useFocusEffect(useCallback(() => { fetchNotifications(); }, []));

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const mapped: Notification[] = (Array.isArray(data) ? data : []).map((n: any) => ({
        id:         n.id,
        title:      n.title   || 'Notifikasi',
        message:    n.message || n.body || '',
        type:       (n.type   || 'info') as NotifType,
        is_read:    !!n.is_read,
        created_at: n.created_at || n.createdAt || new Date().toISOString(),
        report_id:  n.report_id,
      }));
      setNotifs(mapped.length > 0 ? mapped : DUMMY_NOTIFICATIONS);
    } catch {
      setNotifs(DUMMY_NOTIFICATIONS);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: number) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`${BASE_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
  };

  const markAllRead = async () => {
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`${BASE_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
  };

  const deleteNotif = (id: number) => {
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    Alert.alert('Hapus Semua', 'Hapus semua notifikasi?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => setNotifs([]) },
    ]);
  };

  const displayed  = filter === 'unread' ? notifs.filter(n => !n.is_read) : notifs;
  const unreadCount = notifs.filter(n => !n.is_read).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ── */}
      <LinearGradient
        colors={['#1E1B4B', '#312E81', '#4338CA'] as const}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerCircle1} />
        <View style={styles.headerCircle2} />

        <Animated.View style={[styles.headerInner, { opacity: headerAnim }]}>
          {/* Top row */}
          <View style={styles.headerTopRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
              <Text style={styles.backBtnText}>‹</Text>
            </TouchableOpacity>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerTitle}>Notifikasi</Text>
              {unreadCount > 0 && (
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            {notifs.length > 0 && (
              <TouchableOpacity style={styles.clearBtn} onPress={clearAll} activeOpacity={0.8}>
                <Text style={styles.clearBtnText}>🗑️</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Quick actions */}
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn} activeOpacity={0.8}>
              <View style={styles.markAllPill}>
                <Text style={styles.markAllText}>✓ Tandai semua dibaca</Text>
              </View>
            </TouchableOpacity>
          )}
        </Animated.View>
      </LinearGradient>

      {/* ── Filter tabs ── */}
      <View style={styles.filterRow}>
        <FilterTab label="Semua"       active={filter === 'all'}    onPress={() => setFilter('all')}    count={notifs.length} />
        <FilterTab label="Belum Dibaca" active={filter === 'unread'} onPress={() => setFilter('unread')} count={unreadCount} />
      </View>

      {/* ── List ── */}
      <FlatList
        data={displayed}
        keyExtractor={item => item.id.toString()}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchNotifications} tintColor="#6366F1" />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState filter={filter} />}
        renderItem={({ item }) => (
          <NotifItem
            item={item}
            onRead={markRead}
            onDelete={deleteNotif}
          />
        )}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: 20,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  headerCircle1: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.05)', top: -80, right: -60,
  },
  headerCircle2: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.04)', bottom: -40, left: 20,
  },
  headerInner: { zIndex: 1 },
  headerTopRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  backBtnText: { color: '#fff', fontSize: 24, fontWeight: '700', lineHeight: 28 },
  headerTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  headerBadge: {
    backgroundColor: '#EF4444', borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  headerBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  clearBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  clearBtnText: { fontSize: 18 },
  markAllBtn: { marginTop: 14, alignSelf: 'flex-start' },
  markAllPill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  markAllText: { color: '#E0E7FF', fontSize: 12, fontWeight: '600' },

  // Filter tabs
  filterRow: {
    flexDirection: 'row', padding: 12, gap: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  filterTab: { flex: 1, borderRadius: 12, overflow: 'hidden', borderWidth: 1.5, borderColor: '#E2E8F0' },
  filterTabActive: { borderColor: 'transparent' },
  filterTabGrad: {
    paddingVertical: 9, paddingHorizontal: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  filterTabText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  filterTabTextActive: { color: '#fff' },
  filterBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 1,
    minWidth: 20, alignItems: 'center',
  },
  filterBadgeInactive: { backgroundColor: '#EEF2FF' },
  filterBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },

  // List
  listContent: { padding: 12, paddingBottom: 40, gap: 10 },

  // Notification card
  notifCard: {
    backgroundColor: '#fff', borderRadius: 18,
    flexDirection: 'row', alignItems: 'flex-start',
    padding: 14, gap: 12,
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
  },
  notifCardUnread: {
    borderLeftWidth: 3, borderLeftColor: '#6366F1',
    backgroundColor: '#FAFBFF',
  },
  unreadDot: {
    position: 'absolute', top: 14, right: 14,
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#6366F1',
  },
  notifIconWrap: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  notifIcon: { fontSize: 22 },
  notifContent: { flex: 1 },
  notifTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  notifTitle: { fontSize: 14, color: '#334155', fontWeight: '600', flex: 1, marginRight: 8 },
  notifTitleBold: { color: '#0F172A', fontWeight: '800' },
  notifTime: { fontSize: 11, color: '#94A3B8', flexShrink: 0 },
  notifMessage: { fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 8 },
  notifTypePill: {
    alignSelf: 'flex-start', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  notifTypeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  deleteBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginTop: 2,
  },
  deleteBtnText: { fontSize: 11, color: '#EF4444', fontWeight: '700' },

  // Empty
  emptyWrap: { alignItems: 'center', paddingVertical: 64, paddingHorizontal: 32 },
  emptyIconWrap: {
    width: 88, height: 88, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 20 },
});