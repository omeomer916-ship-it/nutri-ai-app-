import { useState } from 'react';
import { Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient as SvgGrad, Path, Stop } from 'react-native-svg';
import { useT, TKey } from '../../src/i18n';
import { dayKey, streakOf, totals, useApp } from '../../src/store';
import { fmt } from '../../src/calc';
import { C, CAT_ICON, R, fontFor } from '../../src/theme';
import { Bar, Btn, Card, H2, IconBadge, Num, Row, Screen, Segmented, Txt } from '../../src/components/ui';
import { Ring } from '../../src/components/Ring';
import { Icon, IconName } from '../../src/components/Icon';

export default function Progress() {
  const { t } = useT();
  const [tab, setTab] = useState<'d' | 'w'>('d');
  return (
    <Screen>
      <Txt style={{ fontSize: 28, fontWeight: '900', marginTop: 12, marginBottom: 14, lineHeight: 40 }}>{t('tProgress')}</Txt>
      <Segmented value={tab} options={[['d', t('daily')], ['w', t('weight')]]} onChange={setTab} />
      <View style={{ height: 16 }} />
      {tab === 'd' ? <Daily /> : <Weight />}
    </Screen>
  );
}

function Daily() {
  const { t, lang, rtl } = useT();
  const days = useApp((s) => s.days);
  const goals = useApp((s) => s.goals);
  const [sel, setSel] = useState(6);
  const now = Date.now();
  const loc = lang === 'ar' ? 'ar-u-nu-latn' : lang;
  const week = [0, 1, 2, 3, 4, 5, 6].map((i) => {
    const ts = now - (6 - i) * 864e5;
    const k = dayKey(ts);
    return { ts, k, day: days[k], tot: totals(days[k]) };
  });
  const d = week[sel];
  const used = week.filter((w) => w.tot.kcal > 0);
  const avg = used.length ? Math.round(used.reduce((a, w) => a + w.tot.kcal, 0) / used.length) : 0;
  const pavg = used.length ? Math.round(used.reduce((a, w) => a + w.tot.P, 0) / used.length) : 0;
  const streak = streakOf(days);
  const mx = Math.max(goals.kcal * 1.3, ...week.map((w) => w.tot.kcal));
  const sp = [d.tot.P * 4, d.tot.C * 4, d.tot.F * 9];
  const BH = 150;
  return (
    <>
      <Row style={{ gap: 6 }}>
        {week.map((w, i) => {
          const r = w.tot.kcal / goals.kcal;
          const col = r > 1.1 ? C.red : r >= 0.85 ? C.green : w.tot.kcal ? C.carb : 'transparent';
          const on = i === sel;
          return (
            <Pressable key={w.k} onPress={() => setSel(i)} style={[st.day, on && st.dayOn]}>
              <Txt center style={{ color: on ? '#000' : C.dim, fontSize: 10, fontWeight: '700' }}>{new Date(w.ts).toLocaleDateString(loc, { weekday: 'short' })}</Txt>
              <Num style={{ color: on ? '#000' : '#fff', fontWeight: '900', fontSize: 16 }}>{new Date(w.ts).getDate()}</Num>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: col }} />
            </Pressable>
          );
        })}
      </Row>

      <Card style={{ marginTop: 14, alignItems: 'center', paddingVertical: 24 }}>
        <Ring size={210} stroke={16} value={d.tot.kcal} max={goals.kcal} segments={sp}>
          <Icon name="flame" size={22} color="#fff" />
          <Num style={{ fontSize: 42, fontWeight: '900', lineHeight: 52 }}>{fmt(d.tot.kcal)}</Num>
          <Num style={{ color: C.mut, fontSize: 13 }}>/ {fmt(goals.kcal)} kcal</Num>
        </Ring>
        <View style={{ alignSelf: 'stretch', gap: 14, marginTop: 22 }}>
          {([['P', d.tot.P, goals.P, C.pro, 'drumstick'], ['Cb', d.tot.C, goals.C, C.carb, 'wheat'], ['F', d.tot.F, goals.F, C.fat, 'avocado']] as [TKey, number, number, string, IconName][]).map(([k, v, g, col, ic]) => (
            <View key={k}>
              <Row style={{ justifyContent: 'space-between', marginBottom: 7 }}>
                <Row style={{ gap: 8 }}>
                  <Icon name={ic} size={16} color={col} />
                  <Txt style={{ fontSize: 14, fontWeight: '700' }}>{t(k)}</Txt>
                </Row>
                <Num style={{ color: C.mut, fontSize: 13, fontWeight: '700' }}>{Math.round(v)} / {g} g</Num>
              </Row>
              <Bar value={v} max={g} color={col} />
            </View>
          ))}
        </View>
      </Card>

      <Row style={{ gap: 10, marginTop: 10 }}>
        {([['flame', '#FF9F5C', t('avg'), avg ? fmt(avg) : '—'], ['drumstick', C.pro, t('pavg'), pavg ? `${pavg} g` : '—'], ['bolt', C.green, t('streak'), String(streak)]] as [IconName, string, string, string][]).map(([ic, col, l, v]) => (
          <Card key={l} style={{ flex: 1, padding: 14 }}>
            <IconBadge name={ic} color={col} size={34} icon={17} />
            <Num style={{ fontSize: 22, fontWeight: '900', marginTop: 10, textAlign: rtl ? 'right' : 'left' }}>{v}</Num>
            <Txt numberOfLines={1} style={{ color: C.mut, fontSize: 11, fontWeight: '600' }}>{l}</Txt>
          </Card>
        ))}
      </Row>

      <H2>{t('last7')}</H2>
      <Card>
        <View style={{ height: BH, flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
          <View style={[st.goalLine, { bottom: (goals.kcal / mx) * BH }]} />
          {week.map((w, i) => (
            <Pressable key={w.k} onPress={() => setSel(i)} style={{ flex: 1, height: '100%', justifyContent: 'flex-end' }}>
              <View style={{ height: `${Math.max(3, (w.tot.kcal / mx) * 100)}%`, borderRadius: 10, backgroundColor: i === sel ? C.green : 'rgba(57,230,140,0.3)', opacity: w.tot.kcal ? 1 : 0.4 }} />
            </Pressable>
          ))}
        </View>
        <Row style={{ gap: 10, marginTop: 8 }}>
          {week.map((w) => <Txt key={w.k} center style={{ flex: 1, color: C.dim, fontSize: 10 }}>{new Date(w.ts).toLocaleDateString(loc, { weekday: 'narrow' })}</Txt>)}
        </Row>
        <Txt style={{ color: C.dim, fontSize: 12, marginTop: 10 }}>{t('dashed')}</Txt>
      </Card>

      <H2>{t('logged')}: {d.day?.meals.length ?? 0}</H2>
      {d.day?.meals.length ? (
        <View style={{ gap: 8 }}>
          {d.day.meals.map((m) => {
            const ci = CAT_ICON[m.cat];
            return (
              <Card key={m.id} style={{ padding: 10 }}>
                <Row style={{ gap: 12 }}>
                  {m.photo ? <Image source={{ uri: m.photo }} style={st.thumb} /> : <View style={[st.thumb, { backgroundColor: ci.color + '22', alignItems: 'center', justifyContent: 'center' }]}><Icon name={ci.icon} size={22} color={ci.color} /></View>}
                  <View style={{ flex: 1 }}>
                    <Txt numberOfLines={1} style={{ fontWeight: '800' }}>{m.name}</Txt>
                    <Txt style={{ color: C.mut, fontSize: 12 }}>{t(m.cat)}</Txt>
                  </View>
                  <Num style={{ color: C.green, fontWeight: '900' }}>{fmt(m.kcal)} kcal</Num>
                </Row>
              </Card>
            );
          })}
        </View>
      ) : (
        <Card><Txt style={{ color: C.mut }}>{t('noLog')}</Txt></Card>
      )}
    </>
  );
}

function Weight() {
  const { t, rtl, lang } = useT();
  const weights = useApp((s) => s.weights);
  const profile = useApp((s) => s.profile);
  const addWeight = useApp((s) => s.addWeight);
  const [v, setV] = useState('');
  const save = () => {
    const n = parseFloat(v.replace(',', '.'));
    if (n > 20 && n < 400) { addWeight(Math.round(n * 10) / 10); setV(''); }
  };
  const input = (
    <Row style={{ gap: 10, marginTop: 16 }}>
      <TextInput value={v} onChangeText={setV} keyboardType="decimal-pad" placeholder={t('kg')} placeholderTextColor={C.dim} style={[st.in, { fontFamily: fontFor(800, lang) }]} />
      <Btn title={t('add')} onPress={save} style={{ height: 54, paddingHorizontal: 26 }} icon={<Icon name="plus" size={18} color="#000" stroke={2.6} />} />
    </Row>
  );
  if (!weights.length) {
    return (
      <Card style={{ alignItems: 'center', paddingVertical: 28 }}>
        <IconBadge name="scale" color={C.green} size={64} icon={32} />
        <Txt center style={{ fontSize: 19, fontWeight: '900', marginTop: 12 }}>{t('logW')}</Txt>
        <Txt center style={{ color: C.mut, marginTop: 4 }}>{t('logWS')}</Txt>
        <View style={{ alignSelf: 'stretch' }}>{input}</View>
      </Card>
    );
  }
  const cur = weights[weights.length - 1].w;
  const start = weights[0].w;
  const goal = profile?.gw ?? start;
  const pct = start === goal ? 100 : Math.max(0, Math.min(100, ((start - cur) / (start - goal)) * 100));
  const ws = weights.slice(-12).map((x) => x.w);
  const lo = Math.min(...ws, goal) - 1, hi = Math.max(...ws, goal) + 1;
  const W = 300, Hh = 130;
  const xy = ws.map((w, i) => [ws.length === 1 ? W / 2 : (i / (ws.length - 1)) * W, Hh - ((w - lo) / (hi - lo)) * Hh]);
  const line = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ');
  const area = `${line} L${xy[xy.length - 1][0]},${Hh} L${xy[0][0]},${Hh} Z`;
  const gy = Hh - ((goal - lo) / (hi - lo)) * Hh;
  return (
    <>
      <Card>
        <Txt style={{ color: C.mut, fontWeight: '700' }}>{t('curW')}</Txt>
        <Row style={{ alignItems: 'flex-end', gap: 6, marginVertical: 4 }}>
          <Num style={{ fontSize: 50, fontWeight: '900', lineHeight: 62 }}>{cur}</Num>
          <Txt style={{ fontSize: 16, color: C.mut, marginBottom: 12, fontWeight: '700' }}>{t('kg')}</Txt>
        </Row>
        <Bar value={pct} max={100} height={10} />
        <Row style={{ justifyContent: 'space-between', marginTop: 10 }}>
          <Txt style={{ color: C.mut, fontSize: 13 }}>{t('startW')} {start}</Txt>
          <Txt style={{ color: C.mut, fontSize: 13 }}>{t('goalW')} {goal}</Txt>
        </Row>
        <View style={st.toGo}>
          <Icon name="target" size={16} color={C.green} />
          <Txt style={{ color: C.green, fontWeight: '800' }}>{Math.abs(cur - goal).toFixed(1)} {t('kg')} {t('toGo')}</Txt>
        </View>
      </Card>
      <Card style={{ marginTop: 10 }}>
        <View style={{ transform: [{ scaleX: rtl ? -1 : 1 }] }}>
          <Svg width="100%" height={Hh + 20} viewBox={`-10 -10 ${W + 20} ${Hh + 20}`}>
            <Defs>
              <SvgGrad id="g" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={C.green} stopOpacity={0.35} />
                <Stop offset="1" stopColor={C.green} stopOpacity={0} />
              </SvgGrad>
            </Defs>
            <Line x1={0} x2={W} y1={gy} y2={gy} stroke="rgba(255,255,255,0.35)" strokeDasharray="6 6" />
            {xy.length > 1 && <Path d={area} fill="url(#g)" />}
            <Path d={line} fill="none" stroke={C.green} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
            {xy.map(([x, y], i) => <Circle key={i} cx={x} cy={y} r={i === xy.length - 1 ? 6 : 3.5} fill={i === xy.length - 1 ? '#fff' : C.green} />)}
          </Svg>
        </View>
        {input}
      </Card>
    </>
  );
}

const st = StyleSheet.create({
  day: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 9, borderRadius: 16, backgroundColor: C.surface, borderWidth: 1, borderColor: C.stroke },
  dayOn: { backgroundColor: '#fff', borderColor: '#fff' },
  thumb: { width: 46, height: 46, borderRadius: 14 },
  goalLine: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.4)' },
  in: { flex: 1, height: 54, paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false, color: '#fff', backgroundColor: C.surface2, borderRadius: R.pill, paddingHorizontal: 16, fontSize: 18, textAlign: 'center' },
  toGo: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: 'rgba(57,230,140,0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginTop: 12 },
});
