import type { Goals, Profile } from './store';

/** Mifflin-St Jeor BMR × activity, adjusted for the goal. */
export function computePlan(p: Profile): Goals & { weeks: number } {
  const bmr = 10 * p.w + 6.25 * p.h - 5 * p.age + (p.sex === 'm' ? 5 : -161);
  const mult = [1.2, 1.375, 1.55, 1.725][p.act - 1];
  let kcal = bmr * mult;
  if (p.goal === 'lose') kcal -= 500;
  if (p.goal === 'gain') kcal += 300;
  kcal = Math.max(p.sex === 'f' ? 1200 : 1500, Math.round(kcal / 10) * 10);
  const P = Math.round(p.w * (p.goal === 'gain' ? 2 : 1.8));
  const F = Math.round((kcal * 0.25) / 9);
  const C = Math.max(50, Math.round((kcal - P * 4 - F * 9) / 4));
  const diff = Math.abs(p.w - p.gw);
  const weeks = p.goal === 'keep' || diff < 0.5 ? 0 : Math.ceil(diff / (p.goal === 'lose' ? 0.5 : 0.25));
  return { kcal, P, C, F, weeks };
}

export const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
