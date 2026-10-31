export const C = {
  bg: '#000000',
  surface: '#0D1411',
  surface2: '#141D18',
  surface3: '#1B2620',
  stroke: 'rgba(255,255,255,0.07)',
  // kept for older screens
  card: '#0D1411',
  card2: '#141D18',
  line: 'rgba(57,230,140,0.22)',
  green: '#39E68C',
  green2: '#9af3c4',
  greenDark: '#1a8f52',
  white: '#ffffff',
  mut: 'rgba(255,255,255,0.62)',
  dim: 'rgba(255,255,255,0.38)',
  red: '#FF6B6B',
  // macro colours
  pro: '#FF7A8C',
  carb: '#FFC35C',
  fat: '#6CB6FF',
  water: '#4FC3FF',
};

export const R = { sm: 12, md: 18, lg: 26, xl: 32, pill: 999 };

/** Cairo static weights (assets/fonts). Cyrillic is not in Cairo, so Russian uses the system font. */
export const FONTS = {
  'Cairo-400': require('../assets/fonts/Cairo-400.ttf'),
  'Cairo-600': require('../assets/fonts/Cairo-600.ttf'),
  'Cairo-700': require('../assets/fonts/Cairo-700.ttf'),
  'Cairo-800': require('../assets/fonts/Cairo-800.ttf'),
  'Cairo-900': require('../assets/fonts/Cairo-900.ttf'),
};

export function fontFor(weight?: string | number, lang?: string) {
  if (lang === 'ru') return undefined;
  const w = Number(weight === 'bold' ? 700 : weight === 'normal' || !weight ? 400 : weight);
  const k = w >= 900 ? 900 : w >= 800 ? 800 : w >= 700 ? 700 : w >= 500 ? 600 : 400;
  return `Cairo-${k}`;
}

export const IMG = {
  intro1: require('../assets/images/intro1.jpg'),
  intro2: require('../assets/images/intro2.jpg'),
  intro3: require('../assets/images/intro3.jpg'),
  welcome: require('../assets/images/welcome.jpg'),
  scan: require('../assets/images/scan.jpg'),
  scanDn: require('../assets/images/scan_dn.jpg'),
  scanSn: require('../assets/images/scan_sn.jpg'),
  scanDs: require('../assets/images/scan_ds.jpg'),
  scanDr: require('../assets/images/scan_dr.jpg'),
  bf: require('../assets/images/breakfast.jpg'),
  ln: require('../assets/images/lunch.jpg'),
  dn: require('../assets/images/dinner.jpg'),
  sn: require('../assets/images/snacks.jpg'),
  ds: require('../assets/images/desserts.jpg'),
  dr: require('../assets/images/drinks.jpg'),
};

/** Category icon names + accent colours (see components/Icon). */
export const CAT_ICON = {
  bf: { icon: 'sun', color: '#FFC35C' },
  ln: { icon: 'bowl', color: '#39E68C' },
  dn: { icon: 'moon', color: '#9C8CFF' },
  sn: { icon: 'cookie', color: '#FF9F5C' },
  ds: { icon: 'cake', color: '#FF7A8C' },
  dr: { icon: 'cup', color: '#4FC3FF' },
} as const;

// legacy emoji map (unused by new screens)
export const ICO = { bf: '🍳', ln: '🥗', dn: '🍽️', sn: '🍿', ds: '🍫', dr: '🥤' } as const;
