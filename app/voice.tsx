import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useT, TKey } from '../src/i18n';
import { CATS, Cat, useApp } from '../src/store';
import { AiError, DescribeResult, describeMeal } from '../src/ai';
import { fmt } from '../src/calc';
import { C, CAT_ICON, R, fontFor, themed, fa } from '../src/theme';
import { Btn, Chip, Num, Pop, Row, Txt } from '../src/components/ui';
import { Icon, IconName } from '../src/components/Icon';
import { Illus } from '../src/components/Illus';
import { MealAlerts } from '../src/components/Alerts';

// Mono, 64 kbps AAC: a 30-second note is about 250 KB.
const REC = { ...RecordingPresets.HIGH_QUALITY, numberOfChannels: 1, bitRate: 64000 };
const MAX_MS = 30000;

type S = { k: 'idle' } | { k: 'rec' } | { k: 'busy' } | { k: 'done'; r: DescribeResult } | { k: 'err'; msg: string };

/** Log a meal by talking or typing: "two eggs, toast and a latte". */
export default function Voice() {
  const { t, lang, rtl } = useT();
  const params = useLocalSearchParams<{ cat?: string }>();
  const addMeal = useApp((x) => x.addMeal);
  const rec = useAudioRecorder(REC);
  const rs = useAudioRecorderState(rec, 200);
  const [s, setS] = useState<S>({ k: 'idle' });
  const [text, setText] = useState('');
  const [mult, setMult] = useState(1);
  const h = new Date().getHours();
  const [cat, setCat] = useState<Cat>(params.cat && (CATS as string[]).includes(params.cat) ? (params.cat as Cat) : h < 11 ? 'bf' : h < 16 ? 'ln' : h < 21 ? 'dn' : 'sn');

  const fail = (e: unknown) => {
    const code = e instanceof AiError ? e.code : 'network';
    setS({ k: 'err', msg: code === 'no_api' ? t('noApi') : code === 'no_food' ? t('vNoFood') : code === 'rate' ? t('aiRate') : t('aiErr') });
  };
  const run = async (input: Parameters<typeof describeMeal>[0]) => {
    setS({ k: 'busy' });
    try {
      const r = await describeMeal(input, lang);
      setMult(1);
      setS({ k: 'done', r });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (e) { fail(e); }
  };

  const start = async () => {
    try {
      const p = await requestRecordingPermissionsAsync();
      if (!p.granted) { setS({ k: 'err', msg: t('micNo') }); return; }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await rec.prepareToRecordAsync();
      rec.record();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      setS({ k: 'rec' });
    } catch { setS({ k: 'err', msg: t('micErr') }); }
  };
  const stop = async () => {
    try {
      await rec.stop();
      await setAudioModeAsync({ allowsRecording: false }).catch(() => {});
      const uri = rec.uri;
      if (!uri) throw new Error('no file');
      const audio = await readAsStringAsync(uri, { encoding: 'base64' });
      await run({ audio, mime: 'audio/mp4' });
    } catch (e) { if (e instanceof AiError) fail(e); else setS({ k: 'err', msg: t('micErr') }); }
  };
  // Stop on its own at 30 seconds.
  const stopping = useRef(false);
  useEffect(() => {
    if (s.k === 'rec' && rs.durationMillis >= MAX_MS && !stopping.current) { stopping.current = true; stop().finally(() => { stopping.current = false; }); }
  }, [rs.durationMillis, s.k]);
  useEffect(() => () => { if (rec.isRecording) rec.stop().catch(() => {}); }, []);

  const save = () => {
    if (s.k !== 'done') return;
    const r = s.r, m = mult;
    addMeal({ name: r.name, cat, kcal: Math.round(r.kcal * m), P: Math.round(r.protein * m), C: Math.round(r.carbs * m), F: Math.round(r.fat * m) });
    router.back();
  };
  const secs = Math.floor(rs.durationMillis / 1000);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaView style={{ flex: 1 }}>
        <Row style={st.head}>
          <Pressable hitSlop={10} onPress={() => router.back()} style={st.close}><Icon name="x" size={20} /></Pressable>
          <Txt style={{ flex: 1, fontSize: 18, fontWeight: '900', textAlign: 'center' }}>{t('voiceT')}</Txt>
          <View style={{ width: 40 }} />
        </Row>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          {(s.k === 'idle' || s.k === 'rec' || s.k === 'busy' || s.k === 'err') && (
            <View style={{ alignItems: 'center' }}>
              {s.k === 'idle' || s.k === 'err' ? <Illus kind="voice" size={170} /> : <View style={{ height: 170 }} />}
              <Txt center style={{ fontSize: 22, fontWeight: '900', marginTop: 4 }}>{s.k === 'rec' ? t('vListening') : s.k === 'busy' ? t('analyzing') : t('vTitle')}</Txt>
              <Txt center style={{ color: C.mut, marginTop: 6, lineHeight: 22, paddingHorizontal: 10 }}>{s.k === 'rec' ? t('vTapStop') : t('vHint')}</Txt>
              <View style={{ marginTop: 26, alignItems: 'center', justifyContent: 'center', width: 190, height: 190 }}>
                {s.k === 'rec' && <Waves />}
                <Pressable disabled={s.k === 'busy'} onPress={s.k === 'rec' ? stop : start} style={({ pressed }) => [st.mic, s.k === 'rec' && { backgroundColor: C.red, shadowColor: C.red }, pressed && { transform: [{ scale: 0.95 }] }]}>
                  {s.k === 'busy' ? <ActivityIndicator color="#000" size="large" /> : s.k === 'rec' ? <View style={st.stopSq} /> : <Icon name="mic" size={40} color="#000" stroke={2.4} />}
                </Pressable>
              </View>
              {s.k === 'rec' && <Num style={{ fontSize: 22, fontWeight: '900', marginTop: 4 }}>0:{String(secs).padStart(2, '0')} / 0:30</Num>}
              {s.k === 'err' && (
                <View style={st.err}><Icon name="info" size={18} color={C.red} /><Txt style={{ flex: 1, lineHeight: 21 }}>{s.msg}</Txt></View>
              )}
              {(s.k === 'idle' || s.k === 'err') && (
                <View style={{ alignSelf: 'stretch', marginTop: 26 }}>
                  <Txt style={{ color: C.mut, fontWeight: '700', fontSize: 13, marginBottom: 8 }}>{t('vOrType')}</Txt>
                  <Row style={st.inputRow}>
                    <TextInput value={text} onChangeText={setText} placeholder={t('vPh')} placeholderTextColor={C.dim} multiline
                      style={[st.input, { textAlign: rtl ? 'right' : 'left', fontFamily: fontFor(600, lang) }]} />
                    <Pressable disabled={!text.trim()} onPress={() => run({ text: text.trim() })} style={[st.send, !text.trim() && { opacity: 0.4 }]}>
                      <View style={{ transform: [{ scaleX: rtl ? -1 : 1 }] }}><Icon name="send" size={19} color="#000" stroke={2.4} /></View>
                    </Pressable>
                  </Row>
                  <Row style={{ gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                    {(['vEx1', 'vEx2', 'vEx3'] as TKey[]).map((k) => (
                      <Pressable key={k} onPress={() => setText(t(k))} style={st.ex}><Txt style={{ fontSize: 12, fontWeight: '700', color: C.mut }}>{t(k)}</Txt></Pressable>
                    ))}
                  </Row>
                </View>
              )}
            </View>
          )}

          {s.k === 'done' && (
            <Pop>
              {!!s.r.heard && (
                <View style={st.heard}>
                  <Icon name="mic" size={15} color={C.green} />
                  <Txt style={{ flex: 1, color: C.mut, fontStyle: 'italic', lineHeight: 21 }}>“{s.r.heard}”</Txt>
                </View>
              )}
              <Txt style={{ fontSize: 22, fontWeight: '900', marginTop: 14, lineHeight: 32 }}>{s.r.name}</Txt>
              <View style={st.kcal}>
                <Icon name="flame" size={30} color={C.text} fill={fa(0.1)} />
                <Num style={{ fontSize: 44, fontWeight: '900' }}>{fmt(s.r.kcal * mult)}</Num>
                <Num style={{ fontSize: 16, color: C.mut, fontWeight: '700', marginTop: 14 }}>kcal</Num>
              </View>
              <Row style={{ gap: 8, marginTop: 10 }}>
                {([['meat', s.r.protein, 'P', C.pro], ['bread', s.r.carbs, 'Cb', C.carb], ['avocado', s.r.fat, 'F', C.fat]] as [IconName, number, TKey, string][]).map(([ic, v, k, col]) => (
                  <View key={k} style={st.mt}>
                    <Row style={{ gap: 5 }}><Icon name={ic} size={16} color={col} /><Num style={{ fontWeight: '900', fontSize: 17 }}>{Math.round(v * mult)}g</Num></Row>
                    <Txt center style={{ color: C.mut, fontSize: 12 }}>{t(k)}</Txt>
                  </View>
                ))}
              </Row>
              {!!s.r.items?.length && (
                <View style={{ marginTop: 16 }}>
                  {s.r.items.map((it, i) => (
                    <Row key={i} style={[{ paddingVertical: 10, gap: 6 }, i > 0 && { borderTopWidth: 1, borderTopColor: C.stroke }]}>
                      <Txt numberOfLines={2} style={{ flex: 1, fontWeight: '600' }}>{it.name}</Txt>
                      <Num style={{ color: C.dim, fontSize: 13, width: 60, textAlign: 'center' }}>{Math.round(it.grams * mult)} g</Num>
                      <Num style={{ color: C.green, fontWeight: '800', width: 78, textAlign: 'right' }}>{Math.round(it.kcal * mult)} kcal</Num>
                    </Row>
                  ))}
                </View>
              )}
              <MealAlerts names={[s.r.name, ...(s.r.items ?? []).map((x) => x.name)]} m={{ C: s.r.carbs * mult, kcal: s.r.kcal * mult, F: s.r.fat * mult }} />
              <Txt style={st.lab}>{t('portion')}</Txt>
              <Row style={{ gap: 8 }}>
                {[0.5, 1, 1.5, 2].map((m) => (
                  <Pressable key={m} onPress={() => setMult(m)} style={[st.mult, mult === m && { backgroundColor: C.inv }]}>
                    <Num style={{ fontWeight: '900', fontSize: 15, color: mult === m ? C.onInv : C.text }}>×{m}</Num>
                  </Pressable>
                ))}
              </Row>
              <Txt style={st.lab}>{t('addTo')}</Txt>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {CATS.map((c) => <Chip key={c} title={t(c)} icon={CAT_ICON[c].icon as IconName} on={cat === c} onPress={() => setCat(c)} />)}
              </ScrollView>
              <Btn title={`${t('addTo')} ${t(cat)}`} style={{ marginTop: 22 }} icon={<Icon name="check" size={18} color="#000" stroke={2.6} />} onPress={save} />
              <Btn kind="soft" title={t('vAgain')} style={{ marginTop: 10 }} icon={<Icon name="mic" size={18} />} onPress={() => { setText(''); setS({ k: 'idle' }); }} />
            </Pop>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

/** Rings that spread out from the mic while recording. */
function Waves() {
  const vals = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    const ls = vals.map((v, i) => Animated.loop(Animated.sequence([
      Animated.delay(i * 500),
      Animated.timing(v, { toValue: 1, duration: 1500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true }),
    ])));
    ls.forEach((l) => l.start());
    return () => ls.forEach((l) => l.stop());
  }, []);
  return (
    <>
      {vals.map((v, i) => (
        <Animated.View key={i} pointerEvents="none" style={[st.wave, { opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }), transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.25] }) }] }]} />
      ))}
    </>
  );
}

const st = themed(() => StyleSheet.create({
  head: { paddingHorizontal: 16, paddingTop: 8, gap: 10 },
  close: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  mic: { width: 112, height: 112, borderRadius: 56, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', shadowColor: C.green, shadowOpacity: 0.7, shadowRadius: 24, elevation: 14 },
  stopSq: { width: 34, height: 34, borderRadius: 9, backgroundColor: '#fff' },
  wave: { position: 'absolute', width: 190, height: 190, borderRadius: 95, borderWidth: 3, borderColor: C.red },
  err: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'stretch', marginTop: 16, padding: 14, borderRadius: 16, backgroundColor: C.surface, borderWidth: 1, borderColor: 'rgba(255,107,107,0.35)' },
  inputRow: { alignItems: 'flex-end', gap: 8, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 22, padding: 8 },
  input: { flex: 1, color: C.text, fontSize: 15, minHeight: 44, maxHeight: 120, paddingHorizontal: 10, paddingVertical: 10 },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  ex: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.stroke },
  heard: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', padding: 14, borderRadius: 18, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line },
  kcal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, paddingVertical: 10, backgroundColor: C.surface2, borderRadius: 20 },
  mt: { flex: 1, alignItems: 'center', backgroundColor: C.surface2, borderRadius: 16, paddingVertical: 12 },
  lab: { color: C.mut, fontWeight: '700', fontSize: 13, marginTop: 18, marginBottom: 8 },
  mult: { flex: 1, height: 44, borderRadius: 14, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  _r: { borderRadius: R.lg },
}));
