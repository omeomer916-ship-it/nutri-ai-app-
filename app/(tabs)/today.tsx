import { useEffect, useRef, useState } from 'react';
import { Alert, Image, ImageBackground, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useT } from '../../src/i18n';
import { CATS, Cat, dayKey, streakOf, totals, useApp } from '../../src/store';
import { fmt } from '../../src/calc';
import { C, CAT_ICON, IMG, R } from '../../src/theme';
import { Btn, Card, H2, IconBadge, Num, Row, Screen, Txt } from '../../src/components/ui';
import { Ring } from '../../src/components/Ring';
import { Brand } from '../../src/components/Brand';
import { Icon, IconName } from '../../src/components/Icon';

export default function Today() {
  const { t, lang, rtl } = useT();
  const goals = useApp((s) => s.goals);
  const days = useApp((s) => s.days);
  const account = useApp((s) => s.account);
  const setWater = useApp((s) => s.setWater);
  const removeMeal = useApp((s) => s.removeMeal);
  const del = (id: string) => Alert.alert(t('delQ'), '', [
    { text: t('cancel'), style: 'cancel' },
    { text: t('del'), style: 'destructive', onPress: () => removeMeal(dayKey(), id) },
  ]);
  const day = days[dayKey()];
  const tot = totals(day);
  const left = goals.kcal - tot.kcal;
  const hr = new Date().getHours();
  const hello = hr < 12 ? t('gm') : hr < 18 ? t('ga') : t('ge');
  const water = day?.water ?? 0;
  const meals = day?.meals ?? [];
  const loc = lang === 'ar' ? 'ar-u-nu-latn' : lang;
  const first = account && !account.guest ? account.name.split(' ')[0] : '';
  const streak = streakOf(days);

  const week = [6, 5, 4, 3, 2, 1, 0].map((i) => {
    const ts = Date.now() - i * 864e5;
    return { ts, k: dayKey(ts), has: (days[dayKey(ts)]?.meals.length ?? 0) > 0, today: i === 0 };
  });

  const openScan = (cat?: Cat) => router.push({ pathname: '/(tabs)/scan', params: cat ? { cat } : {} });
  const macros: [string, number, number, string, IconName][] = [
    [t('P'), tot.P, goals.P, C.pro, 'drumstick'],
    [t('Cb'), tot.C, goals.C, C.carb, 'wheat'],
    [t('F'), tot.F, goals.F, C.fat, 'avocado'],
  ];

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between', marginTop: 10 }}>
        <Brand />
        <View style={st.streak}>
          <Icon name="flame" size={17} color="#FF9F5C" fill="#FF9F5C33" />
          <Num style={{ fontWeight: '800', fontSize: 15 }}>{streak}</Num>
        </View>
      </Row>

      <Txt style={{ fontSize: 26, fontWeight: '900', marginTop: 22, lineHeight: 36 }}>{hello}{first ? `${rtl ? '،' : ','} ${first}` : ''}</Txt>

      <Row style={{ justifyContent: 'space-between', marginTop: 14 }}>
        {week.map((w) => (
          <View key={w.k} style={{ alignItems: 'center', gap: 6 }}>
            <Txt center style={{ fontSize: 11, color: w.today ? '#fff' : C.dim, fontWeight: '700' }}>
              {new Date(w.ts).toLocaleDateString(loc, { weekday: 'short' })}
            </Txt>
            <View style={[st.day, w.has && st.dayHas, w.today && st.dayToday]}>
              <Num style={{ fontWeight: '800', fontSize: 14, color: w.today ? '#000' : '#fff' }}>{new Date(w.ts).getDate()}</Num>
            </View>
          </View>
        ))}
      </Row>

      <Card style={st.hero}>
        <View style={{ flex: 1 }}>
          <CountUp value={Math.abs(left)} style={st.big} />
          <Txt style={{ color: C.mut, fontSize: 15, fontWeight: '700', marginTop: -4 }}>{left >= 0 ? t('kLeft') : t('kOver')}</Txt>
          <Row style={{ gap: 14, marginTop: 14 }}>
            <View>
              <Txt style={st.small}>{t('eaten')}</Txt>
              <Num style={st.smallV}>{fmt(tot.kcal)}</Num>
            </View>
            <View style={st.vsep} />
            <View>
              <Txt style={st.small}>{t('goal')}</Txt>
              <Num style={st.smallV}>{fmt(goals.kcal)}</Num>
            </View>
          </Row>
        </View>
        <Ring size={128} stroke={12} value={tot.kcal} max={goals.kcal} color={left < 0 ? C.red : C.green}>
          <View style={st.flame}><Icon name="flame" size={30} color="#fff" fill="rgba(255,255,255,0.12)" /></View>
        </Ring>
      </Card>

      <Row style={{ gap: 10, marginTop: 10 }}>
        {macros.map(([l, v, g, col, ic]) => {
          const rem = Math.round(g - v);
          return (
            <Card key={l} style={st.macro}>
              <Row style={{ alignItems: 'flex-end', gap: 3 }}>
                <Num style={{ fontSize: 22, fontWeight: '900' }}>{Math.abs(rem)}</Num>
                <Num style={{ fontSize: 13, color: C.mut, fontWeight: '700', marginBottom: 3 }}>g</Num>
              </Row>
              <Txt numberOfLines={1} style={{ color: C.mut, fontSize: 12, fontWeight: '600' }}>{l} {rem >= 0 ? t('leftS') : t('overS')}</Txt>
              <View style={{ alignItems: 'center', marginTop: 12 }}>
                <Ring size={66} stroke={7} value={v} max={g} color={col}>
                  <Icon name={ic} size={22} color={col} />
                </Ring>
              </View>
            </Card>
          );
        })}
      </Row>

      <Card style={{ marginTop: 10 }}>
        <Row style={{ gap: 12 }}>
          <IconBadge name="drop" color={C.water} size={44} />
          <View style={{ flex: 1 }}>
            <Txt style={{ fontWeight: '800', fontSize: 16 }}>{t('water')}</Txt>
            <Num style={{ color: C.mut, fontSize: 13, textAlign: rtl ? 'right' : 'left' }}>{water * 250} / 2000 ml</Num>
          </View>
          <Pressable hitSlop={8} style={st.round} onPress={() => setWater(water - 1)}><Icon name="minus" size={18} /></Pressable>
          <Pressable hitSlop={8} style={[st.round, { backgroundColor: C.water }]} onPress={() => setWater(water + 1)}><Icon name="plus" size={18} color="#001a26" stroke={2.6} /></Pressable>
        </Row>
        <Row style={{ gap: 6, marginTop: 14 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <Pressable key={n} style={{ flex: 1 }} onPress={() => setWater(water === n ? n - 1 : n)}>
              <View style={[st.glass, n <= water && { backgroundColor: C.water }]} />
            </Pressable>
          ))}
        </Row>
      </Card>

      <H2 right={
        <Pressable onPress={() => router.push({ pathname: '/food', params: {} })} style={st.addBtn}>
          <Icon name="plus" size={16} color="#000" stroke={2.8} />
          <Txt style={{ color: '#000', fontWeight: '800', fontSize: 13 }}>{t('addFood')}</Txt>
        </Pressable>
      }>{t('recentLog')}</H2>
      {meals.length ? (
        <View style={{ gap: 10 }}>
          {meals.map((m) => {
            const ci = CAT_ICON[m.cat];
            return (
              <Pressable key={m.id} onLongPress={() => del(m.id)} delayLongPress={350}>
              <Card style={st.mealCard}>
                {m.photo ? <Image source={{ uri: m.photo }} style={st.thumb} /> : <View style={[st.thumb, { alignItems: 'center', justifyContent: 'center', backgroundColor: ci.color + '22' }]}><Icon name={ci.icon} size={30} color={ci.color} /></View>}
                <View style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 14 }}>
                  <Row style={{ justifyContent: 'space-between', gap: 8 }}>
                    <Txt numberOfLines={1} style={{ fontWeight: '800', fontSize: 15, flex: 1 }}>{m.name}</Txt>
                    <Num style={{ color: C.dim, fontSize: 12 }}>{new Date(m.t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</Num>
                  </Row>
                  <Row style={{ gap: 5, marginTop: 2 }}>
                    <Icon name="flame" size={15} color="#fff" />
                    <Num style={{ fontWeight: '800', fontSize: 15 }}>{fmt(m.kcal)} kcal</Num>
                  </Row>
                  <Row style={{ gap: 12, marginTop: 6 }}>
                    {([['drumstick', m.P, C.pro], ['wheat', m.C, C.carb], ['avocado', m.F, C.fat]] as [IconName, number, string][]).map(([ic, v, col]) => (
                      <Row key={ic} style={{ gap: 4 }}>
                        <Icon name={ic} size={13} color={col} />
                        <Num style={{ color: C.mut, fontSize: 12, fontWeight: '700' }}>{Math.round(v)}g</Num>
                      </Row>
                    ))}
                  </Row>
                </View>
              </Card>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <ImageBackground source={IMG.scan} style={{ height: 160 }} resizeMode="cover">
            <LinearGradient colors={['rgba(13,20,17,0)', C.surface]} style={StyleSheet.absoluteFill} />
          </ImageBackground>
          <View style={{ padding: 18, paddingTop: 4 }}>
            <Txt style={{ fontWeight: '900', fontSize: 18 }}>{t('emptyT')}</Txt>
            <Txt style={{ color: C.mut, marginTop: 4, lineHeight: 22 }}>{t('emptyS')}</Txt>
            <Btn title={t('scanNow')} style={{ marginTop: 16 }} icon={<Icon name="camera" size={20} color="#000" />} onPress={() => openScan()} />
            <Btn kind="soft" title={t('addFood')} style={{ marginTop: 10 }} icon={<Icon name="search" size={19} />} onPress={() => router.push({ pathname: '/food', params: {} })} />
          </View>
        </Card>
      )}

      <H2>{t('types')}</H2>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}>
        {CATS.map((c) => {
          const k = meals.filter((m) => m.cat === c).reduce((a, m) => a + m.kcal, 0);
          return (
            <Pressable key={c} onPress={() => openScan(c)} style={({ pressed }) => [st.tile, pressed && { transform: [{ scale: 0.97 }] }]}>
              <ImageBackground source={IMG[c]} style={{ flex: 1 }} resizeMode="cover">
                <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.88)']} locations={[0.35, 1]} style={StyleSheet.absoluteFill} />
                <View style={{ marginTop: 'auto', padding: 12 }}>
                  <Txt style={{ fontWeight: '900', fontSize: 16 }}>{t(c)}</Txt>
                  <Num style={{ color: C.green, fontWeight: '800', fontSize: 12, textAlign: rtl ? 'right' : 'left' }}>{fmt(k)} kcal</Num>
                </View>
              </ImageBackground>
            </Pressable>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

/** Number that counts up to its value. */
function CountUp({ value, style }: { value: number; style: object }) {
  const [n, setN] = useState(value);
  const from = useRef(0);
  useEffect(() => {
    const start = Date.now(), a = from.current, b = value, dur = 700;
    let id = 0;
    const step = () => {
      const p = Math.min(1, (Date.now() - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setN(Math.round(a + (b - a) * e));
      if (p < 1) id = requestAnimationFrame(step);
      else from.current = b;
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [value]);
  return <Num style={style}>{fmt(n)}</Num>;
}

const st = StyleSheet.create({
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.green, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.surface2, borderRadius: R.pill, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: C.stroke },
  day: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)', borderStyle: 'dashed' },
  dayHas: { borderStyle: 'solid', borderColor: C.green },
  dayToday: { backgroundColor: '#fff', borderColor: '#fff', borderStyle: 'solid' },
  hero: { marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 22 },
  big: { fontSize: 52, fontWeight: '900', lineHeight: 64 },
  small: { color: C.dim, fontSize: 12, fontWeight: '600' },
  smallV: { fontSize: 16, fontWeight: '800' },
  vsep: { width: 1, height: 28, backgroundColor: C.stroke },
  flame: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  macro: { flex: 1, padding: 14 },
  round: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  glass: { height: 26, borderRadius: 7, backgroundColor: 'rgba(79,195,255,0.12)' },
  mealCard: { padding: 0, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  thumb: { width: 92, height: 96 },
  tile: { width: 140, height: 176, borderRadius: R.md, overflow: 'hidden', borderWidth: 1, borderColor: C.stroke },
});
