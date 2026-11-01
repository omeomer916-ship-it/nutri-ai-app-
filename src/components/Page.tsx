import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useT } from '../i18n';
import { C, themed } from '../theme';
import { Row, Screen, Txt } from './ui';
import { Icon } from './Icon';

/** Full screen opened from Today or Profile: back button, title and scrolling content. */
export function Page({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) {
  const { rtl } = useT();
  return (
    <Screen>
      <Row style={st.head}>
        <Pressable hitSlop={10} onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/today'))} style={st.back}>
          <View style={{ transform: [{ scaleX: rtl ? 1 : -1 }] }}><Icon name="chevron" size={20} stroke={2.4} /></View>
        </Pressable>
        <Txt numberOfLines={1} style={{ flex: 1, fontSize: 19, fontWeight: '900', textAlign: 'center' }}>{title}</Txt>
        <View style={{ minWidth: 40, alignItems: 'flex-end' }}>{right}</View>
      </Row>
      {children}
    </Screen>
  );
}

const st = themed(() => StyleSheet.create({
  head: { marginTop: 8, marginBottom: 14, gap: 10 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
}));
