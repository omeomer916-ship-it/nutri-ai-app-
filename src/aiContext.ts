import { dayKey, totals, useApp } from './store';

/** Short summary of the user's goals, today's intake and health settings for the AI. */
export function aiContext() {
  const s = useApp.getState();
  const k = dayKey();
  const tot = totals(s.days[k]);
  const burned = (s.burn[k] ?? []).reduce((a, b) => a + b.kcal, 0);
  const p = s.profile;
  const h = s.health;
  const flags = [h.diabetes && 'diabetes', h.bp && 'high blood pressure', h.gluten && 'gluten-free', h.nuts && 'nut allergy', h.lactose && 'lactose intolerant'].filter(Boolean);
  return `Goals: ${s.goals.kcal} kcal, P ${s.goals.P}g, C ${s.goals.C}g, F ${s.goals.F}g. Eaten today: ${Math.round(tot.kcal)} kcal, P ${Math.round(tot.P)}g. ` +
    `Left today: ${Math.round(s.goals.kcal + burned - tot.kcal)} kcal, ${Math.max(0, Math.round(s.goals.P - tot.P))}g protein. Local time ${new Date().getHours()}:00. ` +
    (p ? `User: ${p.sex === 'm' ? 'male' : 'female'}, ${p.age}y, ${p.w}kg, goal ${p.goal} weight${p.diet && p.diet !== 'any' ? `, diet ${p.diet}` : ''}. ` : '') +
    (flags.length ? `Health: ${flags.join(', ')} (respect strictly). ` : '');
}
