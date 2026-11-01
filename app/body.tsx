import { useState } from 'react';
import { Alert, Dimensions, Image, Pressable, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { copyAsync, deleteAsync, documentDirectory, makeDirectoryAsync } from 'expo-file-system/legacy';
import { useT } from '../src/i18n';
import { useApp } from '../src/store';
import { wShow } from '../src/calc';
import { C, themed } from '../src/theme';
import { Btn, Card, Num, Row, Txt } from '../src/components/ui';
import { Icon } from '../src/components/Icon';
import { Illus } from '../src/components/Illus';
import { Page } from '../src/components/Page';

const W = Dimensions.get('window').width;

/** Private before / after photos. They stay on this phone only. */
export default function Body() {
  const { t, lang } = useT();
  const { photos, addPhoto, removePhoto, weights, imperial } = useApp();
  const [pick, setPick] = useState<[number, number] | null>(null);
  const loc = lang === 'ar' ? 'ar' : lang;
  const wAt = (ts: number) => {
    if (!weights.length) return undefined;
    return weights.reduce((b, w) => (Math.abs(w.t - ts) < Math.abs(b.t - ts) ? w : b)).w;
  };

  const add = async (cam: boolean) => {
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect: [3, 4] };
    const perm = cam ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const r = cam ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    if (r.canceled || !r.assets?.[0]) return;
    try {
      const dir = `${documentDirectory}body/`;
      await makeDirectoryAsync(dir, { intermediates: true }).catch(() => {});
      const to = `${dir}${Date.now()}.jpg`;
      await copyAsync({ from: r.assets[0].uri, to });
      addPhoto({ t: Date.now(), uri: to, w: wAt(Date.now()) });
    } catch { addPhoto({ t: Date.now(), uri: r.assets[0].uri, w: wAt(Date.now()) }); }
  };
  const del = (id: string, uri: string) => Alert.alert(t('delPhoto'), '', [
    { text: t('cancel'), style: 'cancel' },
    { text: t('delete'), style: 'destructive', onPress: () => { removePhoto(id); deleteAsync(uri, { idempotent: true }).catch(() => {}); setPick(null); } },
  ]);

  const [a, b] = pick ?? [0, photos.length - 1];
  const A = photos[a], B = photos[b];
  const fmtD = (ts: number) => new Date(ts).toLocaleDateString(loc, { day: 'numeric', month: 'short', year: 'numeric' });
  const days = A && B ? Math.round((B.t - A.t) / 864e5) : 0;
  const cw = (W - 40 - 10) / 2;

  return (
    <Page title={t('bodyT')}>
      {photos.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 10 }}>
          <Illus kind="photos" size={190} />
          <Txt center style={{ fontSize: 20, fontWeight: '900', marginTop: 6 }}>{t('bodyEmpty')}</Txt>
          <Txt center style={{ color: C.mut, marginTop: 6, lineHeight: 22 }}>{t('bodyS')}</Txt>
        </View>
      ) : (
        <>
          <Row style={{ gap: 10 }}>
            {(photos.length > 1 ? [A, B] : [A]).map((p, i) => (
              <View key={i} style={{ width: photos.length > 1 ? cw : W - 40 }}>
                <View style={[st.big, { width: photos.length > 1 ? cw : W - 40, height: (photos.length > 1 ? cw : W - 40) * 4 / 3 }]}>
                  <Image source={{ uri: p.uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                  <View style={st.tag}><Txt style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>{photos.length < 2 ? t('startPhoto') : i === 0 ? t('before') : t('after')}</Txt></View>
                </View>
                <Txt center style={{ fontWeight: '800', fontSize: 13, marginTop: 6 }}>{fmtD(p.t)}</Txt>
                {p.w !== undefined && <Num style={{ color: C.mut, fontSize: 12, textAlign: 'center' }}>{wShow(p.w, imperial)} {imperial ? 'lb' : 'kg'}</Num>}
              </View>
            ))}
          </Row>
          {photos.length > 1 && (
            <Card style={{ marginTop: 14 }}>
              <Row style={{ justifyContent: 'space-around' }}>
                <View style={{ alignItems: 'center' }}><Num style={{ fontSize: 22, fontWeight: '900' }}>{days}</Num><Txt style={{ color: C.mut, fontSize: 12 }}>{t('daysL')}</Txt></View>
                {A.w !== undefined && B.w !== undefined && (
                  <View style={{ alignItems: 'center' }}>
                    <Num style={{ fontSize: 22, fontWeight: '900', color: C.green }}>{B.w - A.w > 0 ? '+' : B.w - A.w < 0 ? '-' : ''}{wShow(Math.abs(B.w - A.w), imperial)}</Num>
                    <Txt style={{ color: C.mut, fontSize: 12 }}>{imperial ? 'lb' : 'kg'}</Txt>
                  </View>
                )}
              </Row>
            </Card>
          )}
          <Txt style={{ color: C.mut, fontWeight: '700', fontSize: 13, marginTop: 18, marginBottom: 8 }}>{t('bodyAll')}</Txt>
          <View style={st.grid}>
            {photos.map((p, i) => {
              const on = i === a || i === b;
              return (
                <Pressable key={p.id} onLongPress={() => del(p.id, p.uri)}
                  onPress={() => setPick(i < b ? [i, b] : [a, i])}
                  style={[st.thumb, on && { borderColor: C.green }]}>
                  <Image source={{ uri: p.uri }} style={StyleSheet.absoluteFill} />
                </Pressable>
              );
            })}
          </View>
          <Txt style={{ color: C.dim, fontSize: 12, marginTop: 8 }}>{t('bodyTip')}</Txt>
        </>
      )}
      <Row style={{ gap: 10, marginTop: 20 }}>
        <Btn title={t('takePhoto')} style={{ flex: 1 }} icon={<Icon name="camera" size={18} color="#000" />} onPress={() => add(true)} />
        <Btn kind="soft" title={t('gallery')} style={{ flex: 1 }} icon={<Icon name="image" size={18} />} onPress={() => add(false)} />
      </Row>
      <Row style={{ gap: 8, marginTop: 14, justifyContent: 'center' }}>
        <Icon name="lock" size={14} color={C.dim} />
        <Txt style={{ color: C.dim, fontSize: 12 }}>{t('bodyPrivate')}</Txt>
      </Row>
    </Page>
  );
}

const st = themed(() => StyleSheet.create({
  big: { borderRadius: 20, overflow: 'hidden', backgroundColor: C.surface2 },
  tag: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  thumb: { width: (W - 40 - 24) / 4, aspectRatio: 3 / 4, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent', backgroundColor: C.surface2 },
}));
