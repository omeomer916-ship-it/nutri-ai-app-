import { useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useT } from '../../src/i18n';
import { dayKey, totals, useApp } from '../../src/store';
import { AiError, ChatMsg, askCoach } from '../../src/ai';
import { C, R, fontFor, themed } from '../../src/theme';
import { Glow, Row, Txt } from '../../src/components/ui';
import { Leaf } from '../../src/components/Leaf';
import { Icon, IconName } from '../../src/components/Icon';
import { Rich } from '../../src/components/Rich';
import { aiContext } from '../../src/aiContext';

export default function Coach() {
  const { t, rtl, lang } = useT();
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const sv = useRef<ScrollView>(null);
  const [kb, setKb] = useState(false);
  useEffect(() => {
    const a = Keyboard.addListener('keyboardDidShow', () => setKb(true));
    const b = Keyboard.addListener('keyboardDidHide', () => setKb(false));
    return () => { a.remove(); b.remove(); };
  }, []);

  const context = aiContext;

  const send = async (text: string) => {
    const txt = text.trim();
    if (!txt || busy) return;
    const next: ChatMsg[] = [...msgs, { role: 'user', content: txt }];
    setMsgs(next);
    setQ('');
    setBusy(true);
    setTimeout(() => sv.current?.scrollToEnd({ animated: true }), 50);
    try {
      const a = await askCoach(next.slice(-12), lang, context());
      setMsgs([...next, { role: 'assistant', content: a }]);
    } catch (e) {
      const code = e instanceof AiError ? e.code : 'network';
      setMsgs([...next, { role: 'assistant', content: code === 'no_api' ? t('noApi') : code === 'rate' ? t('aiRate') : t('aiErr') }]);
    } finally {
      setBusy(false);
      setTimeout(() => sv.current?.scrollToEnd({ animated: true }), 80);
    }
  };

  const sugg: [IconName, string, 'q1' | 'q2' | 'q3'][] = [['bowl', C.green, 'q1'], ['meat', C.pro, 'q2'], ['target', C.carb, 'q3']];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Glow />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView style={{ flex: 1, direction: rtl ? 'rtl' : 'ltr' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
          <Row style={st.head}>
            <View>
              <LinearGradient colors={['#7CF5B5', C.green, '#17A35B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.av}>
                <Leaf size={26} color="#03140b" />
              </LinearGradient>
              <View style={st.online} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt style={{ fontSize: 20, fontWeight: '900' }}>{t('tCoach')}</Txt>
              <Txt style={{ color: C.green, fontSize: 12, fontWeight: '700' }}>{t('online')}</Txt>
            </View>
            <Pressable hitSlop={8} onPress={() => router.push('/ai')} style={st.toolsBtn}>
              <Icon name="wand" size={16} color="#000" stroke={2.4} />
              <Txt style={{ color: '#000', fontWeight: '900', fontSize: 13 }}>{t('aiToolsBtn')}</Txt>
            </Pressable>
            {msgs.length > 0 && (
              <Pressable hitSlop={10} onPress={() => setMsgs([])} style={st.clear}>
                <Icon name="refresh" size={18} color={C.mut} />
              </Pressable>
            )}
          </Row>
          <ScrollView ref={sv} style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
            <View style={[st.b, st.ai]}><Rich text={t('hello')} color={C.text} /></View>
            {msgs.length === 0 && (
              <View style={{ gap: 10, marginTop: 8 }}>
                {sugg.map(([ic, col, k]) => (
                  <Pressable key={k} onPress={() => send(t(k))} style={({ pressed }) => [st.sug, pressed && { opacity: 0.8 }]}>
                    <View style={[st.sugI, { backgroundColor: col + '22' }]}><Icon name={ic} size={18} color={col} /></View>
                    <Txt style={{ flex: 1, fontWeight: '700', fontSize: 14 }}>{t(k)}</Txt>
                    <View style={{ transform: [{ scaleX: rtl ? -1 : 1 }] }}><Icon name="chevron" size={18} color={C.dim} /></View>
                  </Pressable>
                ))}
              </View>
            )}
            {msgs.map((m, i) => (
              <View key={i} style={[st.b, m.role === 'user' ? st.me : st.ai]}>
                {m.role === 'user'
                  ? <Txt style={{ color: '#000', fontWeight: '700', fontSize: 15, lineHeight: 23 }}>{m.content}</Txt>
                  : <Rich text={m.content} color={C.text} />}
              </View>
            ))}
            {busy && (
              <View style={[st.b, st.ai, { flexDirection: 'row', gap: 6, paddingVertical: 16 }]}>
                {[0.9, 0.6, 0.3].map((o, i) => <View key={i} style={[st.typing, { opacity: o }]} />)}
              </View>
            )}
          </ScrollView>
          <Row style={[st.inputRow, kb && { paddingBottom: 10 }]}>
            <View style={st.inputWrap}>
              <TextInput
                value={q} onChangeText={setQ} placeholder={t('ask')} placeholderTextColor={C.dim}
                style={[st.input, { textAlign: rtl ? 'right' : 'left', fontFamily: fontFor(400, lang) }]} onSubmitEditing={() => send(q)} returnKeyType="send" multiline
              />
              <Pressable onPress={() => send(q)} style={[st.send, (!q.trim() || busy) && { opacity: 0.4 }]}>
                <View style={{ transform: [{ rotate: '-90deg' }] }}>
                  <Icon name="send" size={20} color="#000" stroke={2.6} />
                </View>
              </Pressable>
            </View>
          </Row>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const st = themed(() => StyleSheet.create({
  toolsBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.green, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  head: { gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.stroke },
  av: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  clear: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  online: { position: 'absolute', bottom: 1, end: 1, width: 13, height: 13, borderRadius: 7, backgroundColor: C.green, borderWidth: 2.5, borderColor: C.bg },
  b: { maxWidth: '88%', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 12 },
  ai: { alignSelf: 'flex-start', backgroundColor: C.surface, borderWidth: 1, borderColor: C.stroke, borderTopStartRadius: 6 },
  me: { alignSelf: 'flex-end', backgroundColor: C.green, borderTopEndRadius: 6 },
  bul: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green, marginTop: 10 },
  sug: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.stroke, borderRadius: R.md, padding: 12 },
  sugI: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  typing: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.green },
  inputRow: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 112 : 104 },
  inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 8, backgroundColor: C.surface, borderWidth: 1, borderColor: C.stroke, borderRadius: 28, padding: 6, paddingStart: 16 },
  input: { flex: 1, color: C.text, paddingVertical: 10, fontSize: 15, maxHeight: 120 },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
}));
