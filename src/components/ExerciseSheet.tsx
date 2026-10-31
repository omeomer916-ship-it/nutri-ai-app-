import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useT } from '../i18n';
import { useApp } from '../store';
import { fmt } from '../calc';
import { C } from '../theme';
import { Btn, Num, Row, Txt } from './ui';
import { Icon } from './Icon';

// MET values (Compendium of Physical Activities, rounded).
export const ACTS: { id: string; ar: string; en: string; met: number }[] = [
  { id: 'walk', ar: 'مشي', en: 'Walking', met: 3.5 },
  { id: 'fastwalk', ar: 'مشي سريع', en: 'Brisk walking', met: 4.8 },
  { id: 'run', ar: 'جري', en: 'Running', met: 9.8 },
  { id: 'bike', ar: 'دراجة', en: 'Cycling', met: 7.5 },
  { id: 'gym', ar: 'حديد / جيم', en: 'Weights / gym', met: 5 },
  { id: 'hiit', ar: 'تمارين HIIT', en: 'HIIT', met: 8 },
  { id: 'football', ar: 'كرة قدم', en: 'Football', met: 7 },
  { id: 'swim', ar: 'سباحة', en: 'Swimming', met: 7 },
  { id: 'yoga', ar: 'يوغا', en: 'Yoga', met: 2.5 },
  { id: 'dance', ar: 'رقص', en: 'Dancing', met: 5 },
  { id: 'stairs', ar: 'درج', en: 'Stairs', met: 8 },
  { id: 'house', ar: 'شغل بيت', en: 'Housework', met: 3.3 },
];
const MINS = [15, 30, 45, 60, 90];

export function ExerciseSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang, rtl } = useT();
  const addBurn = useApp((s) => s.addBurn);
  const w = useApp((s) => s.weights[s.weights.length - 1]?.w ?? s.profile?.w ?? 70);
  const [act, setAct] = useState(ACTS[0].id);
  const [min, setMin] = useState(30);
  const a = ACTS.find((x) => x.id === act)!;
  const kcal = Math.round(a.met * w * (min / 60));
  const save = () => {
    addBurn({ name: lang === 'ar' ? a.ar : a.en, kcal, min });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onClose();
  };
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={st.dim} onPress={onClose} />
      <View style={[st.sheet, { direction: rtl ? 'rtl' : 'ltr' }]}>
        <View style={st.grab} />
        <Txt style={{ fontSize: 20, fontWeight: '900' }}>{t('exAdd')}</Txt>
        <View style={st.grid}>
          {ACTS.map((x) => (
            <Pressable key={x.id} onPress={() => setAct(x.id)} style={[st.act, act === x.id && st.actOn]}>
              <Txt center numberOfLines={1} style={{ fontWeight: '800', fontSize: 13, color: act === x.id ? '#000' : '#fff' }}>{lang === 'ar' ? x.ar : x.en}</Txt>
            </Pressable>
          ))}
        </View>
        <Txt style={st.lab}>{t('minutes')}</Txt>
        <Row style={{ gap: 8 }}>
          {MINS.map((m) => (
            <Pressable key={m} onPress={() => setMin(m)} style={[st.min, min === m && { backgroundColor: '#fff' }]}>
              <Num style={{ fontWeight: '900', color: min === m ? '#000' : '#fff' }}>{m}</Num>
            </Pressable>
          ))}
        </Row>
        <View style={st.kcal}>
          <Icon name="flame" size={26} color="#FF9F5C" fill="#FF9F5C33" />
          <Num style={{ fontSize: 38, fontWeight: '900' }}>{fmt(kcal)}</Num>
          <Num style={{ color: C.mut, fontSize: 14, fontWeight: '700', marginTop: 12 }}>kcal</Num>
        </View>
        <Btn title={t('exAdd')} style={{ marginTop: 16 }} icon={<Icon name="plus" size={18} color="#000" stroke={2.8} />} onPress={save} />
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  dim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { backgroundColor: C.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 22, paddingBottom: 34, borderWidth: 1, borderColor: C.stroke },
  grab: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  act: { width: '31.6%', paddingVertical: 11, borderRadius: 14, backgroundColor: C.surface2, alignItems: 'center' },
  actOn: { backgroundColor: '#FF9F5C' },
  lab: { color: C.mut, fontWeight: '700', fontSize: 13, marginTop: 16, marginBottom: 8 },
  min: { flex: 1, height: 44, borderRadius: 14, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  kcal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, paddingVertical: 6, backgroundColor: C.surface2, borderRadius: 20 },
});
