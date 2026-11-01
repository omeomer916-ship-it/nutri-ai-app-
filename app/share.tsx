import { useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useT } from '../src/i18n';
import { dayKey, streakOf, totals, useApp } from '../src/store';
import { fmt } from '../src/calc';
import { C, themed } from '../src/theme';
import { Btn, Num, Row, Txt } from '../src/components/ui';
import { Icon } from '../src/components/Icon';
import { Ring } from '../src/components/Ring';
import { Logo } from '../src/components/Logo';
import { INSTAGRAM } from '../src/social';

const W = Math.min(Dimensions.get('window').width - 48, 360);
type Look = 'night' | 'mint' | 'paper';
const LOOKS: Record<Look, { bg: string[]; text: string; mut: string; tile: string; frame: string; track: string }> = {
  night: { bg: ['#06100B', '#000000'], text: '#FFFFFF', mut: 'rgba(255,255,255,0.6)', tile: 'rgba(255,255,255,0.06)', frame: '#FFFFFF', track: 'rgba(255,255,255,0.08)' },
  mint: { bg: ['#39E68C', '#0E9A52'], text: '#03140B', mut: 'rgba(3,20,11,0.65)', tile: 'rgba(255,255,255,0.22)', frame: '#03140B', track: 'rgba(3,20,11,0.12)' },
  paper: { bg: ['#FFFFFF', '#EEF5F0'], text: '#0A0F0C', mut: 'rgba(10,15,12,0.6)', tile: 'rgba(10,15,12,0.05)', frame: '#0A0F0C', track: 'rgba(10,15,12,0.08)' },
};

/** A designed picture of today's numbers, ready for Instagram, TikTok or WhatsApp. */
export default function ShareDay() {
  const { t, lang, rtl } = useT();
  const { days, goals, burn, waterGoal } = useApp();
  const k = dayKey();
  const tot = totals(days[k]);
  const burned = (burn[k] ?? []).reduce((a, b) => a + b.kcal, 0);
  const water = days[k]?.water ?? 0;
  const streak = streakOf(days);
  const meals = days[k]?.meals ?? [];
  const [look, setLook] = useState<Look>('night');
  const [busy, setBusy] = useState(false);
  const ref = useRef<View>(null);
  const L = LOOKS[look];
  const loc = lang === 'ar' ? 'ar' : lang;
  const date = new Date().toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long' });

  const share = async () => {
    setBusy(true);
    try {
      const uri = await captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile' });
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: t('shareDay') });
    } catch { /* user closed the sheet */ }
    setBusy(false);
  };

  const mac: [string, number, number, string][] = [[t('P'), tot.P, goals.P, '#39E68C'], [t('Cb'), tot.C, goals.C, '#B5F7D5'], [t('F'), tot.F, goals.F, '#17B062']];
  const macCol = (c: string) => (look === 'mint' ? '#03140B' : look === 'paper' && c === '#B5F7D5' ? '#5CCB8F' : c);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaView style={{ flex: 1 }}>
        <Row style={st.head}>
          <Pressable hitSlop={10} onPress={() => router.back()} style={st.close}><Icon name="x" size={20} /></Pressable>
          <Txt style={{ flex: 1, fontSize: 18, fontWeight: '900', textAlign: 'center' }}>{t('shareDay')}</Txt>
          <View style={{ width: 40 }} />
        </Row>
        <ScrollView contentContainerStyle={{ alignItems: 'center', padding: 24, paddingBottom: 40 }}>
          <View ref={ref} collapsable={false} style={{ width: W, borderRadius: 30, overflow: 'hidden' }}>
            <LinearGradient colors={L.bg as [string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 22, direction: rtl ? 'rtl' : 'ltr' }}>
              {look === 'night' && <LinearGradient colors={['rgba(57,230,140,0.28)', 'rgba(57,230,140,0)']} style={[StyleSheet.absoluteFill, { height: 260 }]} />}
              <Row style={{ justifyContent: 'space-between' }}>
                <Row style={{ gap: 7, direction: 'ltr' }}>
                  <Logo size={30} frame={L.frame} />
                  <Num style={{ color: L.text, fontSize: 18, fontWeight: '900' }}>Nutri<Num style={{ color: look === 'mint' ? '#fff' : '#39E68C', fontSize: 18, fontWeight: '900' }}> AI</Num></Num>
                </Row>
                {streak > 0 && (
                  <Row style={[st.pill, { backgroundColor: L.tile }]}>
                    <Icon name="flame" size={14} color={L.text} />
                    <Num style={{ color: L.text, fontWeight: '900', fontSize: 13 }}>{streak}</Num>
                  </Row>
                )}
              </Row>
              <Txt style={{ color: L.mut, fontSize: 13, fontWeight: '700', marginTop: 16 }}>{date}</Txt>
              <Txt style={{ color: L.text, fontSize: 24, fontWeight: '900', lineHeight: 32 }}>{t('myDay')}</Txt>
              <View style={{ alignItems: 'center', marginTop: 16 }}>
                <Ring size={W * 0.56} stroke={16} value={tot.kcal} max={goals.kcal + burned} color={look === 'mint' ? '#03140B' : '#39E68C'} track={L.track}>
                  <Num style={{ color: L.text, fontSize: 40, fontWeight: '900', textAlign: 'center' }}>{fmt(tot.kcal)}</Num>
                  <Num style={{ color: L.mut, fontSize: 13, fontWeight: '700', textAlign: 'center' }}>/ {fmt(goals.kcal + burned)} kcal</Num>
                </Ring>
              </View>
              <Row style={{ gap: 8, marginTop: 18 }}>
                {mac.map(([l, v, g, c]) => (
                  <View key={l} style={[st.tile, { backgroundColor: L.tile }]}>
                    <Num style={{ color: L.text, fontSize: 18, fontWeight: '900', textAlign: 'center' }}>{Math.round(v)}g</Num>
                    <Txt center numberOfLines={1} style={{ color: L.mut, fontSize: 11, fontWeight: '700' }}>{l}</Txt>
                    <View style={[st.bar, { backgroundColor: L.track }]}><View style={{ width: `${Math.min(100, (v / Math.max(1, g)) * 100)}%`, height: '100%', borderRadius: 3, backgroundColor: macCol(c) }} /></View>
                  </View>
                ))}
              </Row>
              <Row style={{ gap: 8, marginTop: 8 }}>
                <Row style={[st.tile, st.tileRow, { backgroundColor: L.tile }]}>
                  <Icon name="drop" size={16} color={L.text} />
                  <Num style={{ color: L.text, fontWeight: '900' }}>{water * 250} ml</Num>
                  <Num style={{ color: L.mut, fontSize: 11 }}>/ {waterGoal * 250}</Num>
                </Row>
                <Row style={[st.tile, st.tileRow, { backgroundColor: L.tile }]}>
                  <Icon name="run" size={16} color={L.text} />
                  <Num style={{ color: L.text, fontWeight: '900' }}>{fmt(burned)} kcal</Num>
                </Row>
              </Row>
              {meals.length > 0 && (
                <View style={[st.meals, { backgroundColor: L.tile }]}>
                  {meals.slice(0, 4).map((m) => (
                    <Row key={m.id} style={{ gap: 8, paddingVertical: 4 }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: look === 'mint' ? '#03140B' : '#39E68C' }} />
                      <Txt numberOfLines={1} style={{ flex: 1, color: L.text, fontSize: 13, fontWeight: '700' }}>{m.name}</Txt>
                      <Num style={{ color: L.mut, fontSize: 12, fontWeight: '700' }}>{fmt(m.kcal)}</Num>
                    </Row>
                  ))}
                  {meals.length > 4 && <Txt style={{ color: L.mut, fontSize: 12, marginTop: 2 }}>+{meals.length - 4}</Txt>}
                </View>
              )}
              <Txt center style={{ color: L.mut, fontSize: 11, fontWeight: '700', marginTop: 16 }}>{t('trackedWith')}{INSTAGRAM ? `  ·  @${INSTAGRAM}` : ''}</Txt>
            </LinearGradient>
          </View>

          <Row style={{ gap: 10, marginTop: 22 }}>
            {(Object.keys(LOOKS) as Look[]).map((x) => (
              <Pressable key={x} onPress={() => setLook(x)} style={[st.swatch, look === x && { borderColor: C.green }]}>
                <LinearGradient colors={LOOKS[x].bg as [string, string]} style={{ flex: 1, borderRadius: 18 }} />
              </Pressable>
            ))}
          </Row>
          <Btn title={t('shareNow')} style={{ marginTop: 22, alignSelf: 'stretch' }} disabled={busy}
            icon={busy ? <ActivityIndicator color="#000" /> : <Icon name="share" size={18} color="#000" stroke={2.4} />} onPress={share} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const st = themed(() => StyleSheet.create({
  head: { paddingHorizontal: 16, paddingTop: 8, gap: 10 },
  close: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  pill: { gap: 4, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  tile: { flex: 1, borderRadius: 16, paddingVertical: 10, paddingHorizontal: 10 },
  tileRow: { alignItems: 'center', gap: 6, justifyContent: 'center' },
  bar: { height: 5, borderRadius: 3, marginTop: 6, overflow: 'hidden' },
  meals: { marginTop: 8, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  swatch: { width: 56, height: 56, borderRadius: 22, padding: 3, borderWidth: 2, borderColor: 'transparent' },
}));
