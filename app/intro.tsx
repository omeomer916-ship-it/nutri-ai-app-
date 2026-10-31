import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Easing, Linking, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useT } from '../src/i18n';
import { useApp } from '../src/store';
import { C, IMG } from '../src/theme';
import { Btn, Glow, Num, Pop, Txt } from '../src/components/ui';
import { Ring } from '../src/components/Ring';
import type { TKey } from '../src/i18n';
import { Icon, IconName } from '../src/components/Icon';
import { Leaf } from '../src/components/Leaf';
import { GoogleButton, googleReady } from '../src/GoogleButton';
import { Brand } from '../src/components/Brand';
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

/** Floating glass chip used on the intro photos. */
function Chip({ top, side, delay, children }: { top: number; side: 'start' | 'end'; delay: number; children: React.ReactNode }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(a, { toValue: 1, useNativeDriver: true, friction: 6 }),
    ]).start();
  }, []);
  return (
    <Animated.View
      style={[st.chip, { top: `${top}%` }, side === 'start' ? { start: '7%' } : { end: '7%' },
        { opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }]}
    >
      {children}
    </Animated.View>
  );
}

export default function Intro() {
  const { t, lang, rtl } = useT();
  const setLang = useApp((s) => s.setLang);
  const finishIntro = useApp((s) => s.finishIntro);
  const [i, setI] = useState(0);
  const zoom = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    zoom.setValue(0);
    Animated.timing(zoom, { toValue: 1, duration: 9000, useNativeDriver: true }).start();
  }, [i]);

  const slides = [
    { img: IMG.intro1, title: t('s1'), desc: t('d1') },
    { img: IMG.intro2, title: t('s2'), desc: t('d2') },
    { img: IMG.intro3, title: t('s3'), desc: t('d3') },
    { img: IMG.welcome, title: t('welcome'), desc: t('signS') },
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
    <View style={[st.wrap, { direction: rtl ? 'rtl' : 'ltr' }]}>
      {i === 0 ? <ScanVisual ar={ar} zoom={zoom} /> : i === 1 ? <MacroVisual t={t} /> : i === 2 ? <CoachVisual ar={ar} /> : <BrandVisual />}
      <SafeAreaView style={{ flex: 1 }}>
        <View style={st.top}>
          <LangPicker style={st.pill} textStyle={st.pillT} />
          {i < 3 && (
            <Pressable style={st.pill} onPress={() => setI(3)}>
              <Txt style={st.pillT}>{t('skip')}</Txt>
            </Pressable>
          )}
        </View>
        <View style={st.body}>
          {i < 3 ? (
            <View style={st.dots}>
              {[0, 1, 2].map((d) => <View key={d} style={[st.dot, d === i && st.dotOn]} />)}
            </View>
          ) : (
            <View style={{ alignSelf: 'center', marginBottom: 16 }}><Brand size="lg" /></View>
          )}
          <Txt center style={st.title}>{sl.title}</Txt>
          <Txt center style={st.desc}>{sl.desc}</Txt>
          {i < 3 ? (
            <Btn title={i === 2 ? t('start') : t('next')} onPress={() => setI(i + 1)} />
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

/** Slide 1: real scan photo, framed on the plate, with the AI result pinned on each food. */
function ScanVisual({ ar, zoom }: { ar: boolean; zoom: Animated.Value }) {
  const X0 = 0.25, Y0 = 0.3, iw = W / 0.75, ih = iw * 1.4;
  const at = (x: number, y: number) => ({ left: (x - X0) * iw, top: (y - Y0) * ih });
  // [x, y in photo (0-1), label, kcal, delay, label goes to the left of the dot]
  const pins: [number, number, string, number, number, boolean][] = [
    [0.7, 0.59, ar ? 'خضار مشكلة' : 'Vegetables', 80, 700, false],
    [0.79, 0.76, ar ? 'سلمون مشوي' : 'Grilled salmon', 280, 1000, true],
    [0.9, 0.82, ar ? 'كينوا' : 'Quinoa', 150, 1300, true],
  ];
  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.Image source={IMG.scan} resizeMode="cover"
        style={{ position: 'absolute', width: iw, height: ih, left: -X0 * iw, top: -Y0 * ih, transform: [{ scale: zoom.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }] }} />
      <LinearGradient colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.92)', '#000']} locations={[0, 0.18, 0.42, 0.62, 0.75]} style={StyleSheet.absoluteFill} />
      {pins.map(([x, y, n, k, d, left]) => {
        const p = at(x, y);
        return (
          <Pop key={n} delay={d} style={{ position: 'absolute', top: p.top - 18, ...(left ? { right: W - p.left - 7 } : { left: p.left - 7 }), flexDirection: left ? 'row-reverse' : 'row', alignItems: 'center', gap: 6, direction: 'ltr' }}>
            <View style={st.pinDot} />
            <View style={st.pin}>
              <Txt style={{ fontWeight: '800', fontSize: 13 }}>{n}</Txt>
              <Num style={{ color: C.green, fontWeight: '900', fontSize: 13 }}>{k} kcal</Num>
            </View>
          </Pop>
        );
      })}
      <Pop delay={1700} style={[st.total, { top: H * 0.12 }]}>
        <Icon name="flame" size={18} color={C.green} fill="rgba(57,230,140,0.2)" />
        <Num style={{ fontWeight: '900', fontSize: 22 }}>510</Num>
        <Num style={{ color: C.mut, fontWeight: '700', fontSize: 12 }}>kcal</Num>
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
      <Glow height={H * 0.6} strength={0.22} />
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
  const opts = ar ? ['صدر دجاج مشوي مع سلطة', 'شيش طاووق مع حمص', 'زبادي يوناني مع لوز'] : ['Grilled chicken with salad', 'Salmon with quinoa', 'Greek yogurt with almonds'];
  return (
    <View style={StyleSheet.absoluteFill}>
      <Glow height={H * 0.6} strength={0.2} />
      <View style={{ marginTop: H * 0.12, paddingHorizontal: 22, gap: 12, direction: ar ? 'rtl' : 'ltr' }}>
        <Pop delay={200} style={{ alignSelf: 'center', alignItems: 'center', marginBottom: 8 }}>
          <LinearGradient colors={['#7CF5B5', C.green, '#17A35B']} style={st.coachAv}><Leaf size={34} color="#03140b" /></LinearGradient>
        </Pop>
        <Pop delay={600} style={[st.bub, st.me]}><Txt style={{ color: '#03140b', fontWeight: '800', fontSize: 15 }}>{q}</Txt></Pop>
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
      <Glow height={H * 0.65} strength={0.25} />
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
          <LinearGradient colors={['#7CF5B5', C.green, '#17A35B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.emblem}>
            <Leaf size={56} color="#03140b" />
          </LinearGradient>
        </Pop>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  pinDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: C.green, borderWidth: 3, borderColor: 'rgba(0,0,0,0.6)' },
  pin: { backgroundColor: 'rgba(10,18,14,0.86)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 },
  total: { position: 'absolute', alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(10,18,14,0.9)', borderWidth: 1, borderColor: 'rgba(57,230,140,0.5)', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8, direction: 'ltr' },
  macro: { flex: 1, alignItems: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.stroke, borderRadius: 20, paddingVertical: 12 },
  coachAv: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  bub: { maxWidth: '88%', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 12 },
  me: { alignSelf: 'flex-end', backgroundColor: C.green, borderTopEndRadius: 6 },
  ai: { alignSelf: 'flex-start', backgroundColor: C.surface, borderWidth: 1, borderColor: C.stroke, borderTopStartRadius: 6 },
  ring: { position: 'absolute', borderWidth: 1, borderColor: 'rgba(57,230,140,0.2)', borderStyle: 'dashed' },
  orb: { position: 'absolute', width: 44, height: 44, borderRadius: 22, backgroundColor: C.surface, borderWidth: 1, borderColor: 'rgba(57,230,140,0.4)', alignItems: 'center', justifyContent: 'center' },
  emblem: { width: 130, height: 130, borderRadius: 40, alignItems: 'center', justifyContent: 'center', shadowColor: C.green, shadowOpacity: 0.9, shadowRadius: 40, elevation: 24 },

  wrap: { flex: 1, backgroundColor: '#000', overflow: 'hidden' },
  top: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
  pillT: { color: '#fff', fontWeight: '700', fontSize: 13 },
  body: { marginTop: 'auto', paddingHorizontal: 24, paddingBottom: 24 },
  dots: { flexDirection: 'row', gap: 7, justifyContent: 'center', marginBottom: 18 },
  dot: { width: 8, height: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotOn: { width: 26, backgroundColor: C.green },
  logo: { alignSelf: 'center', flexDirection: 'row', gap: 8, alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.45)', borderWidth: 1, borderColor: C.line, marginBottom: 14 },
  title: { fontSize: H < 700 ? 28 : 32, fontWeight: '900', marginBottom: 8, lineHeight: H < 700 ? 40 : 46 },
  desc: { color: C.mut, fontSize: 16, lineHeight: 25, marginBottom: 24 },
  terms: { color: C.dim, fontSize: 12, marginTop: 14, textDecorationLine: 'underline' },
  chip: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(14,20,17,0.86)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  ct: { color: '#fff', fontWeight: '700', fontSize: 14 },
  cg: { color: C.green, fontWeight: '800', fontSize: 14 },
});
