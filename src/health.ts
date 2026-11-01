import type { Health } from './store';
import type { TKey } from './i18n';

// Words that point to an allergen, in the languages people type or the AI answers in.
const WORDS: Record<'gluten' | 'nuts' | 'lactose', string[]> = {
  gluten: ['bread', 'toast', 'pasta', 'spaghetti', 'lasagna', 'pizza', 'burger', 'bun', 'wrap', 'sandwich', 'croissant', 'cake', 'cookie', 'biscuit', 'noodle', 'ramen', 'couscous', 'bulgur', 'freekeh', 'pita', 'bagel', 'pancake', 'waffle', 'cereal', 'oats', 'wheat', 'barley', 'beer', 'falafel', 'shawarma', 'manakish', 'knafeh', 'baklava', 'donut', 'muffin', 'tortilla', 'taco',
    'خبز', 'توست', 'معكرونة', 'سباغيتي', 'لازانيا', 'بيتزا', 'برغر', 'ساندويش', 'كرواسون', 'كعك', 'كيك', 'بسكويت', 'نودلز', 'كسكس', 'برغل', 'فريكة', 'كنافة', 'بقلاوة', 'مناقيش', 'شاورما', 'فلافل', 'قمح', 'شوفان', 'فطائر', 'دونات',
    'pain', 'pâtes', 'brot', 'nudeln', 'pan ', 'ekmek', 'makarna', 'хлеб', 'паста', 'roti', 'mie', 'روٹی'],
  nuts: ['nut', 'almond', 'peanut', 'cashew', 'pistachio', 'walnut', 'hazelnut', 'pecan', 'nutella', 'praline', 'baklava', 'pesto', 'satay',
    'مكسرات', 'لوز', 'فستق', 'كاجو', 'جوز', 'بندق', 'نوتيلا', 'بقلاوة', 'زبدة الفول السوداني',
    'noix', 'amande', 'nuss', 'mandel', 'nuez', 'fındık', 'ceviz', 'badem', 'орех', 'миндаль', 'kacang'],
  lactose: ['milk', 'cheese', 'yogurt', 'yoghurt', 'labneh', 'cream', 'butter', 'latte', 'cappuccino', 'ice cream', 'milkshake', 'pizza', 'alfredo', 'mac and cheese', 'halloumi', 'feta', 'mozzarella', 'knafeh',
    'حليب', 'جبن', 'جبنة', 'لبن', 'لبنة', 'زبادي', 'قشطة', 'كريمة', 'زبدة', 'لاتيه', 'كابتشينو', 'بوظة', 'آيس كريم', 'حلوم', 'كنافة', 'مهلبية',
    'lait', 'fromage', 'milch', 'käse', 'leche', 'queso', 'süt', 'peynir', 'молоко', 'сыр', 'susu', 'keju', 'دودھ'],
};

export type Alert = { key: TKey; level: 'warn' | 'info' };

/** Warnings for one meal, based on the user's health settings. */
export function mealAlerts(h: Health, names: string[], m: { C: number; kcal: number; F: number }): Alert[] {
  const text = ' ' + names.join(' ').toLowerCase() + ' ';
  const has = (k: keyof typeof WORDS) => WORDS[k].some((w) => text.includes(w));
  const out: Alert[] = [];
  if (h.gluten && has('gluten')) out.push({ key: 'alGluten', level: 'warn' });
  if (h.nuts && has('nuts')) out.push({ key: 'alNuts', level: 'warn' });
  if (h.lactose && has('lactose')) out.push({ key: 'alLactose', level: 'warn' });
  if (h.diabetes && m.C >= 60) out.push({ key: 'alCarbs', level: 'warn' });
  if (h.bp && /(salt|pickle|chips|crisps|fries|soy|ramen|instant|sausage|salami|bacon|ham|olive|cheese|ملح|مخلل|شيبس|بطاطا مقلية|صويا|نقانق|سلامي|زيتون|جبن)/.test(text)) out.push({ key: 'alSalt', level: 'warn' });
  return out;
}
