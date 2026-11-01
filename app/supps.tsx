import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useT, TKey } from '../src/i18n';
import { dayKey, useApp } from '../src/store';
import { C, fontFor, themed } from '../src/theme';
import { Card, IconBadge, Num, Pop, Row, Txt } from '../src/components/ui';
import { Icon } from '../src/components/Icon';
import { Page } from '../src/components/Page';

const PRESETS: TKey[] = ['spD', 'spOmega', 'spMulti', 'spMag', 'spIron', 'spCreatine', 'spProtein', 'spB12'];

/** Daily vitamins and supplements: tick them off, keep a streak. */
export default function Supps() {
  const { t, lang, rtl } = useT();
  const { supps, suppLog, addSupp, removeSupp, toggleSupp } = useApp();
  const [name, setName] = useState('');
  const k = dayKey();
  const today = suppLog[k] ?? [];
  const streak = (id: string) => {
    let n = 0;
    for (let i = 0; i < 365; i++) {
      const has = (suppLog[dayKey(Date.now() - i * 864e5)] ?? []).includes(id);
      if (has) n++; else if (i > 0) break;
    }
    return n;
  };
  const add = (n: string) => { if (!n.trim() || supps.some((s) => s.name === n.trim())) return; addSupp(n); setName(''); };
  const done = supps.filter((s) => today.includes(s.id)).length;

  return (
    <Page title={t('spT')}>
      <Card style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <IconBadge name="pill" size={50} icon={24} loop="pulse" />
        <View style={{ flex: 1 }}>
          <Num style={{ fontSize: 22, fontWeight: '900' }}>{done}/{supps.length}</Num>
          <Txt style={{ color: C.mut, fontSize: 13 }}>{t('spToday')}</Txt>
        </View>
      </Card>
      <View style={{ gap: 8, marginTop: 10 }}>
        {supps.map((s, i) => {
          const on = today.includes(s.id);
          const n = streak(s.id);
          return (
            <Pop key={s.id} delay={i * 50}>
              <Pressable onPress={() => { toggleSupp(k, s.id); Haptics.selectionAsync().catch(() => {}); }}
                onLongPress={() => Alert.alert(t('delete'), s.name, [{ text: t('cancel'), style: 'cancel' }, { text: t('delete'), style: 'destructive', onPress: () => removeSupp(s.id) }])}
                style={[st.row, on && { borderColor: C.green }]}>
                <View style={[st.chk, on && { backgroundColor: C.green, borderColor: C.green }]}>{on && <Icon name="check" size={16} color="#000" stroke={3} />}</View>
                <Txt style={{ flex: 1, fontWeight: '800', fontSize: 16 }}>{s.name}</Txt>
                {n > 0 && <Row style={{ gap: 3 }}><Icon name="flame" size={14} color={C.green} /><Num style={{ fontWeight: '900', color: C.green }}>{n}</Num></Row>}
              </Pressable>
            </Pop>
          );
        })}
      </View>
      <Txt style={{ fontWeight: '900', fontSize: 16, marginTop: 20, marginBottom: 8 }}>{t('spAdd')}</Txt>
      <Row style={st.inputRow}>
        <TextInput value={name} onChangeText={setName} placeholder={t('spPh')} placeholderTextColor={C.dim} onSubmitEditing={() => add(name)}
          style={[st.input, { textAlign: rtl ? 'right' : 'left', fontFamily: fontFor(600, lang) }]} />
        <Pressable onPress={() => add(name)} style={st.plus}><Icon name="plus" size={20} color="#000" stroke={2.6} /></Pressable>
      </Row>
      <Row style={{ gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
        {PRESETS.map((p) => t(p)).filter((p) => !supps.some((s) => s.name === p)).map((p) => (
          <Pressable key={p} onPress={() => add(p)} style={st.chip}><Icon name="plus" size={13} color={C.green} stroke={2.6} /><Txt style={{ fontSize: 13, fontWeight: '700' }}>{p}</Txt></Pressable>
        ))}
      </Row>
      {supps.length > 0 && <Txt style={{ color: C.dim, fontSize: 12, marginTop: 14 }}>{t('spTip')}</Txt>}
      <Row style={{ gap: 8, marginTop: 16, alignItems: 'flex-start' }}>
        <Icon name="info" size={15} color={C.dim} />
        <Txt style={{ flex: 1, color: C.dim, fontSize: 12, lineHeight: 18 }}>{t('spNote')}</Txt>
      </Row>
    </Page>
  );
}

const st = themed(() => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 18, padding: 14 },
  chk: { width: 28, height: 28, borderRadius: 9, borderWidth: 2, borderColor: C.dim, alignItems: 'center', justifyContent: 'center' },
  inputRow: { alignItems: 'center', gap: 8, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 18, padding: 6 },
  input: { flex: 1, color: C.text, fontSize: 15, height: 44, paddingHorizontal: 10 },
  plus: { width: 44, height: 44, borderRadius: 14, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.stroke },
}));
