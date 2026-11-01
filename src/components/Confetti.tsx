import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');
const COLS = ['#39E68C', '#9AF3C4', '#FFD45C', '#17B062', '#FFFFFF', '#7CF5B5'];

/** A short burst of falling confetti. Calls onDone when it has finished. */
export function Confetti({ onDone, count = 46 }: { onDone?: () => void; count?: number }) {
  const bits = useRef(Array.from({ length: count }, (_, i) => ({
    v: new Animated.Value(0), x: Math.random() * W, drift: (Math.random() - 0.5) * 160,
    spin: 360 + Math.random() * 720, w: 6 + Math.random() * 7, h: 9 + Math.random() * 9,
    c: COLS[i % COLS.length], delay: Math.random() * 450, dur: 1800 + Math.random() * 1200, round: Math.random() < 0.3,
  }))).current;
  useEffect(() => {
    Animated.parallel(bits.map((b) => Animated.timing(b.v, { toValue: 1, duration: b.dur, delay: b.delay, easing: Easing.in(Easing.quad), useNativeDriver: true })))
      .start(() => onDone?.());
  }, []);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {bits.map((b, i) => (
        <Animated.View key={i} style={{
          position: 'absolute', left: b.x, top: -30, width: b.w, height: b.round ? b.w : b.h, borderRadius: b.round ? b.w : 2, backgroundColor: b.c,
          opacity: b.v.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] }),
          transform: [
            { translateY: b.v.interpolate({ inputRange: [0, 1], outputRange: [0, H + 60] }) },
            { translateX: b.v.interpolate({ inputRange: [0, 1], outputRange: [0, b.drift] }) },
            { rotate: b.v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${b.spin}deg`] }) },
          ],
        }} />
      ))}
    </View>
  );
}
