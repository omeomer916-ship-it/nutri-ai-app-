import { useEffect, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useT, TKey } from '../i18n';
import { CATS, Cat, Meal, useApp } from '../store';
import { fmt } from '../calc';
import { C, CAT_ICON, themed, fa } from '../theme';
import { Btn, Chip, IconBadge, Num, Row, Txt } from './ui';
import { Icon, IconName } from './Icon';

const MULTS = [0.5, 1, 1.5, 2];

/** Bottom sheet to edit, duplicate or delete a logged meal. */
export function MealSheet({ meal, dayK, onClose }: { meal: Meal | null; dayK: string; onClose: () => void }) {
  const { t, rtl } = useT();
  const updateMeal = useApp((s) => s.updateMeal);
  const removeMeal = useApp((s) => s.removeMeal);
  const addMeal = useApp((s) => s.addMeal);
  const [mult, setMult] = useState(1);
  const [cat, setCat] = useState<Cat>('ln');
  useEffect(() => { if (meal) { setMult(1); setCat(meal.cat); } }, [meal?.id]);
  if (!meal) return null;
  const v = (n: number) => Math.round(n * mult);
  const done = () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); onClose(); };
  const ci = CAT_ICON[meal.cat];

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={st.dim} onPress={onClose} />
      <View style={[st.sheet, { direction: rtl ? 'rtl' : 'ltr' }]}>
        <View style={st.grab} />
        <Row style={{ gap: 12 }}>
          {meal.photo ? <Image source={{ uri: meal.photo }} style={st.ph} /> : <IconBadge name={ci.icon} color={ci.color} size={56} icon={26} />}
          <View style={{ flex: 1 }}>
            <Txt style={{ color: C.mut, fontSize: 12, fontWeight: '700' }}>{t('editMeal')}</Txt>
            <Txt numberOfLines={2} style={{ fontSize: 19, fontWeight: '900' }}>{meal.name}</Txt>
          </View>
          <Pressable hitSlop={10} onPress={onClose} style={st.x}><Icon name="x" size={18} /></Pressable>
        </Row>

        <View style={st.kcal}>
          <Icon name="flame" size={26} color={C.text} fill={fa(0.1)} />
          <Num style={{ fontSize: 40, fontWeight: '900' }}>{fmt(v(meal.kcal))}</Num>
          <Num style={{ color: C.mut, fontSize: 15, fontWeight: '700', marginTop: 12 }}>kcal</Num>
        </View>
        <Row style={{ gap: 8, marginTop: 10 }}>
          {([['meat', meal.P, 'P', C.pro], ['bread', meal.C, 'Cb', C.carb], ['avocado', meal.F, 'F', C.fat]] as [IconName, number, TKey, string][]).map(([ic, n, k, col]) => (
            <View key={k} style={st.mt}>
              <Row style={{ gap: 5 }}><Icon name={ic} size={15} color={col} /><Num style={{ fontWeight: '900', fontSize: 16 }}>{v(n)}g</Num></Row>
              <Txt center style={{ color: C.mut, fontSize: 11 }}>{t(k)}</Txt>
            </View>
          ))}
        </Row>

        <Txt style={st.lab}>{t('portion')}</Txt>
        <Row style={{ gap: 8 }}>
          {MULTS.map((m) => (
            <Pressable key={m} onPress={() => setMult(m)} style={[st.mult, mult === m && { backgroundColor: C.inv }]}>
              <Num style={{ fontWeight: '900', fontSize: 16, color: mult === m ? C.onInv : C.text }}>×{m}</Num>
            </Pressable>
          ))}
        </Row>
        <Txt style={st.lab}>{t('mealL')}</Txt>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {CATS.map((c) => <Chip key={c} title={t(c)} icon={CAT_ICON[c].icon as IconName} on={cat === c} onPress={() => setCat(c)} />)}
        </ScrollView>

        <Btn title={t('saveCh')} style={{ marginTop: 20 }} icon={<Icon name="check" size={18} color="#000" stroke={2.6} />}
          onPress={() => { updateMeal(dayK, meal.id, { cat, kcal: v(meal.kcal), P: v(meal.P), C: v(meal.C), F: v(meal.F) }); done(); }} />
        <Row style={{ gap: 10, marginTop: 10 }}>
          <Btn kind="soft" title={t('again')} style={{ flex: 1 }} icon={<Icon name="copy" size={17} />}
            onPress={() => { addMeal({ name: meal.name, cat, kcal: v(meal.kcal), P: v(meal.P), C: v(meal.C), F: v(meal.F), photo: meal.photo }); done(); }} />
          <Btn kind="soft" title={t('del')} style={{ flex: 1 }} icon={<Icon name="trash" size={17} color={C.red} />}
            onPress={() => { removeMeal(dayK, meal.id); done(); }} />
        </Row>
      </View>
    </Modal>
  );
}

const st = themed(() => StyleSheet.create({
  dim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { backgroundColor: C.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 22, paddingBottom: 34, borderWidth: 1, borderColor: C.stroke },
  grab: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: fa(0.2), marginBottom: 16 },
  ph: { width: 56, height: 56, borderRadius: 16 },
  x: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  kcal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, paddingVertical: 6, backgroundColor: C.surface2, borderRadius: 20 },
  mt: { flex: 1, alignItems: 'center', backgroundColor: C.surface2, borderRadius: 16, paddingVertical: 10 },
  lab: { color: C.mut, fontWeight: '700', fontSize: 13, marginTop: 16, marginBottom: 8 },
  mult: { flex: 1, height: 44, borderRadius: 14, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
}));
