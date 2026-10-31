import { Alert, Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useT, TKey } from '../../src/i18n';
import { Goals, useApp } from '../../src/store';
import { C, R, fontFor } from '../../src/theme';
import { Card, H2, IconBadge, Num, Row, Screen, Txt } from '../../src/components/ui';
import { Leaf } from '../../src/components/Leaf';
import { Icon, IconName } from '../../src/components/Icon';
import { googleSignOut } from '../../src/GoogleButton';
import { LangPicker } from '../../src/components/LangPicker';

export default function Profile() {
  const { t, lang, rtl } = useT();
  const { account, goals, profile, setGoals, signOut, resetAll } = useApp();

  const field = (k: keyof Goals, label: TKey, ic: IconName, col: string, unit: string) => (
    <Row key={k} style={st.row}>
      <IconBadge name={ic} color={col} size={38} icon={18} />
      <Txt style={{ flex: 1, fontWeight: '700' }}>{t(label)}</Txt>
      <View style={st.inWrap}>
        <TextInput
          defaultValue={String(goals[k])}
          keyboardType="number-pad"
          onEndEditing={(e) => { const n = parseInt(e.nativeEvent.text, 10); if (n > 0 && n < 10000) setGoals({ [k]: n }); }}
          style={[st.in, { fontFamily: fontFor(800, lang) }]}
        />
        <Num style={{ color: C.dim, fontSize: 12, fontWeight: '700' }}>{unit}</Num>
      </View>
    </Row>
  );

  const item = (ic: IconName, label: string, onPress: () => void, danger = false, last = false) => (
    <Pressable key={label} onPress={onPress} style={({ pressed }) => [st.row, last && { borderBottomWidth: 0 }, pressed && { opacity: 0.7 }]}>
      <IconBadge name={ic} color={danger ? C.red : '#fff'} size={38} icon={18} />
      <Txt style={{ flex: 1, fontWeight: '700', color: danger ? C.red : '#fff' }}>{label}</Txt>
      {!danger && <View style={{ transform: [{ scaleX: rtl ? -1 : 1 }] }}><Icon name="chevron" size={18} color={C.dim} /></View>}
    </Pressable>
  );

  const stats: [string, string][] = profile
    ? [[`${profile.w}`, t('kg')], [`${profile.h}`, 'cm'], [`${profile.age}`, t('years')]]
    : [];

  return (
    <Screen>
      <View style={{ alignItems: 'center', marginTop: 22 }}>
        <View style={st.avRing}>
          {account?.photo ? <Image source={{ uri: account.photo }} style={st.av} /> : (
            <LinearGradient colors={['#7CF5B5', C.green, '#17A35B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[st.av, { alignItems: 'center', justifyContent: 'center' }]}>
              <Leaf size={38} color="#03140b" />
            </LinearGradient>
          )}
        </View>
        <Txt center style={{ fontSize: 24, fontWeight: '900', marginTop: 12 }}>{account?.name || t('guestName')}</Txt>
        <Txt center style={{ color: C.mut }}>{account?.email || t('member')}</Txt>
        {stats.length > 0 && (
          <Row style={st.stats}>
            {stats.map(([v, u], i) => (
              <Row key={i} style={{ flex: 1, justifyContent: 'center', gap: 4, alignItems: 'flex-end' }}>
                <Num style={{ fontSize: 20, fontWeight: '900' }}>{v}</Num>
                <Txt style={{ color: C.mut, fontSize: 12, marginBottom: 3 }}>{u}</Txt>
              </Row>
            ))}
          </Row>
        )}
      </View>

      <H2>{t('goals')}</H2>
      <Card style={{ paddingVertical: 2 }}>
        {field('kcal', 'kcal', 'flame', '#FF9F5C', 'kcal')}
        {field('P', 'P', 'drumstick', C.pro, 'g')}
        {field('C', 'Cb', 'wheat', C.carb, 'g')}
        <View style={{ marginBottom: -1 }}>{field('F', 'F', 'avocado', C.fat, 'g')}</View>
      </Card>

      <H2>{t('settings')}</H2>
      <Card style={{ paddingVertical: 2 }}>
        <Row style={st.row}>
          <IconBadge name="globe" color={C.water} size={38} icon={18} />
          <Txt style={{ flex: 1, fontWeight: '700' }}>{t('language')}</Txt>
          <LangPicker style={st.pill} textStyle={{ color: '#fff', fontWeight: '700', fontSize: 13 }} />
        </Row>
        {item('refresh', t('redo'), () => router.push('/onboarding'))}
        {item('logout', account?.guest ? t('signIn') : t('signOut'), () => { googleSignOut(); signOut(); router.replace('/intro'); })}
        {item('trash', t('reset'), () =>
          Alert.alert(t('reset'), t('resetQ'), [
            { text: t('cancel'), style: 'cancel' },
            { text: t('del'), style: 'destructive', onPress: () => { resetAll(); router.replace('/intro'); } },
          ]), true, true)}
      </Card>
      <Num style={{ color: C.dim, marginTop: 22, fontSize: 12, textAlign: 'center' }}>Nutri AI · v{Constants.expoConfig?.version ?? '1.0.0'}</Num>
    </Screen>
  );
}

const st = StyleSheet.create({
  avRing: { padding: 4, borderRadius: 60, borderWidth: 2, borderColor: 'rgba(57,230,140,0.5)' },
  av: { width: 96, height: 96, borderRadius: 48 },
  stats: { alignSelf: 'stretch', marginTop: 18, backgroundColor: C.surface, borderWidth: 1, borderColor: C.stroke, borderRadius: R.lg, paddingVertical: 14 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.stroke, gap: 12 },
  inWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.surface2, borderRadius: R.pill, paddingHorizontal: 12, height: 42 },
  in: { width: 62, height: 42, paddingVertical: 0, color: '#fff', textAlign: 'center', textAlignVertical: 'center', includeFontPadding: false, fontSize: 16 },
  pill: { backgroundColor: C.surface2, borderRadius: R.pill, paddingHorizontal: 12, paddingVertical: 7 },
});
