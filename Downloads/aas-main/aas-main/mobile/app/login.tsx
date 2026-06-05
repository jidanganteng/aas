import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const router = useRouter();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const blob1Anim = useRef(new Animated.Value(0)).current;
  const blob2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();

    // Blob floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(blob1Anim, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(blob1Anim, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(blob2Anim, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(blob2Anim, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const blob1Y = blob1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const blob2Y = blob2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 14] });

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email dan password harus diisi');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://10.2.10.245:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password: password.trim() }),
      });

      const data = await response.json();
      console.log('LOGIN RESPONSE:', data);

      if (!response.ok) {
        Alert.alert('Login Gagal', data.message || 'Email atau password salah');
        return;
      }

      if (!data.token || !data.user) {
        Alert.alert('Error', 'Data login tidak valid dari server');
        return;
      }

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('userRole', data.user.role);

      Alert.alert('Sukses', `Selamat datang ${data.user.name}`);
      router.replace('/screens/HomeScreen');
    } catch (error: any) {
      console.log('LOGIN ERROR:', error);
      Alert.alert('Error', 'Tidak dapat terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.gradient}>

        {/* Floating blobs */}
        <Animated.View style={[styles.blob1, { transform: [{ translateY: blob1Y }] }]} />
        <Animated.View style={[styles.blob2, { transform: [{ translateY: blob2Y }] }]} />

        <Animated.View
          style={[
            styles.innerContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Logo / Header */}
          <Animated.View style={[styles.logoWrap, { transform: [{ scale: logoScale }] }]}>
            <LinearGradient colors={['#f7971e', '#ffd200']} style={styles.logoCircle}>
              <Text style={styles.logoIcon}>📣</Text>
            </LinearGradient>
          </Animated.View>

          <Text style={styles.title}>Selamat Datang</Text>
          <Text style={styles.subtitle}>Masuk ke Aplikasi Pengaduan</Text>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="nama@email.com"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>

            <Text style={styles.inputLabel}>Password</Text>
            <View style={[styles.inputWrapper, passFocused && styles.inputWrapperFocused]}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
              <LinearGradient colors={['#f7971e', '#ffd200']} style={styles.buttonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {loading
                  ? <ActivityIndicator color="#1a1a2e" />
                  : <Text style={styles.buttonText}>Masuk →</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.registerLink} onPress={() => router.push('/register')}>
            <Text style={styles.registerText}>
              Belum punya akun?{' '}
              <Text style={styles.registerHighlight}>Daftar sekarang</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },

  blob1: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(247,151,30,0.18)',
    top: -60,
    right: -60,
  },
  blob2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,210,0,0.12)',
    bottom: 80,
    left: -70,
  },

  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  logoWrap: { alignItems: 'center', marginBottom: 20 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ffd200',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  logoIcon: { fontSize: 32 },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 28,
    letterSpacing: 0.3,
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  inputLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 4,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14,
    marginBottom: 18,
    height: 52,
  },
  inputWrapperFocused: {
    borderColor: '#ffd200',
    backgroundColor: 'rgba(255,210,0,0.06)',
  },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
  },

  button: {
    borderRadius: 14,
    marginTop: 6,
    overflow: 'hidden',
    shadowColor: '#ffd200',
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
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  registerLink: { marginTop: 24, alignItems: 'center' },
  registerText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  registerHighlight: { color: '#ffd200', fontWeight: '700' },
});