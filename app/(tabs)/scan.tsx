import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Image, ImageBackground, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import * as ImageManipulator from 'expo-image-manipulator';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useT, TKey } from '../../src/i18n';
import { CATS, Cat, useApp } from '../../src/store';
import { AiError, ScanResult, scanMeal } from '../../src/ai';
import { fmt } from '../../src/calc';
import { C, CAT_ICON, IMG, R } from '../../src/theme';
import { Btn, Card, Chip, H2, IconBadge, Num, Row, Screen, Segmented, Txt } from '../../src/components/ui';
import { IntroVideo } from '../../src/components/IntroVideo';
import { Icon, IconName } from '../../src/components/Icon';

// Example background + result shown for each meal type before the user takes a photo.
const EX: Record<Cat, { bg?: number; ar: string; en: string; k: number; P: number; C: number; F: number }> = {
  bf: { ar: 'بيض مع خضار طازجة', en: 'Eggs with fresh vegetables', k: 320, P: 18, C: 14, F: 20 },
  ln: { bg: IMG.scan, ar: 'سلمون مشوي مع كينوا وخضار', en: 'Grilled salmon, quinoa & vegetables', k: 520, P: 38, C: 42, F: 22 },
  dn: { bg: IMG.scanDn, ar: 'ورق عنب ومتبّل وتمر', en: 'Stuffed vine leaves, dips & dates', k: 620, P: 14, C: 82, F: 26 },
  sn: { bg: IMG.scanSn, ar: 'فشار وشيبس وشوكولا داكنة', en: 'Popcorn, chips & dark chocolate', k: 480, P: 6, C: 52, F: 28 },
  ds: { bg: IMG.scanDs, ar: 'بقلاوة وبوظة عربية بالفستق', en: 'Baklava & pistachio ice cream', k: 560, P: 9, C: 68, F: 28 },
  dr: { bg: IMG.scanDr, ar: 'عصير ليمون ونعنع', en: 'Lemon mint juice', k: 140, P: 1, C: 34, F: 0 },
};

type St = { k: 'idle' } | { k: 'busy'; uri: string } | { k: 'done'; uri: string; r: ScanResult } | { k: 'err'; uri?: string; msg: string };

function Corners() {
  const c = { position: 'absolute' as const, width: 46, height: 46, borderColor: '#fff' };
  const w = 3.5;
  return (
    <>
      <View style={[c, { top: 22, left: 22, borderTopWidth: w, borderLeftWidth: w, borderTopLeftRadius: 18 }]} />
      <View style={[c, { top: 22, right: 22, borderTopWidth: w, borderRightWidth: w, borderTopRightRadius: 18 }]} />
      <View style={[c, { bottom: 22, left: 22, borderBottomWidth: w, borderLeftWidth: w, borderBottomLeftRadius: 18 }]} />
      <View style={[c, { bottom: 22, right: 22, borderBottomWidth: w, borderRightWidth: w, borderBottomRightRadius: 18 }]} />
    </>
  );
}

function ScanLine({ h }: { h: number }) {
  const y = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(y, { toValue: 1, duration: 1800, useNativeDriver: true }),
      Animated.timing(y, { toValue: 0, duration: 1800, useNativeDriver: true }),
    ]));
    a.start();
    return () => a.stop();
  }, []);
  return (
    <Animated.View pointerEvents="none" style={[st.lineWrap, { transform: [{ translateY: y.interpolate({ inputRange: [0, 1], outputRange: [h * 0.08, h * 0.88] }) }] }]}>
      <LinearGradient colors={['rgba(57,230,140,0)', 'rgba(57,230,140,0.28)']} style={{ height: 40 }} />
      <View style={st.line} />
    </Animated.View>
  );
}

export default function Scan() {
  const { t, rtl } = useT();
  const params = useLocalSearchParams<{ cat?: string }>();
  const addMeal = useApp((s) => s.addMeal);
  const lang = useApp((s) => s.lang);
  const days = useApp((s) => s.days);
  const [cat, setCat] = useState<Cat>('ln');
  const [s, setS] = useState<St>({ k: 'idle' });
  const [mult, setMult] = useState(1);
  const VH = Math.min(520, Dimensions.get('window').height * 0.56);

  useEffect(() => {
    if (params.cat && (CATS as string[]).includes(params.cat)) setCat(params.cat as Cat);
    else {
      const h = new Date().getHours();
      setCat(h < 11 ? 'bf' : h < 16 ? 'ln' : 'dn');
    }
  }, [params.cat]);

  const recent = Object.values(days).flatMap((d) => d.meals).filter((m) => m.photo).sort((a, b) => b.t - a.t).slice(0, 6);

  const pick = async (camera: boolean) => {
    try {
      if (camera) {
        const p = await ImagePicker.requestCameraPermissionsAsync();
        if (!p.granted) return setS({ k: 'err', msg: t('camDenied') });
      }
      const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.8, allowsEditing: false };
      const res = camera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
      if (res.canceled || !res.assets?.[0]) return;
      const a = res.assets[0];
      setS({ k: 'busy', uri: a.uri });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      // Shrink to 1024px so uploads are fast and small.
      const small = await ImageManipulator.manipulateAsync(a.uri, [{ resize: { width: 1024 } }], {
        compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true,
      });
      const r = await scanMeal(small.base64 ?? '', lang, cat === 'dr' ? 'drink' : 'food', cat);
      setMult(1);
      setS({ k: 'done', uri: small.uri, r });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (e) {
      const code = e instanceof AiError ? e.code : 'network';
      setS((p) => ({ k: 'err', uri: 'uri' in p ? p.uri : undefined, msg: code === 'no_api' ? t('noApi') : code === 'no_food' ? t('noFood') : t('aiErr') }));
    }
  };

  const save = () => {
    if (s.k !== 'done') return;
    const r = s.r;
    addMeal({ name: r.name + (mult !== 1 ? ` ×${mult}` : ''), kcal: Math.round(r.kcal * mult), P: Math.round(r.protein * mult), C: Math.round(r.carbs * mult), F: Math.round(r.fat * mult), cat, photo: s.uri });
    setS({ k: 'idle' });
    router.navigate('/(tabs)/today');
  };

  const uri = s.k !== 'idle' ? (s as { uri?: string }).uri : undefined;
  const ex = EX[cat];

  return (
    <Screen>
      <Txt style={{ fontSize: 28, fontWeight: '900', marginTop: 12, lineHeight: 40 }}>{t('scanT')}</Txt>
      <Txt style={{ color: C.mut, marginBottom: 16, lineHeight: 22 }}>{t('scanS')}</Txt>

      <Segmented value={cat === 'dr' ? 'drink' : 'food'} options={[['food', t('mFood')], ['drink', t('mDrink')]]} onChange={(m) => setCat(m === 'drink' ? 'dr' : 'ln')} />
      {cat !== 'dr' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, marginTop: 12 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
          {CATS.filter((c) => c !== 'dr').map((c) => <Chip key={c} title={t(c)} icon={CAT_ICON[c].icon as IconName} on={cat === c} onPress={() => setCat(c)} />)}
        </ScrollView>
      )}

      <View style={[st.view, { height: VH, marginTop: 14 }]}>
        {uri ? <ImageBackground source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : ex.bg ? <ImageBackground key={cat} source={ex.bg} style={StyleSheet.absoluteFill} resizeMode="cover" /> : <IntroVideo which="scan" />}
        <LinearGradient colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.85)']} locations={[0, 0.25, 0.5, 1]} style={StyleSheet.absoluteFill} />
        <Corners />
        {(s.k === 'idle' || s.k === 'busy') && <ScanLine h={VH} />}
        <View style={st.live}>
          <View style={[st.dotLive, s.k === 'busy' && { backgroundColor: C.green }]} />
          <Txt style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{s.k === 'busy' ? t('analyzing') : t('liveAI')}</Txt>
        </View>
        {s.k === 'idle' && (
          <View style={st.res}>
            <Row style={{ justifyContent: 'space-between', gap: 8 }}>
              <Txt numberOfLines={1} style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '700', flex: 1 }}>{lang === 'ar' ? ex.ar : ex.en}</Txt>
              <View style={st.ex}><Txt style={{ fontSize: 10, fontWeight: '800', color: '#000' }}>{t('example')}</Txt></View>
            </Row>
            <Row style={{ gap: 6, marginTop: 2 }}>
              <Icon name="flame" size={22} color="#fff" />
              <Num style={{ fontSize: 30, fontWeight: '900' }}>{ex.k}</Num>
              <Num style={{ fontSize: 14, color: C.mut, fontWeight: '700', marginTop: 8 }}>kcal</Num>
            </Row>
            <MacroTiles P={ex.P} C={ex.C} F={ex.F} t={t} compact />
          </View>
        )}
        {s.k === 'busy' && (
          <View style={st.busy}>
            <ActivityIndicator size="large" color={C.green} />
          </View>
        )}
      </View>

      <Row style={{ justifyContent: 'center', gap: 34, marginTop: 18 }}>
        <Pressable style={st.side} onPress={() => pick(false)}>
          <Icon name="image" size={22} />
        </Pressable>
        <Pressable style={({ pressed }) => [st.shutterOut, pressed && { transform: [{ scale: 0.94 }] }]} onPress={() => pick(true)} disabled={s.k === 'busy'}>
          <View style={st.shutterIn}><Icon name="camera" size={30} color="#000" /></View>
        </Pressable>
        <Pressable style={st.side} onPress={() => router.navigate('/(tabs)/coach')}>
          <Icon name="sparkle" size={22} color={C.green} />
        </Pressable>
      </Row>
      <Row style={{ justifyContent: 'center', gap: 34, marginTop: 6 }}>
        <Txt center style={st.sideL}>{t('gallery')}</Txt>
        <Txt center style={[st.sideL, { width: 84 }]}>{t('camera')}</Txt>
        <Txt center style={st.sideL}>{t('tCoach')}</Txt>
      </Row>

      {s.k === 'done' && (
        <Card style={{ marginTop: 20, padding: 20 }}>
          <Row style={{ gap: 12 }}>
            <Image source={{ uri: s.uri }} style={{ width: 64, height: 64, borderRadius: 16 }} />
            <View style={{ flex: 1 }}>
              <Txt style={{ fontSize: 19, fontWeight: '900', lineHeight: 28 }}>{s.r.name}</Txt>
              <View style={st.conf}>
                <Icon name="check" size={13} color={C.green} stroke={3} />
                <Txt style={{ color: C.green, fontSize: 12, fontWeight: '700' }}>{t('conf')}: {t((s.r.confidence || 'medium') as TKey)}</Txt>
              </View>
            </View>
          </Row>
          <View style={st.kcalBox}>
            <Icon name="flame" size={30} color="#fff" fill="rgba(255,255,255,0.1)" />
            <Num style={{ fontSize: 44, fontWeight: '900' }}>{fmt(s.r.kcal * mult)}</Num>
            <Num style={{ fontSize: 16, color: C.mut, fontWeight: '700', marginTop: 14 }}>kcal</Num>
          </View>
          <MacroTiles P={s.r.protein * mult} C={s.r.carbs * mult} F={s.r.fat * mult} t={t} />
          <Txt style={{ color: C.mut, fontWeight: '700', fontSize: 13, marginTop: 16, marginBottom: 8 }}>{t('portion')}</Txt>
          <Row style={{ gap: 8 }}>
            {[0.5, 1, 1.5, 2].map((m) => (
              <Pressable key={m} onPress={() => setMult(m)} style={[st.mult, mult === m && { backgroundColor: '#fff' }]}>
                <Num style={{ fontWeight: '900', fontSize: 15, color: mult === m ? '#000' : '#fff' }}>×{m}</Num>
              </Pressable>
            ))}
          </Row>
          {!!s.r.items?.length && (
            <View style={{ marginTop: 18 }}>
              <Txt style={{ fontWeight: '800', marginBottom: 6, fontSize: 16 }}>{t('items')}</Txt>
              {s.r.items.map((it, i) => (
                <Row key={i} style={[st.item, i > 0 && { borderTopWidth: 1, borderTopColor: C.stroke }]}>
                  <Txt numberOfLines={2} style={{ flex: 1, fontWeight: '600' }}>{it.name}</Txt>
                  <Num style={{ color: C.dim, fontSize: 13, width: 60, textAlign: 'center' }}>{Math.round(it.grams)} g</Num>
                  <Num style={{ color: C.green, fontWeight: '800', width: 78, textAlign: rtl ? 'left' : 'right' }}>{Math.round(it.kcal)} kcal</Num>
                </Row>
              ))}
            </View>
          )}
          {!!s.r.note && <Txt style={{ color: C.dim, fontSize: 12, marginTop: 10, lineHeight: 19 }}>{s.r.note}</Txt>}
          <Row style={{ gap: 10, marginTop: 20 }}>
            <Btn kind="soft" title={t('retake')} style={{ flex: 1 }} icon={<Icon name="refresh" size={18} />} onPress={() => setS({ k: 'idle' })} />
            <Btn title={t('save')} style={{ flex: 1.4 }} icon={<Icon name="check" size={18} color="#000" stroke={2.6} />} onPress={save} />
          </Row>
        </Card>
      )}
      {s.k === 'err' && (
        <Card style={{ marginTop: 20, borderColor: 'rgba(255,107,107,0.35)' }}>
          <Row style={{ gap: 12 }}>
            <IconBadge name="info" color={C.red} />
            <Txt style={{ flex: 1, lineHeight: 22 }}>{s.msg}</Txt>
          </Row>
          <Btn kind="soft" title={t('retake')} style={{ marginTop: 14 }} icon={<Icon name="refresh" size={18} />} onPress={() => setS({ k: 'idle' })} />
        </Card>
      )}

      <Pressable onPress={() => router.push({ pathname: '/food', params: { cat } })} style={({ pressed }) => [st.search, pressed && { opacity: 0.8 }]}>
        <IconBadge name="search" color={C.green} size={46} />
        <View style={{ flex: 1 }}>
          <Txt style={{ fontWeight: '800' }}>{t('orSearch')}</Txt>
          <Txt style={{ color: C.mut, fontSize: 13 }}>{t('searchD')}</Txt>
        </View>
        <View style={{ transform: [{ scaleX: rtl ? -1 : 1 }] }}><Icon name="chevron" size={18} color={C.dim} /></View>
      </Pressable>

      <Card style={{ marginTop: 10 }}>
        <Row style={{ gap: 14 }}>
          <IconBadge name="sun" color={C.carb} size={46} />
          <View style={{ flex: 1 }}>
            <Txt style={{ fontWeight: '800', marginBottom: 2 }}>{t('tipT')}</Txt>
            <Txt style={{ color: C.mut, fontSize: 13, lineHeight: 21 }}>{t('tipD')}</Txt>
          </View>
        </Row>
      </Card>

      {recent.length > 0 && (
        <>
          <H2>{t('recent')}</H2>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}>
            {recent.map((m) => (
              <View key={m.id} style={st.rec}>
                <ImageBackground source={{ uri: m.photo }} style={{ flex: 1 }}>
                  <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)']} locations={[0.3, 1]} style={StyleSheet.absoluteFill} />
                  <View style={{ marginTop: 'auto', padding: 10 }}>
                    <Txt numberOfLines={1} style={{ fontWeight: '800', fontSize: 13 }}>{m.name}</Txt>
                    <Num style={{ color: C.green, fontWeight: '800', fontSize: 12, textAlign: rtl ? 'right' : 'left' }}>{fmt(m.kcal)} kcal</Num>
                  </View>
                </ImageBackground>
              </View>
            ))}
          </ScrollView>
        </>
      )}
    </Screen>
  );
}

function MacroTiles({ P, C: Cb, F, t, compact }: { P: number; C: number; F: number; t: (k: TKey) => string; compact?: boolean }) {
  const items: [IconName, number, TKey, string][] = [['drumstick', P, 'P', C.pro], ['wheat', Cb, 'Cb', C.carb], ['avocado', F, 'F', C.fat]];
  return (
    <Row style={{ gap: 8, marginTop: compact ? 10 : 16 }}>
      {items.map(([ic, v, k, col]) => (
        <View key={k} style={[st.mt, compact && { paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.1)' }]}>
          <Row style={{ gap: 5 }}>
            <Icon name={ic} size={compact ? 14 : 17} color={col} />
            <Num style={{ color: '#fff', fontWeight: '900', fontSize: compact ? 14 : 17 }}>{Math.round(v)}g</Num>
          </Row>
          <Txt center numberOfLines={1} style={{ color: C.mut, fontSize: compact ? 10 : 12, fontWeight: '600', marginTop: 1 }}>{t(k)}</Txt>
        </View>
      ))}
    </Row>
  );
}

const st = StyleSheet.create({
  view: { borderRadius: R.xl, overflow: 'hidden', backgroundColor: '#050c08', borderWidth: 1, borderColor: C.stroke },
  lineWrap: { position: 'absolute', left: 30, right: 30, top: -40 },
  line: { height: 2.5, borderRadius: 2, backgroundColor: C.green, shadowColor: C.green, shadowOpacity: 1, shadowRadius: 10, elevation: 6 },
  live: { position: 'absolute', top: 18, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 999, paddingHorizontal: 13, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  dotLive: { width: 7, height: 7, borderRadius: 7, backgroundColor: '#ff4d4d' },
  res: { position: 'absolute', left: 16, right: 16, bottom: 16, backgroundColor: 'rgba(12,18,15,0.82)', borderRadius: 22, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  ex: { backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 2 },
  busy: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.25)' },
  mt: { flex: 1, alignItems: 'center', backgroundColor: C.surface2, borderRadius: 16, paddingVertical: 12 },
  shutterOut: { width: 84, height: 84, borderRadius: 42, borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  shutterIn: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  side: { width: 52, height: 52, borderRadius: 26, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.stroke, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  sideL: { width: 52, color: C.dim, fontSize: 11, fontWeight: '600' },
  conf: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: 'rgba(57,230,140,0.12)', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3, marginTop: 4 },
  kcalBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 18, paddingVertical: 10, backgroundColor: C.surface2, borderRadius: 20 },
  item: { paddingVertical: 10, gap: 6 },
  mult: { flex: 1, height: 44, borderRadius: 14, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 20, backgroundColor: C.surface, borderWidth: 1, borderColor: 'rgba(57,230,140,0.35)', borderRadius: R.lg, padding: 16 },
  rec: { width: 130, height: 150, borderRadius: R.md, overflow: 'hidden', borderWidth: 1, borderColor: C.stroke },
});
