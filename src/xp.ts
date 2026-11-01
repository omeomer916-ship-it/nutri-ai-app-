import type { IconName } from './components/Icon';
import type { TKey } from './i18n';
import { dayKey, totals, type Checkin, type Day, type Goals } from './store';
import { dayScore } from './score';

// XP is worked out from what the user has logged, so it can never drift or be farmed.
// Nothing here rewards eating less than the goal: the best days are balanced days.

export type QuestId = 'bf' | 'water6' | 'prot' | 'ci' | 'move' | 'meals3' | 'ai' | 'score70' | 'photo' | 'fast';
export type Quest = { id: QuestId; icon: IconName; title: TKey; xp: number; done: boolean };

type Data = {
  days: Record<string, Day>; goals: Goals; waterGoal: number;
  burn: Record<string, { kcal: number }[]>; checkins: Record<string, Checkin>;
  fast: { log: { s: number; e: number; h: number }[] }; toolUses: Record<string, number>;
  suppLog: Record<string, string[]>; supps: { id: string }[];
};

const META: Record<QuestId, { icon: IconName; title: TKey; xp: number }> = {
  bf: { icon: 'sun', title: 'qBf', xp: 20 },
  water6: { icon: 'drop', title: 'qWater', xp: 20 },
  prot: { icon: 'meat', title: 'qProt', xp: 30 },
  ci: { icon: 'heart', title: 'qCi', xp: 15 },
  move: { icon: 'run', title: 'qMove', xp: 30 },
  meals3: { icon: 'bowl', title: 'qMeals', xp: 25 },
  ai: { icon: 'wand', title: 'qAi', xp: 20 },
  score70: { icon: 'target', title: 'qScore', xp: 35 },
  photo: { icon: 'camera', title: 'qPhoto', xp: 20 },
  fast: { icon: 'moon', title: 'qFast', xp: 30 },
};
const POOL = Object.keys(META) as QuestId[];

/** Three quests for a given day, the same for everyone on that date. */
export function questIds(key: string): QuestId[] {
  // FNV-1a hash of the date, then xorshift: spreads neighbouring dates far apart.
  let h = 2166136261;
  for (const ch of key) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  const next = () => { h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0; return h; };
  const pool = [...POOL];
  const picks: QuestId[] = [];
  while (picks.length < 3) picks.push(pool.splice(next() % pool.length, 1)[0]);
  return picks;
}

const burnOf = (x: Data, k: string) => (x.burn[k] ?? []).reduce((a, b) => a + b.kcal, 0);

function questDone(q: QuestId, x: Data, k: string): boolean {
  const d = x.days[k];
  const t = totals(d);
  switch (q) {
    case 'bf': return !!d?.meals.some((m) => m.cat === 'bf');
    case 'water6': return (d?.water ?? 0) >= 6;
    case 'prot': return t.P >= x.goals.P * 0.8;
    case 'ci': return !!x.checkins[k];
    case 'move': return burnOf(x, k) > 0;
    case 'meals3': return (d?.meals.length ?? 0) >= 3;
    case 'ai': return (x.toolUses[k] ?? 0) > 0;
    case 'score70': return dayScore(d, x.goals, x.waterGoal, burnOf(x, k)).total >= 70;
    case 'photo': return !!d?.meals.some((m) => !!m.photo);
    case 'fast': return x.fast.log.some((f) => dayKey(f.e) === k && f.e - f.s >= f.h * 3600e3);
  }
}

export function quests(x: Data, k = dayKey()): Quest[] {
  return questIds(k).map((id) => ({ id, ...META[id], done: questDone(id, x, k) }));
}

export const QUEST_BONUS = 50;

/** XP earned on one day, with the parts that made it. */
export function dayXp(x: Data, k: string) {
  const d = x.days[k];
  const n = d?.meals.length ?? 0;
  let xp = Math.min(n, 6) * 5;
  if ((d?.water ?? 0) >= x.waterGoal) xp += 15;
  if (n && totals(d).P >= x.goals.P * 0.9) xp += 20;
  if (x.checkins[k]) xp += 10;
  if (burnOf(x, k) > 0) xp += 10;
  if (x.supps.length && x.supps.every((s) => (x.suppLog[k] ?? []).includes(s.id))) xp += 5;
  if (n) {
    const g = dayScore(d, x.goals, x.waterGoal, burnOf(x, k)).grade;
    xp += g === 'A' ? 30 : g === 'B' ? 15 : 0;
  }
  const qs = quests(x, k);
  xp += qs.filter((q) => q.done).reduce((a, q) => a + q.xp, 0);
  if (qs.every((q) => q.done)) xp += QUEST_BONUS;
  return xp;
}

export function totalXp(x: Data) {
  const keys = new Set([...Object.keys(x.days), ...Object.keys(x.checkins), ...Object.keys(x.burn), ...Object.keys(x.toolUses)]);
  let xp = 0;
  keys.forEach((k) => { xp += dayXp(x, k); });
  return xp;
}

// Level n starts at 50 * n * (n - 1) XP: 0, 100, 300, 600, 1000...
export const levelStart = (n: number) => 50 * n * (n - 1);
export function levelOf(xp: number) {
  let n = 1;
  while (levelStart(n + 1) <= xp) n++;
  const from = levelStart(n), to = levelStart(n + 1);
  return { level: n, into: xp - from, need: to - from, title: TITLES[Math.min(TITLES.length - 1, Math.floor((n - 1) / 3))] };
}
export const TITLES: TKey[] = ['lv1', 'lv2', 'lv3', 'lv4', 'lv5', 'lv6', 'lv7', 'lv8', 'lv9', 'lv10'];

/**
 * Streak with freezes: every 7 days in a row earns a freeze (hold up to 2).
 * A missed day uses a freeze instead of breaking the streak. Today never breaks it.
 */
export function streakInfo(days: Record<string, Day>) {
  const logged = (k: string) => (days[k]?.meals.length ?? 0) > 0;
  const first = Object.keys(days).filter(logged).sort()[0];
  if (!first) return { streak: 0, freezes: 0, saved: [] as string[] };
  let streak = 0, freezes = 0, run = 0;
  const saved: string[] = [];
  const start = new Date(first + 'T12:00:00').getTime();
  const today = dayKey();
  for (let t = start; ; t += 864e5) {
    const k = dayKey(t);
    if (logged(k)) {
      streak++; run++;
      if (run % 7 === 0) freezes = Math.min(2, freezes + 1);
    } else if (k === today) {
      break;
    } else if (streak > 0 && freezes > 0) {
      freezes--; saved.push(k);
    } else {
      streak = 0; run = 0;
    }
    if (k === today) break;
  }
  return { streak, freezes, saved };
}
