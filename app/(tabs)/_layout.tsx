import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useEffect, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useT, TKey } from '../../src/i18n';
import { C, themed, fa } from '../../src/theme';
import { Icon, IconName } from '../../src/components/Icon';
import { Pop, Txt } from '../../src/components/ui';

const META: Record<string, { icon: IconName; label: TKey }> = {
  today: { icon: 'home', label: 'tToday' },
  progress: { icon: 'chart', label: 'tProgress' },
  scan: { icon: 'camera', label: 'tScan' },
  coach: { icon: 'chat', label: 'tCoach' },
  profile: { icon: 'user', label: 'tProfile' },
};
const ORDER = ['today', 'progress', 'scan', 'coach', 'profile'];

function Bar({ state, navigation }: BottomTabBarProps) {
  const { t, rtl } = useT();
  const ins = useSafeAreaInsets();
  const routes = ORDER.map((n) => state.routes.find((r) => r.name === n)!).filter(Boolean);
  const active = state.routes[state.index]?.name;
  const [kb, setKb] = useState(false);
  useEffect(() => {
    const a = Keyboard.addListener('keyboardDidShow', () => setKb(true));
    const b = Keyboard.addListener('keyboardDidHide', () => setKb(false));
    return () => { a.remove(); b.remove(); };
  }, []);
  if (kb) return null;
  const go = (name: string) => {
    Haptics.selectionAsync().catch(() => {});
    navigation.navigate(name);
  };
  return (
    <View pointerEvents="box-none" style={[st.wrap, { paddingBottom: Math.max(ins.bottom, 12) }]}>
      <LinearGradient pointerEvents="none" colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)']} style={StyleSheet.absoluteFill} />
      <View style={[st.bar, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
        {routes.map((r) => {
          const m = META[r.name];
          const on = active === r.name;
          if (r.name === 'scan') {
            return (
              <Pressable key={r.key} onPress={() => go(r.name)} style={st.fabWrap}>
                <LinearGradient colors={['#7CF5B5', C.green, '#17A35B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.fab}>
                  <Pop loop="pulse"><Icon name="scan" size={28} color="#03140b" stroke={2.4} /></Pop>
                </LinearGradient>
              </Pressable>
            );
          }
          return (
            <Pressable key={r.key} onPress={() => go(r.name)} style={st.item}>
              <Pop key={on ? 'on' : 'off'}>
                <Icon name={m.icon} size={23} color={on ? C.green : fa(0.42)} stroke={on ? 2.2 : 1.8} fill={on && m.icon !== 'chart' ? 'rgba(57,230,140,0.18)' : undefined} />
              </Pop>
              <Txt center numberOfLines={1} style={{ fontSize: 11, fontWeight: on ? '800' : '600', color: on ? C.text : fa(0.42), marginTop: 2 }}>{t(m.label)}</Txt>
              <View style={[st.dot, on && { backgroundColor: C.green }]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(p) => <Bar {...p} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: C.bg } }}>
      {ORDER.map((n) => <Tabs.Screen key={n} name={n} />)}
    </Tabs>
  );
}

const st = themed(() => StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 14, paddingTop: 24 },
  bar: {
    height: 72, borderRadius: 36, backgroundColor: C.bar, borderWidth: 1, borderColor: fa(0.08),
    alignItems: 'center', paddingHorizontal: 6,
    shadowColor: '#000', shadowOpacity: C.mode === 'light' ? 0.12 : 0.6, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 14,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 4 },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 3, backgroundColor: 'transparent' },
  fabWrap: { flex: 1, alignItems: 'center' },
  fab: {
    width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center', marginTop: -30,
    borderWidth: 4, borderColor: C.bg, shadowColor: C.green, shadowOpacity: 0.7, shadowRadius: 18, elevation: 12,
  },
}));
