import { StyleSheet, View } from 'react-native';
import { useT } from '../src/i18n';
import { useApp } from '../src/store';
import { challenges } from '../src/challenges';
import { C, themed } from '../src/theme';
import { Bar, Card, IconBadge, Num, Pop, Row, Txt } from '../src/components/ui';
import { Icon } from '../src/components/Icon';
import { Illus } from '../src/components/Illus';
import { Page } from '../src/components/Page';

/** Rolling challenges with progress, built from what the user already logs. */
export default function Challenges() {
  const { t } = useT();
  const { days, goals, waterGoal, burn, fast } = useApp();
  const list = challenges({ days, goals, waterGoal, burn, fast });
  const done = list.filter((c) => c.done).length;
  return (
    <Page title={t('chT')}>
      <View style={{ alignItems: 'center' }}>
        <Illus kind="trophy" size={170} />
        <Num style={{ fontSize: 34, fontWeight: '900', marginTop: 4 }}>{done}/{list.length}</Num>
        <Txt center style={{ color: C.mut, marginTop: 2, lineHeight: 22 }}>{t('chS')}</Txt>
      </View>
      <View style={{ gap: 10, marginTop: 20 }}>
        {list.map((c, i) => (
          <Pop key={c.id} delay={i * 90}>
            <Card style={[{ padding: 16 }, c.done && st.done]}>
              <Row style={{ gap: 12 }}>
                <IconBadge name={c.icon} color={c.done ? '#FFD45C' : C.green} size={46} icon={22} loop={c.done ? 'pulse' : undefined} />
                <View style={{ flex: 1 }}>
                  <Txt style={{ fontWeight: '900', fontSize: 16 }}>{t(c.title)}</Txt>
                  <Txt style={{ color: C.mut, fontSize: 13, lineHeight: 19 }}>{t(c.desc)}</Txt>
                </View>
                {c.done
                  ? <View style={st.medal}><Icon name="check" size={16} color="#000" stroke={3} /></View>
                  : <Num style={{ fontWeight: '900', color: C.mut }}>{c.have}/{c.need}</Num>}
              </Row>
              <View style={{ marginTop: 12 }}><Bar value={c.have} max={c.need} color={c.done ? '#FFD45C' : C.green} height={8} /></View>
            </Card>
          </Pop>
        ))}
      </View>
    </Page>
  );
}

const st = themed(() => StyleSheet.create({
  done: { borderColor: 'rgba(255,212,92,0.5)' },
  medal: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFD45C', alignItems: 'center', justifyContent: 'center' },
}));
