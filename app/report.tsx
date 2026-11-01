import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useT, TKey } from '../src/i18n';
import { dayKey, totals, useApp } from '../src/store';
import { AiError, askCoach } from '../src/ai';
import { fmt, wShow } from '../src/calc';
import { C, themed } from '../src/theme';
import { Btn, Card, IconBadge, Num, Pop, Row, Txt } from '../src/components/ui';
import { Icon, IconName } from '../src/components/Icon';
import { Illus } from '../src/components/Illus';
import { Page } from '../src/components/Page';
import { Rich } from '../src/components/Rich';

/** Last 7 days in numbers, plus a short written review from the AI coach. */
export default function Report() {
  const { t, lang } = useT();
  const s = useApp();
  const keys = Array.from({ length: 7 }, (_, i) => dayKey(Date.now() - i * 864e5));
  const prevKeys = Array.from({ length: 7 }, (_, i) => dayKey(Date.now() - (i + 7) * 864e5));
  const logged = keys.filter((k) => (s.days[k]?.meals.length ?? 0) > 0);
  const tt = logged.map((k) => totals(s.days[k]));
  const avg = (f: (x: ReturnType<typeof totals>) => number) => (tt.length ? Math.round(tt.reduce((a, x) => a + f(x), 0) / tt.length) : 0);
  const avgK = avg((x) => x.kcal), avgP = avg((x) => x.P);
  const onTarget = tt.filter((x) => Math.abs(x.kcal - s.goals.kcal) <= s.goals.kcal * 0.1).length;
  const waterDays = keys.filter((k) => (s.days[k]?.water ?? 0) >= s.waterGoal).length;
  const meals = keys.reduce((a, k) => a + (s.days[k]?.meals.length ?? 0), 0);
  const burned = keys.reduce((a, k) => a + (s.burn[k] ?? []).reduce((b, x) => b + x.kcal, 0), 0);
  const prevLogged = prevKeys.filter((k) => (s.days[k]?.meals.length ?? 0) > 0);
  const prevAvg = prevLogged.length ? Math.round(prevLogged.reduce((a, k) => a + totals(s.days[k]).kcal, 0) / prevLogged.length) : 0;
  const wk = s.weights.filter((w) => Date.now() - w.t < 7 * 864e5);
  const wDelta = wk.length >= 2 ? Math.round((wk[wk.length - 1].w - wk[0].w) * 10) / 10 : null;

  const cacheKey = `${dayKey()}-${lang}-${meals}`;
  const [text, setText] = useState(s.report?.k === cacheKey ? s.report.text : '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const write = async () => {
    if (!logged.length) return;
    setBusy(true); setErr('');
    const stats = `Last 7 days: logged ${logged.length}/7 days, ${meals} meals. Average ${avgK} kcal/day (goal ${s.goals.kcal}), previous week average ${prevAvg || 'n/a'}. ` +
      `Average protein ${avgP} g (goal ${s.goals.P} g). Days within 10% of calorie goal: ${onTarget}. Days water goal reached: ${waterDays}/7. Exercise burned: ${burned} kcal. ` +
      (wDelta !== null ? `Weight change this week: ${wDelta} kg. ` : '') + (s.profile ? `Goal: ${s.profile.goal} weight, target ${s.profile.gw} kg.` : '');
    try {
      const out = await askCoach([{ role: 'user', content:
        `Write my weekly nutrition report from these numbers. ${stats}\n` +
        'Format: one short opening sentence; then a "**What went well**" heading with 2 bullets; a "**To improve**" heading with 1-2 bullets; ' +
        'a "**Next week**" heading with one concrete, simple goal. Be warm, specific and brief (under 120 words). No medical claims.' }], lang, stats);
      setText(out);
      s.setReport({ k: cacheKey, text: out });
    } catch (e) {
      const c = e instanceof AiError ? e.code : 'network';
      setErr(c === 'no_api' ? t('noApi') : c === 'rate' ? t('aiRate') : t('aiErr'));
    }
    setBusy(false);
  };
  useEffect(() => { if (!text && logged.length) write(); }, []);

  const tiles: [IconName, string, TKey, string?][] = [
    ['flame', fmt(avgK), 'avgK', prevAvg ? `${avgK - prevAvg >= 0 ? '+' : ''}${fmt(avgK - prevAvg)}` : undefined],
    ['target', `${onTarget}/7`, 'onTarget'],
    ['meat', `${avgP} g`, 'avgP'],
    ['drop', `${waterDays}/7`, 'waterDays'],
    ['bowl', String(meals), 'mealsLogged'],
    ['run', fmt(burned), 'burned'],
  ];

  return (
    <Page title={t('repT')}>
      <View style={{ alignItems: 'center' }}>
        <Illus kind="report" size={150} />
        <Txt center style={{ color: C.mut, marginTop: 2 }}>{t('repS')}</Txt>
      </View>
      <View style={st.grid}>
        {tiles.map(([ic, v, k, d], i) => (
          <Pop key={k} delay={i * 70} style={st.tile}>
            <IconBadge name={ic} size={34} icon={17} />
            <Num style={{ fontSize: 20, fontWeight: '900', marginTop: 8 }}>{v}</Num>
            <Txt numberOfLines={1} style={{ color: C.mut, fontSize: 12, fontWeight: '600' }}>{t(k)}</Txt>
            {!!d && <Num style={{ color: C.mut, fontSize: 11, fontWeight: '800', marginTop: 2 }}>{d} {t('vsLast')}</Num>}
          </Pop>
        ))}
      </View>
      {wDelta !== null && (
        <Card style={{ marginTop: 10 }}>
          <Row style={{ gap: 12 }}>
            <IconBadge name="scale" size={40} />
            <Txt style={{ flex: 1, fontWeight: '800' }}>{t('wkWeight')}</Txt>
            <Num style={{ fontSize: 18, fontWeight: '900', color: wDelta <= 0 ? C.green : C.text }}>{wDelta > 0 ? '+' : wDelta < 0 ? '-' : ''}{wShow(Math.abs(wDelta), s.imperial)} {s.imperial ? 'lb' : 'kg'}</Num>
          </Row>
        </Card>
      )}
      <Card style={{ marginTop: 10, padding: 18 }}>
        <Row style={{ gap: 10, marginBottom: 10 }}>
          <IconBadge name="sparkle" size={36} icon={18} loop="pulse" />
          <Txt style={{ flex: 1, fontWeight: '900', fontSize: 16 }}>{t('repAi')}</Txt>
          {!!text && !busy && (
            <Pressable hitSlop={8} onPress={write}><Icon name="refresh" size={18} color={C.mut} /></Pressable>
          )}
        </Row>
        {!logged.length ? <Txt style={{ color: C.mut, lineHeight: 22 }}>{t('repEmpty')}</Txt>
          : busy ? <Row style={{ gap: 10 }}><ActivityIndicator color={C.green} /><Txt style={{ color: C.mut }}>{t('repWriting')}</Txt></Row>
          : err ? <><Txt style={{ color: C.mut, lineHeight: 22 }}>{err}</Txt><Btn kind="soft" title={t('retry')} style={{ marginTop: 12 }} onPress={write} /></>
          : <Rich text={text} color={C.text} />}
      </Card>
    </Page>
  );
}

const st = themed(() => StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 18 },
  tile: { width: '31.5%', flexGrow: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 20, padding: 12 },
}));
