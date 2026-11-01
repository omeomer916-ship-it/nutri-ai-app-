import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, Share, StyleSheet, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Haptics from 'expo-haptics';
import { useT, TKey } from '../src/i18n';
import { TOOLS } from '../src/tools';
import { AiError, runTool } from '../src/ai';
import { aiContext } from '../src/aiContext';
import { C, fontFor, themed } from '../src/theme';
import { Btn, Card, IconBadge, Pop, Row, Txt } from '../src/components/ui';
import { Icon } from '../src/components/Icon';
import { Page } from '../src/components/Page';
import { Rich } from '../src/components/Rich';

type S = { k: 'idle' } | { k: 'busy' } | { k: 'done'; text: string } | { k: 'err'; msg: string };

/** One AI tool: optional photo and/or text in, a short written answer out. */
export default function ToolScreen() {
  const { t, lang, rtl } = useT();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const tool = TOOLS.find((x) => x.id === id) ?? TOOLS[0];
  const [text, setText] = useState('');
  const [img, setImg] = useState<{ uri: string; b64: string } | null>(null);
  const [s, setS] = useState<S>({ k: 'idle' });
  const wantsImg = tool.input === 'image' || tool.input === 'any';
  const ready = tool.input === 'none' || (tool.input === 'image' ? !!img : tool.input === 'text' ? !!text.trim() : !!img || !!text.trim());

  const pick = async (camera: boolean) => {
    if (camera) { const p = await ImagePicker.requestCameraPermissionsAsync(); if (!p.granted) return; }
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.8 };
    const r = camera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    if (r.canceled || !r.assets?.[0]) return;
    const small = await ImageManipulator.manipulateAsync(r.assets[0].uri, [{ resize: { width: 1024 } }], { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true });
    setImg({ uri: small.uri, b64: small.base64 ?? '' });
  };
  const go = async () => {
    setS({ k: 'busy' });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      const out = await runTool(tool.id, { text: text.trim() || undefined, image: img?.b64 }, lang, aiContext());
      setS({ k: 'done', text: out });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (e) {
      const c = e instanceof AiError ? e.code : 'network';
      setS({ k: 'err', msg: c === 'no_api' ? t('noApi') : c === 'no_food' ? t('aiNotFood') : c === 'rate' ? t('aiRate') : t('aiErr') });
    }
  };

  return (
    <Page title={t(`tl_${tool.id}` as TKey)}>
      <Card style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <IconBadge name={tool.icon} size={52} icon={26} loop="pulse" />
        <Txt style={{ flex: 1, color: C.mut, lineHeight: 21 }}>{t(`td_${tool.id}` as TKey)}</Txt>
      </Card>

      {s.k !== 'done' && (
        <>
          {wantsImg && (
            img ? (
              <View style={st.photo}>
                <Image source={{ uri: img.uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                <Pressable onPress={() => setImg(null)} style={st.rm}><Icon name="x" size={16} color="#fff" stroke={2.6} /></Pressable>
              </View>
            ) : (
              <Row style={{ gap: 10, marginTop: 14 }}>
                <Pressable onPress={() => pick(true)} style={({ pressed }) => [st.pick, pressed && { opacity: 0.8 }]}>
                  <IconBadge name="camera" size={46} icon={22} loop="float" />
                  <Txt style={{ fontWeight: '800', marginTop: 8 }}>{t('takePhoto')}</Txt>
                </Pressable>
                <Pressable onPress={() => pick(false)} style={({ pressed }) => [st.pick, pressed && { opacity: 0.8 }]}>
                  <IconBadge name="image" size={46} icon={22} loop="float" delay={300} />
                  <Txt style={{ fontWeight: '800', marginTop: 8 }}>{t('gallery')}</Txt>
                </Pressable>
              </Row>
            )
          )}
          <View style={st.inputBox}>
            <TextInput value={text} onChangeText={setText} multiline placeholder={t(`tp_${tool.id}` as TKey)} placeholderTextColor={C.dim}
              style={[st.input, { textAlign: rtl ? 'right' : 'left', fontFamily: fontFor(600, lang) }]} />
          </View>
          {!!tool.ex && (
            <Row style={{ gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {tool.ex.map((k) => (
                <Pressable key={k} onPress={() => setText(t(k))} style={st.ex}><Txt style={{ fontSize: 12, fontWeight: '700', color: C.mut }}>{t(k)}</Txt></Pressable>
              ))}
            </Row>
          )}
          {s.k === 'err' && (
            <Row style={st.err}><Icon name="info" size={18} color={C.red} /><Txt style={{ flex: 1, lineHeight: 21 }}>{s.msg}</Txt></Row>
          )}
          <Btn title={s.k === 'busy' ? t('aiThinking') : t('aiRun')} style={{ marginTop: 18 }} disabled={!ready || s.k === 'busy'}
            icon={s.k === 'busy' ? <ActivityIndicator color="#000" /> : <Icon name="sparkle" size={18} color="#000" stroke={2.4} />} onPress={go} />
          <Row style={{ gap: 6, justifyContent: 'center', marginTop: 12 }}>
            <Icon name="target" size={13} color={C.dim} />
            <Txt style={{ color: C.dim, fontSize: 12 }}>{t('aiUsesGoals')}</Txt>
          </Row>
        </>
      )}

      {s.k === 'done' && (
        <Pop>
          {!!img && <Image source={{ uri: img.uri }} style={[st.photo, { height: 140 }]} resizeMode="cover" />}
          <Card style={{ marginTop: 14, padding: 18 }}>
            <Rich text={s.text} color={C.text} />
          </Card>
          <Row style={{ gap: 10, marginTop: 14 }}>
            <Btn kind="soft" title={t('aiShare')} style={{ flex: 1 }} icon={<Icon name="share" size={17} />} onPress={() => Share.share({ message: `${s.text}\n\nNutri AI` }).catch(() => {})} />
            <Btn kind="soft" title={t('aiAsk')} style={{ flex: 1 }} icon={<Icon name="chat" size={17} />} onPress={() => router.navigate('/(tabs)/coach')} />
          </Row>
          <Btn title={t('aiAgain')} style={{ marginTop: 10 }} icon={<Icon name="refresh" size={18} color="#000" stroke={2.4} />} onPress={() => { setS({ k: 'idle' }); }} />
        </Pop>
      )}
    </Page>
  );
}

const st = themed(() => StyleSheet.create({
  photo: { height: 220, borderRadius: 22, overflow: 'hidden', marginTop: 14, backgroundColor: C.surface2 },
  rm: { position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  pick: { flex: 1, alignItems: 'center', paddingVertical: 18, borderRadius: 22, backgroundColor: C.surface, borderWidth: 1, borderStyle: 'dashed', borderColor: C.line },
  inputBox: { marginTop: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 20, padding: 6 },
  input: { color: C.text, fontSize: 15, minHeight: 56, maxHeight: 140, paddingHorizontal: 12, paddingVertical: 10 },
  ex: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.stroke },
  err: { gap: 10, marginTop: 14, padding: 14, borderRadius: 16, backgroundColor: C.surface, borderWidth: 1, borderColor: 'rgba(255,107,107,0.35)' },
}));
