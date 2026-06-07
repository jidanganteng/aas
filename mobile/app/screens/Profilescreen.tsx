import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, StatusBar, Animated, Alert, Modal, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { BASE_URL } from '../../src/api/index';

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  role?: string;
  totalReports?: number;
  approvedReports?: number;
  pendingReports?: number;
  rejectedReports?: number;
  joinDate?: string;
  avatar?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (d?: string) => {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
};

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const ACCENT_COLORS = ['#6366F1', '#818CF8'] as const;

// ─── Edit Profile Modal ───────────────────────────────────────────────────────
function EditProfileModal({
  visible,
  profile,
  onClose,
  onSave,
}: {
  visible: boolean;
  profile: UserProfile | null;
  onClose: () => void;
  onSave: (updated: Partial<UserProfile>) => void;
}) {
  const [name, setName]   = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Perhatian', 'Nama tidak boleh kosong');
      return;
    }
    onSave({ name: name.trim(), phone: phone.trim() });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Edit Profil</Text>

          <Text style={styles.inputLabel}>Nama Lengkap</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Masukkan nama lengkap"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.inputLabel}>Nomor Telepon</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Masukkan nomor telepon"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
          />

          <View style={styles.modalBtnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelBtnText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
              <LinearGradient
                colors={['#6366F1', '#818CF8'] as const}
                style={styles.saveBtnGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.saveBtnText}>Simpan</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Change Password Modal ────────────────────────────────────────────────────
function ChangePasswordModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [oldPw, setOldPw]     = useState('');
  const [newPw, setNewPw]     = useState('');
  const [confirmPw, setConfirm] = useState('');

  const handleChange = () => {
    if (!oldPw || !newPw || !confirmPw) {
      Alert.alert('Perhatian', 'Semua kolom harus diisi');
      return;
    }
    if (newPw !== confirmPw) {
      Alert.alert('Perhatian', 'Password baru tidak cocok');
      return;
    }
    if (newPw.length < 6) {
      Alert.alert('Perhatian', 'Password minimal 6 karakter');
      return;
    }
    Alert.alert('Berhasil', 'Password berhasil diubah');
    setOldPw(''); setNewPw(''); setConfirm('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Ubah Password</Text>

          {[
            { label: 'Password Lama',    value: oldPw,    setter: setOldPw },
            { label: 'Password Baru',    value: newPw,    setter: setNewPw },
            { label: 'Konfirmasi Baru',  value: confirmPw, setter: setConfirm },
          ].map(({ label, value, setter }) => (
            <View key={label}>
              <Text style={styles.inputLabel}>{label}</Text>
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={setter}
                placeholder={`Masukkan ${label.toLowerCase()}`}
                placeholderTextColor="#94A3B8"
                secureTextEntry
              />
            </View>
          ))}

          <View style={styles.modalBtnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelBtnText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleChange} activeOpacity={0.85}>
              <LinearGradient colors={['#6366F1', '#818CF8'] as const} style={styles.saveBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.saveBtnText}>Ubah</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Stat Item ────────────────────────────────────────────────────────────────
function StatItem({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, tension: 55, friction: 8, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[styles.statItem, { opacity: anim, transform: [{ scale: anim }] }]}>
      <View style={[styles.statIconWrap, { backgroundColor: color + '18' }]}>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

// ─── Menu Row ─────────────────────────────────────────────────────────────────
function MenuRow({ icon, label, color, onPress, danger }: {
  icon: string; label: string; color: string; onPress: () => void; danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.menuIconWrap, { backgroundColor: color + '18' }]}>
        <Text style={styles.menuIcon}>{icon}</Text>
      </View>
      <Text style={[styles.menuLabel, danger && { color: '#EF4444' }]}>{label}</Text>
      <Text style={[styles.menuChevron, danger && { color: '#EF4444' }]}>›</Text>
    </TouchableOpacity>
  );
}

// ─── Main ProfileScreen ───────────────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit]   = useState(false);
  const [showPw,   setShowPw]     = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const avatarAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(avatarAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
    ]).start();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const mapped: UserProfile = {
        name:            data.name         || data.user_name || 'Pengguna',
        email:           data.email        || '—',
        phone:           data.phone        || data.no_hp     || '',
        role:            data.role         || 'User',
        totalReports:    data.total_reports    ?? data.totalReports    ?? 0,
        approvedReports: data.approved_reports ?? data.approvedReports ?? 0,
        pendingReports:  data.pending_reports  ?? data.pendingReports  ?? 0,
        rejectedReports: data.rejected_reports ?? data.rejectedReports ?? 0,
        joinDate:        data.created_at   || data.joinDate  || '',
      };
      setProfile(mapped);
      await AsyncStorage.setItem('userName', mapped.name);
    } catch (err) {
      // Fallback: load from storage
      const name = await AsyncStorage.getItem('userName');
      setProfile({
        name: name || 'Pengguna',
        email: '—',
        totalReports: 0,
        approvedReports: 0,
        pendingReports: 0,
        rejectedReports: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (updated: Partial<UserProfile>) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`${BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updated),
      });
      setProfile(prev => prev ? { ...prev, ...updated } : prev);
      if (updated.name) await AsyncStorage.setItem('userName', updated.name);
      Alert.alert('Berhasil', 'Profil berhasil diperbarui');
    } catch {
      Alert.alert('Error', 'Gagal memperbarui profil');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Keluar', 'Yakin ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar', style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['token', 'userRole', 'userName']);
          router.replace('/login');
        },
      },
    ]);
  };

  const p = profile;
  const initials = p?.name ? getInitials(p.name) : '?';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── Header Gradient ── */}
      <LinearGradient
        colors={['#1E1B4B', '#312E81', '#4338CA'] as const}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerCircle1} />
        <View style={styles.headerCircle2} />

        <Animated.View style={[styles.headerInner, { opacity: headerAnim }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profil Saya</Text>
          <TouchableOpacity style={styles.editHeaderBtn} onPress={() => setShowEdit(true)} activeOpacity={0.8}>
            <Text style={styles.editHeaderBtnText}>✏️</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Avatar */}
        <Animated.View style={[styles.avatarWrap, { transform: [{ scale: avatarAnim }] }]}>
          <LinearGradient colors={ACCENT_COLORS} style={styles.avatarGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
          <View style={styles.avatarOnline} />
        </Animated.View>

        <Animated.View style={[styles.profileNameWrap, { opacity: headerAnim }]}>
          <Text style={styles.profileName}>{p?.name || '…'}</Text>
          <View style={styles.rolePill}>
            <Text style={styles.roleText}>{p?.role || 'User'}</Text>
          </View>
          <Text style={styles.profileEmail}>{p?.email || '—'}</Text>
          {p?.joinDate ? (
            <Text style={styles.joinDate}>📅 Bergabung {formatDate(p.joinDate)}</Text>
          ) : null}
        </Animated.View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Stats ── */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionLabel}>STATISTIK LAPORAN</Text>
          <View style={styles.statsGrid}>
            <StatItem label="Total"     value={p?.totalReports    ?? 0} color="#6366F1" icon="📊" />
            <StatItem label="Menunggu"  value={p?.pendingReports  ?? 0} color="#F59E0B" icon="⏳" />
            <StatItem label="Disetujui" value={p?.approvedReports ?? 0} color="#10B981" icon="✅" />
            <StatItem label="Ditolak"   value={p?.rejectedReports ?? 0} color="#EF4444" icon="❌" />
          </View>
        </View>

        {/* ── Info ── */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionLabel}>INFORMASI AKUN</Text>
          {[
            { icon: '👤', label: 'Nama',     value: p?.name  || '—' },
            { icon: '📧', label: 'Email',    value: p?.email || '—' },
            { icon: '📱', label: 'Telepon',  value: p?.phone || '—' },
            { icon: '🎭', label: 'Peran',    value: p?.role  || '—' },
          ].map(({ icon, label, value }) => (
            <View key={label} style={styles.infoRow}>
              <View style={styles.infoIconWrap}>
                <Text style={styles.infoIcon}>{icon}</Text>
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Menu ── */}
        <View style={styles.menuCard}>
          <Text style={styles.sectionLabel}>PENGATURAN</Text>
          <MenuRow icon="✏️"  label="Edit Profil"      color="#6366F1" onPress={() => setShowEdit(true)} />
          <MenuRow icon="🔒"  label="Ubah Password"    color="#10B981" onPress={() => setShowPw(true)} />
          <MenuRow icon="🔔"  label="Notifikasi"       color="#F59E0B" onPress={() => router.push('/screens/NotificationScreen' as any)} />
          <MenuRow icon="📋"  label="Syarat & Ketentuan" color="#0EA5E9" onPress={() => {}} />
          <MenuRow icon="❓"  label="Bantuan"          color="#EC4899" onPress={() => {}} />
          <View style={styles.menuDivider} />
          <MenuRow icon="🚪"  label="Keluar dari Akun" color="#EF4444" onPress={handleLogout} danger />
        </View>

        {/* ── App version ── */}
        <Text style={styles.version}>Versi 1.0.0 · © 2025 LaporIn</Text>

      </ScrollView>

      <EditProfileModal
        visible={showEdit}
        profile={profile}
        onClose={() => setShowEdit(false)}
        onSave={handleSaveProfile}
      />
      <ChangePasswordModal visible={showPw} onClose={() => setShowPw(false)} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: 32,
    paddingHorizontal: 20,
    overflow: 'hidden',
    alignItems: 'center',
  },
  headerCircle1: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.05)', top: -80, right: -60,
  },
  headerCircle2: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.04)', bottom: -40, left: 20,
  },
  headerInner: {
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  backBtnText: { color: '#fff', fontSize: 24, fontWeight: '700', lineHeight: 28 },
  editHeaderBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  editHeaderBtnText: { fontSize: 18 },

  // Avatar
  avatarWrap: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 20, elevation: 10,
  },
  avatarGrad: { flex: 1, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 34, fontWeight: '900' },
  avatarOnline: {
    position: 'absolute', width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#10B981', borderWidth: 3, borderColor: '#312E81',
    bottom: 2, right: 2,
  },

  profileNameWrap: { alignItems: 'center', marginTop: 14, width: '100%' },
  profileName: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  rolePill: {
    marginTop: 6, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  roleText: { color: '#E0E7FF', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  profileEmail: { color: 'rgba(199,210,254,0.8)', fontSize: 13, marginTop: 6 },
  joinDate: { color: 'rgba(199,210,254,0.65)', fontSize: 11, marginTop: 4 },

  // Scroll
  scrollContent: { paddingBottom: 40, gap: 12, paddingTop: 16 },

  // Section label
  sectionLabel: {
    fontSize: 10, fontWeight: '800', letterSpacing: 1.5,
    color: '#94A3B8', marginBottom: 14,
  },

  // Stats card
  statsCard: {
    backgroundColor: '#fff', marginHorizontal: 16,
    borderRadius: 20, padding: 18,
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center', flex: 1 },
  statIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  statIcon: { fontSize: 18 },
  statValue: { fontSize: 24, fontWeight: '900', lineHeight: 28 },
  statLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '600', marginTop: 2 },

  // Info card
  infoCard: {
    backgroundColor: '#fff', marginHorizontal: 16,
    borderRadius: 20, padding: 18,
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  infoIconWrap: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center',
  },
  infoIcon: { fontSize: 17 },
  infoTextWrap: { flex: 1, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 10 },
  infoLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 14, color: '#1E293B', fontWeight: '600' },

  // Menu card
  menuCard: {
    backgroundColor: '#fff', marginHorizontal: 16,
    borderRadius: 20, padding: 18,
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  menuIconWrap: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  menuIcon: { fontSize: 18 },
  menuLabel: { flex: 1, fontSize: 15, color: '#1E293B', fontWeight: '600' },
  menuChevron: { fontSize: 22, color: '#CBD5E1' },
  menuDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 4 },

  // Version
  version: { textAlign: 'center', fontSize: 12, color: '#CBD5E1', marginTop: 8 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.55)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHandle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0',
    alignSelf: 'center', marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 20 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 6, letterSpacing: 0.4 },
  input: {
    borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#1E293B', marginBottom: 16,
    backgroundColor: '#F8FAFC',
  },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    backgroundColor: '#F8FAFC', alignItems: 'center',
  },
  cancelBtnText: { color: '#94A3B8', fontWeight: '700', fontSize: 15 },
  saveBtn: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  saveBtnGrad: { paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});