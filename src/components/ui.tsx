import { ReactNode, useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Pressable, ScrollView, StyleProp, StyleSheet, Text, TextProps, TextStyle, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { C, R, fontFor, themed, fa } from '../theme';
import { useT } from '../i18n';
import { Icon, IconName } from './Icon';
import * as Haptics from 'expo-haptics';

/** Text with the Cairo font picked by weight, and direction from the app language. */
export function Txt({ style, center, ...p }: TextProps & { center?: boolean }) {
  const { rtl, lang } = useT();
  const flat = (StyleSheet.flatten([{ color: C.text, fontSize: 15 }, style]) || {}) as TextStyle;
  const fam = fontFor(flat.fontWeight as string | undefined, lang);
  // Android mirrors left/right inside an RTL layout, so 'left' means "start" here.
  const out: TextStyle = { textAlign: center ? 'center' : 'left', writingDirection: rtl ? 'rtl' : 'ltr', ...flat };
  if (fam) { out.fontFamily = fam; delete out.fontWeight; }
  logical(out, rtl);
  return <Text {...p} style={out} />;
}

/** In this app 'left' means start and 'right' means end. Android already mirrors them in RTL; iOS needs the swap. */
function logical(st: TextStyle, rtl: boolean) {
  if (Platform.OS !== 'ios' || !rtl) return;
  if (st.textAlign === 'left') st.textAlign = 'right';
  else if (st.textAlign === 'right') st.textAlign = 'left';
}

/** Numbers / Latin bits that must stay left-to-right inside Arabic text. */
export function Num({ style, children, ...p }: TextProps) {
  const { lang, rtl } = useT();
  const flat = (StyleSheet.flatten([{ color: C.text, fontSize: 15 }, style]) || {}) as TextStyle;
  const fam = fontFor(flat.fontWeight as string | undefined, lang);
  const out: TextStyle = { textAlign: 'left', writingDirection: 'ltr', ...flat };
  if (fam) { out.fontFamily = fam; delete out.fontWeight; }
  logical(out, rtl);
  // Unicode LTR isolate keeps "8:30", "120 kcal", "2,100" in order inside Arabic text on every platform.
  return <Text {...p} style={out}>{'\u2066'}{children}{'\u2069'}</Text>;
}

/** Soft green light at the top of every screen. */
export function Glow({ height = 340, strength = 0.16 }: { height?: number; strength?: number }) {
  return (
    <LinearGradient
      pointerEvents="none"
      colors={[`rgba(57,230,140,${strength})`, 'rgba(57,230,140,0.03)', 'rgba(0,0,0,0)']}
      locations={[0, 0.55, 1]}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, height }}
    />
  );
}

export function Screen({ children, scroll = true, pad = true, glow = true }: { children: ReactNode; scroll?: boolean; pad?: boolean; glow?: boolean }) {
  const { rtl } = useT();
  const inner = { direction: rtl ? 'rtl' : 'ltr', paddingHorizontal: pad ? 20 : 0 } as ViewStyle;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {glow && <Glow />}
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {scroll ? (
          <ScrollView contentContainerStyle={[inner, { paddingBottom: 130 }]} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        ) : (
          <View style={[inner, { flex: 1 }]}>{children}</View>
        )}
      </SafeAreaView>
    </View>
  );
}

/** Dark glass card: soft top highlight and a hairline border. */
export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[s.card, style]}>
      <LinearGradient pointerEvents="none" colors={[fa(0.05), fa(0)]} locations={[0, 0.5]} style={[StyleSheet.absoluteFill, { borderRadius: R.lg }]} />
      {children}
    </View>
  );
}

export function H1({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Txt style={[s.h1, style]}>{children}</Txt>;
}
export function H2({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <Row style={{ justifyContent: 'space-between', marginTop: 28, marginBottom: 12 }}>
      <Txt style={s.h2}>{children}</Txt>
      {right}
    </Row>
  );
}
export function Label({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Txt style={[s.label, style]}>{children}</Txt>;
}

export function Btn({ title, onPress, kind = 'primary', style, disabled, icon }: {
  title: string; onPress?: () => void; kind?: 'primary' | 'ghost' | 'white' | 'soft'; style?: StyleProp<ViewStyle>; disabled?: boolean; icon?: ReactNode;
}) {
  const bg = kind === 'primary' ? C.green : kind === 'white' ? C.inv : kind === 'soft' ? C.surface2 : 'transparent';
  const fg = kind === 'ghost' || kind === 'soft' ? C.text : kind === 'white' ? C.onInv : '#000';
  return (
    <Pressable
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); onPress?.(); }}
      disabled={disabled}
      style={({ pressed }) => [
        s.btn,
        { backgroundColor: bg, borderWidth: kind === 'ghost' ? 1 : 0, opacity: disabled ? 0.45 : pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        kind === 'primary' && s.glow,
        style,
      ]}
    >
      {icon}
      <Txt numberOfLines={1} adjustsFontSizeToFit style={{ color: fg, fontSize: 16, fontWeight: '800', flexShrink: 1, textAlign: 'center' }}>{title}</Txt>
    </Pressable>
  );
}

export function Chip({ title, on, onPress, icon }: { title: string; on?: boolean; onPress?: () => void; icon?: IconName }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, on && { backgroundColor: C.inv, borderColor: C.inv }]}>
      {icon && <Icon name={icon} size={16} color={on ? C.onInv : C.mut} />}
      <Txt style={{ color: on ? C.onInv : C.text, fontWeight: '700', fontSize: 14 }}>{title}</Txt>
    </Pressable>
  );
}

/** Two-or-more option pill switch. */
export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <View style={s.seg}>
      {options.map(([v, l]) => (
        <Pressable key={v} onPress={() => onChange(v)} style={[s.segB, value === v && s.segOn]}>
          <Txt center numberOfLines={1} adjustsFontSizeToFit style={{ color: value === v ? C.onInv : C.mut, fontWeight: '800', fontSize: 13 }}>{l}</Txt>
        </Pressable>
      ))}
    </View>
  );
}

export function Row({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>;
}

type Loop = 'float' | 'pulse' | 'wiggle';
const LINE_ONLY = new Set(['refresh', 'logout', 'share', 'search', 'info', 'plus', 'minus', 'x', 'chevron', 'check', 'edit', 'copy', 'barcode', 'scan', 'run', 'chart', 'send', 'sun', 'bowl', 'wheat', 'bread', 'mic', 'book', 'compare', 'calendar', 'alert', 'clock', 'medal', 'fridge', 'cart', 'list', 'menu', 'tag', 'wand']);
/** Pops in when it appears; can keep a gentle idle motion. */
export function Pop({ children, delay = 0, loop, style }: { children: ReactNode; delay?: number; loop?: Loop; style?: StyleProp<ViewStyle> }) {
  const a = useRef(new Animated.Value(0)).current;
  const l = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(a, { toValue: 1, delay, friction: 5, tension: 90, useNativeDriver: true }).start();
    if (!loop) return;
    const d = loop === 'wiggle' ? 900 : 1800;
    const anim = Animated.loop(Animated.sequence([
      Animated.timing(l, { toValue: 1, duration: d, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(l, { toValue: 0, duration: d, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    const id = setTimeout(() => anim.start(), delay + 400);
    return () => { clearTimeout(id); anim.stop(); };
  }, []);
  const tf: object[] = [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }];
  if (loop === 'float') tf.push({ translateY: l.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) });
  if (loop === 'pulse') tf.push({ scale: l.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) });
  if (loop === 'wiggle') tf.push({ rotate: l.interpolate({ inputRange: [0, 1], outputRange: ['-7deg', '7deg'] }) });
  return <Animated.View style={[style, { opacity: a, transform: tf as never }]}>{children}</Animated.View>;
}

/** Glass tile with a two-tone green icon that pops in (and can keep moving). */
export function IconBadge({ name, color = C.green, size = 40, icon = 20, loop, delay = 0 }: { name: IconName; color?: string; size?: number; icon?: number; loop?: Loop; delay?: number }) {
  const r = size * 0.32;
  return (
    <Pop delay={delay} loop={loop}>
      <View style={{ width: size, height: size, borderRadius: r, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(124,245,181,0.28)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(57,230,140,0.07)' }}>
        <LinearGradient pointerEvents="none" colors={C.mode === 'light' ? ['rgba(255,255,255,0.9)', 'rgba(57,230,140,0.12)', 'rgba(57,230,140,0.05)'] : ['rgba(255,255,255,0.16)', 'rgba(57,230,140,0.10)', 'rgba(0,0,0,0.15)']} locations={[0, 0.45, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: r * 0.6, right: r * 0.6, height: 1, backgroundColor: 'rgba(255,255,255,0.35)' }} />
        <Icon name={name} size={icon} color={color} fill={LINE_ONLY.has(name) ? undefined : color + '2E'} />
      </View>
    </Pop>
  );
}

export function Bar({ value, max, color = C.green, height = 8 }: { value: number; max: number; color?: string; height?: number }) {
  const pct = Math.max(0, Math.min(100, max ? (value / max) * 100 : 0));
  return (
    <View style={{ height, borderRadius: height, backgroundColor: fa(0.08), overflow: 'hidden' }}>
      <View style={{ width: `${pct}%`, height, borderRadius: height, backgroundColor: color }} />
    </View>
  );
}

export const s = themed(() => StyleSheet.create({
  card: { backgroundColor: C.surface, borderColor: C.border, borderWidth: 1, borderRadius: R.lg, padding: 18 },
  h1: { fontSize: 30, fontWeight: '900', marginTop: 6, marginBottom: 14, lineHeight: 42 },
  h2: { fontSize: 19, fontWeight: '800' },
  label: { color: C.mut, fontSize: 13, fontWeight: '600' },
  btn: { height: 56, borderRadius: R.pill, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, borderColor: fa(0.18), paddingHorizontal: 20 },
  glow: { shadowColor: C.green, shadowOpacity: 0.45, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: R.pill, borderWidth: 1, borderColor: C.stroke, backgroundColor: C.surface },
  seg: { flexDirection: 'row', backgroundColor: C.surface, borderWidth: 1, borderColor: C.stroke, borderRadius: R.pill, padding: 4 },
  segB: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: R.pill },
  segOn: { backgroundColor: C.inv },
}));
