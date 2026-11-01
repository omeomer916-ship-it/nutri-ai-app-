import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useT, TKey } from '../src/i18n';
import { Checkin, dayKey, totals, useApp } from '../src/store';
import { fmt } from '../src/calc';
import { C, themed } from '../src/theme';
import { Btn, Card, IconBadge, Num, Pop, Row, Txt } from '../src/components/ui';
import { Icon } from '../src/components/Icon';
import { Page } from '../src/components/Page';

const MOOD_COL = ['#E5484D', '#EF7D00', '#F5C100', '#7AC547', '#1FC46F'];

/** Simple face whose smile follows the level (1 sad to 5 happy). */
function Face({ level, size, on }: { level: number; size: number; on: boolean }) {
  const c = on ? MOOD_COL[level - 1] : C.dim;
  const curve = (level - 3) * 3.2;
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Circle cx={20} cy={20} r={17} fill={on ? c + '33' : 'transparent'} stroke={c} strokeWidth={2.4} />
      <Circle cx={14} cy={16} r={2.2} fill={c} />
      <Circle cx={26} cy={16} r={2.2} fill={c} />
      <Path d={`M12 ${25 - curve / 2} Q20 ${25 + curve} 28 ${25 - curve / 2}`} stroke={c} strokeWidth={2.4} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

/** Daily check-in: mood, energy, hunger and sleep, with what they say about your eating. */
export default function CheckinScreen() {
  const { t } = useT();
  const { checkins, setCheckin, days } = useApp();
  const k = dayKey();
  const [c, setC] = useState<Checkin>(checkins[k] ?? { mood: 0, energy: 0, hunger: 0, sleep: 7 });
  const [saved, setSaved] = useState(!!checkins[k]);
  const set = (p: Partial<Checkin>) => { setC({ ...c, ...p }); setSaved(false); Haptics.selectionAsync().catch(() => {}); };
  const save = () => { setCheckin(k, c); setSaved(true); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); };

  // Insights over the last 14 days.
  const keys = Array.from({ length: 14 }, (_, i) => dayKey(Date.now() - i * 864e5));
  const list = keys.map((x) => ({ k: x, c: checkins[x], kcal: totals(days[x]).kcal, has: (days[x]?.meals.length ?? 0) > 0 })).filter((x) => x.c);
  const avg = (a: number[]) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);
  const sleepAvg = avg(list.map((x) => x.c.sleep));
  const moodAvg = avg(list.filter((x) => x.c.mood).map((x) => x.c.mood));
  const short = list.filter((x) => x.has && x.c.sleep < 6.5).map((x) => x.kcal);
  const good = list.filter((x) => x.has && x.c.sleep >= 7).map((x) => x.kcal);
  const diff = short.length >= 2 && good.length >= 2 ? Math.round(avg(short) - avg(good)) : null;

  const scale = (key: 'energy' | 'hunger', icon: 'bolt' | 'bowl', label: TKey, lo: TKey, hi: TKey) => (
    <Card style={{ marginTop: 10 }}>
      <Txt style={{ fontWeight: '900' }}>{t(label)}</Txt>
      <Row style={{ gap: 8, marginTop: 12 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => set({ [key]: n })} style={[st.lvl, c[key] >= n && { backgroundColor: C.green, borderColor: C.green }]}>
            <Icon name={icon} size={18} color={c[key] >= n ? '#000' : C.dim} stroke={2.2} />
          </Pressable>
        ))}
      </Row>
      <Row style={{ justifyContent: 'space-between', marginTop: 6 }}>
        <Txt style={{ color: C.dim, fontSize: 11 }}>{t(lo)}</Txt>
        <Txt style={{ color: C.dim, fontSize: 11 }}>{t(hi)}</Txt>
      </Row>
    </Card>
  );

  return (
    <Page title={t('ciT')}>
      <Card>
        <Txt style={{ fontWeight: '900' }}>{t('ciMood')}</Txt>
        <Row style={{ justifyContent: 'space-between', marginTop: 12 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable key={n} hitSlop={4} onPress={() => set({ mood: n })} style={{ transform: [{ scale: c.mood === n ? 1.15 : 1 }] }}>
              <Face level={n} size={50} on={c.mood === n} />
            </Pressable>
          ))}
        </Row>
      </Card>
      {scale('energy', 'bolt', 'ciEnergy', 'ciLow', 'ciHigh')}
      {scale('hunger', 'bowl', 'ciHunger', 'ciLow', 'ciHigh')}
      <Card style={{ marginTop: 10 }}>
        <Row style={{ gap: 12 }}>
          <IconBadge name="moon" size={42} icon={21} />
          <Txt style={{ flex: 1, fontWeight: '900' }}>{t('ciSleep')}</Txt>
          <Pressable hitSlop={6} onPress={() => set({ sleep: Math.max(0, c.sleep - 0.5) })} style={st.step}><Icon name="minus" size={18} /></Pressable>
          <Num style={{ fontSize: 22, fontWeight: '900', width: 58, textAlign: 'center' }}>{c.sleep}h</Num>
          <Pressable hitSlop={6} onPress={() => set({ sleep: Math.min(14, c.sleep + 0.5) })} style={st.step}><Icon name="plus" size={18} /></Pressable>
        </Row>
      </Card>
      <Btn title={saved ? t('ciSaved') : t('ciSave')} style={{ marginTop: 18 }} disabled={!c.mood}
        icon={<Icon name="check" size={18} color="#000" stroke={2.6} />} onPress={save} />

      {list.length > 0 && (
        <Pop>
          <Txt style={{ fontWeight: '900', fontSize: 17, marginTop: 24, marginBottom: 10 }}>{t('ciInsights')}</Txt>
          <Row style={{ gap: 10 }}>
            <Card style={{ flex: 1, alignItems: 'center' }}>
              <Num style={{ fontSize: 24, fontWeight: '900' }}>{sleepAvg.toFixed(1)}h</Num>
              <Txt center style={{ color: C.mut, fontSize: 12 }}>{t('ciAvgSleep')}</Txt>
            </Card>
            <Card style={{ flex: 1, alignItems: 'center' }}>
              {moodAvg ? <Face level={Math.round(moodAvg)} size={34} on /> : <Num style={{ fontSize: 24, fontWeight: '900' }}>—</Num>}
              <Txt center style={{ color: C.mut, fontSize: 12, marginTop: 2 }}>{t('ciAvgMood')}</Txt>
            </Card>
          </Row>
          <Card style={{ marginTop: 10, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <IconBadge name="sparkle" size={40} icon={20} loop="pulse" />
            <Txt style={{ flex: 1, lineHeight: 21 }}>
              {diff === null ? t('ciNeedMore') : diff > 80 ? `${t('ciShortMore')} ${fmt(diff)} kcal` : t('ciSleepOk')}
            </Txt>
          </Card>
        </Pop>
      )}
    </Page>
  );
}

const st = themed(() => StyleSheet.create({
  lvl: { flex: 1, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: C.surface2, borderWidth: 1, borderColor: C.stroke },
  step: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
}));
