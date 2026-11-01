import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Defs, LinearGradient as SvgGrad, Path, Stop } from 'react-native-svg';
import { useT, TKey } from '../src/i18n';
import { Profile, useApp } from '../src/store';
import { KG_LB, computePlan, fmt, wShow } from '../src/calc';
import { C, R, fontFor, themed, fa } from '../src/theme';
import { Btn, Card, IconBadge, Num, Pop, Row, Screen, Segmented, Txt } from '../src/components/ui';
import { Ring } from '../src/components/Ring';
import { Icon, IconName } from '../src/components/Icon';

type K = keyof Profile;
type Opt = [string | number, TKey, IconName, string?];
type Step =
  | { k: K; q: TKey; opts: Opt[] }
  | { k: 'age' | 'h' | 'w' | 'gw'; q: TKey; num: true };

const ALL: Step[] = [
  { k: 'goal', q: 'qGoal', opts: [['lose', 'lose', 'flame'], ['keep', 'keep', 'target'], ['gain', 'gain', 'meat']] },
  { k: 'sex', q: 'qSex', opts: [['m', 'male', 'user'], ['f', 'female', 'user']] },
  { k: 'age', q: 'qAge', num: true },
  { k: 'h', q: 'qH', num: true },
  { k: 'w', q: 'qW', num: true },
  { k: 'gw', q: 'qGW', num: true },
  { k: 'pace', q: 'qPace', opts: [[0.25, 'p1', 'moon'], [0.5, 'p2', 'star'], [0.75, 'p3', 'bolt'], [1, 'p4', 'flame']] },
  { k: 'act', q: 'qAct', opts: [[1, 'a1', 'moon'], [2, 'a2', 'sun'], [3, 'a3', 'run'], [4, 'a4', 'bolt']] },
  { k: 'diet', q: 'qDiet', opts: [['any', 'dAny', 'bowl'], ['highP', 'dHighP', 'meat'], ['medi', 'dMedi', 'avocado'], ['lowcarb', 'dLow', 'bread'], ['keto', 'dKeto', 'drop'], ['veg', 'dVeg', 'sparkle'], ['vegan', 'dVegan', 'sparkle']] },
];

export default function Onboarding() {
  const { t, lang, rtl } = useT();
  const old = useApp((s) => s.profile);
  const setProfile = useApp((s) => s.setProfile);
  const imperial = useApp((s) => s.imperial);
  const setImperial = useApp((s) => s.setImperial);
  const [a, setA] = useState<Partial<Profile>>(old ?? {});
  const [i, setI] = useState(0);
  const [txt, setTxt] = useState('');
  const [inch, setInch] = useState('');
  const [phase, setPhase] = useState<'q' | 'build' | 'plan'>('q');

  const steps = ALL.filter((s) => !(a.goal === 'keep' && (s.k === 'gw' || s.k === 'pace')));
  const st = steps[Math.min(i, steps.length - 1)];

  const next = (v: unknown) => {
    Haptics.selectionAsync().catch(() => {});
    const n = { ...a, [st.k]: v } as Partial<Profile>;
    if (st.k === 'goal' && v === 'keep') { n.gw = n.w; n.pace = undefined; }
    setA(n);
    setTxt(''); setInch('');
    if (i + 1 >= steps.length) setPhase('build');
    else setI(i + 1);
  };

  if (phase === 'build') return <Building onDone={() => setPhase('plan')} />;
  if (phase === 'plan') {
    const p = { gw: a.w, diet: 'any', ...a } as Profile;
    return <Plan p={p} onBack={() => { setPhase('q'); setI(steps.length - 1); }} onStart={(plan) => {
      setProfile(p, { kcal: plan.kcal, P: plan.P, C: plan.C, F: plan.F });
      router.replace('/(tabs)/today');
    }} />;
  }

  // Numeric step limits and conversions (values are stored metric).
  const isNum = 'num' in st;
  const kind = st.k === 'age' ? 'age' : st.k === 'h' ? 'h' : 'w';
  let val = NaN;
  if (isNum) {
    const n = parseFloat(txt.replace(',', '.'));
    if (kind === 'age') val = n;
    else if (kind === 'h') val = imperial ? ((n || 0) * 12 + (parseFloat(inch) || 0)) * 2.54 : n;
    else val = imperial ? n / KG_LB : n;
  }
  const ok = kind === 'age' ? val >= 12 && val <= 100 : kind === 'h' ? val >= 120 && val <= 230 : val >= 30 && val <= 300;
  const prev = (a as Record<string, unknown>)[st.k];
  const ph = typeof prev === 'number' ? (kind === 'w' ? String(wShow(prev, imperial)) : kind === 'h' && !imperial ? String(Math.round(prev)) : kind === 'age' ? String(prev) : '') : '';

  return (
    <Screen scroll={false}>
      <Row style={{ gap: 12, marginTop: 12 }}>
        {i > 0 ? (
          <Pressable onPress={() => setI(i - 1)} style={styles.backBtn}>
            <View style={{ transform: [{ scaleX: rtl ? 1 : -1 }] }}><Icon name="chevron" size={20} /></View>
          </Pressable>
        ) : <View style={{ width: 40 }} />}
        <View style={[styles.prog, { flex: 1 }]}><View style={[styles.progIn, { width: `${((i + 1) / (steps.length + 1)) * 100}%` }]} /></View>
        <Num style={{ color: C.dim, fontSize: 12, fontWeight: '700' }}>{i + 1}/{steps.length}</Num>
      </Row>
      <Txt style={styles.kicker}>{t('obT')}</Txt>
      <Txt style={styles.q}>{t(st.q)}</Txt>

      {'opts' in st ? (
        <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
          {st.opts.map(([v, k, ic], idx) => {
            const on = prev === v;
            const sub = st.k === 'pace' && typeof v === 'number' ? `${wShow(v, imperial)} ${imperial ? 'lb' : t('kg')} ${t('perWeek')}` : '';
            return (
              <Pop key={String(v)} delay={idx * 60}>
                <Pressable onPress={() => next(v)} style={({ pressed }) => [styles.opt, on && styles.optOn, pressed && { transform: [{ scale: 0.98 }] }]}>
                  <IconBadge name={ic} color={on ? '#03140b' : C.green} size={44} />
                  <View style={{ flex: 1 }}>
                    <Txt style={{ fontSize: 17, fontWeight: '800', color: on ? '#03140b' : C.text }}>{t(k)}</Txt>
                    {!!sub && <Num style={{ color: on ? '#03140b' : C.mut, fontSize: 12 }}>{sub}</Num>}
                  </View>
                  <View style={[styles.radio, on && { borderColor: '#03140b', backgroundColor: '#03140b' }]}>{on && <Icon name="check" size={14} color={C.green} stroke={3} />}</View>
                </Pressable>
              </Pop>
            );
          })}
        </ScrollView>
      ) : (
        <View style={{ marginTop: 6 }}>
          {kind !== 'age' && (
            <View style={{ marginBottom: 14 }}>
              <Segmented value={imperial ? 'i' : 'm'} options={[['m', t('metric')], ['i', t('imperialL')]]} onChange={(v) => { setImperial(v === 'i'); setTxt(''); setInch(''); }} />
            </View>
          )}
          <Row style={{ gap: 10 }}>
            <Row style={[styles.inputRow, { flex: 1 }]}>
              <TextInput value={txt} onChangeText={setTxt} keyboardType="decimal-pad" autoFocus placeholder={ph} placeholderTextColor={C.dim}
                style={[styles.input, { fontFamily: fontFor(900, lang) }]} />
              <Txt style={{ color: C.mut, fontSize: 18, fontWeight: '700' }}>
                {kind === 'age' ? t('years') : kind === 'h' ? (imperial ? 'ft' : 'cm') : imperial ? 'lb' : t('kg')}
              </Txt>
            </Row>
            {kind === 'h' && imperial && (
              <Row style={[styles.inputRow, { flex: 1 }]}>
                <TextInput value={inch} onChangeText={setInch} keyboardType="number-pad" placeholder="0" placeholderTextColor={C.dim}
                  style={[styles.input, { fontFamily: fontFor(900, lang) }]} />
                <Txt style={{ color: C.mut, fontSize: 18, fontWeight: '700' }}>in</Txt>
              </Row>
            )}
          </Row>
          <Btn style={{ marginTop: 20 }} title={t('next')} disabled={!ok} onPress={() => next(kind === 'age' ? Math.round(val) : Math.round(val * 10) / 10)} />
        </View>
      )}
    </Screen>
  );
}

/** Short animated "building your plan" moment. */
function Building({ onDone }: { onDone: () => void }) {
  const { t } = useT();
  const p = useRef(new Animated.Value(0)).current;
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const id = p.addListener(({ value }) => setPct(Math.round(value * 100)));
    Animated.timing(p, { toValue: 1, duration: 3200, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }).start(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      onDone();
    });
    return () => p.removeListener(id);
  }, []);
  const lines: TKey[] = ['b1', 'b2', 'b3', 'b4'];
  return (
    <Screen scroll={false}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Ring size={200} stroke={14} value={pct} max={100}>
          <Num style={{ fontSize: 48, fontWeight: '900', textAlign: 'center' }}>{pct}%</Num>
        </Ring>
        <Txt center style={{ fontSize: 22, fontWeight: '900', marginTop: 24 }}>{t('bT')}</Txt>
        <View style={{ gap: 12, marginTop: 22, alignSelf: 'stretch' }}>
          {lines.map((k, i) => {
            const done = pct >= (i + 1) * 25;
            return (
              <Row key={k} style={{ gap: 10, opacity: pct >= i * 25 ? 1 : 0.3 }}>
                <View style={[styles.chk, done && { backgroundColor: C.green, borderColor: C.green }]}>{done && <Icon name="check" size={13} color="#03140b" stroke={3} />}</View>
                <Txt style={{ fontWeight: '700', color: done ? C.text : C.mut }}>{t(k)}</Txt>
              </Row>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

function Plan({ p, onStart, onBack }: { p: Profile; onStart: (g: ReturnType<typeof computePlan>) => void; onBack: () => void }) {
  const { t, lang } = useT();
  const imperial = useApp((s) => s.imperial);
  const plan = computePlan(p);
  const loc = lang === 'ar' ? 'ar-u-nu-latn' : lang;
  const date = new Date(Date.now() + plan.weeks * 7 * 864e5).toLocaleDateString(loc, { day: 'numeric', month: 'long', year: 'numeric' });
  const W = 300, H = 110;
  const y0 = p.goal === 'gain' ? H - 20 : 20, y1 = p.goal === 'gain' ? 20 : H - 20;
  const curve = `M10,${y0} C${W * 0.4},${y0} ${W * 0.55},${y1} ${W - 10},${y1}`;
  return (
    <Screen>
      <Pop><Txt style={styles.q}>{t('planT')}</Txt></Pop>
      <Txt style={styles.sub}>{t('planS')}</Txt>

      {plan.weeks > 0 && (
        <Pop delay={150}>
          <Card style={{ paddingBottom: 8 }}>
            <Txt style={{ color: C.mut, fontWeight: '700' }}>{t('reach')}</Txt>
            <Row style={{ gap: 8, alignItems: 'flex-end' }}>
              <Num style={{ fontSize: 40, fontWeight: '900', color: C.green, lineHeight: 50 }}>{wShow(p.gw, imperial)}</Num>
              <Txt style={{ fontWeight: '800', marginBottom: 8 }}>{imperial ? 'lb' : t('kg')}</Txt>
            </Row>
            <Txt style={{ fontWeight: '800' }}>{t('byD')} {date}</Txt>
            <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ marginTop: 6 }}>
              <Defs>
                <SvgGrad id="pg" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={C.green} stopOpacity={0.4} />
                  <Stop offset="1" stopColor={C.green} stopOpacity={1} />
                </SvgGrad>
              </Defs>
              <Path d={curve} stroke="url(#pg)" strokeWidth={4} fill="none" strokeLinecap="round" />
              <Circle cx={10} cy={y0} r={6} fill={C.text} />
              <Circle cx={W - 10} cy={y1} r={8} fill={C.green} stroke={C.bg} strokeWidth={3} />
            </Svg>
          </Card>
        </Pop>
      )}

      <Pop delay={300}>
        <Card style={{ alignItems: 'center', paddingVertical: 24, marginTop: 10 }}>
          <Txt center style={{ color: C.mut, fontWeight: '700', marginBottom: 10 }}>{t('dailyCal')}</Txt>
          <Ring size={190} stroke={16} value={1} max={1} segments={[plan.P * 4, plan.C * 4, plan.F * 9]}>
            <Pop loop="wiggle"><Icon name="flame" size={22} color={C.green} fill="rgba(57,230,140,0.2)" /></Pop>
            <Num style={{ fontSize: 44, fontWeight: '900', lineHeight: 54, textAlign: 'center' }}>{fmt(plan.kcal)}</Num>
            <Num style={{ color: C.mut, fontSize: 13, textAlign: 'center' }}>kcal</Num>
          </Ring>
          <Row style={{ gap: 10, marginTop: 20 }}>
            {([['P', plan.P, C.pro, 'meat'], ['Cb', plan.C, C.carb, 'bread'], ['F', plan.F, C.fat, 'avocado']] as [TKey, number, string, IconName][]).map(([k, v, col, ic], idx) => (
              <View key={k} style={styles.mac}>
                <IconBadge name={ic} color={col} size={36} icon={18} delay={400 + idx * 120} />
                <Num style={{ fontSize: 20, fontWeight: '900', marginTop: 6, textAlign: 'center' }}>{v}g</Num>
                <Txt center style={{ color: C.mut, fontSize: 12 }}>{t(k)}</Txt>
              </View>
            ))}
          </Row>
          <Num style={{ color: C.dim, fontSize: 12, marginTop: 14, textAlign: 'center' }}>{t('maintain')}: {fmt(plan.tdee)} kcal</Num>
        </Card>
      </Pop>

      <Btn style={{ marginTop: 20 }} title={t('start')} icon={<Icon name="bolt" size={18} color="#000" stroke={2.6} />} onPress={() => onStart(plan)} />
      <Btn kind="ghost" style={{ marginTop: 10 }} title={t('back')} onPress={onBack} />
    </Screen>
  );
}

const styles = themed(() => StyleSheet.create({
  prog: { height: 6, borderRadius: 6, backgroundColor: fa(0.08), overflow: 'hidden' },
  progIn: { height: 6, borderRadius: 6, backgroundColor: C.green },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: fa(0.25), alignItems: 'center', justifyContent: 'center' },
  chk: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: fa(0.25), alignItems: 'center', justifyContent: 'center' },
  kicker: { color: C.green, fontWeight: '700', marginTop: 26 },
  q: { fontSize: 30, fontWeight: '900', marginTop: 6, marginBottom: 18, lineHeight: 42 },
  sub: { color: C.mut, marginBottom: 18, lineHeight: 22 },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.stroke, borderRadius: R.lg, padding: 14 },
  optOn: { borderColor: C.green, backgroundColor: C.green },
  inputRow: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.stroke, borderRadius: R.lg, paddingHorizontal: 18, gap: 10 },
  input: { flex: 1, color: C.text, fontSize: 34, height: 84, paddingVertical: 0, textAlign: 'center', textAlignVertical: 'center', includeFontPadding: false },
  mac: { flex: 1, alignItems: 'center', backgroundColor: C.surface2, borderRadius: R.md, paddingVertical: 12 },
}));
