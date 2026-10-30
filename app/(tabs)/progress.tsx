import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { useT, TKey } from '../../src/i18n';
import { dayKey, totals, useApp } from '../../src/store';
import { fmt } from '../../src/calc';
import { C, ICO, R } from '../../src/theme';
import { Bar, Btn, Card, Chip, H1, H2, Label, Row, Screen, Txt } from '../../src/components/ui';
import { Ring } from '../../src/components/Ring';

export default function Progress() {
  const { t, lang } = useT();
  const [tab, setTab] = useState<'d' | 'w'>('d');
  return (
    <Screen>
      <H1>{t('tProgress')}</H1>
      <Row style={{ gap: 8, marginBottom: 14 }}>
        <Chip title={t('daily')} on={tab === 'd'} onPress={() => setTab('d')} />
        <Chip title={t('weight')} on={tab === 'w'} onPress={() => setTab('w')} />
      </Row>
      {tab === 'd' ? <Daily /> : <Weight />}
    </Screen>
  );
}

function Daily() {
  const { t, lang } = useT();
    const days = useApp((s) => s.days);
    const goals = useApp((s) => s.goals);
    const [sel, setSel] = useState(6);
    const now = Date.now();
    const loc = lang === 'ar' ? 'ar-u-nu-latn' : 'en-US';
    const week = [0, 1, 2, 3, 4, 5, 6].map((i) => {
      const ts = now - (6 - i) * 864e5;
      const k = dayKey(ts);
      return { ts, k, day: days[k], tot: totals(days[k]) };
    });
    const d = week[sel];
    const used = week.filter((w) => w.tot.kcal > 0);
    const avg = used.length ? Math.round(used.reduce((a, w) => a + w.tot.kcal, 0) / used.length) : 0;
    const pavg = used.length ? Math.round(used.reduce((a, w) => a + w.tot.P, 0) / used.length) : 0;
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const k = totals(days[dayKey(now - i * 864e5)]).kcal;
      if (k > 0) streak++;
      else if (i > 0) break;
    }
    const mx = Math.max(goals.kcal * 1.3, ...week.map((w) => w.tot.kcal));
    const sp = [d.tot.P * 4, d.tot.C * 4, d.tot.F * 9];
    const sum = sp.reduce((a, b) => a + b, 0);
    return (
      <>
        <Row style={{ gap: 6 }}>
          {week.map((w, i) => {
            const r = w.tot.kcal / goals.kcal;
            const col = r > 1.1 ? C.red : r >= 0.9 ? C.green : C.mut;
            return (
              <Pressable key={w.k} onPress={() => setSel(i)} style={[st.day, i === sel && st.dayOn]}>
                <Text style={{ color: C.mut, fontSize: 10 }}>{new Date(w.ts).toLocaleDateString(loc, { weekday: 'short' })}</Text>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>{new Date(w.ts).getDate()}</Text>
                <Text style={{ color: col, fontSize: 9, fontWeight: '700' }}>{fmt(w.tot.kcal)}</Text>
              </Pressable>
            );
          })}
        </Row>
        <Card style={{ marginTop: 14, alignItems: 'center' }}>
          <Ring size={220} stroke={18} value={d.tot.kcal} max={goals.kcal} segments={sp}>
            <Text style={{ color: C.mut, fontSize: 11 }}>{t('goal')} = {fmt(goals.kcal)}</Text>
            <Text style={{ color: '#fff', fontSize: 44, fontWeight: '800' }}>{fmt(d.tot.kcal)}</Text>
            <Text style={{ color: C.mut, fontSize: 12 }}>{t('eaten')}</Text>
          </Ring>
          <View style={{ alignSelf: 'stretch', gap: 12, marginTop: 18 }}>
            {([['P', d.tot.P, goals.P, C.green], ['Cb', d.tot.C, goals.C, C.green2], ['F', d.tot.F, goals.F, '#fff']] as [TKey, number, number, string][]).map(([k, v, g, col]) => (
              <View key={k}>
                <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                  <Txt style={{ fontSize: 13 }}>{t(k)}</Txt>
                  <Text style={{ color: C.mut, fontSize: 13 }}>{Math.round(v)} / {g} g</Text>
                </Row>
                <Bar value={v} max={g} color={col} />
              </View>
            ))}
          </View>
        </Card>

        <H2>{t('logged')}: {d.day?.meals.length ?? 0}</H2>
        <Card style={{ paddingVertical: 6 }}>
          {d.day?.meals.length ? d.day.meals.map((m, i) => (
            <Row key={m.id} style={{ gap: 12, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: 'rgba(255,255,255,0.07)' }}>
              <View style={st.tl}><Text style={{ fontSize: 22 }}>{ICO[m.cat]}</Text></View>
              <View style={{ flex: 1 }}><Txt style={{ fontWeight: '700' }}>{m.name}</Txt><Txt style={{ color: C.mut, fontSize: 12 }}>{t(m.cat)}</Txt></View>
              <Text style={{ color: C.green, fontWeight: '800' }}>{fmt(m.kcal)} kcal</Text>
            </Row>
          )) : <Txt style={{ color: C.mut, paddingVertical: 12 }}>{t('noLog')}</Txt>}
        </Card>

        <H2>{t('last7')}</H2>
        <Card>
          <View style={{ height: 150, flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
            <View style={[st.goalLine, { bottom: (goals.kcal / mx) * 150 }]} />
            {week.map((w, i) => (
              <View key={w.k} style={{ flex: 1, height: `${Math.max(2, (w.tot.kcal / mx) * 100)}%`, borderRadius: 8, backgroundColor: i === 6 ? C.green : C.greenDark, opacity: w.tot.kcal ? 1 : 0.25 }} />
            ))}
          </View>
          <Label style={{ marginTop: 10 }}>{t('dashed')}</Label>
        </Card>
        <Row style={{ gap: 10, marginTop: 12 }}>
          {([[t('avg'), avg ? fmt(avg) : '—'], [t('pavg'), pavg ? `${pavg} g` : '—'], [t('streak'), String(streak)]] as [string, string][]).map(([l, v]) => (
            <Card key={l} style={{ flex: 1, padding: 14 }}><Label>{l}</Label><Txt style={{ fontSize: 22, fontWeight: '800', marginTop: 6 }}>{v}</Txt></Card>
          ))}
        </Row>
        {sum > 0 && (
          <Card style={{ marginTop: 12 }}>
            <View style={{ flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden' }}>
              {sp.map((v, i) => <View key={i} style={{ flex: v || 0.0001, backgroundColor: [C.green, C.greenDark, '#fff'][i] }} />)}
            </View>
            <Row style={{ justifyContent: 'space-between', marginTop: 10 }}>
              {(['P', 'Cb', 'F'] as TKey[]).map((k, i) => <Text key={k} style={{ color: C.mut, fontSize: 12 }}>● {t(k)} {Math.round((sp[i] / sum) * 100)}%</Text>)}
            </Row>
          </Card>
        )}
      </>
    );
  }

function Weight() {
  const { t } = useT();
    const weights = useApp((s) => s.weights);
    const profile = useApp((s) => s.profile);
    const addWeight = useApp((s) => s.addWeight);
    const [v, setV] = useState('');
    const save = () => {
      const n = parseFloat(v.replace(',', '.'));
      if (n > 20 && n < 400) { addWeight(Math.round(n * 10) / 10); setV(''); }
    };
    const input = (
      <Row style={{ gap: 10, marginTop: 14 }}>
        <TextInput value={v} onChangeText={setV} keyboardType="decimal-pad" placeholder={t('kg')} placeholderTextColor={C.dim} style={st.in} />
        <Btn title={t('add')} onPress={save} style={{ height: 52, paddingHorizontal: 24 }} />
      </Row>
    );
    if (!weights.length) {
      return (
        <Card style={{ alignItems: 'center', paddingVertical: 28 }}>
          <Text style={{ fontSize: 42 }}>⚖️</Text>
          <Txt center style={{ fontSize: 18, fontWeight: '800', marginTop: 8 }}>{t('logW')}</Txt>
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
    const W = 300, Hh = 120;
    const pts = ws.map((w, i) => `${ws.length === 1 ? W / 2 : (i / (ws.length - 1)) * W},${Hh - ((w - lo) / (hi - lo)) * Hh}`).join(' ');
    const gy = Hh - ((goal - lo) / (hi - lo)) * Hh;
    return (
      <>
        <Card>
          <Label>{t('curW')}</Label>
          <Text style={{ color: '#fff', fontSize: 46, fontWeight: '800', marginVertical: 6 }}>{cur} <Text style={{ fontSize: 16, color: C.mut }}>{t('kg')}</Text></Text>
          <Bar value={pct} max={100} />
          <Row style={{ justifyContent: 'space-between', marginTop: 10 }}>
            <Txt style={{ color: C.mut, fontSize: 13 }}>{t('startW')} {start}</Txt>
            <Txt style={{ color: C.mut, fontSize: 13 }}>{t('goalW')} {goal}</Txt>
          </Row>
          <Txt style={{ color: C.green, fontWeight: '700', marginTop: 6 }}>{Math.abs(cur - goal).toFixed(1)} {t('kg')} {t('toGo')}</Txt>
        </Card>
        <Card style={{ marginTop: 12 }}>
          <Svg width="100%" height={Hh + 20} viewBox={`-10 -10 ${W + 20} ${Hh + 20}`}>
            <Line x1={0} x2={W} y1={gy} y2={gy} stroke="rgba(255,255,255,0.35)" strokeDasharray="6 6" />
            <Polyline points={pts} fill="none" stroke={C.green} strokeWidth={3} strokeLinejoin="round" />
            {pts.split(' ').map((p, i) => { const [x, y] = p.split(',').map(Number); return <Circle key={i} cx={x} cy={y} r={4} fill={C.green} />; })}
          </Svg>
          {input}
        </Card>
      </>
    );
  }


const st = StyleSheet.create({
  day: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: C.card },
  dayOn: { borderColor: C.green },
  tl: { width: 46, height: 46, borderRadius: 14, backgroundColor: '#14331f', alignItems: 'center', justifyContent: 'center' },
  goalLine: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.4)' },
  in: { flex: 1, height: 52, color: '#fff', backgroundColor: '#000', borderWidth: 1, borderColor: C.line, borderRadius: R.md, paddingHorizontal: 16, fontSize: 18, textAlign: 'center' },
});
