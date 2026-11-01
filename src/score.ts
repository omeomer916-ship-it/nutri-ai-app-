import type { TKey } from './i18n';
import { dayKey, totals, type Day, type Goals } from './store';

export type ScorePart = { key: TKey; got: number; max: number };
export type DayScore = { total: number; grade: 'A' | 'B' | 'C' | 'D' | 'E'; parts: ScorePart[] };

/** A 0-100 score for one day: calories on target, protein, water, balance, activity and logging. */
export function dayScore(day: Day | undefined, goals: Goals, waterGoal: number, burned: number): DayScore {
  const t = totals(day);
  const n = day?.meals.length ?? 0;
  const goal = goals.kcal + burned;
  const off = n ? Math.abs(t.kcal - goal) / Math.max(1, goal) : 1;
  const kcal = n ? Math.round(35 * (off <= 0.1 ? 1 : Math.max(0, 1 - (off - 0.1) / 0.4))) : 0;
  const prot = Math.round(25 * Math.min(1, t.P / Math.max(1, goals.P)));
  const water = Math.round(15 * Math.min(1, (day?.water ?? 0) / Math.max(1, waterGoal)));
  const bal = n ? Math.round(10 * ((t.C <= goals.C * 1.2 ? 0.5 : 0) + (t.F <= goals.F * 1.2 ? 0.5 : 0))) : 0;
  const move = burned >= 150 ? 10 : burned > 0 ? 6 : 0;
  const log = n >= 3 ? 5 : n * 1.5;
  const parts: ScorePart[] = [
    { key: 'scKcal', got: kcal, max: 35 }, { key: 'scProt', got: prot, max: 25 }, { key: 'scWater', got: water, max: 15 },
    { key: 'scBal', got: bal, max: 10 }, { key: 'scMove', got: move, max: 10 }, { key: 'scLog', got: Math.round(log), max: 5 },
  ];
  const total = Math.min(100, parts.reduce((a, p) => a + p.got, 0));
  const grade = total >= 85 ? 'A' : total >= 70 ? 'B' : total >= 55 ? 'C' : total >= 40 ? 'D' : 'E';
  return { total, grade, parts };
}

export const GRADE_COLOR: Record<DayScore['grade'], string> = { A: '#1FC46F', B: '#7AC547', C: '#F5C100', D: '#EF7D00', E: '#E5484D' };

/** Calories saved (positive) or overspent (negative) over the last 6 logged days, plus today's flexible budget. */
export function weekBank(days: Record<string, Day>, goals: Goals, burn: Record<string, { kcal: number }[]>) {
  let bank = 0, used = 0;
  for (let i = 1; i <= 6; i++) {
    const k = dayKey(Date.now() - i * 864e5);
    const d = days[k];
    if (!d?.meals.length) continue;
    used++;
    const b = (burn[k] ?? []).reduce((a, x) => a + x.kcal, 0);
    bank += goals.kcal + b - totals(d).kcal;
  }
  bank = Math.round(bank);
  // Spread at most a third of the bank into today, never more than 500 kcal.
  const flex = Math.max(-300, Math.min(500, Math.round(bank / 3)));
  return { bank, used, flex };
}
