import { cacheDirectory, writeAsStringAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { totals, useApp } from './store';

const csv = (rows: (string | number)[][]) => rows.map((r) => r.map((c) => (typeof c === 'string' && /[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(',')).join('\n');

/** Every logged day, meal and weight as one CSV file, shared through the phone's share sheet. */
export async function exportData() {
  const s = useApp.getState();
  const keys = Object.keys(s.days).sort();
  const daily: (string | number)[][] = [['date', 'kcal', 'protein_g', 'carbs_g', 'fat_g', 'water_glasses', 'burned_kcal', 'meals']];
  keys.forEach((k) => {
    const t = totals(s.days[k]);
    const b = (s.burn[k] ?? []).reduce((a, x) => a + x.kcal, 0);
    daily.push([k, Math.round(t.kcal), Math.round(t.P), Math.round(t.C), Math.round(t.F), s.days[k].water, b, s.days[k].meals.length]);
  });
  const meals: (string | number)[][] = [['date', 'time', 'meal', 'name', 'kcal', 'protein_g', 'carbs_g', 'fat_g']];
  keys.forEach((k) => s.days[k].meals.forEach((m) => {
    meals.push([k, new Date(m.t).toTimeString().slice(0, 5), m.cat, m.name, Math.round(m.kcal), Math.round(m.P), Math.round(m.C), Math.round(m.F)]);
  }));
  const weights: (string | number)[][] = [['date', 'weight_kg'], ...s.weights.map((w) => [new Date(w.t).toISOString().slice(0, 10), w.w])];
  const body = `# Nutri AI export\n\n# Daily totals\n${csv(daily)}\n\n# Meals\n${csv(meals)}\n\n# Weight\n${csv(weights)}\n`;
  const uri = `${cacheDirectory}nutri-ai-${new Date().toISOString().slice(0, 10)}.csv`;
  await writeAsStringAsync(uri, body);
  await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Nutri AI' });
}
