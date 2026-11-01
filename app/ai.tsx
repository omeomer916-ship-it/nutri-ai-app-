import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useT, TKey } from '../src/i18n';
import { TOOLS } from '../src/tools';
import { C, themed } from '../src/theme';
import { IconBadge, Pop, Row, Txt } from '../src/components/ui';
import { Icon } from '../src/components/Icon';
import { Page } from '../src/components/Page';

/** AI Studio: every AI tool in one place. */
export default function AiStudio() {
  const { t } = useT();
  const open = (id: string) => router.push({ pathname: '/tool', params: { id } });
  const big = TOOLS.slice(0, 3), rest = TOOLS.slice(3);
  return (
    <Page title={t('aiT')}>
      <LinearGradient colors={C.mode === 'light' ? ['#E3F8EC', '#FFFFFF'] : ['#0F2A1B', '#06100B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.hero}>
        <Row style={{ gap: 12 }}>
          <IconBadge name="wand" size={52} icon={26} loop="pulse" />
          <View style={{ flex: 1 }}>
            <Txt style={{ fontSize: 20, fontWeight: '900' }}>{t('aiHero')}</Txt>
            <Txt style={{ color: C.mut, fontSize: 13, lineHeight: 19, marginTop: 2 }}>{t('aiS')}</Txt>
          </View>
        </Row>
      </LinearGradient>

      <Txt style={st.lab}>{t('aiPhotoTools')}</Txt>
      <View style={{ gap: 10 }}>
        {big.map((x, i) => (
          <Pop key={x.id} delay={i * 80}>
            <Pressable onPress={() => open(x.id)} style={({ pressed }) => [st.wide, pressed && { transform: [{ scale: 0.98 }] }]}>
              <IconBadge name={x.icon} size={54} icon={27} loop="float" delay={i * 300} />
              <View style={{ flex: 1 }}>
                <Row style={{ gap: 6 }}>
                  <Txt style={{ fontWeight: '900', fontSize: 16 }}>{t(`tl_${x.id}` as TKey)}</Txt>
                  <View style={st.cam}><Icon name="camera" size={11} color="#000" stroke={2.6} /></View>
                </Row>
                <Txt numberOfLines={2} style={{ color: C.mut, fontSize: 13, lineHeight: 19 }}>{t(`td_${x.id}` as TKey)}</Txt>
              </View>
            </Pressable>
          </Pop>
        ))}
      </View>

      <Txt style={st.lab}>{t('aiMoreTools')}</Txt>
      <View style={st.grid}>
        {rest.map((x, i) => (
          <Pop key={x.id} delay={200 + i * 50} style={st.cell}>
            <Pressable onPress={() => open(x.id)} style={({ pressed }) => [st.tile, pressed && { transform: [{ scale: 0.97 }] }]}>
              <IconBadge name={x.icon} size={44} icon={22} />
              <Txt numberOfLines={1} style={{ fontWeight: '900', fontSize: 14, marginTop: 10 }}>{t(`tl_${x.id}` as TKey)}</Txt>
              <Txt numberOfLines={2} style={{ color: C.mut, fontSize: 12, lineHeight: 17, marginTop: 2 }}>{t(`td_${x.id}` as TKey)}</Txt>
            </Pressable>
          </Pop>
        ))}
      </View>
    </Page>
  );
}

const st = themed(() => StyleSheet.create({
  hero: { borderRadius: 24, padding: 16, borderWidth: 1, borderColor: C.line },
  lab: { color: C.mut, fontWeight: '800', fontSize: 13, marginTop: 20, marginBottom: 10 },
  wide: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 22, padding: 14 },
  cam: { width: 18, height: 18, borderRadius: 9, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: { width: '48.4%', flexGrow: 1 },
  tile: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 22, padding: 14, minHeight: 138 },
}));
