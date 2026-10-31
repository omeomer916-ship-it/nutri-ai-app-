import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleProp, StyleSheet, Text, TextProps, TextStyle, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { C, R, fontFor } from '../theme';
import { useT } from '../i18n';
import { Icon, IconName } from './Icon';

/** Text with the Cairo font picked by weight, and direction from the app language. */
export function Txt({ style, center, ...p }: TextProps & { center?: boolean }) {
  const { rtl, lang } = useT();
  const flat = (StyleSheet.flatten([{ color: C.white, fontSize: 15 }, style]) || {}) as TextStyle;
  const fam = fontFor(flat.fontWeight as string | undefined, lang);
  // Android mirrors left/right inside an RTL layout, so 'left' means "start" here.
  const out: TextStyle = { textAlign: center ? 'center' : 'left', writingDirection: rtl ? 'rtl' : 'ltr', ...flat };
  if (fam) { out.fontFamily = fam; delete out.fontWeight; }
  return <Text {...p} style={out} />;
}

/** Numbers / Latin bits that must stay left-to-right inside Arabic text. */
export function Num({ style, ...p }: TextProps) {
  const { lang } = useT();
  const flat = (StyleSheet.flatten([{ color: C.white, fontSize: 15 }, style]) || {}) as TextStyle;
  const fam = fontFor(flat.fontWeight as string | undefined, lang);
  const out: TextStyle = { textAlign: 'left', writingDirection: 'ltr', ...flat };
  if (fam) { out.fontFamily = fam; delete out.fontWeight; }
  return <Text {...p} style={out} />;
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

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
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
  const bg = kind === 'primary' ? C.green : kind === 'white' ? '#fff' : kind === 'soft' ? C.surface2 : 'transparent';
  const fg = kind === 'ghost' || kind === 'soft' ? C.white : '#000';
  return (
    <Pressable
      onPress={onPress}
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
    <Pressable onPress={onPress} style={[s.chip, on && { backgroundColor: '#fff', borderColor: '#fff' }]}>
      {icon && <Icon name={icon} size={16} color={on ? '#000' : C.mut} />}
      <Txt style={{ color: on ? '#000' : C.white, fontWeight: '700', fontSize: 14 }}>{title}</Txt>
    </Pressable>
  );
}

/** Two-or-more option pill switch. */
export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <View style={s.seg}>
      {options.map(([v, l]) => (
        <Pressable key={v} onPress={() => onChange(v)} style={[s.segB, value === v && s.segOn]}>
          <Txt center style={{ color: value === v ? '#000' : C.mut, fontWeight: '800', fontSize: 14 }}>{l}</Txt>
        </Pressable>
      ))}
    </View>
  );
}

export function Row({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>;
}

/** Rounded square with a tinted icon. */
export function IconBadge({ name, color = C.green, size = 40, icon = 20 }: { name: IconName; color?: string; size?: number; icon?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.32, backgroundColor: color + '22', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={name} size={icon} color={color} />
    </View>
  );
}

export function Bar({ value, max, color = C.green, height = 8 }: { value: number; max: number; color?: string; height?: number }) {
  const pct = Math.max(0, Math.min(100, max ? (value / max) * 100 : 0));
  return (
    <View style={{ height, borderRadius: height, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
      <View style={{ width: `${pct}%`, height, borderRadius: height, backgroundColor: color }} />
    </View>
  );
}

export const s = StyleSheet.create({
  card: { backgroundColor: C.surface, borderColor: C.stroke, borderWidth: 1, borderRadius: R.lg, padding: 18 },
  h1: { fontSize: 30, fontWeight: '900', marginTop: 6, marginBottom: 14, lineHeight: 42 },
  h2: { fontSize: 19, fontWeight: '800' },
  label: { color: C.mut, fontSize: 13, fontWeight: '600' },
  btn: { height: 56, borderRadius: R.pill, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, borderColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 20 },
  glow: { shadowColor: C.green, shadowOpacity: 0.45, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: R.pill, borderWidth: 1, borderColor: C.stroke, backgroundColor: C.surface },
  seg: { flexDirection: 'row', backgroundColor: C.surface, borderWidth: 1, borderColor: C.stroke, borderRadius: R.pill, padding: 4 },
  segB: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: R.pill },
  segOn: { backgroundColor: '#fff' },
});
