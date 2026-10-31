import type { ReactNode } from 'react';
import { Alert, Image, Linking, Pressable, Share, StyleSheet, Switch, TextInput, View } from 'react-native';
import { applyReminders } from '../../src/reminders';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useT, TKey } from '../../src/i18n';
import { Goals, dayKey, streakOf, totals, useApp } from '../../src/store';
import { hShow, wShow } from '../../src/calc';
import { C, R, fontFor } from '../../src/theme';
import { Card, H2, IconBadge, Num, Row, Screen, Segmented, Txt } from '../../src/components/ui';
import { Leaf } from '../../src/components/Leaf';
import { Icon, IconName } from '../../src/components/Icon';
import { googleSignOut } from '../../src/GoogleButton';
import { API } from '../../src/ai';
import { LangPicker } from '../../src/components/LangPicker';

export default function Profile() {
  const { t, lang, rtl } = useT();
  const { account, goals, profile, setGoals, signOut, resetAll, days, weights, remind, setRemind, waterGoal, setWaterGoal, imperial, setImperial } = useApp();
  const toggle = async (k: 'meals' | 'water', on: boolean) => {
    const next = { ...remind, [k]: on };
    setRemind({ [k]: on });
    const ok = await applyReminders(next, lang);
    if (!ok) { setRemind({ [k]: false }); Alert.alert(t('remT'), t('remNo')); }
  };
  const sw = (ic: IconName, col: string, label: string, k: 'meals' | 'water', sub: ReactNode) => (
    <Row key={k} style={st.row}>
      <IconBadge name={ic} color={col} size={38} icon={18} />
      <View style={{ flex: 1 }}>
        <Txt style={{ fontWeight: '700' }}>{label}</Txt>
        {sub}
      </View>
      <Switch value={remind[k]} onValueChange={(v) => toggle(k, v)} trackColor={{ false: C.surface3, true: C.green }} thumbColor="#fff" />
    </Row>
  );
  const all = Object.values(days);
  const mealsN = all.reduce((a, d) => a + d.meals.length, 0);
  const streak = streakOf(days);
  let best = 0;
  for (let i = 0, run = 0; i < 400; i++) {
    run = (days[dayKey(Date.now() - i * 864e5)]?.meals.length ?? 0) > 0 ? run + 1 : 0;
    best = Math.max(best, run);
  }
  const onGoal = all.some((d) => { const k = totals(d).kcal; return k >= goals.kcal * 0.9 && k <= goals.kcal * 1.1; });
  const ach: [IconName, TKey, boolean, string][] = [
    ['bowl', 'a_first', mealsN > 0, C.green],
    ['flame', 'a_s3', best >= 3, '#7CF5B5'],
    ['bolt', 'a_s7', best >= 7, C.carb],
    ['trophy', 'a_s30', best >= 30, '#39E68C'],
    ['star', 'a_m50', mealsN >= 50, C.pro],
    ['drop', 'a_water', all.some((d) => d.water >= 8), C.water],
    ['scale', 'a_weight', weights.length > 1, '#9AF3C4'],
    ['target', 'a_goal', onGoal, C.green],
  ];
  const bmi = profile ? profile.w / Math.pow(profile.h / 100, 2) : 0;
  const bmiK: TKey = bmi < 18.5 ? 'bUnder' : bmi < 25 ? 'bNormal' : bmi < 30 ? 'bOver' : 'bObese';
  const bmiC = bmi < 18.5 ? C.water : bmi < 25 ? C.green : bmi < 30 ? C.carb : C.red;

  const field = (k: keyof Goals, label: TKey, ic: IconName, col: string, unit: string) => (
    <Row key={k} style={st.row}>
      <IconBadge name={ic} color={col} size={38} icon={18} />
      <Txt style={{ flex: 1, fontWeight: '700' }}>{t(label)}</Txt>
      <View style={st.inWrap}>
        <TextInput
          key={`${k}-${goals[k]}`}
          defaultValue={String(goals[k])}
          keyboardType="number-pad"
          onEndEditing={(e) => { const n = parseInt(e.nativeEvent.text, 10); if (n > 0 && n < 10000) setGoals({ [k]: n }); }}
          style={[st.in, { fontFamily: fontFor(800, lang) }]}
        />
        <Num style={{ color: C.dim, fontSize: 12, fontWeight: '700' }}>{unit}</Num>
      </View>
    </Row>
  );

  const item = (ic: IconName, label: string, onPress: () => void, danger = false, last = false) => (
    <Pressable key={label} onPress={onPress} style={({ pressed }) => [st.row, last && { borderBottomWidth: 0 }, pressed && { opacity: 0.7 }]}>
      <IconBadge name={ic} color={danger ? C.red : '#fff'} size={38} icon={18} />
      <Txt style={{ flex: 1, fontWeight: '700', color: danger ? C.red : '#fff' }}>{label}</Txt>
      {!danger && <View style={{ transform: [{ scaleX: rtl ? -1 : 1 }] }}><Icon name="chevron" size={18} color={C.dim} /></View>}
    </Pressable>
  );

  const stats: [string, string][] = profile
    ? [[`${wShow(profile.w, imperial)}`, imperial ? 'lb' : t('kg')], [imperial ? hShow(profile.h, true) : `${profile.h}`, imperial ? '' : 'cm'], [`${profile.age}`, t('years')]]
    : [];

  return (
    <Screen>
      <View style={{ alignItems: 'center', marginTop: 22 }}>
        <View style={st.avRing}>
          {account?.photo ? <Image source={{ uri: account.photo }} style={st.av} /> : (
            <LinearGradient colors={['#7CF5B5', C.green, '#17A35B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[st.av, { alignItems: 'center', justifyContent: 'center' }]}>
              <Leaf size={38} color="#03140b" />
            </LinearGradient>
          )}
        </View>
        <Txt center style={{ fontSize: 24, fontWeight: '900', marginTop: 12 }}>{account?.name || t('guestName')}</Txt>
        <Txt center style={{ color: C.mut }}>{account?.email || t('member')}</Txt>
        {stats.length > 0 && (
          <Row style={st.stats}>
            {stats.map(([v, u], i) => (
              <Row key={i} style={{ flex: 1, justifyContent: 'center', gap: 4, alignItems: 'flex-end' }}>
                <Num style={{ fontSize: 20, fontWeight: '900' }}>{v}</Num>
                <Txt style={{ color: C.mut, fontSize: 12, marginBottom: 3 }}>{u}</Txt>
              </Row>
            ))}
          </Row>
        )}
      </View>

      <Pressable onPress={() => router.push('/pro')} style={({ pressed }) => [{ marginTop: 16 }, pressed && { opacity: 0.9 }]}>
        <LinearGradient colors={['#1d3b2b', '#0e1a14']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.proBan}>
          <View style={st.crown}><Icon name="crown" size={22} color="#000" stroke={2.2} /></View>
          <View style={{ flex: 1 }}>
            <Txt style={{ fontWeight: '900', fontSize: 16 }}>{t('goPro')}</Txt>
            <Txt style={{ color: C.mut, fontSize: 12 }}>{t('proBan')}</Txt>
          </View>
          <View style={{ transform: [{ scaleX: rtl ? -1 : 1 }] }}><Icon name="chevron" size={20} color="#39E68C" stroke={2.6} /></View>
        </LinearGradient>
      </Pressable>

      {profile && (
        <Card style={{ marginTop: 10 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt style={{ fontWeight: '800' }}>{t('bmi')}</Txt>
            <View style={[st.bmiTag, { backgroundColor: bmiC + '22' }]}><Txt style={{ color: bmiC, fontWeight: '800', fontSize: 12 }}>{t(bmiK)}</Txt></View>
          </Row>
          <Num style={{ fontSize: 34, fontWeight: '900', marginTop: 4, textAlign: 'left' }}>{bmi.toFixed(1)}</Num>
          <View style={st.bmiBar}>
            {[C.water, C.green, C.carb, C.red].map((c, i) => <View key={i} style={{ flex: [18.5 - 15, 25 - 18.5, 30 - 25, 40 - 30][i], backgroundColor: c, opacity: 0.85 }} />)}
            <View style={[st.bmiDot, { left: `${Math.max(0, Math.min(100, ((bmi - 15) / 25) * 100))}%` }]} />
          </View>
        </Card>
      )}

      <H2 right={<Num style={{ color: C.mut, fontWeight: '800' }}>{ach.filter((a) => a[2]).length}/{ach.length}</Num>}>{t('achT')}</H2>
      <View style={st.achGrid}>
        {ach.map(([ic, k, on, col]) => (
          <View key={k} style={st.ach}>
            <View style={[st.achI, on ? { backgroundColor: col + '26', borderColor: col } : null]}>
              <Icon name={on ? ic : 'lock'} size={22} color={on ? col : 'rgba(255,255,255,0.3)'} />
            </View>
            <Txt center numberOfLines={2} style={{ fontSize: 11, fontWeight: '700', color: on ? '#fff' : C.dim, marginTop: 6 }}>{t(k)}</Txt>
          </View>
        ))}
      </View>

      <H2>{t('goals')}</H2>
      <Card style={{ paddingVertical: 2 }}>
        {field('kcal', 'kcal', 'flame', '#7CF5B5', 'kcal')}
        {field('P', 'P', 'meat', C.pro, 'g')}
        {field('C', 'Cb', 'bread', C.carb, 'g')}
        <View style={{ marginBottom: -1 }}>{field('F', 'F', 'avocado', C.fat, 'g')}</View>
      </Card>

      <H2>{t('remT')}</H2>
      <Card style={{ paddingVertical: 2 }}>
        {sw('bell', '#7CF5B5', t('remMeals'), 'meals', <Num style={{ color: C.dim, fontSize: 12 }}>8:30 · 13:30 · 19:30</Num>)}
        {sw('drop', C.water, t('remWater'), 'water', <Txt style={{ color: C.dim, fontSize: 12 }}>5 {t('perDay')}</Txt>)}
        <Row style={[st.row, { borderBottomWidth: 0 }]}>
          <IconBadge name="drop" color={C.water} size={38} icon={18} />
          <Txt style={{ flex: 1, fontWeight: '700' }}>{t('waterGoal')}</Txt>
          <Pressable hitSlop={8} onPress={() => setWaterGoal(waterGoal - 1)} style={st.step}><Icon name="minus" size={16} /></Pressable>
          <Num style={{ fontWeight: '900', fontSize: 16, minWidth: 54, textAlign: 'center' }}>{(waterGoal * 0.25).toFixed(2).replace(/0$/, '')} L</Num>
          <Pressable hitSlop={8} onPress={() => setWaterGoal(waterGoal + 1)} style={st.step}><Icon name="plus" size={16} /></Pressable>
        </Row>
      </Card>

      <H2>{t('settings')}</H2>
      <Card style={{ paddingVertical: 2 }}>
        <Row style={st.row}>
          <IconBadge name="globe" color={C.water} size={38} icon={18} />
          <Txt style={{ flex: 1, fontWeight: '700' }}>{t('language')}</Txt>
          <LangPicker style={st.pill} textStyle={{ color: '#fff', fontWeight: '700', fontSize: 13 }} />
        </Row>
        <Row style={st.row}>
          <IconBadge name="scale" color={C.green} size={38} icon={18} />
          <Txt style={{ flex: 1, fontWeight: '700' }}>{t('units')}</Txt>
          <View style={{ width: 170 }}>
            <Segmented value={imperial ? 'i' : 'm'} options={[['m', 'kg · cm'], ['i', 'lb · ft']]} onChange={(v) => setImperial(v === 'i')} />
          </View>
        </Row>
        {item('refresh', t('redo'), () => router.push('/onboarding'))}
        {item('share', t('share'), () => { Share.share({ message: t('shareMsg') }).catch(() => {}); })}
        {item('star', t('rate'), () => { Linking.openURL('market://details?id=com.nutriai.app').catch(() => Linking.openURL('https://play.google.com/store/apps/details?id=com.nutriai.app').catch(() => {})); })}
        {item('info', t('privacy'), () => { Linking.openURL(`${API ?? 'https://nutri-ai-server.netlify.app'}/privacy`).catch(() => {}); })}
        {item('info', t('termsL'), () => { Linking.openURL(`${API ?? 'https://nutri-ai-server.netlify.app'}/terms`).catch(() => {}); })}
        {item('logout', account?.guest ? t('signIn') : t('signOut'), () => { googleSignOut(); signOut(); router.replace('/intro'); })}
        {item('trash', t('reset'), () =>
          Alert.alert(t('reset'), t('resetQ'), [
            { text: t('cancel'), style: 'cancel' },
            { text: t('del'), style: 'destructive', onPress: () => { resetAll(); router.replace('/intro'); } },
          ]), true, true)}
      </Card>
      <Num style={{ color: C.dim, marginTop: 22, fontSize: 12, textAlign: 'center' }}>Nutri AI · v{Constants.expoConfig?.version ?? '1.0.0'}</Num>
    </Screen>
  );
}

const st = StyleSheet.create({
  avRing: { padding: 4, borderRadius: 60, borderWidth: 2, borderColor: 'rgba(57,230,140,0.5)' },
  av: { width: 96, height: 96, borderRadius: 48 },
  stats: { alignSelf: 'stretch', marginTop: 18, backgroundColor: C.surface, borderWidth: 1, borderColor: C.stroke, borderRadius: R.lg, paddingVertical: 14 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.stroke, gap: 12 },
  inWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.surface2, borderRadius: R.pill, paddingHorizontal: 12, height: 42 },
  in: { width: 62, height: 42, paddingVertical: 0, color: '#fff', textAlign: 'center', textAlignVertical: 'center', includeFontPadding: false, fontSize: 16 },
  step: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  proBan: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: R.lg, padding: 16, borderWidth: 1, borderColor: 'rgba(57,230,140,0.4)' },
  crown: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#39E68C', alignItems: 'center', justifyContent: 'center' },
  bmiTag: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  bmiBar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'visible', marginTop: 10, direction: 'ltr' },
  bmiDot: { position: 'absolute', top: -5, width: 18, height: 18, marginLeft: -9, borderRadius: 9, backgroundColor: '#fff', borderWidth: 3, borderColor: '#000' },
  achGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 14 },
  ach: { width: '25%', alignItems: 'center', paddingHorizontal: 4 },
  achI: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.stroke },
  pill: { backgroundColor: C.surface2, borderRadius: R.pill, paddingHorizontal: 12, paddingVertical: 7 },
});
