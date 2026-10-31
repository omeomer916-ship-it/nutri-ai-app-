import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useT, TKey } from '../src/i18n';
import { Profile, useApp } from '../src/store';
import { computePlan, fmt } from '../src/calc';
import { C, R } from '../src/theme';
import { Btn, Card, Row, Screen, Txt } from '../src/components/ui';

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
  const { t } = useT();
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
          <Text style={{ color: C.green, fontSize: 56, fontWeight: '800' }}>{fmt(plan.kcal)}</Text>
          <Txt center style={{ color: C.mut }}>kcal / {t('goal')}</Txt>
          <Row style={{ gap: 10, marginTop: 22 }}>
            {([['P', plan.P], ['Cb', plan.C], ['F', plan.F]] as [TKey, number][]).map(([k, v]) => (
              <View key={k} style={styles.mac}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>{v} g</Text>
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
      <View style={styles.prog}><View style={[styles.progIn, { width: `${((i + 1) / steps.length) * 100}%` }]} /></View>
      <Txt style={styles.kicker}>{t('obT')}</Txt>
      <Txt style={styles.q}>{t(st.q)}</Txt>
      {'opts' in st ? (
        <View style={{ gap: 12, marginTop: 10 }}>
          {st.opts.map(([v, k]) => (
            <Pressable key={String(v)} onPress={() => go(v)}
              style={({ pressed }) => [styles.opt, (a as Record<string, unknown>)[st.k] === v && styles.optOn, pressed && { opacity: 0.8 }]}>
              <Txt style={{ fontSize: 17, fontWeight: '700' }}>{t(k)}</Txt>
            </Pressable>
          ))}
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
              style={styles.input}
            />
            <Text style={{ color: C.mut, fontSize: 18 }}>{st.unit === 'years' ? t('years') : st.unit === 'kg' ? t('kg') : st.unit}</Text>
          </Row>
          <Btn style={{ marginTop: 20 }} title={t('next')} disabled={!ok} onPress={() => go(val)} />
        </View>
      )}
      {i > 0 && <Btn kind="ghost" style={{ marginTop: 'auto', marginBottom: 20 }} title={t('back')} onPress={() => setI(i - 1)} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  prog: { height: 6, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.08)', marginTop: 12, overflow: 'hidden' },
  progIn: { height: 6, borderRadius: 6, backgroundColor: C.green },
  kicker: { color: C.green, fontWeight: '700', marginTop: 28 },
  q: { fontSize: 30, fontWeight: '800', marginTop: 8, marginBottom: 18 },
  sub: { color: C.mut, marginBottom: 18, lineHeight: 22 },
  opt: { backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: R.md, padding: 20 },
  optOn: { borderColor: C.green, backgroundColor: '#0f2a1b' },
  inputRow: { backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: R.md, paddingHorizontal: 20, gap: 10 },
  input: { flex: 1, color: '#fff', fontSize: 34, fontWeight: '800', height: 84, paddingVertical: 0, textAlign: 'center', textAlignVertical: 'center', includeFontPadding: false },
  mac: { flex: 1, alignItems: 'center', backgroundColor: C.card2, borderRadius: R.md, paddingVertical: 14 },
});
