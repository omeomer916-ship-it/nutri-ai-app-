import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useT } from '../../src/i18n';
import { dayKey, totals, useApp } from '../../src/store';
import { AiError, ChatMsg, askCoach } from '../../src/ai';
import { C, R } from '../../src/theme';
import { Row, Txt } from '../../src/components/ui';
import { Leaf } from '../../src/components/Leaf';

export default function Coach() {
  const { t, rtl, lang } = useT();
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const sv = useRef<ScrollView>(null);

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
    try {
      const a = await askCoach(next.slice(-12), lang, context());
      setMsgs([...next, { role: 'assistant', content: a }]);
    } catch (e) {
      const code = e instanceof AiError ? e.code : 'network';
      setMsgs([...next, { role: 'assistant', content: code === 'no_api' ? t('noApi') : t('aiErr') }]);
    } finally {
      setBusy(false);
      setTimeout(() => sv.current?.scrollToEnd({ animated: true }), 50);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1, direction: rtl ? 'rtl' : 'ltr' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
        <Row style={{ gap: 12, paddingHorizontal: 18, paddingTop: 14 }}>
          <View style={st.av}><Leaf size={24} color="#03140b" /></View>
          <View>
            <Txt style={{ fontSize: 24, fontWeight: '800' }}>{t('tCoach')}</Txt>
            <Txt style={{ color: C.mut, fontSize: 13 }}>{t('coachS')}</Txt>
          </View>
        </Row>
        <ScrollView ref={sv} style={{ flex: 1 }} contentContainerStyle={{ padding: 18, gap: 10, paddingBottom: 30 }}>
          <View style={[st.b, st.ai]}><Txt style={st.bt}>{t('hello')}</Txt></View>
          {msgs.length === 0 && (
            <View style={{ gap: 8, marginTop: 6 }}>
              {(['q1', 'q2', 'q3'] as const).map((k) => (
                <Pressable key={k} onPress={() => send(t(k))} style={st.sug}><Txt style={{ color: C.green, fontWeight: '600' }}>{t(k)}</Txt></Pressable>
              ))}
            </View>
          )}
          {msgs.map((m, i) => (
            <View key={i} style={[st.b, m.role === 'user' ? st.me : st.ai]}>
              <Txt style={[st.bt, m.role === 'user' && { color: '#000', fontWeight: '600' }]}>{m.content}</Txt>
            </View>
          ))}
          {busy && <View style={[st.b, st.ai]}><Txt style={[st.bt, { color: C.mut }]}>{t('thinking')}</Txt></View>}
        </ScrollView>
        <Row style={st.inputRow}>
          <TextInput
            value={q} onChangeText={setQ} placeholder={t('ask')} placeholderTextColor={C.dim}
            style={[st.input, { textAlign: rtl ? 'right' : 'left' }]} onSubmitEditing={() => send(q)} returnKeyType="send" multiline
          />
          <Pressable onPress={() => send(q)} style={[st.send, (!q.trim() || busy) && { opacity: 0.5 }]}>
            <Text style={{ fontSize: 20, fontWeight: '800' }}>↑</Text>
          </Pressable>
        </Row>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  av: { width: 52, height: 52, borderRadius: 26, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', shadowColor: C.green, shadowOpacity: 0.5, shadowRadius: 14 },
  b: { maxWidth: '86%', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 11 },
  ai: { alignSelf: 'flex-start', backgroundColor: C.card, borderWidth: 1, borderColor: C.line },
  me: { alignSelf: 'flex-end', backgroundColor: C.green },
  bt: { fontSize: 15, lineHeight: 23 },
  sug: { alignSelf: 'flex-start', borderWidth: 1, borderColor: C.line, borderRadius: R.pill, paddingHorizontal: 14, paddingVertical: 9, backgroundColor: C.card },
  inputRow: { gap: 10, paddingHorizontal: 14, paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 96 : 82 },
  input: { flex: 1, color: '#fff', backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, maxHeight: 120 },
  send: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
});
