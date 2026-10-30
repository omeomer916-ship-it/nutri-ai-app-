import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useT, TKey } from '../../src/i18n';
import { CATS, Cat, dayKey, totals, useApp } from '../../src/store';
import { fmt } from '../../src/calc';
import { C, ICO, IMG, R } from '../../src/theme';
import { Bar, Card, H1, H2, Label, Row, Screen, Txt } from '../../src/components/ui';
import { Ring } from '../../src/components/Ring';


export default function Today() {
  const { t, lang } = useT();
  const goals = useApp((s) => s.goals);
  const day = useApp((s) => s.days[dayKey()]);
  const account = useApp((s) => s.account);
  const setWater = useApp((s) => s.setWater);
  const tot = totals(day);
  const left = goals.kcal - tot.kcal;
  const hr = new Date().getHours();
  const hello = hr < 12 ? t('gm') : hr < 18 ? t('ga') : t('ge');
  const water = day?.water ?? 0;
  const meals = day?.meals ?? [];
  const date = new Date().toLocaleDateString(lang === 'ar' ? 'ar-u-nu-latn' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const openScan = (cat: Cat) => router.push({ pathname: '/(tabs)/scan', params: { cat } });

  return (
    <Screen>
      <Txt style={{ color: C.mut, marginTop: 10 }}>{date}</Txt>
      <H1>{hello}{account && !account.guest ? `${lang === 'ar' ? '،' : ','} ${account.name.split(' ')[0]}` : ''} 👋</H1>

      <ImageBackground source={IMG.bf} style={st.hero} imageStyle={{ borderRadius: R.lg }}>
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={[StyleSheet.absoluteFill, { borderRadius: R.lg }]} />
        <Row style={{ marginTop: 'auto', padding: 16, justifyContent: 'space-between' }}>
          <Txt style={{ fontSize: 17, fontWeight: '800', flex: 1 }}>{t('tToday')}</Txt>
          <View style={st.pill}><Text style={st.pillT}>{fmt(Math.abs(left))} {left >= 0 ? t('left') : t('over')}</Text></View>
        </Row>
      </ImageBackground>

      <Card style={{ marginTop: 14 }}>
        <Row style={{ gap: 18 }}>
          <Ring size={128} value={tot.kcal} max={goals.kcal} segments={[tot.P * 4, tot.C * 4, tot.F * 9]}>
            <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800' }}>{Math.round((tot.kcal / goals.kcal) * 100)}%</Text>
            <Text style={{ color: C.mut, fontSize: 11 }}>{t('ofGoal')}</Text>
          </Ring>
          <View style={{ flex: 1 }}>
            <Label>{t('eaten')}</Label>
            <Row style={{ alignItems: 'flex-end', gap: 6, marginVertical: 4 }}>
              <Text style={{ color: '#fff', fontSize: 40, fontWeight: '800' }}>{fmt(tot.kcal)}</Text>
              <Text style={{ color: C.mut, marginBottom: 8 }}>kcal</Text>
            </Row>
            <Bar value={tot.kcal} max={goals.kcal} />
            <Txt style={{ color: C.mut, fontSize: 12, marginTop: 8 }}>{t('goal')} · {fmt(goals.kcal)}</Txt>
          </View>
        </Row>
      </Card>

      <H2>{t('macros')}</H2>
      <Row style={{ gap: 10 }}>
        {([['P', tot.P, goals.P, C.green], ['Cb', tot.C, goals.C, C.green2], ['F', tot.F, goals.F, '#fff']] as [TKey, number, number, string][]).map(([k, v, g, col]) => (
          <Card key={k} style={{ flex: 1, padding: 14 }}>
            <Label>{t(k)}</Label>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', marginVertical: 6 }}>
              {Math.round(v)}<Text style={{ fontSize: 12, color: C.mut, fontWeight: '500' }}> / {g} g</Text>
            </Text>
            <Bar value={v} max={g} color={col} height={6} />
          </Card>
        ))}
      </Row>

      <H2>{t('meals')}</H2>
      <Card style={{ paddingVertical: 4 }}>
        {CATS.filter((c) => ['bf', 'ln', 'dn'].includes(c) || meals.some((m) => m.cat === c)).map((c, idx, arr) => {
          const it = meals.filter((m) => m.cat === c);
          const k = it.reduce((a, m) => a + m.kcal, 0);
          const photo = it.find((m) => m.photo)?.photo;
          return (
            <Pressable key={c} onPress={() => openScan(c)} style={[st.meal, idx < arr.length - 1 && st.sep]}>
              {photo ? <Image source={{ uri: photo }} style={st.thumb} /> : <View style={st.tl}><Text style={{ fontSize: 26 }}>{ICO[c]}</Text></View>}
              <View style={{ flex: 1 }}>
                <Txt style={{ fontSize: 16, fontWeight: '800' }}>{t(c)}</Txt>
                <Txt numberOfLines={1} style={{ color: C.mut, fontSize: 13, marginTop: 2 }}>{it.length ? it.map((m) => m.name).join('، ') : t('addMeal')}</Txt>
              </View>
              {it.length ? <Text style={st.k}>{fmt(k)} kcal</Text> : <View style={st.add}><Text style={{ fontSize: 22, fontWeight: '700' }}>+</Text></View>}
            </Pressable>
          );
        })}
      </Card>

      <H2>{t('water')}</H2>
      <Card>
        <Label>{water * 250} / 2000 ml</Label>
        <Row style={{ justifyContent: 'space-between', marginTop: 10 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <Pressable key={n} hitSlop={6} onPress={() => setWater(water === n ? n - 1 : n)}>
              <Text style={{ fontSize: 26, opacity: n <= water ? 1 : 0.25 }}>💧</Text>
            </Pressable>
          ))}
        </Row>
      </Card>

      <H2>{t('types')}</H2>
      <View style={st.grid}>
        {CATS.map((c) => {
          const k = meals.filter((m) => m.cat === c).reduce((a, m) => a + m.kcal, 0);
          return (
            <Pressable key={c} onPress={() => openScan(c)} style={st.tile}>
              <ImageBackground source={IMG[c]} style={{ flex: 1 }} imageStyle={{ borderRadius: R.md }}>
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={[StyleSheet.absoluteFill, { borderRadius: R.md }]} />
                <View style={{ marginTop: 'auto', padding: 12 }}>
                  <Txt style={{ fontWeight: '800', fontSize: 16 }}>{t(c)}</Txt>
                  <Txt style={{ color: C.green, fontWeight: '700', fontSize: 12 }}>{fmt(k)} kcal</Txt>
                </View>
              </ImageBackground>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const st = StyleSheet.create({
  hero: { height: 190, borderRadius: R.lg, overflow: 'hidden', borderWidth: 1, borderColor: C.line },
  pill: { backgroundColor: C.green, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  pillT: { color: '#000', fontWeight: '800', fontSize: 13 },
  meal: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  sep: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  thumb: { width: 58, height: 58, borderRadius: 16 },
  tl: { width: 58, height: 58, borderRadius: 16, backgroundColor: '#14331f', alignItems: 'center', justifyContent: 'center' },
  k: { color: C.green, fontWeight: '800', fontSize: 15 },
  add: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { width: '47.8%', height: 140, borderRadius: R.md, overflow: 'hidden', borderWidth: 1, borderColor: C.line },
});
