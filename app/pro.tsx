import { useState } from 'react';
import { Alert, ImageBackground, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useT, TKey } from '../src/i18n';
import { C, IMG, R } from '../src/theme';
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
      <ImageBackground source={IMG.welcome} style={{ height: 360, position: 'absolute', top: 0, left: 0, right: 0 }} resizeMode="cover">
        <LinearGradient colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)', '#000']} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />
      </ImageBackground>
      <SafeAreaView style={{ flex: 1, direction: rtl ? 'rtl' : 'ltr' }} edges={['top', 'bottom']}>
        <Row style={{ justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 }}>
          <Brand size="sm" />
          <Pressable hitSlop={10} onPress={() => router.back()} style={st.x}><Icon name="x" size={18} /></Pressable>
        </Row>
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 120, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
          <View style={st.badge}>
            <Icon name="crown" size={16} color="#000" stroke={2.4} />
            <Num style={{ color: '#000', fontWeight: '900', fontSize: 13 }}>PRO</Num>
          </View>
          <Txt style={{ fontSize: 34, fontWeight: '900', lineHeight: 46, marginTop: 12 }}>Nutri AI Pro</Txt>
          <Txt style={{ color: C.mut, fontSize: 16, lineHeight: 25 }}>{t('proS')}</Txt>

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
  badge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: GOLD, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  fi: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  plan: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: R.lg, backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.stroke },
  planOn: { borderColor: GOLD, backgroundColor: '#1a1708' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  tag: { backgroundColor: C.green, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
});
