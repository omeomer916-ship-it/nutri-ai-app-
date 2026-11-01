import { StyleSheet, View } from 'react-native';
import { useT } from '../i18n';
import { useApp } from '../store';
import { mealAlerts } from '../health';
import { C, themed } from '../theme';
import { Pop, Txt } from './ui';
import { Icon } from './Icon';

/** Warnings for a meal, based on the user's health settings (diabetes, blood pressure, allergies). */
export function MealAlerts({ names, m }: { names: string[]; m: { C: number; kcal: number; F: number } }) {
  const { t } = useT();
  const health = useApp((s) => s.health);
  const list = mealAlerts(health, names, m);
  if (!list.length) return null;
  return (
    <View style={{ gap: 8, marginTop: 14 }}>
      {list.map((a, i) => (
        <Pop key={a.key} delay={i * 120} style={st.row}>
          <View style={st.ic}><Icon name="alert" size={16} color="#1a0c00" stroke={2.4} /></View>
          <Txt style={{ flex: 1, fontWeight: '700', fontSize: 13, lineHeight: 19 }}>{t(a.key)}</Txt>
        </Pop>
      ))}
    </View>
  );
}

const st = themed(() => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 16, backgroundColor: C.mode === 'light' ? '#FFF4E0' : 'rgba(255,176,32,0.10)', borderWidth: 1, borderColor: 'rgba(255,176,32,0.45)' },
  ic: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFB020', alignItems: 'center', justifyContent: 'center' },
}));
