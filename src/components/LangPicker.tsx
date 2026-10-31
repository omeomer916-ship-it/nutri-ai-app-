import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LANGS, langName, useT } from '../i18n';
import { useApp } from '../store';
import { C, R } from '../theme';

/** Pill that shows the current language and opens a list of all languages. */
export function LangPicker({ style, textStyle }: { style?: object; textStyle?: object }) {
  const { lang, t } = useT();
  const setLang = useApp((s) => s.setLang);
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable style={style} onPress={() => setOpen(true)}>
        <Text style={textStyle}>🌐 {langName(lang)}</Text>
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={st.back} onPress={() => setOpen(false)}>
          <View style={st.sheet}>
            <Text style={st.title}>{t('language')}</Text>
            <ScrollView style={{ maxHeight: 420 }}>
              {LANGS.map((l) => (
                <Pressable key={l.code} onPress={() => { setLang(l.code); setOpen(false); }} style={[st.row, l.code === lang && st.on]}>
                  <Text style={[st.name, l.code === lang && { color: '#000' }]}>{l.name}</Text>
                  {l.code === lang && <Text style={{ color: '#000', fontWeight: '900' }}>✓</Text>}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const st = StyleSheet.create({
  back: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 },
  sheet: { backgroundColor: C.card, borderRadius: R.lg, borderWidth: 1, borderColor: C.line, padding: 16 },
  title: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: R.md, marginBottom: 6, backgroundColor: C.card2 },
  on: { backgroundColor: C.green },
  name: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
