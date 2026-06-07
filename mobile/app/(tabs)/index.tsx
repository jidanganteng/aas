import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  // Core animations
  const logoScale    = useRef(new Animated.Value(0)).current;
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const textOpacity  = useRef(new Animated.Value(0)).current;
  const textSlide    = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const ringScale1   = useRef(new Animated.Value(0.4)).current;
  const ringOpacity1 = useRef(new Animated.Value(0)).current;
  const ringScale2   = useRef(new Animated.Value(0.4)).current;
  const ringOpacity2 = useRef(new Animated.Value(0)).current;
  const ringScale3   = useRef(new Animated.Value(0.4)).current;
  const ringOpacity3 = useRef(new Animated.Value(0)).current;

  // Blob floats
  const blob1Y = useRef(new Animated.Value(0)).current;
  const blob2Y = useRef(new Animated.Value(0)).current;
  const blob3Y = useRef(new Animated.Value(0)).current;

  // Pulse / glow
  const glowAnim = useRef(new Animated.Value(1)).current;

  // Loading dots
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // ── Blob float loops ──────────────────────────────────────
    const floatBlob = (anim: Animated.Value, dur: number, dist: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: -dist, duration: dur, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
          Animated.timing(anim, { toValue: dist * 0.5, duration: dur, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        ])
      ).start();

    floatBlob(blob1Y, 3200, 18);
    floatBlob(blob2Y, 4100, 14);
    floatBlob(blob3Y, 2800, 22);

    // ── Ripple rings (staggered) ──────────────────────────────
    const rippleRing = (scale: Animated.Value, opacity: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scale,   { toValue: 2.2, duration: 1800, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
            Animated.timing(opacity, { toValue: 0,   duration: 1800, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(scale,   { toValue: 0.4, duration: 0, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.5, duration: 0, useNativeDriver: true }),
          ]),
        ])
      ).start();

    rippleRing(ringScale1, ringOpacity1, 0);
    rippleRing(ringScale2, ringOpacity2, 600);
    rippleRing(ringScale3, ringOpacity3, 1200);

    // ── Glow pulse ────────────────────────────────────────────
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1.12, duration: 1000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(glowAnim, { toValue: 1,    duration: 1000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();

    // ── Logo entrance ─────────────────────────────────────────
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(logoScale,   { toValue: 1, tension: 55, friction: 7, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();

    // ── Text entrance (staggered) ─────────────────────────────
    Animated.sequence([
      Animated.delay(600),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(textSlide,   { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.sequence([
      Animated.delay(900),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    // ── Loading dots ──────────────────────────────────────────
    const dotAnim = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1,   duration: 400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          Animated.delay(400),
        ])
      ).start();

    dotAnim(dot1, 1200);
    dotAnim(dot2, 1400);
    dotAnim(dot3, 1600);

    // ── Navigate ──────────────────────────────────────────────
    const timer = setTimeout(() => router.replace('/login'), 3200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>

      {/* ── Decorative blobs ── */}
      <Animated.View style={[styles.blob1, { transform: [{ translateY: blob1Y }] }]} />
      <Animated.View style={[styles.blob2, { transform: [{ translateY: blob2Y }] }]} />
      <Animated.View style={[styles.blob3, { transform: [{ translateY: blob3Y }] }]} />

      {/* ── Ripple rings ── */}
      <View style={styles.ringContainer} pointerEvents="none">
        {[{ s: ringScale1, o: ringOpacity1 }, { s: ringScale2, o: ringOpacity2 }, { s: ringScale3, o: ringOpacity3 }].map((r, i) => (
          <Animated.View
            key={i}
            style={[styles.ring, { transform: [{ scale: r.s }], opacity: r.o }]}
          />
        ))}
      </View>

      {/* ── Main content ── */}
      <View style={styles.content}>

        {/* Logo circle */}
        <Animated.View style={{ transform: [{ scale: logoScale }], opacity: logoOpacity }}>
          <Animated.View style={{ transform: [{ scale: glowAnim }] }}>
            <LinearGradient colors={['#f7971e', '#ffd200']} style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>📣</Text>
            </LinearGradient>
          </Animated.View>
        </Animated.View>

        {/* App name */}
        <Animated.Text
          style={[styles.appName, { opacity: textOpacity, transform: [{ translateY: textSlide }] }]}
        >
          Aplikasi Pengaduan
        </Animated.Text>

        {/* Divider accent */}
        <Animated.View style={[styles.divider, { opacity: textOpacity }]}>
          <LinearGradient
            colors={['transparent', '#ffd200', 'transparent']}
            style={styles.dividerLine}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </Animated.View>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Laporkan keluhan Anda dengan mudah
        </Animated.Text>

        {/* Loading dots */}
        <Animated.View style={[styles.dotsRow, { opacity: taglineOpacity }]}>
          {[dot1, dot2, dot3].map((dot, i) => (
            <Animated.View key={i} style={[styles.dot, { opacity: dot }]} />
          ))}
        </Animated.View>
      </View>

      {/* ── Bottom badge ── */}
      <Animated.View style={[styles.bottomBadge, { opacity: taglineOpacity }]}>
        <Text style={styles.bottomText}>v1.0.0  •  Dibuat dengan ❤️</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const RING_SIZE = 160;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // ── Blobs ──
  blob1: {
    position: 'absolute',
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(247,151,30,0.13)',
    top: -80, right: -80,
  },
  blob2: {
    position: 'absolute',
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(255,210,0,0.09)',
    bottom: 60, left: -70,
  },
  blob3: {
    position: 'absolute',
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(48,43,99,0.6)',
    top: height * 0.35, left: width * 0.6,
  },

  // ── Rings ──
  ringContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2,
    borderWidth: 2,
    borderColor: 'rgba(255,210,0,0.35)',
  },

  // ── Content ──
  content: { alignItems: 'center', zIndex: 10 },

  logoCircle: {
    width: 110, height: 110, borderRadius: 55,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#ffd200',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 16,
  },
  logoEmoji: { fontSize: 50 },

  appName: {
    fontSize: 30,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.6,
    textAlign: 'center',
    textShadowColor: 'rgba(255,210,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  divider: { width: 180, marginVertical: 14 },
  dividerLine: { height: 1.5, borderRadius: 1 },

  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    letterSpacing: 0.4,
    paddingHorizontal: 32,
  },

  dotsRow: {
    flexDirection: 'row',
    marginTop: 28,
    gap: 10,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#ffd200',
  },

  // ── Bottom ──
  bottomBadge: {
    position: 'absolute',
    bottom: 36,
    alignItems: 'center',
  },
  bottomText: {
    color: 'rgba(255,255,255,0.22)',
    fontSize: 12,
    letterSpacing: 0.5,
  },
});