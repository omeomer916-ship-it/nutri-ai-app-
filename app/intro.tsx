import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Easing, Linking, PanResponder, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';
import { useT } from '../src/i18n';
import { useApp } from '../src/store';
import { C, fa, themed } from '../src/theme';
import { Btn, IconBadge, Num, Pop, Txt } from '../src/components/ui';
import { Ring } from '../src/components/Ring';
import type { TKey } from '../src/i18n';
import { Icon, IconName } from '../src/components/Icon';
import { GoogleButton, googleReady } from '../src/GoogleButton';
import { Brand } from '../src/components/Brand';
import { Logo } from '../src/components/Logo';
import { LangPicker } from '../src/components/LangPicker';

const { width: W, height: H } = Dimensions.get('screen');

function GoogleG() {
  return (
    <Svg width={20} height={20} viewBox="0 0 48 48">
      <Path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.2 5.5-4.7 7.2l7.5 5.8c4.4-4.1 7-10.1 7-17.5z" />
      <Path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
      <Path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </Svg>
  );
}

/** Slow drifting green light behind every slide (pure vector, no photos). */
function Aurora() {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const l = Animated.loop(Animated.sequence([
      Animated.timing(a, { toValue: 1, duration: 7000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(a, { toValue: 0, duration: 7000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    l.start();
    return () => l.stop();
  }, []);
  const blob = (sz: number, op: number) => (
    <Svg width={sz} height={sz}>
      <Defs>
        <RadialGradient id={`g${sz}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={C.green} stopOpacity={op} />
          <Stop offset="1" stopColor={C.green} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={sz / 2} cy={sz / 2} r={sz / 2} fill={`url(#g${sz})`} />
    </Svg>
  );
  const light = C.mode === 'light';
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={{ position: 'absolute', top: -W * 0.35, left: -W * 0.3, transform: [{ translateX: a.interpolate({ inputRange: [0, 1], outputRange: [0, W * 0.25] }) }, { translateY: a.interpolate({ inputRange: [0, 1], outputRange: [0, H * 0.06] }) }] }}>
        {blob(W * 1.3, light ? 0.22 : 0.3)}
      </Animated.View>
      <Animated.View style={{ position: 'absolute', top: H * 0.3, right: -W * 0.45, transform: [{ translateX: a.interpolate({ inputRange: [0, 1], outputRange: [0, -W * 0.2] }) }, { translateY: a.interpolate({ inputRange: [0, 1], outputRange: [0, -H * 0.05] }) }] }}>
        {blob(W * 1.1, light ? 0.14 : 0.18)}
      </Animated.View>
      <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
        {Array.from({ length: 13 }).map((_, x) => Array.from({ length: 24 }).map((__, y) => (
          <Circle key={`${x}-${y}`} cx={12 + x * (W / 12)} cy={10 + y * 34} r={1} fill={fa(0.07)} />
        )))}
      </Svg>
      <LinearGradient colors={[C.bg + '00', C.bg]} locations={[0.45, 0.78]} style={StyleSheet.absoluteFill} />
    </View>
  );
}

/** Counts a number up from 0 when shown. */
function useCount(to: number, delay: number, ms = 1400) {
  const v = useRef(new Animated.Value(0)).current;
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = v.addListener(({ value }) => setN(Math.round(value)));
    Animated.timing(v, { toValue: to, duration: ms, delay, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    return () => v.removeListener(id);
  }, []);
  return n;
}

export default function Intro() {
  const { t, lang, rtl } = useT();
  const setLang = useApp((s) => s.setLang);
  const finishIntro = useApp((s) => s.finishIntro);
  const [i, setI] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const go = (n: number) => {
    if (n < 0 || n > 3 || n === i) return;
    Animated.timing(fade, { toValue: 0, duration: 160, useNativeDriver: true }).start(() => {
      setI(n);
      Animated.timing(fade, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    });
  };
  const swipe = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 18 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
    onPanResponderRelease: (_, g) => {
      if (Math.abs(g.dx) < 50) return;
      const fwd = (g.dx < 0) !== rtlRef.current;
      goRef.current(idxRef.current + (fwd ? 1 : -1));
    },
  })).current;
  const goRef = useRef(go); goRef.current = go;
  const idxRef = useRef(i); idxRef.current = i;
  const rtlRef = useRef(rtl); rtlRef.current = rtl;

  const slides = [
    { title: t('s1'), desc: t('d1') },
    { title: t('s2'), desc: t('d2') },
    { title: t('s3'), desc: t('d3') },
    { title: t('welcome'), desc: t('signS') },
  ];
  const sl = slides[i];
  const done = (acc: { name: string; email?: string; photo?: string; guest: boolean }) => {
    finishIntro(acc);
    router.replace(useApp.getState().profile ? '/(tabs)/today' : '/onboarding');
  };
  const onGoogle = async () => {
    // Real Google sign-in is enabled in phase 2 (see src/google.ts).
    Alert.alert('Google', t('googleOff'));
    done({ name: t('guestName'), guest: true });
  };

  const ar = lang === 'ar';

  return (
    <View style={[st.wrap, { direction: rtl ? 'rtl' : 'ltr' }]} {...swipe.panHandlers}>
      <Aurora />
      <Animated.View key={i} style={[StyleSheet.absoluteFill, { opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }]}>
        {i === 0 ? <ScanVisual ar={ar} /> : i === 1 ? <MacroVisual t={t} /> : i === 2 ? <CoachVisual ar={ar} /> : <BrandVisual />}
      </Animated.View>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={st.top}>
          <LangPicker style={st.pill} textStyle={st.pillT} />
          {i < 3 && (
            <Pressable style={st.pill} onPress={() => go(3)}>
              <Txt style={st.pillT}>{t('skip')}</Txt>
            </Pressable>
          )}
        </View>
        <View style={st.body}>
          {i < 3 ? (
            <View style={st.dots}>
              {[0, 1, 2].map((d) => <Pressable key={d} hitSlop={8} onPress={() => go(d)}><View style={[st.dot, d === i && st.dotOn]} /></Pressable>)}
            </View>
          ) : (
            <View style={{ alignSelf: 'center', marginBottom: 16 }}><Brand size="lg" /></View>
          )}
          <Animated.View style={{ opacity: fade }}>
            <Txt center style={st.title}>{sl.title}</Txt>
            <Txt center style={st.desc}>{sl.desc}</Txt>
          </Animated.View>
          {i < 3 ? (
            <Btn title={i === 2 ? t('start') : t('next')} onPress={() => go(i + 1)} />
          ) : (
            <>
              {googleReady ? (
                <GoogleButton title={t('google')} icon={<GoogleG />} failMsg={t('googleFail')} onUser={(u) => done({ ...u, guest: false })} />
              ) : (
                <Btn kind="white" title={t('google')} icon={<GoogleG />} onPress={onGoogle} />
              )}
              <Btn kind="ghost" title={t('guest')} style={{ marginTop: 12 }} onPress={() => done({ name: t('guestName'), guest: true })} />
              <Pressable onPress={() => Linking.openURL('https://nutri-ai-server.netlify.app/privacy').catch(() => {})}>
                <Txt center style={st.terms}>{t('terms')}</Txt>
              </Pressable>
            </>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

/** Slide 1: vector plate inside the scanner frame. A beam sweeps, then each food gets its label. */
function ScanVisual({ ar }: { ar: boolean }) {
  const S = Math.min(W * 0.82, H * 0.42);
  const beam = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const l = Animated.loop(Animated.sequence([
      Animated.timing(beam, { toValue: 1, duration: 1700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(beam, { toValue: 0, duration: 1700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    const r = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 30000, easing: Easing.linear, useNativeDriver: true }));
    l.start(); r.start();
    return () => { l.stop(); r.stop(); };
  }, []);
  const kcal = useCount(540, 1500);
  const P = S * 0.72;
  // [x, y on the plate (0-1), icon, name, kcal, label side]
  const foods: [number, number, IconName, string, number, 'l' | 'r'][] = [
    [0.3, 0.34, 'meat', ar ? 'سلمون مشوي' : 'Grilled salmon', 290, 'l'],
    [0.7, 0.4, 'avocado', ar ? 'أفوكادو' : 'Avocado', 160, 'r'],
    [0.46, 0.72, 'bowl', ar ? 'كينوا' : 'Quinoa', 90, 'r'],
  ];
  const corner = (rot: string, pos: object) => (
    <View style={[{ position: 'absolute', width: 54, height: 54, transform: [{ rotate: rot }] }, pos]}>
      <Svg width={54} height={54}><Path d="M4 50V20a16 16 0 0 1 16-16h30" stroke={C.text} strokeWidth={5} strokeLinecap="round" fill="none" /></Svg>
    </View>
  );
  return (
    <View style={[StyleSheet.absoluteFill, { alignItems: 'center' }]}>
      <View style={{ marginTop: H * 0.12, width: S, height: S, alignItems: 'center', justifyContent: 'center' }}>
        {corner('0deg', { top: 0, left: 0 })}
        {corner('90deg', { top: 0, right: 0 })}
        {corner('180deg', { bottom: 0, right: 0 })}
        {corner('270deg', { bottom: 0, left: 0 })}
        <Animated.View style={{ position: 'absolute', width: P * 1.12, height: P * 1.12, borderRadius: P, borderWidth: 1, borderStyle: 'dashed', borderColor: C.line, transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }} />
        <View style={[st.plate, { width: P, height: P, borderRadius: P / 2 }]}>
          <View style={[st.plateIn, { width: P * 0.78, height: P * 0.78, borderRadius: P }]} />
        </View>
        {foods.map(([x, y, ic, n, k, side], idx) => {
          const left = (S - P) / 2 + x * P, top = (S - P) / 2 + y * P;
          return (
            <View key={n} style={{ position: 'absolute', left: left - 30, top: top - 30 }}>
              <IconBadge name={ic} size={60} icon={30} delay={300 + idx * 180} loop="float" />
              <Pop delay={1200 + idx * 350} style={[st.tag, side === 'l' ? { right: 66 } : { left: 66 }]}>
                <Txt numberOfLines={1} style={{ fontWeight: '800', fontSize: 12 }}>{n}</Txt>
                <Num style={{ color: C.green, fontWeight: '900', fontSize: 12 }}>{k} kcal</Num>
              </Pop>
            </View>
          );
        })}
        <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 14, right: 14, top: 0, height: 70, transform: [{ translateY: beam.interpolate({ inputRange: [0, 1], outputRange: [0, S - 70] }) }] }}>
          <LinearGradient colors={['rgba(57,230,140,0)', 'rgba(57,230,140,0.22)', 'rgba(57,230,140,0)']} style={StyleSheet.absoluteFill} />
          <View style={{ position: 'absolute', top: 34, left: 0, right: 0, height: 2, borderRadius: 2, backgroundColor: C.green, shadowColor: C.green, shadowOpacity: 1, shadowRadius: 10, elevation: 6 }} />
        </Animated.View>
      </View>
      <Pop delay={1400} style={st.total}>
        <Icon name="sparkle" size={16} color={C.green} />
        <Num style={{ fontWeight: '900', fontSize: 22 }}>{kcal}</Num>
        <Num style={{ color: C.mut, fontWeight: '700', fontSize: 12 }}>kcal</Num>
        <View style={st.sep} />
        <Num style={{ color: C.mut, fontWeight: '700', fontSize: 12 }}>P 38g · C 41g · F 24g</Num>
      </Pop>
    </View>
  );
}

/** Slide 2: designed macro rings that fill up. */
function MacroVisual({ t }: { t: (k: TKey) => string }) {
  const v = useRef(new Animated.Value(0)).current;
  const [p, setP] = useState(0);
  useEffect(() => {
    const id = v.addListener(({ value }) => setP(value));
    Animated.timing(v, { toValue: 1, duration: 1600, delay: 300, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    return () => v.removeListener(id);
  }, []);
  const m: [TKey, number, number, string, IconName][] = [['P', 34, 0.7, C.pro, 'meat'], ['Cb', 48, 0.55, C.carb, 'bread'], ['F', 22, 0.8, C.fat, 'avocado']];
  return (
    <View style={[StyleSheet.absoluteFill, { alignItems: 'center' }]}>
      <View style={{ marginTop: H * 0.13 }}>
        <Ring size={W * 0.62} stroke={20} value={p} max={1} segments={[34 * 4, 48 * 4, 22 * 9]}>
          <Pop loop="wiggle"><Icon name="flame" size={28} color={C.green} fill="rgba(57,230,140,0.2)" /></Pop>
          <Num style={{ fontSize: 48, fontWeight: '900', textAlign: 'center' }}>{Math.round(412 * p)}</Num>
          <Num style={{ color: C.mut, fontSize: 14, textAlign: 'center' }}>kcal</Num>
        </Ring>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 22, paddingHorizontal: 24, direction: 'ltr' }}>
        {m.map(([k, g, f, col, ic], idx) => (
          <Pop key={k} delay={500 + idx * 200} style={st.macro}>
            <Ring size={54} stroke={6} value={f * p} max={1} color={col}><Icon name={ic} size={20} color={col} fill={col + '2E'} /></Ring>
            <Num style={{ fontWeight: '900', fontSize: 17, marginTop: 6, textAlign: 'center' }}>{Math.round(g * p)}g</Num>
            <Txt center style={{ color: C.mut, fontSize: 11 }}>{t(k)}</Txt>
          </Pop>
        ))}
      </View>
    </View>
  );
}

/** Slide 3: chat bubbles appearing one by one. */
function CoachVisual({ ar }: { ar: boolean }) {
  const q = ar ? 'شو آكل عالعشا عشان أكمّل البروتين؟' : 'What should I eat for dinner to hit my protein?';
  const a = ar ? 'لسا ناقصك 48 غ بروتين و620 سعرة. جرّب:' : 'You still need 48 g protein and 620 kcal. Try:';
  const opts = ar ? ['صدر دجاج مشوي مع سلطة', 'سلمون مع كينوا', 'زبادي يوناني مع لوز'] : ['Grilled chicken with salad', 'Salmon with quinoa', 'Greek yogurt with almonds'];
  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={{ marginTop: H * 0.12, paddingHorizontal: 22, gap: 12, direction: ar ? 'rtl' : 'ltr' }}>
        <Pop delay={200} style={{ alignSelf: 'center', alignItems: 'center', marginBottom: 8 }}>
          <View style={st.coachAv}><Logo size={52} /></View>
        </Pop>
        <Pop delay={600} style={[st.bub, st.me]}><Txt style={{ color: '#03140b', fontWeight: '800', fontSize: 15 }}>{q}</Txt></Pop>
        <Typing until={1300} />
        <Pop delay={1300} style={[st.bub, st.ai]}>
          <Txt style={{ fontSize: 15, lineHeight: 23 }}>{a}</Txt>
          {opts.map((o) => (
            <View key={o} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.green }} />
              <Txt style={{ fontSize: 14, fontWeight: '700' }}>{o}</Txt>
            </View>
          ))}
        </Pop>
      </View>
    </View>
  );
}

/** Three dots that bounce until the coach's answer arrives. */
function Typing({ until }: { until: number }) {
  const a = useRef(new Animated.Value(0)).current;
  const [on, setOn] = useState(true);
  useEffect(() => {
    const l = Animated.loop(Animated.timing(a, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true }));
    l.start();
    const id = setTimeout(() => { l.stop(); setOn(false); }, until);
    return () => { clearTimeout(id); l.stop(); };
  }, []);
  if (!on) return null;
  return (
    <Pop delay={700} style={[st.bub, st.ai, { flexDirection: 'row', gap: 6, paddingVertical: 16, direction: 'ltr' }]}>
      {[0, 1, 2].map((k) => (
        <Animated.View key={k} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.green, transform: [{ translateY: a.interpolate({ inputRange: [0, (k + 0.5) / 4, (k + 1.5) / 4, 1], outputRange: [0, -5, 0, 0] }) }] }} />
      ))}
    </Pop>
  );
}

/** Slide 4: brand emblem with food icons orbiting. */
function BrandVisual() {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.loop(Animated.timing(spin, { toValue: 1, duration: 22000, easing: Easing.linear, useNativeDriver: true })).start(); }, []);
  const rot = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const back = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] });
  const S = W * 0.8, r = S * 0.4;
  const orbit: IconName[] = ['flame', 'meat', 'bread', 'avocado', 'drop', 'barcode', 'sparkle', 'moon'];
  return (
    <View style={[StyleSheet.absoluteFill, { alignItems: 'center' }]}>
      <View style={{ marginTop: H * 0.1, width: S, height: S, alignItems: 'center', justifyContent: 'center' }}>
        <View style={[st.ring, { width: r * 2, height: r * 2, borderRadius: r }]} />
        <View style={[st.ring, { width: r * 1.3, height: r * 1.3, borderRadius: r, borderStyle: 'solid', borderColor: 'rgba(57,230,140,0.25)' }]} />
        <Animated.View style={{ position: 'absolute', width: S, height: S, transform: [{ rotate: rot }] }}>
          {orbit.map((ic, k) => {
            const ang = (k / orbit.length) * Math.PI * 2;
            return (
              <Animated.View key={ic} style={[st.orb, { left: S / 2 - 22 + Math.cos(ang) * r, top: S / 2 - 22 + Math.sin(ang) * r, transform: [{ rotate: back }] }]}>
                <Icon name={ic} size={19} color={C.green} />
              </Animated.View>
            );
          })}
        </Animated.View>
        <Pop loop="pulse">
          <View style={st.emblem}><Logo size={104} /></View>
        </Pop>
      </View>
    </View>
  );
}

const st = themed(() => StyleSheet.create({
  plate: { position: 'absolute', backgroundColor: C.surface, borderWidth: 1, borderColor: fa(0.1), alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: C.mode === 'light' ? 0.1 : 0.5, shadowRadius: 30, shadowOffset: { width: 0, height: 14 }, elevation: 10 },
  plateIn: { borderWidth: 1, borderColor: fa(0.06), backgroundColor: C.surface2 },
  tag: { position: 'absolute', top: 10, backgroundColor: C.bar, borderWidth: 1, borderColor: C.line, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4, maxWidth: 130 },
  total: { marginTop: 22, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.bar, borderWidth: 1, borderColor: 'rgba(57,230,140,0.5)', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8, direction: 'ltr' },
  sep: { width: 1, height: 16, backgroundColor: fa(0.15), marginHorizontal: 4 },
  macro: { flex: 1, alignItems: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.stroke, borderRadius: 20, paddingVertical: 12 },
  coachAv: { width: 76, height: 76, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.line },
  bub: { maxWidth: '88%', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 12 },
  me: { alignSelf: 'flex-end', backgroundColor: C.green, borderTopEndRadius: 6 },
  ai: { alignSelf: 'flex-start', backgroundColor: C.surface, borderWidth: 1, borderColor: C.stroke, borderTopStartRadius: 6 },
  ring: { position: 'absolute', borderWidth: 1, borderColor: 'rgba(57,230,140,0.2)', borderStyle: 'dashed' },
  orb: { position: 'absolute', width: 44, height: 44, borderRadius: 22, backgroundColor: C.surface, borderWidth: 1, borderColor: 'rgba(57,230,140,0.4)', alignItems: 'center', justifyContent: 'center' },
  emblem: { width: 140, height: 140, borderRadius: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, shadowColor: C.green, shadowOpacity: 0.5, shadowRadius: 40, elevation: 16 },

  wrap: { flex: 1, backgroundColor: C.bg, overflow: 'hidden' },
  top: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: fa(0.06), borderWidth: 1, borderColor: fa(0.14) },
  pillT: { color: C.text, fontWeight: '700', fontSize: 13 },
  body: { marginTop: 'auto', paddingHorizontal: 24, paddingBottom: 24 },
  dots: { flexDirection: 'row', gap: 7, justifyContent: 'center', marginBottom: 18 },
  dot: { width: 8, height: 8, borderRadius: 8, backgroundColor: fa(0.25) },
  dotOn: { width: 26, backgroundColor: C.green },
  title: { fontSize: H < 700 ? 28 : 32, fontWeight: '900', marginBottom: 8, lineHeight: H < 700 ? 40 : 46 },
  desc: { color: C.mut, fontSize: 16, lineHeight: 25, marginBottom: 24 },
  terms: { color: C.dim, fontSize: 12, marginTop: 14, textDecorationLine: 'underline' },
}));
