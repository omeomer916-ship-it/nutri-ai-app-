const DARK = {
  mode: 'dark' as 'dark' | 'light',
  bg: '#000000',
  surface: '#0D1411',
  surface2: '#141D18',
  surface3: '#1B2620',
  stroke: 'rgba(255,255,255,0.07)',
  border: 'rgba(255,255,255,0.09)',
  card: '#0D1411',
  card2: '#141D18',
  line: 'rgba(57,230,140,0.22)',
  green: '#39E68C',
  green2: '#9af3c4',
  greenDark: '#1a8f52',
  /** main text colour */
  text: '#ffffff',
  white: '#ffffff',
  mut: 'rgba(255,255,255,0.62)',
  dim: 'rgba(255,255,255,0.38)',
  /** selected chip / white button in dark, black in light */
  inv: '#ffffff',
  onInv: '#000000',
  bar: 'rgba(17,24,20,0.99)',
  scrim: 'rgba(0,0,0,0.6)',
  red: '#FF6B6B',
  // One brand: every accent is a shade of the logo green.
  pro: '#39E68C',
  carb: '#B5F7D5',
  fat: '#17B062',
  water: '#7CF5B5',
  mint: '#9AF3C4',
  deep: '#0F2A1B',
};
const LIGHT: typeof DARK = {
  mode: 'light',
  bg: '#F4F7F5',
  surface: '#FFFFFF',
  surface2: '#EEF3F0',
  surface3: '#DDE6E1',
  stroke: 'rgba(10,15,12,0.08)',
  border: 'rgba(10,15,12,0.10)',
  card: '#FFFFFF',
  card2: '#EEF3F0',
  line: 'rgba(31,191,106,0.30)',
  green: '#1FC46F',
  green2: '#3DBE7F',
  greenDark: '#12884A',
  text: '#0A0F0C',
  white: '#ffffff',
  mut: 'rgba(10,15,12,0.62)',
  dim: 'rgba(10,15,12,0.42)',
  inv: '#0A0F0C',
  onInv: '#ffffff',
  bar: 'rgba(255,255,255,0.99)',
  scrim: 'rgba(0,0,0,0.4)',
  red: '#E5484D',
  pro: '#1FC46F',
  carb: '#5CCB8F',
  fat: '#0E8F4C',
  water: '#2FC27A',
  mint: '#3DBE7F',
  deep: '#E3F5EA',
};

/** Live palette: its values are swapped in place by applyTheme(). */
export const C = { ...DARK };
let ver = 0;
export const themeVersion = () => ver;
export function applyTheme(m: 'dark' | 'light') {
  if (C.mode === m) return false;
  Object.assign(C, m === 'light' ? LIGHT : DARK);
  ver++;
  return true;
}
/** Text-coloured rgba: white in dark mode, near-black in light mode. */
export const fa = (a: number) => (C.mode === 'light' ? `rgba(10,15,12,${a})` : `rgba(255,255,255,${a})`);
/** Wrap a StyleSheet factory so its styles are rebuilt after a theme change. */
export function themed<T extends object>(f: () => T): T {
  let v = -1;
  let cache = {} as T;
  return new Proxy({} as T, {
    get(_t, k) {
      if (v !== ver) { cache = f(); v = ver; }
      return (cache as Record<string | symbol, unknown>)[k];
    },
  });
}

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
  scan: require('../assets/images/scan.jpg'),
  scanDn: require('../assets/images/scan_dn.jpg'),
  scanSn: require('../assets/images/scan_sn.jpg'),
  scanDs: require('../assets/images/scan_ds.jpg'),
  scanDr: require('../assets/images/scan_dr.jpg'),
  dr: require('../assets/images/drinks.jpg'),
};

/** Category icon names + accent colours (see components/Icon). */
export const CAT_ICON = {
  bf: { icon: 'sun', color: '#39E68C' },
  ln: { icon: 'bowl', color: '#39E68C' },
  dn: { icon: 'moon', color: '#39E68C' },
  sn: { icon: 'cookie', color: '#39E68C' },
  ds: { icon: 'cake', color: '#39E68C' },
  dr: { icon: 'cup', color: '#39E68C' },
} as const;

// legacy emoji map (unused by new screens)
export const ICO = { bf: '🍳', ln: '🥗', dn: '🍽️', sn: '🍿', ds: '🍫', dr: '🥤' } as const;
