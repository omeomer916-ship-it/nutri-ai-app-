import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import * as ImageManipulator from 'expo-image-manipulator';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { useT, TKey } from '../../src/i18n';
import { CATS, Cat, useApp } from '../../src/store';
import { AiError, ScanResult, scanMeal } from '../../src/ai';
import { fmt } from '../../src/calc';
import { C, IMG, R } from '../../src/theme';
import { Btn, Card, Chip, H2, Row, Screen, Txt } from '../../src/components/ui';

type St = { k: 'idle' } | { k: 'busy'; uri: string } | { k: 'done'; uri: string; r: ScanResult } | { k: 'err'; uri?: string; msg: string };

function Corners() {
  const c = { position: 'absolute' as const, width: 34, height: 34, borderColor: C.green };
  return (
    <>
      <View style={[c, { top: 16, start: 16, borderTopWidth: 3, borderStartWidth: 3, borderTopStartRadius: 12 }]} />
      <View style={[c, { top: 16, end: 16, borderTopWidth: 3, borderEndWidth: 3, borderTopEndRadius: 12 }]} />
      <View style={[c, { bottom: 16, start: 16, borderBottomWidth: 3, borderStartWidth: 3, borderBottomStartRadius: 12 }]} />
      <View style={[c, { bottom: 16, end: 16, borderBottomWidth: 3, borderEndWidth: 3, borderBottomEndRadius: 12 }]} />
    </>
  );
}

function ScanLine({ h }: { h: number }) {
  const y = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(y, { toValue: 1, duration: 1600, useNativeDriver: true }),
      Animated.timing(y, { toValue: 0, duration: 1600, useNativeDriver: true }),
    ]));
    a.start();
    return () => a.stop();
  }, []);
  return (
    <Animated.View pointerEvents="none" style={[st.line, { transform: [{ translateY: y.interpolate({ inputRange: [0, 1], outputRange: [h * 0.1, h * 0.85] }) }] }]} />
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
  const VH = 470;

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
    addMeal({ name: r.name, kcal: Math.round(r.kcal), P: Math.round(r.protein), C: Math.round(r.carbs), F: Math.round(r.fat), cat, photo: s.uri });
    setS({ k: 'idle' });
    router.navigate('/(tabs)/today');
  };

  const uri = s.k !== 'idle' ? (s as { uri?: string }).uri : undefined;

  return (
    <Screen>
      <Row style={{ justifyContent: 'center', gap: 12, marginTop: 14 }}>
        <View style={st.rule} />
        <Text style={{ color: '#fff', fontSize: 25, fontWeight: '800' }}>{t('scanT')}</Text>
        <View style={st.rule} />
      </Row>
      <Txt center style={{ color: C.mut, marginTop: 6, marginBottom: 14 }}>{t('scanS')}</Txt>

      <View style={st.seg}>
        {(['food', 'drink'] as const).map((m) => {
          const on = m === 'drink' ? cat === 'dr' : cat !== 'dr';
          return (
            <Pressable key={m} style={[st.segB, on && st.segOn]} onPress={() => setCat(m === 'drink' ? 'dr' : 'ln')}>
              <Text style={{ color: on ? '#000' : C.mut, fontWeight: '800' }}>{m === 'food' ? t('mFood') : t('mDrink')}</Text>
            </Pressable>
          );
        })}
      </View>
      {cat !== 'dr' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4, flexDirection: rtl ? 'row-reverse' : 'row' }} style={{ marginBottom: 12, marginHorizontal: -18, paddingHorizontal: 18 }}>
          {CATS.filter((c) => c !== 'dr').map((c) => <Chip key={c} title={t(c)} on={cat === c} onPress={() => setCat(c)} />)}
        </ScrollView>
      )}

      <View style={[st.view, { height: VH }]}>
        <ImageBackground source={uri ? { uri } : IMG.scan} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <LinearGradient colors={['rgba(0,0,0,0.45)', 'transparent', 'transparent', 'rgba(0,0,0,0.8)']} locations={[0, 0.25, 0.6, 1]} style={StyleSheet.absoluteFill} />
        <Corners />
        {(s.k === 'idle' || s.k === 'busy') && <ScanLine h={VH} />}
        <View style={st.live}>
          <View style={[st.dotLive, s.k === 'busy' && { backgroundColor: C.green }]} />
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{s.k === 'busy' ? t('analyzing') : t('liveAI')}</Text>
        </View>
        {s.k === 'idle' && (
          <View style={st.res}>
            <View style={st.ex}><Text style={{ fontSize: 10, fontWeight: '800' }}>{t('example')}</Text></View>
            <Text style={st.kc}>420 <Text style={{ fontSize: 16 }}>kcal</Text></Text>
            <Txt center style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, marginBottom: 10 }}>{rtl ? 'دجاج مشوي مع خضار ونودلز أرز' : 'Grilled chicken, greens & rice noodles'}</Txt>
            <MacroTiles P={38} C={32} F={16} t={t} />
          </View>
        )}
        {s.k === 'busy' && <ActivityIndicator size="large" color={C.green} style={{ position: 'absolute', alignSelf: 'center', top: VH / 2 - 20 }} />}
      </View>

      <Row style={{ justifyContent: 'center', gap: 28, marginTop: -40 }}>
        <Pressable style={st.side} onPress={() => pick(false)}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8}><Rect x={3} y={4} width={18} height={16} rx={3} /><Circle cx={9} cy={10} r={1.8} /><Path d="M4 18l5-5 4 4 3-3 4 4" /></Svg>
        </Pressable>
        <Pressable style={({ pressed }) => [st.shutter, pressed && { transform: [{ scale: 0.94 }] }]} onPress={() => pick(true)} disabled={s.k === 'busy'}>
          <Svg width={34} height={34} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}><Path d="M4 8h3l2-3h6l2 3h3v11H4z" /><Circle cx={12} cy={13} r={3.5} /></Svg>
        </Pressable>
        <View style={[st.side, { opacity: 0 }]} />
      </Row>

      {s.k === 'done' && (
        <Card style={{ marginTop: 18 }}>
          <Txt style={{ fontSize: 20, fontWeight: '800' }}>{s.r.name}</Txt>
          <Text style={[st.kc, { textAlign: 'center', marginTop: 8 }]}>{fmt(s.r.kcal)} <Text style={{ fontSize: 16 }}>kcal</Text></Text>
          <MacroTiles P={s.r.protein} C={s.r.carbs} F={s.r.fat} t={t} />
          <Txt style={{ color: C.mut, marginTop: 12 }}>{t('conf')}: {t((s.r.confidence || 'medium') as TKey)}</Txt>
          {!!s.r.items?.length && (
            <View style={{ marginTop: 10 }}>
              <Txt style={{ fontWeight: '800', marginBottom: 6 }}>{t('items')}</Txt>
              {s.r.items.map((it, i) => (
                <Row key={i} style={{ justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: i ? 1 : 0, borderTopColor: 'rgba(255,255,255,0.06)' }}>
                  <Txt style={{ flex: 1 }}>{it.name} · {Math.round(it.grams)} g</Txt>
                  <Text style={{ color: C.green, fontWeight: '700' }}>{Math.round(it.kcal)} kcal</Text>
                </Row>
              ))}
            </View>
          )}
          {!!s.r.note && <Txt style={{ color: C.dim, fontSize: 12, marginTop: 8 }}>{s.r.note}</Txt>}
          <Btn title={t('save')} style={{ marginTop: 16 }} onPress={save} />
          <Btn kind="ghost" title={t('retake')} style={{ marginTop: 10 }} onPress={() => setS({ k: 'idle' })} />
        </Card>
      )}
      {s.k === 'err' && (
        <Card style={{ marginTop: 18, borderColor: 'rgba(255,107,107,0.4)' }}>
          <Txt>{s.msg}</Txt>
          <Btn kind="ghost" title={t('retake')} style={{ marginTop: 12 }} onPress={() => setS({ k: 'idle' })} />
        </Card>
      )}

      <Card style={{ marginTop: 18 }}>
        <Row style={{ gap: 14 }}>
          <View style={st.brain}><Text style={{ fontSize: 22 }}>🧠</Text></View>
          <View style={{ flex: 1 }}>
            <Txt style={{ fontWeight: '800', marginBottom: 2 }}>{t('infoT')}</Txt>
            <Txt style={{ color: C.mut, fontSize: 13, lineHeight: 20 }}>{t('infoD')}</Txt>
          </View>
        </Row>
      </Card>

      <H2>{t('recent')}</H2>
      <Card style={{ paddingVertical: 6 }}>
        {recent.length ? recent.map((m, i) => (
          <Row key={m.id} style={{ gap: 14, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: 'rgba(255,255,255,0.07)' }}>
            <Image source={{ uri: m.photo }} style={{ width: 52, height: 52, borderRadius: 14 }} />
            <View style={{ flex: 1 }}><Txt style={{ fontWeight: '700' }}>{m.name}</Txt><Txt style={{ color: C.mut, fontSize: 12 }}>{t(m.cat)}</Txt></View>
            <Text style={{ color: C.green, fontWeight: '800' }}>{fmt(m.kcal)} kcal</Text>
          </Row>
        )) : <Txt style={{ color: C.mut, paddingVertical: 12 }}>{t('noScans')}</Txt>}
      </Card>
    </Screen>
  );
}

function MacroTiles({ P, C: Cb, F, t }: { P: number; C: number; F: number; t: (k: TKey) => string }) {
  const items: [string, number, TKey][] = [['💪', P, 'P'], ['🌾', Cb, 'Cb'], ['🥑', F, 'F']];
  return (
    <Row style={{ gap: 8 }}>
      {items.map(([e, v, k]) => (
        <View key={k} style={st.mt}>
          <Text style={{ fontSize: 16 }}>{e}</Text>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>{Math.round(v)} g</Text>
          <Text style={{ color: C.mut, fontSize: 10 }}>{t(k)}</Text>
        </View>
      ))}
    </Row>
  );
}

const st = StyleSheet.create({
  rule: { width: 60, height: 1, backgroundColor: C.green, opacity: 0.7 },
  seg: { flexDirection: 'row', backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 999, padding: 4, marginBottom: 12 },
  segB: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 999 },
  segOn: { backgroundColor: C.green },
  view: { borderRadius: 30, overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(57,230,140,0.45)', backgroundColor: '#050c08' },
  line: { position: 'absolute', left: 22, right: 22, height: 2, backgroundColor: C.green, shadowColor: C.green, shadowOpacity: 1, shadowRadius: 10, elevation: 6 },
  live: { position: 'absolute', top: 16, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 999, paddingHorizontal: 13, paddingVertical: 7, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  dotLive: { width: 7, height: 7, borderRadius: 7, backgroundColor: '#ff4d4d' },
  res: { position: 'absolute', left: 16, right: 16, bottom: 56, backgroundColor: 'rgba(0,0,0,0.66)', borderRadius: 20, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  ex: { position: 'absolute', top: -10, start: 14, backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  kc: { color: '#fff', fontSize: 30, fontWeight: '800', textAlign: 'center' },
  mt: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.09)', borderRadius: 12, paddingVertical: 7 },
  shutter: { width: 82, height: 82, borderRadius: 41, backgroundColor: C.green, borderWidth: 5, borderColor: '#000', alignItems: 'center', justifyContent: 'center', shadowColor: C.green, shadowOpacity: 0.7, shadowRadius: 20, elevation: 10 },
  side: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(20,30,24,0.95)', borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  brain: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(57,230,140,0.14)', borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
});
