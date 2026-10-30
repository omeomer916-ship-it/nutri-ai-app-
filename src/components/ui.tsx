import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleProp, StyleSheet, Text, TextProps, TextStyle, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, R } from '../theme';
import { useT } from '../i18n';

export function Txt({ style, center, ...p }: TextProps & { center?: boolean }) {
  const { rtl } = useT();
  return (
    <Text
      {...p}
      style={[{ color: C.white, textAlign: center ? 'center' : rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' }, style]}
    />
  );
}

export function Screen({ children, scroll = true, pad = true }: { children: ReactNode; scroll?: boolean; pad?: boolean }) {
  const { rtl } = useT();
  const inner = { direction: rtl ? 'rtl' : 'ltr', paddingHorizontal: pad ? 18 : 0 } as ViewStyle;
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {scroll ? (
        <ScrollView contentContainerStyle={[inner, { paddingBottom: 120 }]} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[inner, { flex: 1 }]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function H1({ children }: { children: ReactNode }) {
  return <Txt style={s.h1}>{children}</Txt>;
}
export function H2({ children }: { children: ReactNode }) {
  return <Txt style={s.h2}>{children}</Txt>;
}
export function Label({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Txt style={[s.label, style]}>{children}</Txt>;
}

export function Btn({ title, onPress, kind = 'primary', style, disabled, icon }: {
  title: string; onPress?: () => void; kind?: 'primary' | 'ghost' | 'white'; style?: StyleProp<ViewStyle>; disabled?: boolean; icon?: ReactNode;
}) {
  const bg = kind === 'primary' ? C.green : kind === 'white' ? '#fff' : 'transparent';
  const fg = kind === 'ghost' ? C.white : '#000';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.btn,
        { backgroundColor: bg, borderWidth: kind === 'ghost' ? 1 : 0, opacity: disabled ? 0.5 : pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        kind === 'primary' && s.glow,
        style,
      ]}
    >
      {icon}
      <Text style={{ color: fg, fontSize: 16, fontWeight: '700' }}>{title}</Text>
    </Pressable>
  );
}

export function Chip({ title, on, onPress }: { title: string; on?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, on && { backgroundColor: C.green, borderColor: C.green }]}>
      <Text style={{ color: on ? '#000' : C.green, fontWeight: '700', fontSize: 14 }}>{title}</Text>
    </Pressable>
  );
}

export function Row({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>;
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
  safe: { flex: 1, backgroundColor: C.bg },
  card: { backgroundColor: C.card, borderColor: C.line, borderWidth: 1, borderRadius: R.lg, padding: 18 },
  h1: { fontSize: 32, fontWeight: '800', marginTop: 6, marginBottom: 14, letterSpacing: -0.5 },
  h2: { fontSize: 21, fontWeight: '800', marginTop: 26, marginBottom: 12 },
  label: { color: C.mut, fontSize: 12, fontWeight: '600', letterSpacing: 0.4 },
  btn: { height: 56, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, borderColor: C.line, paddingHorizontal: 18 },
  glow: { shadowColor: C.green, shadowOpacity: 0.45, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: R.pill, borderWidth: 1, borderColor: C.line, backgroundColor: C.card },
});
