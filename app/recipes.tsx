import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useT, TKey } from '../src/i18n';
import { useApp } from '../src/store';
import { RECIPES, Recipe, RecipeTag } from '../src/recipes';
import { C, themed, fa } from '../src/theme';
import { Btn, Chip, IconBadge, Num, Pop, Row, Txt } from '../src/components/ui';
import { Icon } from '../src/components/Icon';
import { Illus } from '../src/components/Illus';
import { Page } from '../src/components/Page';

const TAGS: [RecipeTag | 'all', TKey][] = [['all', 'gall'], ['hp', 'tHp'], ['lc', 'tLc'], ['veg', 'tVeg'], ['quick', 'tQuick']];

/** Healthy recipes from around the world, each one added to the day in one tap. */
export default function Recipes() {
  const { t, lang, rtl } = useT();
  const addMeal = useApp((s) => s.addMeal);
  const [tag, setTag] = useState<RecipeTag | 'all'>('all');
  const [open, setOpen] = useState<Recipe | null>(null);
  const L = (r: Recipe) => (lang === 'ar' ? r.ar : r.en);
  const list = RECIPES.filter((r) => tag === 'all' || r.tags.includes(tag));

  return (
    <Page title={t('recT')}>
      <View style={{ alignItems: 'center' }}>
        <Illus kind="book" size={150} />
        <Txt center style={{ color: C.mut, marginTop: 2, lineHeight: 22 }}>{t('recS')}</Txt>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, marginTop: 16 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
        {TAGS.map(([k, l]) => <Chip key={k} title={t(l)} on={tag === k} onPress={() => setTag(k)} />)}
      </ScrollView>
      <View style={{ gap: 10, marginTop: 14 }}>
        {list.map((r, i) => (
          <Pop key={r.id} delay={i * 50}>
            <Pressable onPress={() => setOpen(r)} style={({ pressed }) => [st.card, pressed && { opacity: 0.85 }]}>
              <IconBadge name={r.icon} size={54} icon={26} />
              <View style={{ flex: 1 }}>
                <Txt numberOfLines={1} style={{ fontWeight: '900', fontSize: 16 }}>{L(r).name}</Txt>
                <Row style={{ gap: 10, marginTop: 3 }}>
                  <Num style={{ color: C.green, fontWeight: '800', fontSize: 13 }}>{r.kcal} kcal</Num>
                  <Row style={{ gap: 3 }}><Icon name="clock" size={12} color={C.mut} /><Num style={{ color: C.mut, fontSize: 12 }}>{r.min} min</Num></Row>
                  <Num style={{ color: C.mut, fontSize: 12 }}>P {r.P}g</Num>
                </Row>
              </View>
              <View style={{ transform: [{ scaleX: rtl ? -1 : 1 }] }}><Icon name="chevron" size={18} color={C.dim} /></View>
            </Pressable>
          </Pop>
        ))}
      </View>

      <Modal visible={!!open} transparent animationType="slide" onRequestClose={() => setOpen(null)}>
        <Pressable style={st.scrim} onPress={() => setOpen(null)} />
        {open && (
          <View style={[st.sheet, { direction: rtl ? 'rtl' : 'ltr' }]}>
            <View style={st.grab} />
            <ScrollView showsVerticalScrollIndicator={false}>
              <Row style={{ gap: 12 }}>
                <IconBadge name={open.icon} size={56} icon={28} loop="float" />
                <View style={{ flex: 1 }}>
                  <Txt style={{ fontSize: 21, fontWeight: '900', lineHeight: 30 }}>{L(open).name}</Txt>
                  <Row style={{ gap: 4 }}><Icon name="clock" size={13} color={C.mut} /><Num style={{ color: C.mut, fontSize: 13 }}>{open.min} min · 1 {t('serving')}</Num></Row>
                </View>
              </Row>
              <Row style={{ gap: 8, marginTop: 16 }}>
                {([[String(open.kcal), 'kcal'], [`${open.P}g`, t('P')], [`${open.C}g`, t('Cb')], [`${open.F}g`, t('F')]] as [string, string][]).map(([v, l]) => (
                  <View key={l} style={st.mt}><Num style={{ fontWeight: '900', fontSize: 16 }}>{v}</Num><Txt numberOfLines={1} style={{ color: C.mut, fontSize: 11 }}>{l}</Txt></View>
                ))}
              </Row>
              <Txt style={st.h}>{t('ingredients')}</Txt>
              {L(open).ing.map((x) => (
                <Row key={x} style={{ gap: 10, paddingVertical: 5 }}><View style={st.dot} /><Txt style={{ flex: 1 }}>{x}</Txt></Row>
              ))}
              <Txt style={st.h}>{t('steps')}</Txt>
              {L(open).steps.map((x, i) => (
                <Row key={i} style={{ gap: 10, paddingVertical: 6, alignItems: 'flex-start' }}>
                  <View style={st.num}><Num style={{ color: '#000', fontWeight: '900', fontSize: 12 }}>{i + 1}</Num></View>
                  <Txt style={{ flex: 1, lineHeight: 23 }}>{x}</Txt>
                </Row>
              ))}
              <Btn title={`${t('addTo')} ${t(open.cat)}`} style={{ marginTop: 20 }} icon={<Icon name="plus" size={18} color="#000" stroke={2.6} />}
                onPress={() => { addMeal({ name: L(open).name, cat: open.cat, kcal: open.kcal, P: open.P, C: open.C, F: open.F }); setOpen(null); }} />
            </ScrollView>
          </View>
        )}
      </Modal>
    </Page>
  );
}

const st = themed(() => StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 22, padding: 12 },
  scrim: { flex: 1, backgroundColor: C.scrim },
  sheet: { maxHeight: '86%', backgroundColor: C.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 34, borderWidth: 1, borderColor: C.border },
  grab: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: fa(0.2), marginBottom: 16 },
  mt: { flex: 1, alignItems: 'center', backgroundColor: C.surface2, borderRadius: 14, paddingVertical: 10 },
  h: { fontWeight: '900', fontSize: 17, marginTop: 20, marginBottom: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.green },
  num: { width: 24, height: 24, borderRadius: 12, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
}));
