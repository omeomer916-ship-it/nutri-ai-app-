import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useT } from '../src/i18n';
import { dayKey, useApp } from '../src/store';
import { QUEST_BONUS, TITLES, dayXp, levelOf, levelStart, quests, streakInfo, totalXp } from '../src/xp';
import { fmt } from '../src/calc';
import { C, themed } from '../src/theme';
import { Bar, Card, IconBadge, Num, Pop, Row, Txt } from '../src/components/ui';
import { Icon } from '../src/components/Icon';
import { Page } from '../src/components/Page';

const GOLD = ['#FFE48A', '#FFD45C', '#E0A91C'] as const;

/** Level, XP, today's quests, streak freezes and the road of titles ahead. */
export default function Quests() {
  const { t, lang } = useT();
  const s = useApp();
  const data = { days: s.days, goals: s.goals, waterGoal: s.waterGoal, burn: s.burn, checkins: s.checkins, fast: s.fast, toolUses: s.toolUses, suppLog: s.suppLog, supps: s.supps };
  const xp = totalXp(data);
  const lv = levelOf(xp);
  const qs = quests(data);
  const si = streakInfo(s.days);
  const loc = lang === 'ar' ? 'ar' : lang;
  const week = Array.from({ length: 7 }, (_, i) => { const ts = Date.now() - (6 - i) * 864e5; return { ts, xp: dayXp(data, dayKey(ts)) }; });
  const max = Math.max(60, ...week.map((w) => w.xp));
  const tier = Math.floor((lv.level - 1) / 3);

  return (
    <Page title={t('qT')}>
      <LinearGradient colors={C.mode === 'light' ? ['#FFF6D8', '#FFFFFF'] : ['#2A2209', '#0B0A05']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.hero}>
        <LinearGradient colors={GOLD} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.big}>
          <Txt style={{ color: '#2a1d00', fontSize: 11, fontWeight: '900' }}>{t('qLevel')}</Txt>
          <Num style={{ color: '#2a1d00', fontWeight: '900', fontSize: 34, lineHeight: 40, textAlign: 'center' }}>{lv.level}</Num>
        </LinearGradient>
        <Txt center style={{ fontSize: 22, fontWeight: '900', marginTop: 12 }}>{t(lv.title)}</Txt>
        <Num style={{ color: C.mut, fontWeight: '800', marginTop: 2, textAlign: 'center' }}>{fmt(xp)} XP</Num>
        <View style={{ alignSelf: 'stretch', marginTop: 14 }}><Bar value={lv.into} max={lv.need} color="#FFD45C" height={10} /></View>
        <Txt center style={{ color: C.mut, fontSize: 12, marginTop: 6 }}>{fmt(lv.need - lv.into)} XP {t('qToNext')} {lv.level + 1}</Txt>
      </LinearGradient>

      <Row style={{ gap: 10, marginTop: 10 }}>
        <Card style={{ flex: 1, alignItems: 'center' }}>
          <Icon name="flame" size={24} color={C.green} />
          <Num style={{ fontSize: 24, fontWeight: '900', marginTop: 4 }}>{si.streak}</Num>
          <Txt center style={{ color: C.mut, fontSize: 12 }}>{t('qStreak')}</Txt>
        </Card>
        <Card style={{ flex: 1, alignItems: 'center' }}>
          <Icon name="snow" size={24} color="#8FD8FF" />
          <Num style={{ fontSize: 24, fontWeight: '900', marginTop: 4 }}>{si.freezes}/2</Num>
          <Txt center style={{ color: C.mut, fontSize: 12 }}>{t('qFreezes')}</Txt>
        </Card>
      </Row>
      <Txt style={{ color: C.dim, fontSize: 12, marginTop: 8, lineHeight: 18 }}>{t('qFreezeHow')}{si.saved.length ? ` ${t('qSaved')} ${si.saved.length}.` : ''}</Txt>

      <Txt style={st.h}>{t('qToday')}</Txt>
      <Card style={{ paddingVertical: 6 }}>
        {qs.map((q, i) => (
          <Pop key={q.id} delay={i * 80}>
            <Row style={[{ gap: 12, paddingVertical: 12 }, i > 0 && { borderTopWidth: 1, borderTopColor: C.stroke }]}>
              <IconBadge name={q.icon} size={40} icon={20} color={q.done ? C.green : '#E0A91C'} />
              <Txt style={[{ flex: 1, fontWeight: '800' }, q.done && { color: C.mut, textDecorationLine: 'line-through' }]}>{t(q.title)}</Txt>
              {q.done ? <View style={st.ok}><Icon name="check" size={15} color="#000" stroke={3} /></View>
                : <Num style={{ color: '#E0A91C', fontWeight: '900' }}>+{q.xp} XP</Num>}
            </Row>
          </Pop>
        ))}
        <Row style={[st.bonus, qs.every((q) => q.done) && { borderColor: '#FFD45C' }]}>
          <Icon name="gift" size={18} color="#E0A91C" />
          <Txt style={{ flex: 1, fontWeight: '800', fontSize: 13 }}>{qs.every((q) => q.done) ? t('qAllDone') : t('qBonus')}</Txt>
          <Num style={{ color: '#E0A91C', fontWeight: '900' }}>+{QUEST_BONUS}</Num>
        </Row>
      </Card>
      <Txt style={{ color: C.dim, fontSize: 12, marginTop: 8 }}>{t('qNew')}</Txt>

      <Txt style={st.h}>{t('qWeek')}</Txt>
      <Card>
        <Row style={{ alignItems: 'flex-end', height: 120, gap: 8 }}>
          {week.map((w, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
              <Num style={{ fontSize: 10, fontWeight: '800', color: C.mut }}>{w.xp || ''}</Num>
              <LinearGradient colors={w.xp ? GOLD : [C.surface2, C.surface2]} style={{ width: '100%', height: Math.max(6, (w.xp / max) * 86), borderRadius: 8 }} />
              <Txt style={{ fontSize: 10, color: i === 6 ? C.text : C.dim, fontWeight: '700' }}>{new Date(w.ts).toLocaleDateString(loc, { weekday: 'narrow' })}</Txt>
            </View>
          ))}
        </Row>
      </Card>

      <Txt style={st.h}>{t('qRoad')}</Txt>
      <View style={{ gap: 8 }}>
        {TITLES.map((ti, i) => {
          const from = i * 3 + 1, reached = tier >= i, cur = tier === i;
          return (
            <Row key={ti} style={[st.road, cur && { borderColor: '#FFD45C' }, !reached && { opacity: 0.55 }]}>
              {reached ? <LinearGradient colors={GOLD} style={st.roadIc}><Icon name={cur ? 'star' : 'check'} size={16} color="#2a1d00" stroke={2.6} /></LinearGradient>
                : <View style={[st.roadIc, { backgroundColor: C.surface2 }]}><Icon name="lock" size={15} color={C.dim} /></View>}
              <Txt style={{ flex: 1, fontWeight: '800' }}>{t(ti)}</Txt>
              <Num style={{ color: C.mut, fontSize: 12, fontWeight: '800' }}>{t('qLevel')} {from}+ · {fmt(levelStart(from))} XP</Num>
            </Row>
          );
        })}
      </View>
      <Txt style={{ color: C.dim, fontSize: 12, marginTop: 14, lineHeight: 18 }}>{t('qFair')}</Txt>
    </Page>
  );
}

const st = themed(() => StyleSheet.create({
  hero: { alignItems: 'center', borderRadius: 26, padding: 20, borderWidth: 1, borderColor: 'rgba(255,212,92,0.45)' },
  big: { width: 96, height: 96, borderRadius: 32, alignItems: 'center', justifyContent: 'center', shadowColor: '#FFD45C', shadowOpacity: 0.6, shadowRadius: 20, elevation: 10 },
  h: { fontWeight: '900', fontSize: 17, marginTop: 22, marginBottom: 10 },
  ok: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  bonus: { alignItems: 'center', gap: 10, marginVertical: 8, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: C.stroke, backgroundColor: C.surface2 },
  road: { alignItems: 'center', gap: 12, padding: 12, borderRadius: 18, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  roadIc: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
}));
