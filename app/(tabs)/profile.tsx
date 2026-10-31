import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { useT, TKey } from '../../src/i18n';
import { Goals, useApp } from '../../src/store';
import { C, R } from '../../src/theme';
import { Card, H2, Row, Screen, Txt } from '../../src/components/ui';
import { Leaf } from '../../src/components/Leaf';

export default function Profile() {
  const { t, lang } = useT();
  const { account, goals, setGoals, setLang, signOut, resetAll } = useApp();

  const field = (k: keyof Goals, label: TKey) => (
    <Row key={k} style={st.row}>
      <Txt style={{ flex: 1, fontWeight: '700' }}>{t(label)}</Txt>
      <TextInput
        defaultValue={String(goals[k])}
        keyboardType="number-pad"
        onEndEditing={(e) => { const n = parseInt(e.nativeEvent.text, 10); if (n > 0 && n < 10000) setGoals({ [k]: n }); }}
        style={st.in}
      />
    </Row>
  );

  const item = (label: string, action: string, onPress: () => void, danger = false) => (
    <Pressable key={label} onPress={onPress} style={st.row}>
      <Txt style={{ flex: 1, fontWeight: '700', color: danger ? C.red : '#fff' }}>{label}</Txt>
      <View style={[st.pill, danger && { borderColor: 'rgba(255,107,107,0.5)' }]}><Text style={{ color: danger ? C.red : C.green, fontWeight: '700' }}>{action}</Text></View>
    </Pressable>
  );

  return (
    <Screen>
      <Row style={{ gap: 16, marginTop: 18, marginBottom: 6 }}>
        {account?.photo ? <Image source={{ uri: account.photo }} style={st.av} /> : <View style={[st.av, st.avG]}><Leaf size={30} color="#03140b" /></View>}
        <View style={{ flex: 1 }}>
          <Txt style={{ fontSize: 26, fontWeight: '800' }}>{account?.name || t('guestName')}</Txt>
          <Txt style={{ color: C.mut }}>{account?.email || t('member')}</Txt>
        </View>
      </Row>

      <H2>{t('goals')}</H2>
      <Card style={{ paddingVertical: 4 }}>
        {field('kcal', 'kcal')}
        {field('P', 'P')}
        {field('C', 'Cb')}
        {field('F', 'F')}
      </Card>

      <H2>{t('settings')}</H2>
      <Card style={{ paddingVertical: 4 }}>
        {item(t('language'), lang === 'ar' ? 'English' : 'العربية', () => setLang(lang === 'ar' ? 'en' : 'ar'))}
        {item(t('redo'), '↻', () => router.push('/onboarding'))}
        {item(account?.guest ? t('signIn') : t('signOut'), '→', () => { signOut(); router.replace('/intro'); })}
        {item(t('reset'), t('del'), () =>
          Alert.alert(t('reset'), t('resetQ'), [
            { text: t('cancel'), style: 'cancel' },
            { text: t('del'), style: 'destructive', onPress: () => { resetAll(); router.replace('/intro'); } },
          ]), true)}
      </Card>
      <Txt center style={{ color: C.dim, marginTop: 20, fontSize: 12 }}>Nutri AI · {t('version')} {Constants.expoConfig?.version ?? '1.0.0'}</Txt>
    </Screen>
  );
}

const st = StyleSheet.create({
  av: { width: 76, height: 76, borderRadius: 38 },
  avG: { backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', shadowColor: C.green, shadowOpacity: 0.5, shadowRadius: 18 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)', gap: 12 },
  in: { width: 100, height: 46, paddingVertical: 0, paddingHorizontal: 8, color: '#fff', backgroundColor: '#000', borderWidth: 1, borderColor: C.line, borderRadius: R.sm, textAlign: 'center', textAlignVertical: 'center', includeFontPadding: false, fontSize: 17, fontWeight: '700' },
  pill: { borderWidth: 1, borderColor: C.line, borderRadius: R.pill, paddingHorizontal: 14, paddingVertical: 7 },
});
