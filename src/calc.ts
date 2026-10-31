import type { Goals, Profile } from './store';

/** Mifflin-St Jeor BMR x activity, adjusted for goal and weekly pace (7700 kcal per kg). */
export function computePlan(p: Profile): Goals & { weeks: number; tdee: number } {
  const bmr = 10 * p.w + 6.25 * p.h - 5 * p.age + (p.sex === 'm' ? 5 : -161);
  const mult = [1.2, 1.375, 1.55, 1.725][p.act - 1];
  const tdee = bmr * mult;
  const pace = p.pace ?? (p.goal === 'gain' ? 0.25 : 0.5);
  let kcal = tdee;
  if (p.goal === 'lose') kcal -= Math.min(1000, (pace * 7700) / 7);
  if (p.goal === 'gain') kcal += Math.min(600, (pace * 7700) / 7);
  kcal = Math.max(p.sex === 'f' ? 1200 : 1500, Math.round(kcal / 10) * 10);
  const highP = p.diet === 'highP' || p.goal === 'gain';
  const P = Math.round(p.w * (highP ? 2 : 1.8));
  const fatShare = p.diet === 'keto' ? 0.65 : p.diet === 'lowcarb' ? 0.4 : 0.27;
  const F = Math.round((kcal * fatShare) / 9);
  const C = Math.max(p.diet === 'keto' ? 25 : 50, Math.round((kcal - P * 4 - F * 9) / 4));
  const diff = Math.abs(p.w - p.gw);
  const weeks = p.goal === 'keep' || diff < 0.5 ? 0 : Math.ceil(diff / pace);
  return { kcal, P, C, F, weeks, tdee: Math.round(tdee) };
}

// Units
export const KG_LB = 2.20462;
export const wShow = (kg: number, imp: boolean) => Math.round((imp ? kg * KG_LB : kg) * 10) / 10;
export const wUnit = (imp: boolean, kgLabel: string) => (imp ? 'lb' : kgLabel);
export const hShow = (cm: number, imp: boolean) => {
  if (!imp) return `${Math.round(cm)} cm`;
  const inch = Math.round(cm / 2.54);
  return `${Math.floor(inch / 12)}′${inch % 12}″`;
};

export const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

export const hms = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}`;
};

/** 12-hour clock in the app language, Latin digits: "8:30 ص", "1:30 PM". */
export function time12(d: Date | number, lang: string) {
  const loc = lang === 'ar' ? 'ar-u-nu-latn' : lang === 'ur' ? 'ur-u-nu-latn' : lang;
  try {
    return new Date(d).toLocaleTimeString(loc, { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch {
    const x = new Date(d), h = x.getHours();
    return `${h % 12 || 12}:${String(x.getMinutes()).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
  }
}
/** Same, for an hour and minute of today. */
export const at12 = (h: number, m: number, lang: string) => { const d = new Date(); d.setHours(h, m, 0, 0); return time12(d, lang); };
