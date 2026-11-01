import { StyleSheet, View } from 'react-native';
import { useT } from '../src/i18n';
import { dayKey, useApp } from '../src/store';
import { GRADE_COLOR, dayScore, weekBank } from '../src/score';
import { fmt } from '../src/calc';
import { C, themed } from '../src/theme';
import { Bar, Card, IconBadge, Num, Pop, Row, Txt } from '../src/components/ui';
import { Ring } from '../src/components/Ring';
import { Page } from '../src/components/Page';

/** Today's score with what earned each point, the last 7 days and the weekly calorie bank. */
export default function Score() {
  const { t, lang } = useT();
  const { days, goals, waterGoal, burn } = useApp();
  const burnOf = (k: string) => (burn[k] ?? []).reduce((a, b) => a + b.kcal, 0);
  const k = dayKey();
  const s = dayScore(days[k], goals, waterGoal, burnOf(k));
  const loc = lang === 'ar' ? 'ar' : lang;
  const week = Array.from({ length: 7 }, (_, i) => {
    const ts = Date.now() - (6 - i) * 864e5, key = dayKey(ts);
    return { ts, sc: days[key]?.meals.length ? dayScore(days[key], goals, waterGoal, burnOf(key)).total : 0 };
  });
  const bank = weekBank(days, goals, burn);
  const col = GRADE_COLOR[s.grade];
  return (
    <Page title={t('scT')}>
      <View style={{ alignItems: 'center' }}>
        <Ring size={190} stroke={16} value={s.total} max={100} color={col}>
          <Num style={{ fontSize: 54, fontWeight: '900', color: col, textAlign: 'center', lineHeight: 62 }}>{s.grade}</Num>
          <Num style={{ fontSize: 16, fontWeight: '800', color: C.mut, textAlign: 'center' }}>{s.total}/100</Num>
        </Ring>
        <Txt center style={{ color: C.mut, marginTop: 10, lineHeight: 22 }}>{t(s.total >= 85 ? 'scMsgA' : s.total >= 55 ? 'scMsgB' : 'scMsgC')}</Txt>
      </View>
      <Card style={{ marginTop: 18, gap: 14 }}>
        {s.parts.map((p, i) => (
          <Pop key={p.key} delay={i * 70}>
            <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
              <Txt style={{ fontWeight: '800' }}>{t(p.key)}</Txt>
              <Num style={{ fontWeight: '900', color: p.got >= p.max ? C.green : C.mut }}>{p.got}/{p.max}</Num>
            </Row>
            <Bar value={p.got} max={p.max} color={p.got >= p.max ? C.green : col} height={8} />
          </Pop>
        ))}
      </Card>
      <Card style={{ marginTop: 10 }}>
        <Txt style={{ fontWeight: '900', marginBottom: 12 }}>{t('sc7')}</Txt>
        <Row style={{ alignItems: 'flex-end', height: 120, gap: 8 }}>
          {week.map((w, i) => {
            const g = w.sc >= 85 ? 'A' : w.sc >= 70 ? 'B' : w.sc >= 55 ? 'C' : w.sc >= 40 ? 'D' : 'E';
            return (
              <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                <Num style={{ fontSize: 11, fontWeight: '800', color: C.mut }}>{w.sc || ''}</Num>
                <View style={{ width: '100%', height: Math.max(6, w.sc * 0.8), borderRadius: 8, backgroundColor: w.sc ? GRADE_COLOR[g] : C.surface2 }} />
                <Txt style={{ fontSize: 10, color: i === 6 ? C.text : C.dim, fontWeight: '700' }}>{new Date(w.ts).toLocaleDateString(loc, { weekday: 'narrow' })}</Txt>
              </View>
            );
          })}
        </Row>
      </Card>
      <Card style={{ marginTop: 10 }}>
        <Row style={{ gap: 12 }}>
          <IconBadge name="target" size={44} icon={22} />
          <View style={{ flex: 1 }}>
            <Txt style={{ fontWeight: '900' }}>{t('bankT')}</Txt>
            <Txt style={{ color: C.mut, fontSize: 12, lineHeight: 18 }}>{bank.used ? (bank.bank >= 0 ? t('bankSaved') : t('bankOver')) : t('bankEmpty')}</Txt>
          </View>
          {bank.used > 0 && <Num style={{ fontSize: 20, fontWeight: '900', color: bank.bank >= 0 ? C.green : C.red }}>{bank.bank >= 0 ? '+' : '-'}{fmt(Math.abs(bank.bank))}</Num>}
        </Row>
        {bank.used > 0 && bank.flex > 0 && (
          <View style={st.flex}><Txt style={{ color: C.green, fontWeight: '800', fontSize: 13 }}>{t('bankFlex')} +{fmt(bank.flex)} kcal</Txt></View>
        )}
      </Card>
    </Page>
  );
}

const st = themed(() => StyleSheet.create({
  flex: { marginTop: 12, alignSelf: 'flex-start', backgroundColor: 'rgba(57,230,140,0.12)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
}));
