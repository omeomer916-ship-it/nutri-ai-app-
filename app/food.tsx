import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useT, TKey } from '../src/i18n';
import { CATS, Cat, useApp } from '../src/store';
import { FOODS, Food, GROUPS, norm } from '../src/foods';
import { fmt } from '../src/calc';
import { C, CAT_ICON, R, fontFor } from '../src/theme';
import { Btn, Chip, Glow, IconBadge, Num, Row, Txt } from '../src/components/ui';
import { Icon, IconName } from '../src/components/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';

const MULTS = [0.5, 1, 1.5, 2];

export default function FoodSearch() {
  const { t, lang, rtl } = useT();
  const params = useLocalSearchParams<{ cat?: string }>();
  const addMeal = useApp((s) => s.addMeal);
  const myFoods = useApp((s) => s.myFoods);
  const addMyFood = useApp((s) => s.addMyFood);
  const removeMyFood = useApp((s) => s.removeMyFood);
  const [manual, setManual] = useState(false);
  const [mf, setMf] = useState({ name: '', k: '', P: '', C: '', F: '' });
  const [q, setQ] = useState('');
  const [g, setG] = useState<string>('all');
  const [pick, setPick] = useState<Food | null>(null);
  const [mult, setMult] = useState(1);
  const h = new Date().getHours();
  const [cat, setCat] = useState<Cat>(params.cat && (CATS as string[]).includes(params.cat) ? (params.cat as Cat) : h < 11 ? 'bf' : h < 16 ? 'ln' : 'dn');
  const ar = lang === 'ar';
  const name = (f: Food) => (ar ? f.ar : f.en);

  const list = useMemo(() => {
    const n = norm(q);
    const mine: Food[] = myFoods.map((m) => ({ id: 'my_' + m.id, ar: m.name, en: m.name, pa: '', pe: '', g: 'mine', k: m.k, P: m.P, C: m.C, F: m.F }));
    // Arabic users see Arab dishes first; everyone else sees world dishes first.
    const base = ar ? FOODS : [...FOODS.filter((f) => f.g === 'intl' || f.g === 'healthy'), ...FOODS.filter((f) => f.g !== 'intl' && f.g !== 'healthy')];
    return [...mine, ...base].filter((f) => (g === 'all' || f.g === g) && (!n || norm(f.ar).includes(n) || norm(f.en).includes(n)));
  }, [q, g, myFoods, ar]);

  const num = (x: string) => Math.max(0, parseFloat(x.replace(',', '.')) || 0);
  const saveManual = () => {
    const k = num(mf.k);
    if (!mf.name.trim() || !k) return;
    const item = { name: mf.name.trim(), k: Math.round(k), P: Math.round(num(mf.P)), C: Math.round(num(mf.C)), F: Math.round(num(mf.F)) };
    addMyFood(item);
    addMeal({ name: item.name, cat, kcal: item.k, P: item.P, C: item.C, F: item.F });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setManual(false);
    setMf({ name: '', k: '', P: '', C: '', F: '' });
    router.back();
  };

  const add = () => {
    if (!pick) return;
    addMeal({
      name: name(pick) + (mult !== 1 ? ` ×${mult}` : ''), cat,
      kcal: Math.round(pick.k * mult), P: Math.round(pick.P * mult), C: Math.round(pick.C * mult), F: Math.round(pick.F * mult),
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setPick(null);
    router.back();
  };

  const gi = (id: string) => GROUPS.find((x) => x.id === id)!;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Glow />
      <SafeAreaView style={{ flex: 1, direction: rtl ? 'rtl' : 'ltr' }} edges={['top']}>
        <Row style={{ gap: 12, paddingHorizontal: 20, paddingTop: 10 }}>
          <Pressable onPress={() => router.back()} style={st.back}>
            <View style={{ transform: [{ scaleX: rtl ? 1 : -1 }] }}><Icon name="chevron" size={20} /></View>
          </Pressable>
          <Txt style={{ fontSize: 24, fontWeight: '900', flex: 1 }}>{t('addFood')}</Txt>
          <Pressable onPress={() => router.push({ pathname: '/barcode', params: { cat } })} style={st.bcBtn}>
            <Icon name="barcode" size={18} color={C.green} />
          </Pressable>
          <Pressable onPress={() => setManual(true)} style={st.manualBtn}>
            <Icon name="edit" size={15} color="#000" stroke={2.4} />
            <Txt style={{ color: '#000', fontWeight: '800', fontSize: 13 }}>{t('manual')}</Txt>
          </Pressable>
        </Row>
        <View style={st.search}>
          <Icon name="search" size={19} color={C.dim} />
          <TextInput value={q} onChangeText={setQ} placeholder={t('searchF')} placeholderTextColor={C.dim}
            style={[st.input, { textAlign: rtl ? 'right' : 'left', fontFamily: fontFor(600, lang) }]} />
          {!!q && <Pressable hitSlop={10} onPress={() => setQ('')}><Icon name="x" size={18} color={C.mut} /></Pressable>}
        </View>
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingBottom: 12 }}>
            {GROUPS.map((x) => <Chip key={x.id} title={t(('g' + x.id) as TKey)} icon={x.icon as IconName} on={g === x.id} onPress={() => setG(x.id)} />)}
          </ScrollView>
        </View>
        <FlatList
          data={list}
          keyExtractor={(f) => f.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 8 }}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<Txt center style={{ color: C.mut, marginTop: 40 }}>{t('noRes')}</Txt>}
          ListFooterComponent={list.length ? <Txt center style={{ color: C.dim, fontSize: 12, marginTop: 10 }}>{t('approx')}</Txt> : null}
          renderItem={({ item: f }) => {
            const x = gi(f.g);
            return (
              <Pressable onPress={() => { setPick(f); setMult(1); }} onLongPress={() => f.g === 'mine' && removeMyFood(f.id.slice(3))} style={({ pressed }) => [st.row, pressed && { opacity: 0.75 }]}>
                <IconBadge name={x.icon as IconName} color={x.color} size={44} />
                <View style={{ flex: 1 }}>
                  <Txt numberOfLines={1} style={{ fontWeight: '800', fontSize: 15 }}>{name(f)}</Txt>
                  {!!(ar ? f.pa : f.pe) && <Txt numberOfLines={1} style={{ color: C.mut, fontSize: 12 }}>{ar ? f.pa : f.pe}</Txt>}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Num style={{ fontWeight: '900', fontSize: 16 }}>{fmt(f.k)}</Num>
                  <Num style={{ color: C.dim, fontSize: 11 }}>kcal</Num>
                </View>
                <View style={st.plus}><Icon name="plus" size={16} color="#000" stroke={2.8} /></View>
              </Pressable>
            );
          }}
        />
      </SafeAreaView>

      <Modal visible={!!pick} transparent animationType="slide" onRequestClose={() => setPick(null)}>
        <Pressable style={st.dim} onPress={() => setPick(null)} />
        {pick && (
          <View style={[st.sheet, { direction: rtl ? 'rtl' : 'ltr' }]}>
            <View style={st.grab} />
            <Row style={{ gap: 12 }}>
              <IconBadge name={gi(pick.g).icon as IconName} color={gi(pick.g).color} size={52} icon={24} />
              <View style={{ flex: 1 }}>
                <Txt style={{ fontSize: 20, fontWeight: '900' }}>{name(pick)}</Txt>
                <Txt style={{ color: C.mut, fontSize: 13 }}>{ar ? pick.pa : pick.pe}</Txt>
              </View>
            </Row>
            <View style={st.kcal}>
              <Icon name="flame" size={28} color="#fff" fill="rgba(255,255,255,0.1)" />
              <Num style={{ fontSize: 42, fontWeight: '900' }}>{fmt(pick.k * mult)}</Num>
              <Num style={{ color: C.mut, fontSize: 15, fontWeight: '700', marginTop: 12 }}>kcal</Num>
            </View>
            <Row style={{ gap: 8, marginTop: 10 }}>
              {([['drumstick', pick.P, 'P', C.pro], ['wheat', pick.C, 'Cb', C.carb], ['avocado', pick.F, 'F', C.fat]] as [IconName, number, TKey, string][]).map(([ic, v, k, col]) => (
                <View key={k} style={st.mt}>
                  <Row style={{ gap: 5 }}><Icon name={ic} size={15} color={col} /><Num style={{ fontWeight: '900', fontSize: 16 }}>{Math.round(v * mult)}g</Num></Row>
                  <Txt center style={{ color: C.mut, fontSize: 11 }}>{t(k)}</Txt>
                </View>
              ))}
            </Row>
            <Txt style={st.lab}>{t('portion')}</Txt>
            <Row style={{ gap: 8 }}>
              {MULTS.map((m) => (
                <Pressable key={m} onPress={() => setMult(m)} style={[st.mult, mult === m && st.multOn]}>
                  <Num style={{ fontWeight: '900', fontSize: 16, color: mult === m ? '#000' : '#fff' }}>×{m}</Num>
                </Pressable>
              ))}
            </Row>
            <Txt style={st.lab}>{t('addTo')}</Txt>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {CATS.map((c) => <Chip key={c} title={t(c)} icon={CAT_ICON[c].icon as IconName} on={cat === c} onPress={() => setCat(c)} />)}
            </ScrollView>
            <Btn title={`${t('addTo')} ${t(cat)}`} style={{ marginTop: 22 }} icon={<Icon name="check" size={18} color="#000" stroke={2.6} />} onPress={add} />
          </View>
        )}
      </Modal>

      <Modal visible={manual} transparent animationType="slide" onRequestClose={() => setManual(false)}>
        <Pressable style={st.dim} onPress={() => setManual(false)} />
        <View style={[st.sheet, { direction: rtl ? 'rtl' : 'ltr' }]}>
          <View style={st.grab} />
          <Txt style={{ fontSize: 20, fontWeight: '900', marginBottom: 12 }}>{t('manual')}</Txt>
          <TextInput value={mf.name} onChangeText={(v) => setMf({ ...mf, name: v })} placeholder={t('fName')} placeholderTextColor={C.dim}
            style={[st.field, { textAlign: rtl ? 'right' : 'left', fontFamily: fontFor(700, lang) }]} />
          <Row style={{ gap: 8, marginTop: 8 }}>
            {([['k', 'kcal', '#FF9F5C'], ['P', t('P'), C.pro], ['C', t('Cb'), C.carb], ['F', t('F'), C.fat]] as ['k' | 'P' | 'C' | 'F', string, string][]).map(([key, lab, col]) => (
              <View key={key} style={{ flex: 1 }}>
                <TextInput value={mf[key]} onChangeText={(v) => setMf({ ...mf, [key]: v })} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={C.dim}
                  style={[st.field, { textAlign: 'center', fontFamily: fontFor(800, lang), borderColor: col + '55' }]} />
                <Txt center numberOfLines={1} style={{ color: col, fontSize: 11, fontWeight: '700', marginTop: 4 }}>{lab}</Txt>
              </View>
            ))}
          </Row>
          <Txt style={st.lab}>{t('addTo')}</Txt>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {CATS.map((c) => <Chip key={c} title={t(c)} icon={CAT_ICON[c].icon as IconName} on={cat === c} onPress={() => setCat(c)} />)}
          </ScrollView>
          <Btn title={`${t('addTo')} ${t(cat)}`} style={{ marginTop: 20 }} disabled={!mf.name.trim() || !num(mf.k)} icon={<Icon name="check" size={18} color="#000" stroke={2.6} />} onPress={saveManual} />
        </View>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  bcBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  manualBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  field: { height: 50, borderRadius: 14, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.stroke, color: '#fff', paddingHorizontal: 14, fontSize: 16, paddingVertical: 0 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginTop: 16, marginBottom: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.stroke, borderRadius: R.pill, paddingHorizontal: 16, height: 52 },
  input: { flex: 1, color: '#fff', fontSize: 15, paddingVertical: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.stroke, borderRadius: R.md, padding: 10 },
  plus: { width: 30, height: 30, borderRadius: 15, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  dim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { backgroundColor: C.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 22, paddingBottom: 36, borderWidth: 1, borderColor: C.stroke },
  grab: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 18 },
  kcal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 18, paddingVertical: 8, backgroundColor: C.surface2, borderRadius: 20 },
  mt: { flex: 1, alignItems: 'center', backgroundColor: C.surface2, borderRadius: 16, paddingVertical: 10 },
  lab: { color: C.mut, fontWeight: '700', fontSize: 13, marginTop: 18, marginBottom: 8 },
  mult: { flex: 1, height: 46, borderRadius: 14, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  multOn: { backgroundColor: '#fff' },
});
