import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Image, Linking, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useT } from '../src/i18n';
import { useApp } from '../src/store';
import { C, IMG } from '../src/theme';
import { Btn, Num, Txt } from '../src/components/ui';
import { Icon } from '../src/components/Icon';
import { Leaf } from '../src/components/Leaf';
import { GoogleButton, googleReady } from '../src/GoogleButton';
import { Brand } from '../src/components/Brand';
import { LangPicker } from '../src/components/LangPicker';
import { IntroVideo } from '../src/components/IntroVideo';

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
  const chips: React.ReactNode[] = [
    <>
      <Chip key="a" top={50} side="end" delay={600}><Icon name="sparkle" size={16} color={C.green} /><Txt style={st.ct}>{ar ? 'مانجا طازجة' : 'Fresh mango'}</Txt><Num style={st.cg}>200 g</Num></Chip>
      <Chip key="b" top={59} side="end" delay={1000}><Icon name="flame" size={16} color="#7CF5B5" /><Num style={st.cg}>120 kcal</Num><Txt style={st.ct}>{ar ? 'ثقة عالية' : 'high confidence'}</Txt></Chip>
    </>,
    <>
      <Chip key="a" top={14} side="start" delay={400}><Icon name="meat" size={16} color={C.pro} /><Txt style={st.ct}>{t('P')}</Txt><Num style={st.cg}>34 g</Num></Chip>
      <Chip key="b" top={26} side="end" delay={700}><Icon name="avocado" size={16} color={C.fat} /><Txt style={st.ct}>{t('F')}</Txt><Num style={st.cg}>22 g</Num></Chip>
      <Chip key="c" top={38} side="start" delay={1000}><Icon name="flame" size={16} color="#7CF5B5" /><Num style={st.cg}>412 kcal</Num></Chip>
    </>,
    <>
      <Chip key="a" top={13} side="end" delay={400}><Txt style={[st.ct, { maxWidth: 220 }]}>{ar ? 'هل الماء مع الليمون مفيد؟' : 'Is lemon water good for me?'}</Txt></Chip>
      <Chip key="b" top={42} side="start" delay={1100}><Icon name="sparkle" size={16} color={C.green} /><Txt style={[st.ct, { maxWidth: 230, fontWeight: '600' }]}>{ar ? 'يساعدك تشرب ماء أكثر بسعرات شبه صفر.' : 'It helps you drink more water with almost 0 kcal.'}</Txt></Chip>
    </>,
    <>
      <Chip key="a" top={16} side="end" delay={500}><Icon name="target" size={16} color={C.green} /><Txt style={st.ct}>{t('goal')}</Txt><Num style={st.cg}>2,100</Num></Chip>
      <Chip key="b" top={28} side="start" delay={900}><Icon name="flame" size={16} color="#7CF5B5" /><Txt style={st.ct}>{ar ? '5 أيام متتالية' : '5-day streak'}</Txt></Chip>
    </>,
  ];

  return (
    <View style={[st.wrap, { direction: rtl ? 'rtl' : 'ltr' }]}>
      <Animated.View
        key={i}
        style={[StyleSheet.absoluteFill, { transform: [{ scale: zoom.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) }] }]}
      >
        {/* Explicit size: Android otherwise drew the photo at its pixel size (zoomed in). */}
        {i === 0 ? <IntroVideo /> : <Image source={sl.img} resizeMode="cover" style={{ width: W, height: H }} />}
      </Animated.View>
      <LinearGradient
        colors={['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.88)', '#000']}
        locations={[0, 0.22, 0.45, 0.7, 0.88]}
        style={StyleSheet.absoluteFill}
      />
      <View key={'c' + i} style={StyleSheet.absoluteFill} pointerEvents="none">{chips[i]}</View>
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

const st = StyleSheet.create({
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
