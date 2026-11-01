import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useT, TKey } from '../../src/i18n';
import { dayKey, useApp } from '../../src/store';
import { TOOLS } from '../../src/tools';
import { challenges } from '../../src/challenges';
import { levelOf, totalXp } from '../../src/xp';
import { exportData } from '../../src/export';
import { INSTAGRAM, openInstagram } from '../../src/social';
import { C, R, fontFor, themed } from '../../src/theme';
import { IconBadge, Num, Pop, Row, Screen, Txt } from '../../src/components/ui';
import { Icon, IconName } from '../../src/components/Icon';

type Item = { k: TKey; icon: IconName; go: () => void; sub?: string };

/** Discover: every tool beyond the daily log, grouped and searchable, with a live hint on each. */
export default function Discover() {
  const { t, lang, rtl } = useT();
  const s = useApp();
  const [q, setQ] = useState('');
  const k = dayKey();
  const ci = s.checkins[k];
  const supTaken = (s.suppLog[k] ?? []).filter((id) => s.supps.some((x) => x.id === id)).length;
  const lastM = s.measures[s.measures.length - 1];
  const ch = challenges({ days: s.days, goals: s.goals, waterGoal: s.waterGoal, burn: s.burn, fast: s.fast });
  const push = (p: string) => () => router.push(p as never);

  const groups: [TKey, Item[]][] = [
    ['dcTrack', [
      { k: 'ciT', icon: 'heart', go: push('/checkin'), sub: ci ? `${ci.sleep}h · ${t('ciDone')}` : t('ciNot') },
      { k: 'bsT', icon: 'scale', go: push('/bodystats'), sub: lastM?.waist ? `${t('mWaist')} ${Math.round(s.imperial ? lastM.waist / 2.54 : lastM.waist)} ${s.imperial ? 'in' : 'cm'}` : t('dcBsSub') },
      { k: 'spT', icon: 'pill', go: push('/supps'), sub: s.supps.length ? `${supTaken}/${s.supps.length} ${t('spToday')}` : t('dcSpSub') },
      { k: 'bodyT', icon: 'compare', go: push('/body'), sub: s.photos.length ? `${s.photos.length} ${t('dcPhotos')}` : t('dcBodySub') },
    ]],
    ['dcPlan', [
      { k: 'qT', icon: 'gift', go: push('/quests'), sub: `${t('qLevel')} ${levelOf(totalXp({ days: s.days, goals: s.goals, waterGoal: s.waterGoal, burn: s.burn, checkins: s.checkins, fast: s.fast, toolUses: s.toolUses, suppLog: s.suppLog, supps: s.supps })).level}` },
      { k: 'recT', icon: 'book', go: push('/recipes'), sub: t('dcRecSub') },
      { k: 'chT', icon: 'trophy', go: push('/challenges'), sub: `${ch.filter((c) => c.done).length}/${ch.length} ${t('dcDone')}` },
      { k: 'repT', icon: 'chart', go: push('/report'), sub: t('dcRepSub') },
      { k: 'fastT', icon: 'moon', go: push('/fasting'), sub: s.fast.start ? t('fastOn') : `${s.fast.hours}:${24 - s.fast.hours}` },
    ]],
    ['dcMore', [
      { k: 'hT', icon: 'shield', go: push('/health'), sub: Object.values(s.health).filter(Boolean).length ? `${Object.values(s.health).filter(Boolean).length} ${t('dcOn')}` : t('dcHealthSub') },
      { k: 'shareDay', icon: 'share', go: push('/share'), sub: t('dcShareSub') },
      { k: 'scT', icon: 'target', go: push('/score'), sub: t('scTap') },
      { k: 'expT', icon: 'download', go: () => { exportData().catch(() => {}); }, sub: 'CSV' },
    ]],
  ];
  const nq = q.trim().toLowerCase();
  const match = (txt: string) => !nq || txt.toLowerCase().includes(nq);
  const tools = TOOLS.filter((x) => match(t(`tl_${x.id}` as TKey)) || match(t(`td_${x.id}` as TKey)));
  const shown = groups.map(([g, items]) => [g, items.filter((i) => match(t(i.k)) || match(i.sub ?? ''))] as [TKey, Item[]]).filter(([, i]) => i.length);

  return (
    <Screen>
      <Txt style={{ fontSize: 28, fontWeight: '900', marginTop: 14 }}>{t('tDiscover')}</Txt>
      <Txt style={{ color: C.mut, marginTop: 2 }}>{t('dcS')}</Txt>
      <Row style={st.search}>
        <Icon name="search" size={18} color={C.dim} />
        <TextInput value={q} onChangeText={setQ} placeholder={t('dcSearch')} placeholderTextColor={C.dim}
          style={[st.searchIn, { textAlign: rtl ? 'right' : 'left', fontFamily: fontFor(600, lang) }]} />
        {!!q && <Pressable hitSlop={8} onPress={() => setQ('')}><Icon name="x" size={16} color={C.dim} /></Pressable>}
      </Row>

      {tools.length > 0 && (
        <Pop>
          <Pressable onPress={push('/ai')} style={({ pressed }) => [{ marginTop: 16 }, pressed && { transform: [{ scale: 0.98 }] }]}>
            <LinearGradient colors={C.mode === 'light' ? ['#D7F6E5', '#FFFFFF'] : ['#14402A', '#07120C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.hero}>
              <Row style={{ gap: 12 }}>
                <IconBadge name="wand" size={50} icon={25} loop="pulse" />
                <View style={{ flex: 1 }}>
                  <Txt style={{ fontSize: 19, fontWeight: '900' }}>{t('aiT')}</Txt>
                  <Txt style={{ color: C.mut, fontSize: 12, lineHeight: 18 }}>{t('aiBan')}</Txt>
                </View>
                <View style={{ transform: [{ scaleX: rtl ? -1 : 1 }] }}><Icon name="chevron" size={20} color={C.green} stroke={2.6} /></View>
              </Row>
            </LinearGradient>
          </Pressable>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, marginTop: 10 }} contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}>
            {tools.map((x, i) => (
              <Pressable key={x.id} onPress={() => router.push({ pathname: '/tool', params: { id: x.id } })} style={({ pressed }) => [st.tool, pressed && { opacity: 0.85 }]}>
                <IconBadge name={x.icon} size={40} icon={20} delay={i * 60} />
                <Txt numberOfLines={2} style={{ fontWeight: '800', fontSize: 12.5, marginTop: 8, lineHeight: 17 }}>{t(`tl_${x.id}` as TKey)}</Txt>
              </Pressable>
            ))}
          </ScrollView>
        </Pop>
      )}

      {shown.map(([g, items], gi) => (
        <View key={g}>
          <Txt style={st.lab}>{t(g)}</Txt>
          <View style={st.grid}>
            {items.map((it, i) => (
              <Pop key={it.k} delay={gi * 120 + i * 60} style={st.cell}>
                <Pressable onPress={it.go} style={({ pressed }) => [st.card, pressed && { transform: [{ scale: 0.97 }] }]}>
                  <IconBadge name={it.icon} size={42} icon={21} />
                  <Txt numberOfLines={1} style={{ fontWeight: '900', fontSize: 14.5, marginTop: 10 }}>{t(it.k)}</Txt>
                  {!!it.sub && <Num numberOfLines={1} style={{ color: C.mut, fontSize: 12, marginTop: 2, textAlign: 'left' }}>{it.sub}</Num>}
                </Pressable>
              </Pop>
            ))}
          </View>
        </View>
      ))}
      {!tools.length && !shown.length && <Txt center style={{ color: C.mut, marginTop: 30 }}>{t('noRes')}</Txt>}
      {!!INSTAGRAM && !nq && (
        <Pressable onPress={openInstagram} style={({ pressed }) => [{ marginTop: 22 }, pressed && { transform: [{ scale: 0.98 }] }]}>
          <LinearGradient colors={['#F58529', '#DD2A7B', '#8134AF', '#515BD4']} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={st.ig}>
            <View style={st.igIc}><Icon name="instagram" size={26} color="#fff" stroke={2.2} /></View>
            <View style={{ flex: 1 }}>
              <Txt style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>{t('igFollow')}</Txt>
              <Num style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, textAlign: 'left' }}>@{INSTAGRAM}</Num>
              <Txt style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 }}>{t('igSub')}</Txt>
            </View>
            <View style={{ transform: [{ scaleX: rtl ? -1 : 1 }] }}><Icon name="chevron" size={20} color="#fff" stroke={2.6} /></View>
          </LinearGradient>
        </Pressable>
      )}
    </Screen>
  );
}

const st = themed(() => StyleSheet.create({
  search: { gap: 8, marginTop: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: R.pill, paddingHorizontal: 16, height: 48 },
  searchIn: { flex: 1, color: C.text, fontSize: 15, paddingVertical: 0 },
  hero: { borderRadius: 24, padding: 16, borderWidth: 1, borderColor: 'rgba(57,230,140,0.45)' },
  ig: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 24, padding: 16 },
  igIc: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  tool: { width: 104, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 20, padding: 12 },
  lab: { color: C.mut, fontWeight: '800', fontSize: 13, marginTop: 22, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: { width: '48.4%', flexGrow: 1 },
  card: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 22, padding: 14 },
}));
