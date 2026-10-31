import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useT, TKey } from '../src/i18n';
import { Profile, useApp } from '../src/store';
import { computePlan, fmt } from '../src/calc';
import { C, R, fontFor } from '../src/theme';
import { Btn, Card, IconBadge, Num, Row, Screen, Txt } from '../src/components/ui';
import { Ring } from '../src/components/Ring';
import { Icon, IconName } from '../src/components/Icon';

const OPT_ICON: Record<string, IconName> = { m: 'user', f: 'user', lose: 'flame', keep: 'target', gain: 'drumstick', 1: 'moon', 2: 'sun', 3: 'bolt', 4: 'flame' };

type Step =
  | { k: 'sex' | 'goal' | 'act'; q: TKey; opts: [string | number, TKey][] }
  | { k: 'age' | 'h' | 'w' | 'gw'; q: TKey; unit: string; min: number; max: number };

const STEPS: Step[] = [
  { k: 'sex', q: 'qSex', opts: [['m', 'male'], ['f', 'female']] },
  { k: 'age', q: 'qAge', unit: 'years', min: 12, max: 100 },
  { k: 'h', q: 'qH', unit: 'cm', min: 120, max: 230 },
  { k: 'w', q: 'qW', unit: 'kg', min: 30, max: 300 },
  { k: 'goal', q: 'qGoal', opts: [['lose', 'lose'], ['keep', 'keep'], ['gain', 'gain']] },
  { k: 'gw', q: 'qGW', unit: 'kg', min: 30, max: 300 },
  { k: 'act', q: 'qAct', opts: [[1, 'a1'], [2, 'a2'], [3, 'a3'], [4, 'a4']] },
];

export default function Onboarding() {
  const { t, lang, rtl } = useT();
  const old = useApp((s) => s.profile);
  const setProfile = useApp((s) => s.setProfile);
  const [a, setA] = useState<Partial<Profile>>(old ?? {});
  const [i, setI] = useState(0);
  const [txt, setTxt] = useState('');

  const steps = STEPS.filter((s) => !(s.k === 'gw' && a.goal === 'keep'));
  const done = i >= steps.length;
  const st = steps[Math.min(i, steps.length - 1)];

  const go = (v: unknown) => {
    const n = { ...a, [st.k]: v } as Partial<Profile>;
    if (st.k === 'goal' && v === 'keep') n.gw = n.w;
    setA(n);
    setTxt('');
    setI(i + 1);
  };

  if (done) {
    const p = { gw: a.w, ...a } as Profile;
    const plan = computePlan(p);
    return (
      <Screen>
        <Txt style={styles.q}>{t('planT')}</Txt>
        <Txt style={styles.sub}>{t('planS')}</Txt>
        <Card style={{ alignItems: 'center', paddingVertical: 28 }}>
          <Ring size={200} stroke={16} value={1} max={1} segments={[plan.P * 4, plan.C * 4, plan.F * 9]}>
            <Icon name="flame" size={22} color="#fff" />
            <Num style={{ fontSize: 46, fontWeight: '900', lineHeight: 56 }}>{fmt(plan.kcal)}</Num>
            <Num style={{ color: C.mut, fontSize: 13 }}>kcal</Num>
          </Ring>
          <Row style={{ gap: 10, marginTop: 22 }}>
            {([['P', plan.P, C.pro, 'drumstick'], ['Cb', plan.C, C.carb, 'wheat'], ['F', plan.F, C.fat, 'avocado']] as [TKey, number, string, IconName][]).map(([k, v, col, ic]) => (
              <View key={k} style={styles.mac}>
                <Icon name={ic} size={20} color={col} />
                <Num style={{ fontSize: 20, fontWeight: '900', marginTop: 4 }}>{v}g</Num>
                <Txt center style={{ color: C.mut, fontSize: 12 }}>{t(k)}</Txt>
              </View>
            ))}
          </Row>
        </Card>
        <Btn style={{ marginTop: 24 }} title={t('start')} onPress={() => {
          setProfile(p, { kcal: plan.kcal, P: plan.P, C: plan.C, F: plan.F });
          router.replace('/(tabs)/today');
        }} />
        <Btn kind="ghost" style={{ marginTop: 12 }} title={t('back')} onPress={() => setI(steps.length - 1)} />
      </Screen>
    );
  }

  const num = 'unit' in st;
  const val = parseFloat(txt.replace(',', '.'));
  const ok = num ? val >= st.min && val <= st.max : false;
  return (
    <Screen scroll={false}>
      <Row style={{ gap: 12, marginTop: 12 }}>
        {i > 0 ? (
          <Pressable onPress={() => setI(i - 1)} style={styles.backBtn}>
            <View style={{ transform: [{ scaleX: rtl ? 1 : -1 }] }}><Icon name="chevron" size={20} /></View>
          </Pressable>
        ) : <View style={{ width: 40 }} />}
        <View style={[styles.prog, { flex: 1 }]}><View style={[styles.progIn, { width: `${((i + 1) / steps.length) * 100}%` }]} /></View>
      </Row>
      <Txt style={styles.kicker}>{t('obT')}</Txt>
      <Txt style={styles.q}>{t(st.q)}</Txt>
      {'opts' in st ? (
        <View style={{ gap: 12, marginTop: 10 }}>
          {st.opts.map(([v, k]) => {
            const on = (a as Record<string, unknown>)[st.k] === v;
            return (
              <Pressable key={String(v)} onPress={() => go(v)}
                style={({ pressed }) => [styles.opt, on && styles.optOn, pressed && { transform: [{ scale: 0.98 }] }]}>
                <IconBadge name={OPT_ICON[String(v)] ?? 'check'} color={on ? '#000' : C.green} size={42} />
                <Txt style={{ fontSize: 17, fontWeight: '800', flex: 1, color: on ? '#000' : '#fff' }}>{t(k)}</Txt>
                <View style={[styles.radio, on && { borderColor: '#000', backgroundColor: '#000' }]}>{on && <Icon name="check" size={14} color="#fff" stroke={3} />}</View>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={{ marginTop: 10 }}>
          <Row style={styles.inputRow}>
            <TextInput
              value={txt}
              onChangeText={setTxt}
              keyboardType="decimal-pad"
              autoFocus
              placeholder={String((a as Record<string, unknown>)[st.k] ?? '')}
              placeholderTextColor={C.dim}
              style={[styles.input, { fontFamily: fontFor(900, lang) }]}
            />
            <Txt style={{ color: C.mut, fontSize: 18, fontWeight: '700' }}>{st.unit === 'years' ? t('years') : st.unit === 'kg' ? t('kg') : st.unit}</Txt>
          </Row>
          <Btn style={{ marginTop: 20 }} title={t('next')} disabled={!ok} onPress={() => go(val)} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  prog: { height: 6, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  progIn: { height: 6, borderRadius: 6, backgroundColor: C.green },
  kicker: { color: C.green, fontWeight: '700', marginTop: 28 },
  q: { fontSize: 30, fontWeight: '900', marginTop: 8, marginBottom: 18, lineHeight: 42 },
  sub: { color: C.mut, marginBottom: 18, lineHeight: 22 },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.stroke, borderRadius: R.lg, padding: 14 },
  optOn: { borderColor: '#fff', backgroundColor: '#fff' },
  inputRow: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.stroke, borderRadius: R.lg, paddingHorizontal: 20, gap: 10 },
  input: { flex: 1, color: '#fff', fontSize: 34, height: 84, paddingVertical: 0, textAlign: 'center', textAlignVertical: 'center', includeFontPadding: false },
  mac: { flex: 1, alignItems: 'center', backgroundColor: C.surface2, borderRadius: R.md, paddingVertical: 14 },
});
