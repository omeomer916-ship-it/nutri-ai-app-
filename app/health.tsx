import { StyleSheet, Switch, View } from 'react-native';
import { useT, TKey } from '../src/i18n';
import { Health, useApp } from '../src/store';
import { C, themed } from '../src/theme';
import { Card, IconBadge, Row, Txt } from '../src/components/ui';
import { Icon, IconName } from '../src/components/Icon';
import { Page } from '../src/components/Page';

const ITEMS: [keyof Health, IconName, TKey, TKey][] = [
  ['diabetes', 'drop', 'hDiab', 'hDiabD'],
  ['bp', 'heart', 'hBp', 'hBpD'],
  ['gluten', 'bread', 'hGluten', 'hGlutenD'],
  ['nuts', 'shield', 'hNuts', 'hNutsD'],
  ['lactose', 'cup', 'hLact', 'hLactD'],
];

/** Health conditions and allergies. Meals that may not suit them get a warning. */
export default function HealthScreen() {
  const { t } = useT();
  const { health, setHealth } = useApp();
  return (
    <Page title={t('hT')}>
      <Card style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <IconBadge name="shield" size={46} icon={22} loop="pulse" />
        <Txt style={{ flex: 1, color: C.mut, lineHeight: 21 }}>{t('hS')}</Txt>
      </Card>
      <Card style={{ marginTop: 10, paddingVertical: 4 }}>
        {ITEMS.map(([k, ic, l, d], i) => (
          <Row key={k} style={[st.row, i > 0 && { borderTopWidth: 1, borderTopColor: C.stroke }]}>
            <IconBadge name={ic} size={38} icon={18} />
            <View style={{ flex: 1 }}>
              <Txt style={{ fontWeight: '800' }}>{t(l)}</Txt>
              <Txt style={{ color: C.mut, fontSize: 12, lineHeight: 18 }}>{t(d)}</Txt>
            </View>
            <Switch value={health[k]} onValueChange={(v) => setHealth({ [k]: v })} trackColor={{ false: C.surface3, true: C.green }} thumbColor="#fff" />
          </Row>
        ))}
      </Card>
      <Row style={{ gap: 8, marginTop: 14, alignItems: 'flex-start' }}>
        <Icon name="info" size={15} color={C.dim} />
        <Txt style={{ flex: 1, color: C.dim, fontSize: 12, lineHeight: 18 }}>{t('hNote')}</Txt>
      </Row>
    </Page>
  );
}

const st = themed(() => StyleSheet.create({
  row: { gap: 12, paddingVertical: 12 },
}));
