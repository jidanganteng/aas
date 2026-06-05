import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type FieldName = 'name' | 'email' | 'password' | 'confirmPassword';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<FieldName | null>(null);
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const blob1Anim = useRef(new Animated.Value(0)).current;
  const blob2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(blob1Anim, { toValue: 1, duration: 3500, useNativeDriver: true }),
        Animated.timing(blob1Anim, { toValue: 0, duration: 3500, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(blob2Anim, { toValue: 1, duration: 4500, useNativeDriver: true }),
        Animated.timing(blob2Anim, { toValue: 0, duration: 4500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const blob1Y = blob1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });
  const blob2Y = blob2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 16] });

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Semua field harus diisi');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Password dan konfirmasi password tidak cocok');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://10.2.10.245:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
        }),
      });

      const data = await response.json();
      console.log('REGISTER RESPONSE:', data);

      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('userRole', data.user.role);
        Alert.alert('Sukses', 'Pendaftaran berhasil!');
        router.replace('/login');
      } else {
        Alert.alert('Gagal', data.message || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Tidak dapat terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  const fields: { key: FieldName; label: string; icon: string; placeholder: string; secure?: boolean; keyboard?: any }[] = [
    { key: 'name', label: 'Nama Lengkap', icon: '👤', placeholder: 'Masukkan nama kamu' },
    { key: 'email', label: 'Email', icon: '✉️', placeholder: 'nama@email.com', keyboard: 'email-address' },
    { key: 'password', label: 'Password', icon: '🔒', placeholder: '••••••••', secure: true },
    { key: 'confirmPassword', label: 'Konfirmasi Password', icon: '🛡️', placeholder: '••••••••', secure: true },
  ];

  const values: Record<FieldName, string> = { name, email, password, confirmPassword };
  const setters: Record<FieldName, (v: string) => void> = {
    name: setName,
    email: setEmail,
    password: setPassword,
    confirmPassword: setConfirmPassword,
  };

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.gradient}>
      {/* Blobs */}
      <Animated.View style={[styles.blob1, { transform: [{ translateY: blob1Y }] }]} />
      <Animated.View style={[styles.blob2, { transform: [{ translateY: blob2Y }] }]} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>← Kembali</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.headerWrap}>
            <LinearGradient colors={['#43e97b', '#38f9d7']} style={styles.logoCircle}>
              <Text style={styles.logoIcon}>✍️</Text>
            </LinearGradient>
            <Text style={styles.title}>Buat Akun Baru</Text>
            <Text style={styles.subtitle}>Daftarkan diri untuk melaporkan pengaduan</Text>
          </View>

          {/* Step indicator */}
          <View style={styles.stepRow}>
            {[1, 2, 3].map((s) => (
              <View key={s} style={[styles.stepDot, s === 1 && styles.stepDotActive]} />
            ))}
          </View>

          {/* Card */}
          <View style={styles.card}>
            {fields.map((field) => (
              <View key={field.key}>
                <Text style={styles.inputLabel}>{field.label}</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focused === field.key && styles.inputWrapperFocused,
                  ]}
                >
                  <Text style={styles.inputIcon}>{field.icon}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={field.placeholder}
                    placeholderTextColor="#777"
                    value={values[field.key]}
                    onChangeText={setters[field.key]}
                    secureTextEntry={field.secure}
                    keyboardType={field.keyboard || 'default'}
                    autoCapitalize={field.key === 'name' ? 'words' : 'none'}
                    onFocus={() => setFocused(field.key)}
                    onBlur={() => setFocused(null)}
                  />
                </View>
              </View>
            ))}

            {/* Password hint */}
            <View style={styles.hintRow}>
              <Text style={styles.hintDot}>•</Text>
              <Text style={styles.hintText}>Password minimal 6 karakter</Text>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#43e97b', '#38f9d7']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading
                  ? <ActivityIndicator color="#0f0c29" />
                  : <Text style={styles.buttonText}>Daftar Sekarang →</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/login')} style={styles.linkContainer}>
            <Text style={styles.linkText}>
              Sudah punya akun?{' '}
              <Text style={styles.linkHighlight}>Masuk di sini</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },

  blob1: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(67,233,123,0.14)',
    top: -40,
    left: -60,
  },
  blob2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(56,249,215,0.10)',
    bottom: 60,
    right: -60,
  },

  container: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },

  backBtn: { marginBottom: 20 },
  backText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '600' },

  headerWrap: { alignItems: 'center', marginBottom: 20 },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#43e97b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
  },
  logoIcon: { fontSize: 30 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 6,
    textAlign: 'center',
  },

  stepRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  stepDotActive: { backgroundColor: '#43e97b', width: 24 },

  card: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  inputLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    marginLeft: 4,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14,
    marginBottom: 16,
    height: 50,
  },
  inputWrapperFocused: {
    borderColor: '#43e97b',
    backgroundColor: 'rgba(67,233,123,0.06)',
  },
  inputIcon: { fontSize: 15, marginRight: 10 },
  input: { flex: 1, color: '#fff', fontSize: 15 },

  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginLeft: 4,
    gap: 6,
  },
  hintDot: { color: '#43e97b', fontSize: 18, lineHeight: 18 },
  hintText: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },

  button: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#43e97b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#0f0c29',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  linkContainer: { marginTop: 24, alignItems: 'center' },
  linkText: { color: 'rgba(255,255,255,0.45)', fontSize: 14 },
  linkHighlight: { color: '#43e97b', fontWeight: '700' },
});