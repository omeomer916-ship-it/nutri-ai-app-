import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useT, TKey } from '../src/i18n';
import { Measure, useApp } from '../src/store';
import { fmt, wShow } from '../src/calc';
import { C, fontFor, themed } from '../src/theme';
import { Btn, Card, IconBadge, Num, Pop, Row, Txt } from '../src/components/ui';
import { Icon, IconName } from '../src/components/Icon';
import { Page } from '../src/components/Page';

type Part = Exclude<keyof Measure, 't'>;
const PARTS: [Part, TKey][] = [['waist', 'mWaist'], ['hip', 'mHip'], ['chest', 'mChest'], ['arm', 'mArm'], ['thigh', 'mThigh'], ['neck', 'mNeck']];
const IN = 2.54;

/** Body numbers (BMR, TDEE, healthy weight, body fat) and tape measurements over time. */
export default function BodyStats() {
  const { t, lang } = useT();
  const { profile, weights, measures, addMeasure, removeMeasure, imperial } = useApp();
  const [vals, setVals] = useState<Partial<Record<Part, string>>>({});
  const U = imperial ? 'in' : 'cm';
  const loc = lang === 'ar' ? 'ar' : lang;

  const w = weights.length ? weights[weights.length - 1].w : profile?.w ?? 0;
  const p = profile;
  const bmr = p ? Math.round(10 * w + 6.25 * p.h - 5 * p.age + (p.sex === 'm' ? 5 : -161)) : 0;
  const tdee = p ? Math.round(bmr * [1.2, 1.375, 1.55, 1.725][p.act - 1]) : 0;
  const hm = (p?.h ?? 0) / 100;
  const lo = Math.round(18.5 * hm * hm), hi = Math.round(24.9 * hm * hm);
  const last = measures[measures.length - 1];
  const first = measures[0];
  // US Navy body fat estimate (needs waist, neck and, for women, hips).
  let fat: number | null = null;
  if (p && last?.waist && last?.neck) {
    const hIn = p.h / IN, wa = last.waist / IN, ne = last.neck / IN, hp = (last.hip ?? 0) / IN;
    if (p.sex === 'm' && wa > ne) fat = 86.01 * Math.log10(wa - ne) - 70.041 * Math.log10(hIn) + 36.76;
    if (p.sex === 'f' && hp && wa + hp > ne) fat = 163.205 * Math.log10(wa + hp - ne) - 97.684 * Math.log10(hIn) - 78.387;
    if (fat !== null) fat = Math.max(3, Math.min(60, Math.round(fat * 10) / 10));
  }
  const whtr = p && last?.waist ? Math.round((last.waist / p.h) * 100) / 100 : null;
  const show = (cm?: number) => (cm === undefined ? '—' : String(Math.round((imperial ? cm / IN : cm) * 10) / 10));

  const save = () => {
    const m: Omit<Measure, 't'> = {};
    PARTS.forEach(([k]) => {
      const n = parseFloat((vals[k] ?? '').replace(',', '.'));
      if (n > 5 && n < 400) m[k] = Math.round((imperial ? n * IN : n) * 10) / 10;
    });
    if (!Object.keys(m).length) return;
    addMeasure(m);
    setVals({});
  };

  const nums: [IconName, string, TKey, TKey][] = [
    ['flame', fmt(bmr), 'bnBmr', 'bnBmrD'], ['run', fmt(tdee), 'bnTdee', 'bnTdeeD'],
    ['scale', `${wShow(lo, imperial)}-${wShow(hi, imperial)}`, 'bnIdeal', 'bnIdealD'],
    ['target', fat !== null ? `${fat}%` : '—', 'bnFat', 'bnFatD'],
  ];

  return (
    <Page title={t('bsT')}>
      {!p ? <Txt style={{ color: C.mut }}>{t('bsNoProfile')}</Txt> : (
        <View style={st.grid}>
          {nums.map(([ic, v, k, d], i) => (
            <Pop key={k} delay={i * 70} style={st.tile}>
              <IconBadge name={ic} size={36} icon={18} />
              <Num style={{ fontSize: 21, fontWeight: '900', marginTop: 8 }}>{v}</Num>
              <Txt style={{ fontWeight: '800', fontSize: 13 }}>{t(k)}</Txt>
              <Txt style={{ color: C.mut, fontSize: 11, lineHeight: 16 }}>{t(d)}</Txt>
            </Pop>
          ))}
        </View>
      )}
      {whtr !== null && (
        <Card style={{ marginTop: 10 }}>
          <Row style={{ gap: 12 }}>
            <IconBadge name="heart" size={40} icon={20} />
            <View style={{ flex: 1 }}>
              <Txt style={{ fontWeight: '900' }}>{t('bnWhtr')}</Txt>
              <Txt style={{ color: C.mut, fontSize: 12 }}>{t(whtr < 0.5 ? 'bnWhtrOk' : whtr < 0.6 ? 'bnWhtrMid' : 'bnWhtrHi')}</Txt>
            </View>
            <Num style={{ fontSize: 20, fontWeight: '900', color: whtr < 0.5 ? C.green : whtr < 0.6 ? '#F5A400' : C.red }}>{whtr}</Num>
          </Row>
        </Card>
      )}

      <Txt style={{ fontWeight: '900', fontSize: 17, marginTop: 22, marginBottom: 10 }}>{t('bsMeasure')}</Txt>
      <Card>
        <View style={st.grid}>
          {PARTS.map(([k, l]) => (
            <View key={k} style={st.field}>
              <Txt style={{ color: C.mut, fontSize: 12, fontWeight: '700' }}>{t(l)}</Txt>
              <Row style={{ gap: 4 }}>
                <TextInput value={vals[k] ?? ''} onChangeText={(v) => setVals({ ...vals, [k]: v })} keyboardType="decimal-pad"
                  placeholder={show(last?.[k])} placeholderTextColor={C.dim} style={[st.in, { fontFamily: fontFor(800, lang) }]} />
                <Txt style={{ color: C.dim, fontSize: 12 }}>{U}</Txt>
              </Row>
            </View>
          ))}
        </View>
        <Btn title={t('add')} style={{ marginTop: 14 }} icon={<Icon name="plus" size={18} color="#000" stroke={2.6} />} onPress={save} />
      </Card>

      {measures.length > 0 && (
        <Card style={{ marginTop: 10 }}>
          <Txt style={{ fontWeight: '900', marginBottom: 8 }}>{t('bsChange')}</Txt>
          {PARTS.filter(([k]) => last?.[k] !== undefined).map(([k, l]) => {
            const d = first?.[k] !== undefined && last?.[k] !== undefined && measures.length > 1 ? (last[k]! - first[k]!) : null;
            return (
              <Row key={k} style={{ paddingVertical: 7, gap: 8 }}>
                <Txt style={{ flex: 1, fontWeight: '700' }}>{t(l)}</Txt>
                <Num style={{ fontWeight: '900' }}>{show(last?.[k])} {U}</Num>
                {d !== null && <Num style={{ width: 64, textAlign: 'right', fontWeight: '800', color: d <= 0 ? C.green : C.mut }}>{d > 0 ? '+' : d < 0 ? '-' : ''}{show(Math.abs(d))}</Num>}
              </Row>
            );
          })}
          <Txt style={{ color: C.dim, fontSize: 12, marginTop: 8 }}>{t('bsHist')}</Txt>
          {[...measures].reverse().slice(0, 6).map((m) => (
            <Pressable key={m.t} onLongPress={() => Alert.alert(t('delete'), '', [{ text: t('cancel'), style: 'cancel' }, { text: t('delete'), style: 'destructive', onPress: () => removeMeasure(m.t) }])}>
              <Row style={{ paddingVertical: 6, gap: 8 }}>
                <Txt style={{ color: C.mut, fontSize: 12, width: 90 }}>{new Date(m.t).toLocaleDateString(loc, { day: 'numeric', month: 'short' })}</Txt>
                <Num numberOfLines={1} style={{ flex: 1, color: C.mut, fontSize: 12 }}>{PARTS.filter(([k]) => m[k] !== undefined).map(([k]) => show(m[k])).join(' · ')}</Num>
              </Row>
            </Pressable>
          ))}
        </Card>
      )}
      <Txt style={{ color: C.dim, fontSize: 12, marginTop: 12, lineHeight: 18 }}>{t('bsNote')}</Txt>
    </Page>
  );
}

const st = themed(() => StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '48.4%', flexGrow: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 20, padding: 14 },
  field: { width: '31%', flexGrow: 1 },
  in: { flex: 1, height: 44, borderRadius: 12, backgroundColor: C.surface2, color: C.text, fontSize: 16, paddingHorizontal: 10, marginTop: 4 },
}));
