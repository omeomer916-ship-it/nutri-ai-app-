import { useState } from 'react';
import { Alert, Animated, Easing, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useT, TKey } from '../src/i18n';
import { C, R } from '../src/theme';
import { Btn, Num, Row, Txt } from '../src/components/ui';
import { Brand } from '../src/components/Brand';
import { Icon, IconName } from '../src/components/Icon';

const GOLD = '#FFD45C';

export default function Pro() {
  const { t, rtl } = useT();
  const [plan, setPlan] = useState<'y' | 'm'>('y');
  const feats: [IconName, TKey, string][] = [
    ['camera', 'pf1', C.green], ['sparkle', 'pf2', GOLD], ['chart', 'pf3', C.water], ['target', 'pf4', C.pro], ['lock', 'pf5', C.carb],
  ];
  const soon = () => Alert.alert('Nutri AI Pro', t('soon'));

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Hero />
      <SafeAreaView style={{ flex: 1, direction: rtl ? 'rtl' : 'ltr' }} edges={['top', 'bottom']}>
        <Row style={{ justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 }}>
          <Brand size="sm" />
          <Pressable hitSlop={10} onPress={() => router.back()} style={st.x}><Icon name="x" size={18} /></Pressable>
        </Row>
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 250, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
          <Num style={{ fontSize: 36, fontWeight: '900', lineHeight: 48, textAlign: 'center' }}>Nutri AI <Num style={{ fontSize: 36, fontWeight: '900', color: GOLD }}>Pro</Num></Num>
          <Txt center style={{ color: C.mut, fontSize: 16, lineHeight: 25 }}>{t('proS')}</Txt>

          <View style={{ gap: 14, marginTop: 24 }}>
            {feats.map(([ic, k, col]) => (
              <Row key={k} style={{ gap: 12 }}>
                <View style={[st.fi, { backgroundColor: col + '22' }]}><Icon name={ic} size={18} color={col} /></View>
                <Txt style={{ flex: 1, fontWeight: '700', fontSize: 15 }}>{t(k)}</Txt>
                <Icon name="check" size={18} color={C.green} stroke={2.8} />
              </Row>
            ))}
          </View>

          <View style={{ gap: 10, marginTop: 28 }}>
            <PlanCard on={plan === 'y'} onPress={() => setPlan('y')} title={t('yearly')} price="$29.99" per={t('perYear')} sub="$2.50 / mo" tag={t('save50')} />
            <PlanCard on={plan === 'm'} onPress={() => setPlan('m')} title={t('monthly')} price="$4.99" per={t('perMonth')} />
          </View>

          <Btn title={t('tryFree')} style={{ marginTop: 22, backgroundColor: GOLD, shadowColor: GOLD }} icon={<Icon name="crown" size={18} color="#000" stroke={2.4} />} onPress={soon} />
          <Row style={{ justifyContent: 'center', gap: 18, marginTop: 14 }}>
            <Txt style={{ color: C.dim, fontSize: 12 }}>{t('cancelAny')}</Txt>
            <Pressable onPress={soon}><Txt style={{ color: C.mut, fontSize: 12, fontWeight: '700', textDecorationLine: 'underline' }}>{t('restore')}</Txt></Pressable>
          </Row>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

/** Designed hero: glowing gold crown with orbiting feature bubbles. */
function Hero() {
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.timing(spin, { toValue: 1, duration: 24000, easing: Easing.linear, useNativeDriver: true })).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 1600, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 1600, useNativeDriver: true }),
    ])).start();
  }, []);
  const rot = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const back = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] });
  const S = 300;
  const orbit: [IconName, string, number][] = [['flame', '#7CF5B5', 0], ['meat', C.pro, 72], ['sparkle', C.green, 144], ['chart', C.water, 216], ['barcode', '#9AF3C4', 288]];
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 40, left: 0, right: 0, alignItems: 'center' }}>
      <Svg width={S + 120} height={S} style={{ position: 'absolute' }}>
        <Defs>
          <RadialGradient id="g" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={GOLD} stopOpacity={0.35} />
            <Stop offset="0.5" stopColor={C.green} stopOpacity={0.08} />
            <Stop offset="1" stopColor="#000" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={(S + 120) / 2} cy={S / 2} r={S / 2} fill="url(#g)" />
        <Circle cx={(S + 120) / 2} cy={S / 2} r={118} stroke="rgba(255,212,92,0.2)" strokeWidth={1} fill="none" strokeDasharray="3 7" />
        <Circle cx={(S + 120) / 2} cy={S / 2} r={78} stroke="rgba(57,230,140,0.25)" strokeWidth={1} fill="none" />
      </Svg>
      <Animated.View style={{ width: S, height: S, transform: [{ rotate: rot }] }}>
        {orbit.map(([ic, col, deg]) => {
          const a = (deg * Math.PI) / 180;
          return (
            <Animated.View key={ic} style={[st.orb, { left: S / 2 - 22 + Math.cos(a) * 118, top: S / 2 - 22 + Math.sin(a) * 118, borderColor: col + '66', transform: [{ rotate: back }] }]}>
              <Icon name={ic} size={20} color={col} />
            </Animated.View>
          );
        })}
      </Animated.View>
      <Animated.View style={[st.crownBig, { transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }] }]}>
        <LinearGradient colors={['#FFF1B8', GOLD, '#C9971A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.crownIn}>
          <Icon name="crown" size={50} color="#2a1d00" stroke={2.2} />
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

function PlanCard({ on, onPress, title, price, per, sub, tag }: { on: boolean; onPress: () => void; title: string; price: string; per: string; sub?: string; tag?: string }) {
  return (
    <Pressable onPress={onPress} style={[st.plan, on && st.planOn]}>
      <View style={[st.radio, on && { borderColor: GOLD, backgroundColor: GOLD }]}>{on && <Icon name="check" size={13} color="#000" stroke={3} />}</View>
      <View style={{ flex: 1 }}>
        <Row style={{ gap: 8 }}>
          <Txt style={{ fontWeight: '900', fontSize: 17 }}>{title}</Txt>
          {tag && <View style={st.tag}><Txt style={{ color: '#000', fontSize: 11, fontWeight: '900' }}>{tag}</Txt></View>}
        </Row>
        {sub && <Num style={{ color: C.mut, fontSize: 12 }}>{sub}</Num>}
      </View>
      <Row style={{ gap: 4, alignItems: 'flex-end' }}>
        <Num style={{ fontWeight: '900', fontSize: 20 }}>{price}</Num>
        <Txt style={{ color: C.mut, fontSize: 12, marginBottom: 3 }}>{per}</Txt>
      </Row>
    </Pressable>
  );
}

const st = StyleSheet.create({
  x: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  orb: { position: 'absolute', width: 44, height: 44, borderRadius: 22, backgroundColor: '#0D1411', borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  crownBig: { position: 'absolute', top: 150 - 52, width: 104, height: 104, borderRadius: 52, shadowColor: GOLD, shadowOpacity: 0.8, shadowRadius: 30, elevation: 20 },
  crownIn: { flex: 1, borderRadius: 52, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.35)' },
  badge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: GOLD, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  fi: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  plan: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: R.lg, backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.stroke },
  planOn: { borderColor: GOLD, backgroundColor: '#1a1708' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  tag: { backgroundColor: C.green, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
});
