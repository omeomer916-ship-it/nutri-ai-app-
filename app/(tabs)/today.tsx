import { useEffect, useRef, useState } from 'react';
import { Image, ImageBackground, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useT, TKey } from '../../src/i18n';
import { CATS, Cat, Meal, dayKey, streakOf, totals, useApp } from '../../src/store';
import { fmt, hms } from '../../src/calc';
import { C, CAT_ICON, IMG, R } from '../../src/theme';
import { Btn, Card, H2, IconBadge, Num, Pop, Row, Screen, Txt } from '../../src/components/ui';
import { Ring } from '../../src/components/Ring';
import { Brand } from '../../src/components/Brand';
import { Icon, IconName } from '../../src/components/Icon';
import { MealSheet } from '../../src/components/MealSheet';
import { ExerciseSheet } from '../../src/components/ExerciseSheet';

export default function Today() {
  const { t, lang, rtl } = useT();
  const goals = useApp((s) => s.goals);
  const days = useApp((s) => s.days);
  const account = useApp((s) => s.account);
  const setWater = useApp((s) => s.setWater);
  const [edit, setEdit] = useState<Meal | null>(null);
  const [exOpen, setExOpen] = useState(false);
  const fast = useApp((s) => s.fast);
  const waterGoal = useApp((s) => s.waterGoal);
  const addMeal = useApp((s) => s.addMeal);
  const copyDay = useApp((s) => s.copyDay);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!fast.start) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [fast.start]);
  const dk = dayKey();
  const day = days[dk];
  const tot = totals(day);
  const burnList = useApp((s) => s.burn[dk]) ?? [];
  const removeBurn = useApp((s) => s.removeBurn);
  const burned = burnList.reduce((a, b) => a + b.kcal, 0);
  const left = goals.kcal + burned - tot.kcal;
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
  const openFood = (cat?: Cat) => router.push({ pathname: '/food', params: cat ? { cat } : {} });
  const macros: [string, number, number, string, IconName][] = [
    [t('P'), tot.P, goals.P, C.pro, 'meat'],
    [t('Cb'), tot.C, goals.C, C.carb, 'bread'],
    [t('F'), tot.F, goals.F, C.fat, 'avocado'],
  ];

  // One simple, honest tip for right now.
  const tip: TKey = !meals.length ? 'in0'
    : left < -100 ? 'inOver'
    : hr >= 14 && water < 4 ? 'inW'
    : hr >= 15 && tot.P < goals.P * 0.5 ? 'inP'
    : tot.kcal >= goals.kcal * 0.85 ? 'inGood' : 'inLeft';

  const shareDay = () => Share.share({
    message: `Nutri AI · ${new Date().toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long' })}\n` +
      `${fmt(tot.kcal)} / ${fmt(goals.kcal)} kcal\n${t('P')} ${Math.round(tot.P)}g · ${t('Cb')} ${Math.round(tot.C)}g · ${t('F')} ${Math.round(tot.F)}g`,
  }).catch(() => {});

  const yKey = dayKey(Date.now() - 864e5);
  const freq = (() => {
    const m = new Map<string, { n: number; meal: Meal }>();
    for (let i = 0; i < 30; i++) for (const x of days[dayKey(Date.now() - i * 864e5)]?.meals ?? []) {
      const e = m.get(x.name);
      m.set(x.name, { n: (e?.n ?? 0) + 1, meal: e?.meal ?? x });
    }
    return [...m.values()].sort((a, b) => b.n - a.n).slice(0, 8).map((e) => e.meal);
  })();
  const sections = CATS.filter((c) => ['bf', 'ln', 'dn', 'sn'].includes(c) || meals.some((m) => m.cat === c));

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between', marginTop: 10 }}>
        <Brand />
        <Row style={{ gap: 8 }}>
          <Pressable onPress={() => router.push('/pro')} style={st.pro}>
            <Icon name="crown" size={15} color="#000" stroke={2.4} />
            <Num style={{ fontWeight: '900', fontSize: 13, color: '#000' }}>PRO</Num>
          </Pressable>
          <Pressable onPress={() => router.navigate('/(tabs)/progress')} style={st.streak}>
            <Icon name="flame" size={17} color="#7CF5B5" fill="#7CF5B533" />
            <Num style={{ fontWeight: '800', fontSize: 15 }}>{streak}</Num>
          </Pressable>
        </Row>
      </Row>

      <Txt style={{ fontSize: 26, fontWeight: '900', marginTop: 22, lineHeight: 36 }}>{hello}{first ? `${rtl ? '،' : ','} ${first}` : ''}</Txt>

      <Row style={{ justifyContent: 'space-between', marginTop: 14 }}>
        {week.map((w) => (
          <Pressable key={w.k} onPress={() => router.navigate('/(tabs)/progress')} style={{ alignItems: 'center', gap: 6 }}>
            <Txt center style={{ fontSize: 11, color: w.today ? '#fff' : C.dim, fontWeight: '700' }}>
              {new Date(w.ts).toLocaleDateString(loc, { weekday: 'short' })}
            </Txt>
            <View style={[st.day, w.has && st.dayHas, w.today && st.dayToday]}>
              <Num style={{ fontWeight: '800', fontSize: 14, color: w.today ? '#000' : '#fff' }}>{new Date(w.ts).getDate()}</Num>
            </View>
          </Pressable>
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
            {burned > 0 && <>
              <View style={st.vsep} />
              <View>
                <Txt style={st.small}>{t('burned')}</Txt>
                <Num style={[st.smallV, { color: '#7CF5B5' }]}>+{fmt(burned)}</Num>
              </View>
            </>}
          </Row>
        </View>
        <Ring size={128} stroke={12} value={tot.kcal} max={goals.kcal + burned} color={left < 0 ? C.red : C.green}>
          <View style={st.flame}><Pop loop="wiggle"><Icon name="flame" size={30} color={C.green} fill="rgba(57,230,140,0.2)" /></Pop></View>
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
              <Txt numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} style={{ color: C.mut, fontSize: 12, fontWeight: '600' }}>{l} {rem >= 0 ? t('leftS') : t('overS')}</Txt>
              <View style={{ alignItems: 'center', marginTop: 12 }}>
                <Ring size={66} stroke={7} value={v} max={g} color={col}>
                  <Pop loop="pulse" delay={macros.findIndex((m) => m[0] === l) * 300}><Icon name={ic} size={22} color={col} fill={col + '2E'} /></Pop>
                </Ring>
              </View>
            </Card>
          );
        })}
      </Row>

      <Row style={{ gap: 10, marginTop: 10 }}>
        <QuickBtn icon="camera" label={t('scanNow')} color={C.green} onPress={() => openScan()} />
        <QuickBtn delay={250} icon="barcode" label={t('barcode')} color="#9AF3C4" onPress={() => router.push('/barcode')} />
        <QuickBtn delay={500} icon="search" label={t('addFood')} color={C.water} onPress={() => openFood()} />
        <QuickBtn delay={750} icon="share" label={t('shareDay')} color={C.carb} onPress={shareDay} />
      </Row>

      <Card style={{ marginTop: 10, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        <IconBadge name="sparkle" color={C.green} size={42} loop="pulse" />
        <View style={{ flex: 1 }}>
          <Txt style={{ fontWeight: '900' }}>{t('tipTitle')}</Txt>
          <Txt style={{ color: C.mut, fontSize: 14, lineHeight: 22, marginTop: 2 }}>{t(tip)}</Txt>
          <Pressable onPress={() => router.navigate('/(tabs)/coach')} style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Txt style={{ color: C.green, fontWeight: '800', fontSize: 13 }}>{t('askCoach')}</Txt>
            <View style={{ transform: [{ scaleX: rtl ? -1 : 1 }] }}><Icon name="chevron" size={15} color={C.green} stroke={2.6} /></View>
          </Pressable>
        </View>
      </Card>

      <Card style={{ marginTop: 10 }}>
        <Row style={{ gap: 12 }}>
          <IconBadge name="drop" color={C.water} size={44} loop="float" delay={400} />
          <View style={{ flex: 1 }}>
            <Txt style={{ fontWeight: '800', fontSize: 16 }}>{t('water')}</Txt>
            <Num style={{ color: C.mut, fontSize: 13, textAlign: 'left' }}>{water * 250} / {waterGoal * 250} ml</Num>
          </View>
          <Pressable hitSlop={8} style={st.round} onPress={() => setWater(water - 1)}><Icon name="minus" size={18} /></Pressable>
          <Pressable hitSlop={8} style={[st.round, { backgroundColor: C.water }]} onPress={() => setWater(water + 1)}><Icon name="plus" size={18} color="#03140b" stroke={2.6} /></Pressable>
        </Row>
        <Row style={{ gap: 6, marginTop: 14 }}>
          {Array.from({ length: waterGoal }, (_, i) => i + 1).map((n) => (
            <Pressable key={n} style={{ flex: 1 }} onPress={() => setWater(water === n ? n - 1 : n)}>
              <View style={[st.glass, n <= water && { backgroundColor: C.water }]} />
            </Pressable>
          ))}
        </Row>
      </Card>

      <Pressable onPress={() => router.push('/fasting')}>
        <Card style={{ marginTop: 10 }}>
          <Row style={{ gap: 12 }}>
            <IconBadge name="moon" color="#9AF3C4" size={44} loop="float" />
            <View style={{ flex: 1 }}>
              <Txt style={{ fontWeight: '800', fontSize: 16 }}>{t('fastT')}</Txt>
              {fast.start
                ? <Num style={{ color: '#9AF3C4', fontWeight: '900', fontSize: 15 }}>{hms(now - fast.start)} / {fast.hours}h</Num>
                : <Txt style={{ color: C.mut, fontSize: 12 }}>{t('fastS')}</Txt>}
            </View>
            {fast.start
              ? <Ring size={44} stroke={5} value={now - fast.start} max={fast.hours * 3600e3} color="#9AF3C4"><Icon name="moon" size={16} color="#9AF3C4" /></Ring>
              : <View style={[st.round, { backgroundColor: '#9AF3C4' }]}><Icon name="bolt" size={17} color="#000" stroke={2.6} /></View>}
          </Row>
        </Card>
      </Pressable>

      <Card style={{ marginTop: 10 }}>
        <Row style={{ gap: 12 }}>
          <IconBadge name="run" color="#7CF5B5" size={44} loop="float" delay={200} />
          <View style={{ flex: 1 }}>
            <Txt style={{ fontWeight: '800', fontSize: 16 }}>{t('exT')}</Txt>
            {burned > 0
              ? <Num style={{ color: '#7CF5B5', fontSize: 13, fontWeight: '700', textAlign: 'left' }}>{fmt(burned)} kcal</Num>
              : <Txt style={{ color: C.mut, fontSize: 12 }}>{t('exNone')}</Txt>}
          </View>
          <Pressable hitSlop={8} style={[st.round, { backgroundColor: '#7CF5B5' }]} onPress={() => setExOpen(true)}><Icon name="plus" size={18} color="#000" stroke={2.8} /></Pressable>
        </Row>
        {burnList.map((b) => (
          <Pressable key={b.id} onLongPress={() => removeBurn(dk, b.id)} style={st.exRow}>
            <Txt style={{ flex: 1, fontWeight: '700', fontSize: 14 }}>{b.name}</Txt>
            <Num style={{ color: C.mut, fontSize: 12 }}>{b.min} min</Num>
            <Num style={{ fontWeight: '900', color: '#7CF5B5', width: 70, textAlign: 'right' }}>-{fmt(b.kcal)}</Num>
          </Pressable>
        ))}
      </Card>

      <Pressable onPress={() => router.push('/pro')} style={({ pressed }) => [{ marginTop: 10 }, pressed && { opacity: 0.9 }]}>
        <LinearGradient colors={['#3a3010', '#14120a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.proBan}>
          <View style={st.crown}><Icon name="crown" size={22} color="#000" stroke={2.2} /></View>
          <View style={{ flex: 1 }}>
            <Txt style={{ fontWeight: '900', fontSize: 16 }}>{t('goPro')}</Txt>
            <Txt style={{ color: C.mut, fontSize: 12 }}>{t('proBan')}</Txt>
          </View>
          <View style={{ transform: [{ scaleX: rtl ? -1 : 1 }] }}><Icon name="chevron" size={20} color={C.green} stroke={2.6} /></View>
        </LinearGradient>
      </Pressable>

      <H2>{t('meals')}</H2>
      {freq.length > 0 && (
        <View style={{ marginBottom: 10 }}>
          <Txt style={{ color: C.mut, fontWeight: '700', fontSize: 13, marginBottom: 8 }}>{t('quickAdd')}</Txt>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
            {freq.map((m) => (
              <Pressable key={m.id} onPress={() => addMeal({ name: m.name, cat: m.cat, kcal: m.kcal, P: m.P, C: m.C, F: m.F, photo: m.photo })} style={({ pressed }) => [st.qa, pressed && { transform: [{ scale: 0.96 }] }]}>
                <Icon name="plus" size={14} color={C.green} stroke={2.8} />
                <Txt numberOfLines={1} style={{ fontWeight: '700', fontSize: 13, maxWidth: 150 }}>{m.name}</Txt>
                <Num style={{ color: C.dim, fontSize: 12 }}>{fmt(m.kcal)}</Num>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
      {!meals.length && (days[yKey]?.meals.length ?? 0) > 0 && (
        <Btn kind="soft" title={t('copyY')} style={{ marginBottom: 10 }} icon={<Icon name="copy" size={17} />} onPress={() => copyDay(yKey)} />
      )}
      {!meals.length && (
        <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 10 }}>
          <ImageBackground source={IMG.scan} style={{ height: 150 }} resizeMode="cover">
            <LinearGradient colors={['rgba(13,20,17,0)', C.surface]} style={StyleSheet.absoluteFill} />
          </ImageBackground>
          <View style={{ padding: 18, paddingTop: 2 }}>
            <Txt style={{ fontWeight: '900', fontSize: 18 }}>{t('emptyT')}</Txt>
            <Txt style={{ color: C.mut, marginTop: 4, lineHeight: 22 }}>{t('emptyS')}</Txt>
            <Row style={{ gap: 10, marginTop: 16 }}>
              <Btn title={t('scanNow')} style={{ flex: 1 }} icon={<Icon name="camera" size={19} color="#000" />} onPress={() => openScan()} />
              <Btn kind="soft" title={t('addFood')} style={{ flex: 1 }} icon={<Icon name="search" size={18} />} onPress={() => openFood()} />
            </Row>
          </View>
        </Card>
      )}
      <View style={{ gap: 10 }}>
        {sections.map((c) => {
          const it = meals.filter((m) => m.cat === c);
          const k = it.reduce((a, m) => a + m.kcal, 0);
          const ci = CAT_ICON[c];
          return (
            <Card key={c} style={{ padding: 14 }}>
              <Row style={{ gap: 12 }}>
                <IconBadge name={ci.icon} color={ci.color} size={40} />
                <View style={{ flex: 1 }}>
                  <Txt style={{ fontWeight: '900', fontSize: 16 }}>{t(c)}</Txt>
                  <Num style={{ color: C.mut, fontSize: 12, textAlign: 'left' }}>{fmt(k)} kcal</Num>
                </View>
                <Pressable hitSlop={6} onPress={() => openScan(c)} style={st.round}><Icon name="camera" size={17} /></Pressable>
                <Pressable hitSlop={6} onPress={() => openFood(c)} style={[st.round, { backgroundColor: C.green }]}><Icon name="plus" size={18} color="#000" stroke={2.8} /></Pressable>
              </Row>
              {it.map((m) => (
                <Pressable key={m.id} onPress={() => setEdit(m)} style={({ pressed }) => [st.meal, pressed && { opacity: 0.7 }]}>
                  {m.photo ? <Image source={{ uri: m.photo }} style={st.thumb} /> : <View style={[st.thumb, { alignItems: 'center', justifyContent: 'center', backgroundColor: C.surface2 }]}><Icon name={ci.icon} size={22} color={ci.color} /></View>}
                  <View style={{ flex: 1 }}>
                    <Txt numberOfLines={1} style={{ fontWeight: '800', fontSize: 14 }}>{m.name}</Txt>
                    <Row style={{ gap: 10, marginTop: 3 }}>
                      {([['meat', m.P, C.pro], ['bread', m.C, C.carb], ['avocado', m.F, C.fat]] as [IconName, number, string][]).map(([ic, v, col]) => (
                        <Row key={ic} style={{ gap: 3 }}>
                          <Icon name={ic} size={12} color={col} />
                          <Num style={{ color: C.mut, fontSize: 11, fontWeight: '700' }}>{Math.round(v)}g</Num>
                        </Row>
                      ))}
                    </Row>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Num style={{ fontWeight: '900', fontSize: 15 }}>{fmt(m.kcal)}</Num>
                    <Num style={{ color: C.dim, fontSize: 10 }}>kcal</Num>
                  </View>
                  <Icon name="edit" size={15} color={C.dim} />
                </Pressable>
              ))}
            </Card>
          );
        })}
      </View>

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
                  <Num style={{ color: C.green, fontWeight: '800', fontSize: 12, textAlign: 'left' }}>{fmt(k)} kcal</Num>
                </View>
              </ImageBackground>
            </Pressable>
          );
        })}
      </ScrollView>

      <MealSheet meal={edit} dayK={dk} onClose={() => setEdit(null)} />
      <ExerciseSheet open={exOpen} onClose={() => setExOpen(false)} />
    </Screen>
  );
}

function QuickBtn({ icon, label, color, onPress, delay = 0 }: { icon: IconName; label: string; color: string; onPress: () => void; delay?: number }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [st.quick, pressed && { transform: [{ scale: 0.97 }] }]}>
      <IconBadge name={icon} color={color} size={38} icon={19} loop="float" delay={delay} />
      <Txt center numberOfLines={1} adjustsFontSizeToFit style={{ fontSize: 12, fontWeight: '800', marginTop: 6 }}>{label}</Txt>
    </Pressable>
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
  pro: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFD45C', borderRadius: R.pill, paddingHorizontal: 10, paddingVertical: 6 },
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
  quick: { flex: 1, alignItems: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.stroke, borderRadius: R.md, paddingVertical: 12, paddingHorizontal: 6 },
  round: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  glass: { height: 26, borderRadius: 7, backgroundColor: 'rgba(79,195,255,0.12)' },
  proBan: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: R.lg, padding: 16, borderWidth: 1, borderColor: 'rgba(255,212,92,0.4)' },
  crown: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#FFD45C', alignItems: 'center', justifyContent: 'center' },
  meal: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.stroke },
  qa: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.surface, borderWidth: 1, borderColor: C.stroke, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  exRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.stroke },
  thumb: { width: 48, height: 48, borderRadius: 14 },
  tile: { width: 140, height: 176, borderRadius: R.md, overflow: 'hidden', borderWidth: 1, borderColor: C.stroke },
});
