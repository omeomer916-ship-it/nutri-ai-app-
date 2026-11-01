import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getLocales } from 'expo-localization';
import type { Lang } from './i18n';

const SUPPORTED = ['en', 'ar', 'fr', 'es', 'de', 'tr', 'ru', 'id', 'ur'];
const deviceLang = (): Lang => {
  try {
    const c = getLocales()[0]?.languageCode ?? 'en';
    return (SUPPORTED.includes(c) ? c : 'en') as Lang;
  } catch { return 'en'; }
};

/** Free plan: AI scans per day. Turn PAYWALL_ON on once Google Play billing is connected. */
export const PAYWALL_ON = false;
export const FREE_SCANS = 3;

export type Cat = 'bf' | 'ln' | 'dn' | 'sn' | 'ds' | 'dr';
export const CATS: Cat[] = ['bf', 'ln', 'dn', 'sn', 'ds', 'dr'];

export type Meal = {
  id: string; name: string; kcal: number; P: number; C: number; F: number;
  cat: Cat; t: number; photo?: string;
};
export type Day = { meals: Meal[]; water: number };
export type Goals = { kcal: number; P: number; C: number; F: number };
export type Profile = {
  sex: 'm' | 'f'; age: number; h: number; w: number; gw: number;
  goal: 'lose' | 'keep' | 'gain'; act: 1 | 2 | 3 | 4;
  pace?: number; diet?: 'any' | 'veg' | 'vegan' | 'keto' | 'lowcarb' | 'highP' | 'medi';
};
export type Health = { diabetes: boolean; bp: boolean; gluten: boolean; nuts: boolean; lactose: boolean };
export type BodyPhoto = { id: string; t: number; uri: string; w?: number };
export type Checkin = { mood: number; energy: number; hunger: number; sleep: number };
export type Measure = { t: number; waist?: number; hip?: number; chest?: number; arm?: number; thigh?: number; neck?: number };
export type Supp = { id: string; name: string };
export type MyFood = { id: string; name: string; k: number; P: number; C: number; F: number };
export type Account = { name: string; email?: string; photo?: string; guest: boolean };

export const dayKey = (t: number = Date.now()) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const totals = (day?: Day) => {
  const m = day?.meals ?? [];
  return {
    kcal: m.reduce((a, x) => a + x.kcal, 0),
    P: m.reduce((a, x) => a + x.P, 0),
    C: m.reduce((a, x) => a + x.C, 0),
    F: m.reduce((a, x) => a + x.F, 0),
  };
};

export function streakOf(days: Record<string, Day>) {
  let n = 0;
  for (let i = 0; i < 365; i++) {
    const has = (days[dayKey(Date.now() - i * 864e5)]?.meals.length ?? 0) > 0;
    if (has) n++;
    else if (i > 0) break;
  }
  return n;
}

type State = {
  lang: Lang;
  seenIntro: boolean;
  account: Account | null;
  profile: Profile | null;
  goals: Goals;
  days: Record<string, Day>;
  weights: { t: number; w: number }[];
  myFoods: MyFood[];
  remind: { meals: boolean; water: boolean };
  fast: { start: number | null; hours: number; log: { s: number; e: number; h: number }[] };
  startFast: (hours: number) => void;
  endFast: () => void;
  setFastHours: (h: number) => void;
  waterGoal: number;
  imperial: boolean;
  theme: 'system' | 'dark' | 'light';
  health: Health;
  setHealth: (h: Partial<Health>) => void;
  photos: BodyPhoto[];
  addPhoto: (p: Omit<BodyPhoto, 'id'>) => void;
  removePhoto: (id: string) => void;
  rateAsked: number;
  checkins: Record<string, Checkin>;
  setCheckin: (key: string, c: Checkin) => void;
  measures: Measure[];
  addMeasure: (m: Omit<Measure, 't'>) => void;
  removeMeasure: (t: number) => void;
  supps: Supp[];
  suppLog: Record<string, string[]>;
  addSupp: (name: string) => void;
  removeSupp: (id: string) => void;
  toggleSupp: (key: string, id: string) => void;
  report: { k: string; text: string } | null;
  setReport: (r: { k: string; text: string }) => void;
  setRateAsked: (t: number) => void;
  setTheme: (v: 'system' | 'dark' | 'light') => void;
  isPro: boolean;
  scans: Record<string, number>;
  countScan: () => void;
  setImperial: (v: boolean) => void;
  setWaterGoal: (n: number) => void;
  copyDay: (from: string) => void;
  setRemind: (r: Partial<{ meals: boolean; water: boolean }>) => void;
  burn: Record<string, { id: string; name: string; kcal: number; min: number }[]>;
  addBurn: (b: { name: string; kcal: number; min: number }) => void;
  removeBurn: (key: string, id: string) => void;
  addMyFood: (f: Omit<MyFood, 'id'>) => void;
  removeMyFood: (id: string) => void;
  updateMeal: (key: string, id: string, patch: Partial<Omit<Meal, 'id'>>) => void;
  setLang: (l: Lang) => void;
  finishIntro: (a: Account) => void;
  signOut: () => void;
  setProfile: (p: Profile, g: Goals) => void;
  setGoals: (g: Partial<Goals>) => void;
  addMeal: (m: Omit<Meal, 'id' | 't'>) => void;
  removeMeal: (key: string, id: string) => void;
  setWater: (n: number) => void;
  addWeight: (w: number) => void;
  resetAll: () => void;
};

const initial: Pick<State, 'lang' | 'seenIntro' | 'account' | 'profile' | 'goals' | 'days' | 'weights' | 'myFoods' | 'remind' | 'burn' | 'fast' | 'waterGoal' | 'imperial' | 'theme' | 'health' | 'photos' | 'rateAsked' | 'report' | 'checkins' | 'measures' | 'supps' | 'suppLog' | 'isPro' | 'scans'> = {
  lang: deviceLang(),
  seenIntro: false,
  account: null,
  profile: null,
  goals: { kcal: 2000, P: 130, C: 220, F: 65 },
  days: {},
  weights: [],
  myFoods: [],
  remind: { meals: false, water: false },
  burn: {},
  fast: { start: null, hours: 16, log: [] },
  waterGoal: 8,
  imperial: false,
  theme: 'system',
  health: { diabetes: false, bp: false, gluten: false, nuts: false, lactose: false },
  photos: [],
  rateAsked: 0,
  report: null,
  checkins: {},
  measures: [],
  supps: [],
  suppLog: {},
  isPro: false,
  scans: {},
};

export const useApp = create<State>()(
  persist(
    (set, get) => ({
      ...initial,
      setLang: (lang) => set({ lang }),
      finishIntro: (account) => set({ seenIntro: true, account }),
      signOut: () => set({ account: null, seenIntro: false }),
      setProfile: (profile, goals) => {
        const weights = get().weights.length ? get().weights : [{ t: Date.now(), w: profile.w }];
        set({ profile, goals, weights });
      },
      setGoals: (g) => set({ goals: { ...get().goals, ...g } }),
      addMeal: (m) => {
        const k = dayKey();
        const days = { ...get().days };
        const d = days[k] ?? { meals: [], water: 0 };
        const meal: Meal = { ...m, id: Math.random().toString(36).slice(2), t: Date.now() };
        days[k] = { ...d, meals: [meal, ...d.meals] };
        set({ days });
      },
      startFast: (hours) => set({ fast: { ...get().fast, start: Date.now(), hours } }),
      endFast: () => {
        const f = get().fast;
        if (!f.start) return;
        set({ fast: { ...f, start: null, log: [{ s: f.start, e: Date.now(), h: f.hours }, ...f.log].slice(0, 60) } });
      },
      setFastHours: (h) => set({ fast: { ...get().fast, hours: h } }),
      countScan: () => {
        const k = dayKey();
        set({ scans: { [k]: (get().scans[k] ?? 0) + 1 } });
      },
      setImperial: (v) => set({ imperial: v }),
      setTheme: (v) => set({ theme: v }),
      setHealth: (h) => set((s) => ({ health: { ...s.health, ...h } })),
      addPhoto: (p) => set((s) => ({ photos: [...s.photos, { ...p, id: String(Date.now()) }].sort((a, b) => a.t - b.t) })),
      removePhoto: (id) => set((s) => ({ photos: s.photos.filter((x) => x.id !== id) })),
      setRateAsked: (t) => set({ rateAsked: t }),
      setReport: (r) => set({ report: r }),
      setCheckin: (key, c) => set((s) => ({ checkins: { ...s.checkins, [key]: c } })),
      addMeasure: (m) => set((s) => ({ measures: [...s.measures, { ...m, t: Date.now() }] })),
      removeMeasure: (t) => set((s) => ({ measures: s.measures.filter((x) => x.t !== t) })),
      addSupp: (name) => set((s) => ({ supps: [...s.supps, { id: String(Date.now()), name: name.trim().slice(0, 40) }] })),
      removeSupp: (id) => set((s) => ({ supps: s.supps.filter((x) => x.id !== id) })),
      toggleSupp: (key, id) => set((s) => {
        const cur = s.suppLog[key] ?? [];
        return { suppLog: { ...s.suppLog, [key]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] } };
      }),
      setWaterGoal: (n) => set({ waterGoal: Math.max(4, Math.min(16, n)) }),
      copyDay: (from) => {
        const src = get().days[from];
        if (!src?.meals.length) return;
        const k = dayKey();
        const days = { ...get().days };
        const d = days[k] ?? { meals: [], water: 0 };
        const now = Date.now();
        const copies = src.meals.map((m, i) => ({ ...m, id: Math.random().toString(36).slice(2), t: now - i }));
        days[k] = { ...d, meals: [...copies, ...d.meals] };
        set({ days });
      },
      setRemind: (r) => set({ remind: { ...get().remind, ...r } }),
      addBurn: (b) => {
        const k = dayKey();
        const list = get().burn[k] ?? [];
        set({ burn: { ...get().burn, [k]: [{ ...b, id: Math.random().toString(36).slice(2) }, ...list] } });
      },
      removeBurn: (key, id) => set({ burn: { ...get().burn, [key]: (get().burn[key] ?? []).filter((x) => x.id !== id) } }),
      addMyFood: (f) => set({ myFoods: [{ ...f, id: Math.random().toString(36).slice(2) }, ...get().myFoods] }),
      removeMyFood: (id) => set({ myFoods: get().myFoods.filter((x) => x.id !== id) }),
      updateMeal: (key, id, patch) => {
        const days = { ...get().days };
        const d = days[key];
        if (!d) return;
        days[key] = { ...d, meals: d.meals.map((x) => (x.id === id ? { ...x, ...patch } : x)) };
        set({ days });
      },
      removeMeal: (key, id) => {
        const days = { ...get().days };
        const d = days[key];
        if (!d) return;
        days[key] = { ...d, meals: d.meals.filter((x) => x.id !== id) };
        set({ days });
      },
      setWater: (n) => {
        const k = dayKey();
        const days = { ...get().days };
        const d = days[k] ?? { meals: [], water: 0 };
        days[k] = { ...d, water: Math.max(0, Math.min(20, n)) };
        set({ days });
      },
      addWeight: (w) => set({ weights: [...get().weights, { t: Date.now(), w }] }),
      resetAll: () => set({ ...initial, lang: get().lang }),
    }),
    { name: 'nutri-ai', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
