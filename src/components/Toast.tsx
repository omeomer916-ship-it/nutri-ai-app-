import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useT } from '../i18n';
import { dayKey, useApp } from '../store';
import { fmt } from '../calc';
import { C } from '../theme';
import { Num, Txt } from './ui';
import { Icon, IconName } from './Icon';

type Msg = { id: number; icon: IconName; text: string; num?: string };

/** Small confirmation that slides in from the top whenever the user logs something. */
export function Toast() {
  const { t, rtl } = useT();
  const ins = useSafeAreaInsets();
  const [m, setM] = useState<Msg | null>(null);
  const y = useRef(new Animated.Value(-120)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = (icon: IconName, text: string, num?: string) => {
    setM({ id: Date.now(), icon, text, num });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Animated.spring(y, { toValue: 0, friction: 7, tension: 80, useNativeDriver: true }).start();
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => Animated.timing(y, { toValue: -120, duration: 250, useNativeDriver: true }).start(), 2200);
  };

  useEffect(() => useApp.subscribe((s, p) => {
    const k = dayKey();
    const a = s.days[k]?.meals ?? [], b = p.days[k]?.meals ?? [];
    if (a.length > b.length && a[0]) show('check', a[0].name, `+${fmt(a[0].kcal)} kcal`);
    else if (a.length < b.length) show('trash', t('deleted'));
    const ba = s.burn[k] ?? [], bb = p.burn[k] ?? [];
    if (ba.length > bb.length && ba[0]) show('run', ba[0].name, `-${fmt(ba[0].kcal)} kcal`);
    const wa = s.days[k]?.water ?? 0, wb = p.days[k]?.water ?? 0;
    if (wa >= s.waterGoal && wb < s.waterGoal) show('drop', t('waterDone'));
    if (s.fast.start && !p.fast.start) show('moon', t('fastOn'), `${s.fast.hours}h`);
    if (!s.fast.start && p.fast.start) show('check', t('fastOff'));
  }), [t]);

  if (!m) return null;
  return (
    <Animated.View pointerEvents="none" style={[st.wrap, { top: ins.top + 8, transform: [{ translateY: y }] }]}>
      <View style={[st.pill, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
        <View style={st.ic}><Icon name={m.icon} size={16} color="#03140b" stroke={2.8} /></View>
        <Txt numberOfLines={1} style={{ fontWeight: '800', fontSize: 14, flexShrink: 1 }}>{m.text}</Txt>
        {!!m.num && <Num style={{ color: C.green, fontWeight: '900', fontSize: 14 }}>{m.num}</Num>}
      </View>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center', zIndex: 999, elevation: 30 },
  pill: { alignItems: 'center', gap: 10, maxWidth: '100%', backgroundColor: 'rgba(20,29,24,0.98)', borderWidth: 1, borderColor: 'rgba(57,230,140,0.45)', borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
  ic: { width: 26, height: 26, borderRadius: 13, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
});
