import { useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useT, TKey } from '../src/i18n';
import { CATS, Cat, useApp } from '../src/store';
import { fmt } from '../src/calc';
import { C, CAT_ICON } from '../src/theme';
import { Btn, Chip, Num, Row, Txt } from '../src/components/ui';
import { Icon, IconName } from '../src/components/Icon';

type Product = { name: string; brand?: string; img?: string; k: number; P: number; C: number; F: number; serving?: number };

async function lookup(code: string): Promise<Product | null> {
  const fields = 'product_name,product_name_ar,product_name_en,brands,nutriments,serving_quantity,image_front_small_url';
  const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=${fields}`, {
    headers: { 'User-Agent': 'NutriAI/1.5 (Android)' },
  });
  if (!r.ok) return null;
  const j = await r.json();
  const p = j?.product;
  const n = p?.nutriments;
  if (!p || !n) return null;
  const k = Number(n['energy-kcal_100g'] ?? (n['energy_100g'] ? n['energy_100g'] / 4.184 : NaN));
  if (!isFinite(k)) return null;
  return {
    name: p.product_name || p.product_name_en || p.product_name_ar || code,
    brand: p.brands?.split(',')[0],
    img: p.image_front_small_url,
    k, P: Number(n.proteins_100g) || 0, C: Number(n.carbohydrates_100g) || 0, F: Number(n.fat_100g) || 0,
    serving: Number(p.serving_quantity) || undefined,
  };
}

export default function Barcode() {
  const { t, rtl } = useT();
  const params = useLocalSearchParams<{ cat?: string }>();
  const addMeal = useApp((s) => s.addMeal);
  const [perm, ask] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const [prod, setProd] = useState<Product | null>(null);
  const [miss, setMiss] = useState(false);
  const [g, setG] = useState(100);
  const h = new Date().getHours();
  const [cat, setCat] = useState<Cat>(params.cat && (CATS as string[]).includes(params.cat) ? (params.cat as Cat) : h < 11 ? 'bf' : h < 16 ? 'ln' : h < 21 ? 'dn' : 'sn');
  const lock = useRef(false);

  const onScan = async ({ data }: { data: string }) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    try {
      const p = await lookup(data);
      if (p) { setProd(p); setG(p.serving ?? 100); } else setMiss(true);
    } catch { setMiss(true); }
    setBusy(false);
  };
  const again = () => { setProd(null); setMiss(false); lock.current = false; };
  const v = (n: number) => Math.round((n * g) / 100);
  const add = () => {
    if (!prod) return;
    addMeal({ name: `${prod.name} · ${g} g`, cat, kcal: v(prod.k), P: v(prod.P), C: v(prod.C), F: v(prod.F) });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.back();
  };
  const sizes = Array.from(new Set([prod?.serving, 30, 50, 100, 200].filter((x): x is number => !!x && x > 0).map((x) => Math.round(x)))).slice(0, 5);

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {perm?.granted && !prod && !miss && (
        <CameraView style={StyleSheet.absoluteFill} facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }}
          onBarcodeScanned={busy ? undefined : onScan} />
      )}
      <SafeAreaView style={{ flex: 1, direction: rtl ? 'rtl' : 'ltr' }}>
        <Row style={{ gap: 12, paddingHorizontal: 20, paddingTop: 10 }}>
          <Pressable onPress={() => router.back()} style={st.back}><Icon name="x" size={20} /></Pressable>
          <Txt style={{ fontSize: 22, fontWeight: '900', flex: 1 }}>{t('barcode')}</Txt>
        </Row>

        {!perm?.granted ? (
          <View style={st.center}>
            <Icon name="barcode" size={64} color={C.green} />
            <Txt center style={{ color: C.mut, marginTop: 12, marginBottom: 20 }}>{t('bcHint')}</Txt>
            <Btn title={t('camAsk')} style={{ alignSelf: 'stretch' }} icon={<Icon name="camera" size={19} color="#000" />} onPress={() => ask()} />
          </View>
        ) : !prod && !miss ? (
          <View style={st.center} pointerEvents="none">
            <View style={st.frame}>{busy && <ActivityIndicator size="large" color={C.green} />}</View>
            <View style={st.hint}><Txt center style={{ fontWeight: '700' }}>{t('bcHint')}</Txt></View>
          </View>
        ) : miss ? (
          <View style={st.center}>
            <Icon name="search" size={56} color={C.dim} />
            <Txt center style={{ color: C.mut, marginTop: 12, marginBottom: 20, lineHeight: 24 }}>{t('bcNotFound')}</Txt>
            <Btn title={t('scanAgain')} style={{ alignSelf: 'stretch' }} icon={<Icon name="barcode" size={19} color="#000" />} onPress={again} />
            <Btn kind="soft" title={t('manual')} style={{ alignSelf: 'stretch', marginTop: 10 }} icon={<Icon name="edit" size={18} />} onPress={() => router.replace({ pathname: '/food', params: { cat } })} />
          </View>
        ) : prod && (
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Row style={{ gap: 14 }}>
              {prod.img ? <Image source={{ uri: prod.img }} style={st.img} resizeMode="contain" /> : <View style={[st.img, { alignItems: 'center', justifyContent: 'center' }]}><Icon name="barcode" size={30} color={C.green} /></View>}
              <View style={{ flex: 1 }}>
                <Txt style={{ fontSize: 20, fontWeight: '900' }}>{prod.name}</Txt>
                {!!prod.brand && <Txt style={{ color: C.mut }}>{prod.brand}</Txt>}
                <Num style={{ color: C.dim, fontSize: 12, textAlign: 'left' }}>{fmt(prod.k)} kcal · {t('per100')}</Num>
              </View>
            </Row>
            <View style={st.kcal}>
              <Icon name="flame" size={28} color="#fff" fill="rgba(255,255,255,0.1)" />
              <Num style={{ fontSize: 42, fontWeight: '900' }}>{fmt(v(prod.k))}</Num>
              <Num style={{ color: C.mut, fontSize: 15, fontWeight: '700', marginTop: 12 }}>kcal</Num>
            </View>
            <Row style={{ gap: 8, marginTop: 10 }}>
              {([['drumstick', prod.P, 'P', C.pro], ['wheat', prod.C, 'Cb', C.carb], ['avocado', prod.F, 'F', C.fat]] as [IconName, number, TKey, string][]).map(([ic, n, k, col]) => (
                <View key={k} style={st.mt}>
                  <Row style={{ gap: 5 }}><Icon name={ic} size={15} color={col} /><Num style={{ fontWeight: '900', fontSize: 16 }}>{v(n)}g</Num></Row>
                  <Txt center style={{ color: C.mut, fontSize: 11 }}>{t(k)}</Txt>
                </View>
              ))}
            </Row>
            <Txt style={st.lab}>{t('amount')}</Txt>
            <Row style={{ gap: 8 }}>
              {sizes.map((x) => (
                <Pressable key={x} onPress={() => setG(x)} style={[st.mult, g === x && { backgroundColor: '#fff' }]}>
                  <Num style={{ fontWeight: '900', fontSize: 14, color: g === x ? '#000' : '#fff' }}>{x} g</Num>
                  {x === prod.serving && <Txt style={{ fontSize: 9, color: g === x ? '#000' : C.mut }}>{t('serving')}</Txt>}
                </Pressable>
              ))}
            </Row>
            <Txt style={st.lab}>{t('addTo')}</Txt>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {CATS.map((c) => <Chip key={c} title={t(c)} icon={CAT_ICON[c].icon as IconName} on={cat === c} onPress={() => setCat(c)} />)}
            </ScrollView>
            <Btn title={`${t('addTo')} ${t(cat)}`} style={{ marginTop: 22 }} icon={<Icon name="check" size={18} color="#000" stroke={2.6} />} onPress={add} />
            <Btn kind="soft" title={t('scanAgain')} style={{ marginTop: 10 }} icon={<Icon name="barcode" size={18} />} onPress={again} />
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const st = StyleSheet.create({
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  frame: { width: 280, height: 170, borderRadius: 26, borderWidth: 3, borderColor: C.green, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(57,230,140,0.06)' },
  hint: { marginTop: 18, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  img: { width: 76, height: 76, borderRadius: 18, backgroundColor: '#fff' },
  kcal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 18, paddingVertical: 8, backgroundColor: C.surface2, borderRadius: 20 },
  mt: { flex: 1, alignItems: 'center', backgroundColor: C.surface2, borderRadius: 16, paddingVertical: 10 },
  lab: { color: C.mut, fontWeight: '700', fontSize: 13, marginTop: 18, marginBottom: 8 },
  mult: { flex: 1, height: 50, borderRadius: 14, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
});
