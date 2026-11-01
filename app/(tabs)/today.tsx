import { useEffect, useRef, useState } from 'react';
import { Image, ImageBackground, Modal, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useT, TKey } from '../../src/i18n';
import { CATS, Cat, Meal, dayKey, streakOf, totals, useApp } from '../../src/store';
import { fmt, hms } from '../../src/calc';
import { C, CAT_ICON, IMG, R, themed, fa } from '../../src/theme';
import { Bar, Btn, Card, H2, IconBadge, Num, Pop, Row, Screen, Txt } from '../../src/components/ui';
import { Ring } from '../../src/components/Ring';
import { Brand } from '../../src/components/Brand';
import * as StoreReview from 'expo-store-review';
import { Illus } from '../../src/components/Illus';
import { GRADE_COLOR, dayScore, weekBank } from '../../src/score';
import { Confetti } from '../../src/components/Confetti';
import { QUEST_BONUS, levelOf, levelStart, quests, streakInfo, totalXp } from '../../src/xp';
import { scheduleStreakReminder } from '../../src/streakReminder';
import { Icon, IconName } from '../../src/components/Icon';
import { MealSheet } from '../../src/components/MealSheet';
import { ExerciseSheet } from '../../src/components/ExerciseSheet';

/** Dark ink used on the bright green hero card. */
const INK = '#03140b';

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
  const burnAll = useApp((s) => s.burn);
  const burnList = burnAll[dk] ?? [];
  const removeBurn = useApp((s) => s.removeBurn);
  const burned = burnList.reduce((a, b) => a + b.kcal, 0);
  const left = goals.kcal + burned - tot.kcal;
  const hr = new Date().getHours();
  const hello = hr < 12 ? t('gm') : hr < 18 ? t('ga') : t('ge');
  const water = day?.water ?? 0;
  const meals = day?.meals ?? [];
  const loc = lang === 'ar' ? 'ar-u-nu-latn' : lang;
  const first = account && !account.guest ? account.name.split(' ')[0] : '';
  const sInfo = streakInfo(days);
  const streak = sInfo.streak;
  const checkins = useApp((s) => s.checkins);
  const toolUses = useApp((s) => s.toolUses);
  const suppLog = useApp((s) => s.suppLog);
  const supps = useApp((s) => s.supps);

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

  const shareDay = () => router.push('/share');
  const score = dayScore(day, goals, waterGoal, burned);
  const bank = weekBank(days, goals, burnAll);
  // Confetti the first time today's score reaches A.
  const celebrated = useApp((s) => s.celebrated);
  const setCelebrated = useApp((s) => s.setCelebrated);
  const [party, setParty] = useState(false);
  // Levels, daily quests and the streak reminder.
  const xpData = { days, goals, waterGoal, burn: burnAll, checkins, fast, toolUses, suppLog, supps };
  const xpTotal = totalXp(xpData);
  const lvl = levelOf(xpTotal);
  const qs = quests(xpData);
  const lastLevel = useApp((s) => s.lastLevel);
  const setLastLevel = useApp((s) => s.setLastLevel);
  const [levelUp, setLevelUp] = useState(0);
  useEffect(() => {
    if (lvl.level > lastLevel) { if (lastLevel > 0) setLevelUp(lvl.level); setLastLevel(lvl.level); }
  }, [lvl.level]);
  useEffect(() => { if (meals.length) scheduleStreakReminder(streak, lang); }, [meals.length]);
  useEffect(() => {
    if (score.grade === 'A' && celebrated !== dk) { setCelebrated(dk); setParty(true); }
  }, [score.grade]);

  // Ask for a store rating once, only after a few good days of use.
  const rateAsked = useApp((s) => s.rateAsked);
  const setRateAsked = useApp((s) => s.setRateAsked);
  useEffect(() => {
    if (rateAsked || !meals.length) return;
    const active = Object.values(days).filter((d) => d.meals.length > 0).length;
    if (active < 3) return;
    const id = setTimeout(async () => {
      setRateAsked(Date.now());
      try { if (await StoreReview.isAvailableAsync()) await StoreReview.requestReview(); } catch { /* not available */ }
    }, 2500);
    return () => clearTimeout(id);
  }, [meals.length]);

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
          <Pressable onPress={() => router.push('/quests')} style={st.streak}>
            <Icon name="flame" size={17} color={C.orange} fill={C.orange + '33'} />
            <Num style={{ fontWeight: '800', fontSize: 15 }}>{streak}</Num>
            {sInfo.freezes > 0 && <><Icon name="snow" size={13} color="#8FD8FF" stroke={2.2} /><Num style={{ fontWeight: '800', fontSize: 12, color: '#8FD8FF' }}>{sInfo.freezes}</Num></>}
          </Pressable>
          <Pressable hitSlop={6} onPress={() => router.navigate('/(tabs)/profile')} style={st.avatar}>
            {account?.photo ? <Image source={{ uri: account.photo }} style={{ width: 38, height: 38, borderRadius: 19 }} />
              : <Txt style={{ fontWeight: '900', fontSize: 16, color: '#03140b' }}>{(account?.name || 'N').trim().charAt(0).toUpperCase()}</Txt>}
          </Pressable>
        </Row>
      </Row>

      <Txt style={{ fontSize: 26, fontWeight: '900', marginTop: 22, lineHeight: 36 }}>{hello}{first ? `${rtl ? '،' : ','} ${first}` : ''}</Txt>

      <Row style={{ justifyContent: 'space-between', marginTop: 14 }}>
        {week.map((w) => (
          <Pressable key={w.k} onPress={() => router.navigate('/(tabs)/progress')} style={{ alignItems: 'center', gap: 6 }}>
            <Txt center style={{ fontSize: 11, color: w.today ? C.text : C.dim, fontWeight: '700' }}>
              {new Date(w.ts).toLocaleDateString(loc, { weekday: 'short' })}
            </Txt>
            <View style={[st.day, w.has && st.dayHas, w.today && st.dayToday]}>
              <Num style={{ fontWeight: '800', fontSize: 14, color: w.today ? C.onInv : C.text }}>{new Date(w.ts).getDate()}</Num>
            </View>
          </Pressable>
        ))}
      </Row>

      <LinearGradient colors={left < 0 ? ['#FF8A8A', '#F05252', '#B42318'] : ['#4BF09A', '#1FC46F', '#0E8F4C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.hero}>
        <View style={{ flex: 1 }}>
          <CountUp value={Math.abs(left)} style={[st.big, { color: INK }]} />
          <Txt style={{ color: INK, opacity: 0.75, fontSize: 15, fontWeight: '800', marginTop: -4 }}>{left >= 0 ? t('kLeft') : t('kOver')}</Txt>
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
                <Num style={st.smallV}>+{fmt(burned)}</Num>
              </View>
            </>}
          </Row>
        </View>
        <Ring size={124} stroke={12} value={tot.kcal} max={goals.kcal + burned} color={INK} track="rgba(3,20,11,0.15)">
          <View style={st.flame}><Pop loop="wiggle"><Icon name="flame" size={30} color={INK} fill="rgba(3,20,11,0.15)" stroke={2.2} /></Pop></View>
        </Ring>
      </LinearGradient>

      <Row style={{ gap: 10, marginTop: 10 }}>
        {macros.map(([l, v, g, col, ic]) => {
          const rem = Math.round(g - v);
          return (
            <Card key={l} style={[st.macro, { borderColor: col + '55' }]}>
              <LinearGradient pointerEvents="none" colors={[col + '30', col + '00']} locations={[0, 0.7]} style={StyleSheet.absoluteFill} />
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

      <Pressable onPress={() => router.push('/score')} style={({ pressed }) => [st.scoreRow, pressed && { opacity: 0.85 }]}>
        <View style={[st.grade, { backgroundColor: GRADE_COLOR[score.grade] }]}><Num style={{ color: '#fff', fontWeight: '900', fontSize: 22 }}>{score.grade}</Num></View>
        <View style={{ flex: 1 }}>
          <Row style={{ gap: 6 }}>
            <Txt style={{ fontWeight: '900' }}>{t('scT')}</Txt>
            <Num style={{ color: C.mut, fontWeight: '800' }}>{score.total}/100</Num>
          </Row>
          <Txt numberOfLines={1} style={{ color: C.mut, fontSize: 12 }}>
            {bank.used ? `${t('bankT')}: ${bank.bank >= 0 ? '+' : '-'}${fmt(Math.abs(bank.bank))} kcal` : t('scTap')}
          </Txt>
        </View>
        <View style={{ transform: [{ scaleX: rtl ? -1 : 1 }] }}><Icon name="chevron" size={18} color={C.dim} /></View>
      </Pressable>

      <Pressable onPress={() => router.push('/quests')} style={({ pressed }) => [st.quest, pressed && { opacity: 0.9 }]}>
        <Row style={{ gap: 12 }}>
          <LinearGradient colors={['#FFE48A', '#FFD45C', '#E0A91C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.lvl}>
            <Num style={{ color: '#2a1d00', fontWeight: '900', fontSize: 17 }}>{lvl.level}</Num>
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Txt style={{ fontWeight: '900' }}>{t(lvl.title)}</Txt>
              <Num style={{ color: C.mut, fontSize: 12, fontWeight: '800' }}>{lvl.into}/{lvl.need} XP</Num>
            </Row>
            <View style={{ marginTop: 6 }}><Bar value={lvl.into} max={lvl.need} color="#FFD45C" height={7} /></View>
          </View>
        </Row>
        <Txt style={{ color: C.mut, fontSize: 12, fontWeight: '800', marginTop: 14, marginBottom: 4 }}>{t('qToday')}</Txt>
        {qs.map((q) => (
          <Row key={q.id} style={{ gap: 10, paddingVertical: 6 }}>
            <View style={[st.qChk, q.done && { backgroundColor: C.green, borderColor: C.green }]}>
              {q.done ? <Icon name="check" size={14} color="#000" stroke={3} /> : <Icon name={q.icon} size={13} color={C.dim} />}
            </View>
            <Txt style={[{ flex: 1, fontWeight: '700', fontSize: 14 }, q.done && { color: C.mut, textDecorationLine: 'line-through' }]}>{t(q.title)}</Txt>
            <Num style={{ color: q.done ? C.green : '#E0A91C', fontWeight: '900', fontSize: 13 }}>+{q.xp}</Num>
          </Row>
        ))}
        <Row style={[st.bonus, qs.every((q) => q.done) && { backgroundColor: 'rgba(255,212,92,0.18)', borderColor: '#FFD45C' }]}>
          <Icon name="gift" size={16} color="#E0A91C" />
          <Txt style={{ flex: 1, fontSize: 12, fontWeight: '800', color: C.mut }}>{qs.every((q) => q.done) ? t('qAllDone') : t('qBonus')}</Txt>
          <Num style={{ color: '#E0A91C', fontWeight: '900', fontSize: 13 }}>+{QUEST_BONUS}</Num>
        </Row>
      </Pressable>

      <Row style={{ gap: 10, marginTop: 10 }}>
        <QuickBtn icon="camera" label={t('scanNow')} color={C.green} onPress={() => openScan()} />
        <QuickBtn delay={200} icon="mic" label={t('voiceQ')} color={C.violet} onPress={() => router.push('/voice')} />
        <QuickBtn delay={400} icon="barcode" label={t('barcode')} color={C.orange} onPress={() => router.push('/barcode')} />
        <QuickBtn delay={600} icon="search" label={t('addFood')} color={C.sky} onPress={() => openFood()} />
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
            <IconBadge name="moon" color={C.violet} size={44} loop="float" />
            <View style={{ flex: 1 }}>
              <Txt style={{ fontWeight: '800', fontSize: 16 }}>{t('fastT')}</Txt>
              {fast.start
                ? <Num style={{ color: C.violet, fontWeight: '900', fontSize: 15 }}>{hms(now - fast.start)} / {fast.hours}h</Num>
                : <Txt style={{ color: C.mut, fontSize: 12 }}>{t('fastS')}</Txt>}
            </View>
            {fast.start
              ? <Ring size={44} stroke={5} value={now - fast.start} max={fast.hours * 3600e3} color={C.violet}><Icon name="moon" size={16} color={C.violet} /></Ring>
              : <View style={[st.round, { backgroundColor: C.violet }]}><Icon name="bolt" size={17} color="#000" stroke={2.6} /></View>}
          </Row>
        </Card>
      </Pressable>

      <Card style={{ marginTop: 10 }}>
        <Row style={{ gap: 12 }}>
          <IconBadge name="run" color={C.coral} size={44} loop="float" delay={200} />
          <View style={{ flex: 1 }}>
            <Txt style={{ fontWeight: '800', fontSize: 16 }}>{t('exT')}</Txt>
            {burned > 0
              ? <Num style={{ color: C.coral, fontSize: 13, fontWeight: '700', textAlign: 'left' }}>{fmt(burned)} kcal</Num>
              : <Txt style={{ color: C.mut, fontSize: 12 }}>{t('exNone')}</Txt>}
          </View>
          <Pressable hitSlop={8} style={[st.round, { backgroundColor: C.coral }]} onPress={() => setExOpen(true)}><Icon name="plus" size={18} color="#000" stroke={2.8} /></Pressable>
        </Row>
        {burnList.map((b) => (
          <Pressable key={b.id} onLongPress={() => removeBurn(dk, b.id)} style={st.exRow}>
            <Txt style={{ flex: 1, fontWeight: '700', fontSize: 14 }}>{b.name}</Txt>
            <Num style={{ color: C.mut, fontSize: 12 }}>{b.min} min</Num>
            <Num style={{ fontWeight: '900', color: C.coral, width: 70, textAlign: 'right' }}>-{fmt(b.kcal)}</Num>
          </Pressable>
        ))}
      </Card>

      <Pressable onPress={() => router.push('/pro')} style={({ pressed }) => [{ marginTop: 10 }, pressed && { opacity: 0.9 }]}>
        <LinearGradient colors={C.mode === 'light' ? ['#FFF4CF', '#FFE59A'] : ['#3a3010', '#14120a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.proBan}>
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
          <View style={{ alignItems: 'center', paddingTop: 10 }}><Illus kind="plate" size={150} /></View>
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
      {levelUp > 0 && (
        <Modal transparent visible animationType="fade" onRequestClose={() => setLevelUp(0)}>
          <Pressable style={st.partyBg} onPress={() => setLevelUp(0)}>
            <Pop style={st.party}>
              <LinearGradient colors={['#FFE48A', '#FFD45C', '#E0A91C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[st.lvl, { width: 84, height: 84, borderRadius: 28 }]}>
                <Num style={{ color: '#2a1d00', fontWeight: '900', fontSize: 38 }}>{levelUp}</Num>
              </LinearGradient>
              <Txt center style={{ fontSize: 22, fontWeight: '900', marginTop: 14 }}>{t('lvUp')}</Txt>
              <Txt center style={{ color: '#E0A91C', fontWeight: '900', marginTop: 4 }}>{t(levelOf(levelStart(levelUp)).title)}</Txt>
              <Txt center style={{ color: C.mut, marginTop: 6, lineHeight: 22 }}>{t('lvUpS')}</Txt>
              <Btn title={t('lvUpBtn')} style={{ marginTop: 18, alignSelf: 'stretch' }} onPress={() => setLevelUp(0)} />
            </Pop>
            <Confetti />
          </Pressable>
        </Modal>
      )}
      {party && (
        <Modal transparent visible animationType="fade" onRequestClose={() => setParty(false)}>
          <Pressable style={st.partyBg} onPress={() => setParty(false)}>
            <Pop style={st.party}>
              <View style={[st.grade, { width: 72, height: 72, borderRadius: 24, backgroundColor: GRADE_COLOR.A }]}><Num style={{ color: '#fff', fontWeight: '900', fontSize: 38 }}>A</Num></View>
              <Txt center style={{ fontSize: 22, fontWeight: '900', marginTop: 14 }}>{t('wow')}</Txt>
              <Txt center style={{ color: C.mut, marginTop: 6, lineHeight: 22 }}>{t('wowS')}</Txt>
              <Btn title={t('wowBtn')} style={{ marginTop: 18, alignSelf: 'stretch' }} icon={<Icon name="share" size={18} color="#000" stroke={2.4} />} onPress={() => { setParty(false); router.push('/share'); }} />
            </Pop>
            <Confetti onDone={() => {}} />
          </Pressable>
        </Modal>
      )}
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

const st = themed(() => StyleSheet.create({
  pro: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFD45C', borderRadius: R.pill, paddingHorizontal: 10, paddingVertical: 6 },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.surface2, borderRadius: R.pill, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: C.stroke },
  day: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: fa(0.12), borderStyle: 'dashed' },
  dayHas: { borderStyle: 'solid', borderColor: C.green },
  dayToday: { backgroundColor: C.inv, borderColor: C.inv, borderStyle: 'solid' },
  hero: { marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 22, paddingHorizontal: 18, borderRadius: R.lg + 4, shadowColor: '#1FC46F', shadowOpacity: 0.45, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 12 },
  big: { fontSize: 52, fontWeight: '900', lineHeight: 64 },
  small: { color: INK, opacity: 0.65, fontSize: 12, fontWeight: '700' },
  smallV: { color: INK, fontSize: 16, fontWeight: '900' },
  vsep: { width: 1, height: 28, backgroundColor: 'rgba(3,20,11,0.2)' },
  flame: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  macro: { flex: 1, padding: 14, overflow: 'hidden' },
  quick: { flex: 1, alignItems: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.stroke, borderRadius: R.md, paddingVertical: 12, paddingHorizontal: 6 },
  round: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  glass: { height: 26, borderRadius: 7, backgroundColor: 'rgba(79,195,255,0.12)' },
  quest: { marginTop: 10, padding: 14, borderRadius: R.lg, backgroundColor: C.surface, borderWidth: 1, borderColor: 'rgba(255,212,92,0.35)' },
  lvl: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  qChk: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: C.stroke, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  bonus: { alignItems: 'center', gap: 8, marginTop: 8, padding: 10, borderRadius: 14, borderWidth: 1, borderColor: C.stroke, backgroundColor: C.surface2 },
  partyBg: { flex: 1, backgroundColor: C.scrim, alignItems: 'center', justifyContent: 'center', padding: 30 },
  party: { alignSelf: 'stretch', alignItems: 'center', backgroundColor: C.surface, borderRadius: 28, padding: 24, borderWidth: 1, borderColor: C.line },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: C.line },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10, padding: 12, borderRadius: R.lg, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  grade: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  aiBan: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: R.lg, padding: 14, borderWidth: 1, borderColor: 'rgba(57,230,140,0.45)' },
  aiCount: { minWidth: 30, height: 30, borderRadius: 15, paddingHorizontal: 8, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  tools: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  tool: { width: '31.4%', flexGrow: 1, alignItems: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 20, paddingVertical: 14, paddingHorizontal: 6 },
  proBan: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: R.lg, padding: 16, borderWidth: 1, borderColor: 'rgba(255,212,92,0.4)' },
  crown: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#FFD45C', alignItems: 'center', justifyContent: 'center' },
  meal: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.stroke },
  qa: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.surface, borderWidth: 1, borderColor: C.stroke, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  exRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.stroke },
  thumb: { width: 48, height: 48, borderRadius: 14 },
  tile: { width: 140, height: 176, borderRadius: R.md, overflow: 'hidden', borderWidth: 1, borderColor: C.stroke },
}));
