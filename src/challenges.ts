import type { IconName } from './components/Icon';
import type { TKey } from './i18n';
import { dayKey, totals, type Day, type Goals } from './store';

export type Challenge = { id: string; icon: IconName; title: TKey; desc: TKey; have: number; need: number; done: boolean };

type Input = {
  days: Record<string, Day>; goals: Goals; waterGoal: number;
  burn: Record<string, { kcal: number }[]>;
  fast: { log: { s: number; e: number; h: number }[] };
};

const lastDays = (n: number) => Array.from({ length: n }, (_, i) => dayKey(Date.now() - i * 864e5));

/** Rolling challenges, computed from what the user already logs. */
export function challenges(x: Input): Challenge[] {
  const count = (n: number, ok: (d: Day | undefined, k: string) => boolean) => lastDays(n).filter((k) => ok(x.days[k], k)).length;
  const t = (d?: Day) => totals(d);
  const list: Omit<Challenge, 'done'>[] = [
    { id: 'log14', icon: 'calendar', title: 'chLog', desc: 'chLogD', need: 14, have: count(14, (d) => (d?.meals.length ?? 0) > 0) },
    { id: 'prot7', icon: 'meat', title: 'chProt', desc: 'chProtD', need: 7, have: count(7, (d) => !!d && t(d).P >= x.goals.P * 0.9) },
    { id: 'target', icon: 'target', title: 'chTarget', desc: 'chTargetD', need: 5, have: count(7, (d) => !!d && d.meals.length > 0 && Math.abs(t(d).kcal - x.goals.kcal) <= x.goals.kcal * 0.1) },
    { id: 'water', icon: 'drop', title: 'chWater', desc: 'chWaterD', need: 30, have: count(30, (d) => (d?.water ?? 0) >= x.waterGoal) },
    { id: 'move', icon: 'run', title: 'chMove', desc: 'chMoveD', need: 10, have: lastDays(30).reduce((a, k) => a + (x.burn[k]?.length ?? 0), 0) },
    { id: 'fast', icon: 'moon', title: 'chFast', desc: 'chFastD', need: 5, have: x.fast.log.filter((f) => Date.now() - f.e < 14 * 864e5 && f.e - f.s >= f.h * 3600e3).length },
  ];
  return list.map((c) => ({ ...c, have: Math.min(c.have, c.need), done: c.have >= c.need }));
}
