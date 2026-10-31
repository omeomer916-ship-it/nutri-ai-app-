import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useT, TKey } from '../src/i18n';
import { useApp } from '../src/store';
import { C, R } from '../src/theme';
import { hms } from '../src/calc';
import { Btn, Card, Glow, H2, Num, Row, Txt } from '../src/components/ui';
import { Ring } from '../src/components/Ring';
import { Icon } from '../src/components/Icon';

const PLANS = [12, 14, 16, 18, 20, 23];
const PH: [number, TKey, string][] = [[0, 'ph1', C.carb], [4, 'ph2', C.water], [12, 'ph3', '#FF9F5C'], [16, 'ph4', C.pro]];


export default function Fasting() {
  const { t, lang, rtl } = useT();
  const fast = useApp((s) => s.fast);
  const startFast = useApp((s) => s.startFast);
  const endFast = useApp((s) => s.endFast);
  const setFastHours = useApp((s) => s.setFastHours);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const on = !!fast.start;
  const el = on ? now - (fast.start as number) : 0;
  const goal = fast.hours * 3600e3;
  const hrs = el / 3600e3;
  const phase = [...PH].reverse().find(([h]) => hrs >= h) ?? PH[0];
  const loc = lang === 'ar' ? 'ar-u-nu-latn' : lang;
  const tm = (ts: number) => new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Glow strength={0.12} />
      <SafeAreaView style={{ flex: 1, direction: rtl ? 'rtl' : 'ltr' }} edges={['top']}>
        <Row style={{ gap: 12, paddingHorizontal: 20, paddingTop: 10 }}>
          <Pressable onPress={() => router.back()} style={st.back}>
            <View style={{ transform: [{ scaleX: rtl ? 1 : -1 }] }}><Icon name="chevron" size={20} /></View>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Txt style={{ fontSize: 22, fontWeight: '900' }}>{t('fastT')}</Txt>
            <Txt style={{ color: C.mut, fontSize: 12 }}>{t('fastS')}</Txt>
          </View>
        </Row>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <View style={{ alignItems: 'center', marginTop: 10 }}>
            <Ring size={250} stroke={18} value={on ? el : 0} max={goal} color={el >= goal ? C.green : '#FF9F5C'}>
              <Txt center style={{ color: C.mut, fontWeight: '700' }}>{on ? (el >= goal ? t('fastDone') : t('fastElapsed')) : t('fastIdle')}</Txt>
              <Num style={{ fontSize: 40, fontWeight: '900', textAlign: 'center' }}>{hms(el)}</Num>
              {on && el < goal && <Num style={{ color: C.dim, fontSize: 13, textAlign: 'center' }}>-{hms(goal - el)}</Num>}
            </Ring>
          </View>
          {on && (
            <View style={[st.phase, { borderColor: phase[2] + '66', backgroundColor: phase[2] + '18' }]}>
              <Icon name="flame" size={16} color={phase[2]} />
              <Txt style={{ color: phase[2], fontWeight: '800' }}>{t(phase[1])}</Txt>
            </View>
          )}
          <Row style={{ gap: 8, marginTop: 18 }}>
            {PH.map(([h, k, c]) => (
              <View key={k} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                <View style={{ height: 6, alignSelf: 'stretch', borderRadius: 3, backgroundColor: on && hrs >= h ? c : 'rgba(255,255,255,0.1)' }} />
                <Txt center numberOfLines={2} style={{ fontSize: 10, color: on && hrs >= h ? '#fff' : C.dim, fontWeight: '700' }}>{t(k)}</Txt>
                <Num style={{ fontSize: 10, color: C.dim, textAlign: 'center' }}>{h}h+</Num>
              </View>
            ))}
          </Row>

          {on && (
            <Row style={{ gap: 10, marginTop: 18 }}>
              <Card style={{ flex: 1, padding: 14 }}>
                <Txt style={{ color: C.dim, fontSize: 12 }}>{t('fastStart')}</Txt>
                <Num style={{ fontWeight: '900', fontSize: 18 }}>{tm(fast.start as number)}</Num>
              </Card>
              <Card style={{ flex: 1, padding: 14 }}>
                <Txt style={{ color: C.dim, fontSize: 12 }}>{t('fastEnd')}</Txt>
                <Num style={{ fontWeight: '900', fontSize: 18 }}>{tm((fast.start as number) + goal)}</Num>
              </Card>
            </Row>
          )}

          <H2>{t('fastPlan')}</H2>
          <View style={st.plans}>
            {PLANS.map((h) => (
              <Pressable key={h} disabled={on} onPress={() => setFastHours(h)} style={[st.plan, fast.hours === h && st.planOn, on && fast.hours !== h && { opacity: 0.4 }]}>
                <Num style={{ fontWeight: '900', fontSize: 18, color: fast.hours === h ? '#000' : '#fff', textAlign: 'center' }}>{h}:{24 - h}</Num>
                <Num style={{ fontSize: 11, color: fast.hours === h ? '#000' : C.dim, textAlign: 'center' }}>{h}h</Num>
              </Pressable>
            ))}
          </View>

          <Btn title={on ? t('fastEnd') : t('fastStart')} style={[{ marginTop: 20 }, on && { backgroundColor: '#FF9F5C', shadowColor: '#FF9F5C' }]}
            icon={<Icon name={on ? 'check' : 'bolt'} size={18} color="#000" stroke={2.6} />}
            onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); on ? endFast() : startFast(fast.hours); }} />
          <Txt style={{ color: C.dim, fontSize: 11, marginTop: 10, lineHeight: 17 }}>{t('fastNote')}</Txt>

          {fast.log.length > 0 && (
            <>
              <H2>{t('fastHist')}</H2>
              <View style={{ gap: 8 }}>
                {fast.log.slice(0, 7).map((f) => {
                  const d = (f.e - f.s) / 3600e3;
                  const ok = d >= f.h;
                  return (
                    <Card key={f.s} style={{ padding: 12 }}>
                      <Row style={{ gap: 10 }}>
                        <View style={[st.dot, { backgroundColor: ok ? C.green : C.carb }]}><Icon name={ok ? 'check' : 'bolt'} size={14} color="#000" stroke={3} /></View>
                        <Txt style={{ flex: 1, fontWeight: '700' }}>{new Date(f.s).toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'short' })}</Txt>
                        <Num style={{ fontWeight: '900' }}>{d.toFixed(1)}h</Num>
                        <Num style={{ color: C.dim, fontSize: 12 }}>/ {f.h}h</Num>
                      </Row>
                    </Card>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const st = StyleSheet.create({
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  phase: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, marginTop: 14 },
  plans: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  plan: { width: '31.5%', paddingVertical: 12, borderRadius: R.md, backgroundColor: C.surface, borderWidth: 1, borderColor: C.stroke },
  planOn: { backgroundColor: '#FF9F5C', borderColor: '#FF9F5C' },
  dot: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
});
