import { useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useT } from '../../src/i18n';
import { dayKey, totals, useApp } from '../../src/store';
import { AiError, ChatMsg, askCoach } from '../../src/ai';
import { C, R, fontFor } from '../../src/theme';
import { Glow, Row, Txt } from '../../src/components/ui';
import { Leaf } from '../../src/components/Leaf';
import { Icon, IconName } from '../../src/components/Icon';

/** Very small markdown: **bold**, bullet lines (-, *, •, 1.), headings (#). */
function Rich({ text, color }: { text: string; color: string }) {
  const lines = text.replace(/\r/g, '').split('\n').map((l) => l.trimEnd());
  const out: React.ReactNode[] = [];
  lines.forEach((raw, i) => {
    if (!raw.trim()) { out.push(<View key={i} style={{ height: 6 }} />); return; }
    let l = raw.replace(/^#{1,6}\s*/, '');
    const head = l !== raw;
    const bullet = /^\s*([-*•]|\d+[.)])\s+/.exec(l);
    if (bullet) l = l.slice(bullet[0].length);
    const parts = l.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((p, j) =>
      p.startsWith('**') && p.endsWith('**')
        ? <Txt key={j} style={{ color, fontWeight: '800', fontSize: 15 }}>{p.slice(2, -2)}</Txt>
        : p.replace(/\*/g, ''),
    );
    const body = <Txt style={{ color, fontSize: 15, lineHeight: 24, fontWeight: head ? '800' : '400', flex: bullet ? 1 : undefined }}>{parts}</Txt>;
    out.push(bullet
      ? <Row key={i} style={{ alignItems: 'flex-start', gap: 8 }}><View style={st.bul} />{body}</Row>
      : <View key={i}>{body}</View>);
  });
  return <View style={{ gap: 2 }}>{out}</View>;
}

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

  const context = () => {
    const s = useApp.getState();
    const tot = totals(s.days[dayKey()]);
    const p = s.profile;
    return `Goals: ${s.goals.kcal} kcal, P ${s.goals.P}g, C ${s.goals.C}g, F ${s.goals.F}g. Eaten today: ${tot.kcal} kcal, P ${tot.P}g, C ${tot.C}g, F ${tot.F}g. ` +
      (p ? `User: ${p.sex === 'm' ? 'male' : 'female'}, ${p.age}y, ${p.h}cm, ${p.w}kg, target ${p.gw}kg, goal ${p.goal}, activity ${p.act}/4.` : '');
  };

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
          </Row>
          <ScrollView ref={sv} style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
            <View style={[st.b, st.ai]}><Rich text={t('hello')} color="#fff" /></View>
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
                  : <Rich text={m.content} color="#fff" />}
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

const st = StyleSheet.create({
  head: { gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.stroke },
  av: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  online: { position: 'absolute', bottom: 1, end: 1, width: 13, height: 13, borderRadius: 7, backgroundColor: C.green, borderWidth: 2.5, borderColor: '#000' },
  b: { maxWidth: '88%', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 12 },
  ai: { alignSelf: 'flex-start', backgroundColor: C.surface, borderWidth: 1, borderColor: C.stroke, borderTopStartRadius: 6 },
  me: { alignSelf: 'flex-end', backgroundColor: C.green, borderTopEndRadius: 6 },
  bul: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green, marginTop: 10 },
  sug: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.stroke, borderRadius: R.md, padding: 12 },
  sugI: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  typing: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.green },
  inputRow: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 112 : 104 },
  inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 8, backgroundColor: C.surface, borderWidth: 1, borderColor: C.stroke, borderRadius: 28, padding: 6, paddingStart: 16 },
  input: { flex: 1, color: '#fff', paddingVertical: 10, fontSize: 15, maxHeight: 120 },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
});
