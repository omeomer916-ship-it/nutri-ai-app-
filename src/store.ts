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
};
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

const initial: Pick<State, 'lang' | 'seenIntro' | 'account' | 'profile' | 'goals' | 'days' | 'weights' | 'myFoods' | 'remind' | 'burn'> = {
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
        days[k] = { ...d, water: Math.max(0, Math.min(12, n)) };
        set({ days });
      },
      addWeight: (w) => set({ weights: [...get().weights, { t: Date.now(), w }] }),
      resetAll: () => set({ ...initial, lang: get().lang }),
    }),
    { name: 'nutri-ai', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
