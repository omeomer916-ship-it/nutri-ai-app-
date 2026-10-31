// Common Arab + world dishes, values per typical portion (approximate).
export type FoodGroup = 'bf' | 'main' | 'grill' | 'bread' | 'sweet' | 'drink' | 'snack';
export type Food = { id: string; ar: string; en: string; pa: string; pe: string; g: FoodGroup; k: number; P: number; C: number; F: number };

const f = (id: string, g: FoodGroup, ar: string, en: string, pa: string, pe: string, k: number, P: number, C: number, F: number): Food =>
  ({ id, g, ar, en, pa, pe, k, P, C, F });

export const FOODS: Food[] = [
  // breakfast & mezze
  f('hummus', 'bf', 'حمص بطحينة', 'Hummus', '100 غ', '100 g', 170, 8, 14, 10),
  f('foul', 'bf', 'فول مدمس بزيت', 'Foul medames', 'صحن 200 غ', 'bowl 200 g', 260, 13, 30, 10),
  f('falafel', 'bf', 'فلافل', 'Falafel', '4 حبات', '4 pieces', 330, 13, 32, 18),
  f('labneh', 'bf', 'لبنة بزيت زيتون', 'Labneh with olive oil', '60 غ', '60 g', 150, 5, 3, 13),
  f('manakish_z', 'bf', 'مناقيش زعتر', "Za'atar manakish", 'رغيف', '1 piece', 450, 10, 55, 22),
  f('manakish_c', 'bf', 'مناقيش جبنة', 'Cheese manakish', 'رغيف', '1 piece', 520, 20, 55, 24),
  f('shakshuka', 'bf', 'شكشوكة', 'Shakshuka', 'حصة (بيضتين)', '1 portion (2 eggs)', 250, 14, 12, 16),
  f('egg', 'bf', 'بيضة مسلوقة', 'Boiled egg', 'حبة', '1 egg', 78, 6, 1, 5),
  f('halloumi', 'bf', 'جبنة حلوم', 'Halloumi', '50 غ', '50 g', 160, 11, 1, 12),
  f('olives', 'bf', 'زيتون', 'Olives', '10 حبات', '10 olives', 60, 0, 1, 6),
  f('moutabal', 'bf', 'متبّل باذنجان', 'Moutabal', '100 غ', '100 g', 140, 3, 8, 11),
  f('tabbouleh', 'bf', 'تبولة', 'Tabbouleh', 'صحن صغير', 'small plate', 180, 3, 14, 13),
  f('fattoush', 'bf', 'فتوش', 'Fattoush', 'صحن', '1 plate', 220, 4, 22, 13),
  f('oats', 'bf', 'شوفان بالحليب', 'Oatmeal with milk', 'صحن', '1 bowl', 280, 12, 42, 7),
  // mains
  f('mansaf', 'main', 'منسف', 'Mansaf', 'صحن', '1 plate', 900, 50, 80, 40),
  f('maqluba', 'main', 'مقلوبة', 'Maqluba', 'صحن', '1 plate', 700, 30, 80, 28),
  f('musakhan', 'main', 'مسخّن', 'Musakhan', 'ربع دجاجة مع خبز', 'quarter chicken + bread', 750, 45, 55, 38),
  f('kabsa', 'main', 'كبسة دجاج', 'Chicken kabsa', 'صحن', '1 plate', 780, 42, 95, 24),
  f('mandi', 'main', 'مندي دجاج', 'Chicken mandi', 'صحن', '1 plate', 800, 45, 95, 25),
  f('mujaddara', 'main', 'مجدّرة', 'Mujaddara', 'صحن', '1 plate', 450, 15, 70, 12),
  f('warak', 'main', 'ورق عنب', 'Stuffed vine leaves', '6 حبات', '6 pieces', 230, 4, 30, 10),
  f('mahshi', 'main', 'كوسا محشي', 'Stuffed zucchini', '3 حبات', '3 pieces', 360, 16, 36, 16),
  f('molokhia', 'main', 'ملوخية بالدجاج', 'Molokhia with chicken', 'صحن (بدون رز)', 'bowl (no rice)', 250, 22, 10, 13),
  f('rice', 'main', 'رز أبيض', 'White rice', 'كوب', '1 cup', 210, 4, 46, 1),
  f('freekeh', 'main', 'فريكة', 'Freekeh', 'كوب', '1 cup', 230, 8, 45, 2),
  f('lentil', 'main', 'شوربة عدس', 'Lentil soup', 'صحن', '1 bowl', 230, 13, 34, 5),
  f('fatteh', 'main', 'فتة حمص', 'Hummus fatteh', 'صحن', '1 bowl', 600, 20, 55, 33),
  f('koshari', 'main', 'كشري', 'Koshari', 'صحن', '1 plate', 700, 20, 125, 14),
  f('kibbeh', 'main', 'كبة مقلية', 'Fried kibbeh', 'حبة', '1 piece', 190, 8, 14, 11),
  f('sambousek', 'main', 'سمبوسك لحمة', 'Meat sambousek', 'حبة', '1 piece', 130, 5, 11, 7),
  f('pasta', 'main', 'معكرونة بالصلصة', 'Pasta with sauce', 'صحن', '1 plate', 550, 18, 85, 14),
  f('pizza', 'main', 'بيتزا', 'Pizza', 'قطعة', '1 slice', 285, 12, 36, 10),
  // grill & sandwiches
  f('kofta', 'grill', 'كفتة مشوية', 'Grilled kofta', '150 غ', '150 g', 380, 25, 4, 29),
  f('tawook', 'grill', 'شيش طاووق', 'Shish tawook', '200 غ', '200 g', 330, 45, 6, 14),
  f('shawarma_c', 'grill', 'شاورما دجاج (ساندويش)', 'Chicken shawarma wrap', 'ساندويش', '1 wrap', 550, 32, 50, 24),
  f('shawarma_m', 'grill', 'شاورما لحمة (ساندويش)', 'Beef shawarma wrap', 'ساندويش', '1 wrap', 620, 30, 48, 33),
  f('chicken', 'grill', 'صدر دجاج مشوي', 'Grilled chicken breast', '150 غ', '150 g', 250, 47, 0, 5),
  f('fish', 'grill', 'سمك مشوي', 'Grilled fish', '200 غ', '200 g', 300, 45, 0, 12),
  f('burger', 'grill', 'برغر', 'Burger', 'ساندويش', '1 burger', 550, 28, 40, 30),
  f('fries', 'grill', 'بطاطا مقلية', 'French fries', 'وسط', 'medium', 365, 4, 48, 17),
  // bread
  f('pita', 'bread', 'رغيف خبز عربي', 'Arabic pita', 'رغيف', '1 loaf', 240, 8, 49, 1),
  f('taboon', 'bread', 'خبز طابون', 'Taboon bread', 'رغيف', '1 loaf', 320, 10, 64, 2),
  f('kaak', 'bread', 'كعك بسمسم', 'Sesame ka’ak', 'حبة', '1 piece', 380, 12, 64, 8),
  // sweets
  f('knafeh', 'sweet', 'كنافة', 'Knafeh', 'قطعة', '1 piece', 500, 11, 58, 25),
  f('baklava', 'sweet', 'بقلاوة', 'Baklava', 'قطعتين', '2 pieces', 250, 4, 28, 14),
  f('qatayef', 'sweet', 'قطايف بالجوز', 'Qatayef with nuts', 'حبتين', '2 pieces', 350, 6, 44, 17),
  f('basbousa', 'sweet', 'هريسة / بسبوسة', 'Basbousa', 'قطعة', '1 piece', 290, 4, 46, 10),
  f('maamoul', 'sweet', 'معمول تمر', 'Date maamoul', 'حبة', '1 piece', 170, 2, 24, 7),
  f('awamat', 'sweet', 'عوامة / لقيمات', 'Luqaimat', '5 حبات', '5 pieces', 260, 3, 34, 13),
  f('dates', 'sweet', 'تمر مجهول', 'Medjool dates', '3 حبات', '3 dates', 200, 1, 54, 0),
  f('muhallabia', 'sweet', 'مهلبية', 'Muhallabia', 'كاسة', '1 cup', 200, 5, 30, 6),
  // drinks
  f('qahwa', 'drink', 'قهوة عربية سادة', 'Arabic coffee', 'فنجان', '1 cup', 5, 0, 1, 0),
  f('tea', 'drink', 'شاي بسكر', 'Tea with sugar', 'كاسة (2 معلقة سكر)', '1 cup (2 tsp sugar)', 35, 0, 9, 0),
  f('lemonmint', 'drink', 'ليمون ونعنع', 'Lemon mint', 'كاسة كبيرة', 'large glass', 140, 0, 35, 0),
  f('jallab', 'drink', 'جلاب', 'Jallab', 'كاسة كبيرة', 'large glass', 200, 1, 46, 2),
  f('tamarhindi', 'drink', 'تمر هندي', 'Tamarind drink', 'كاسة كبيرة', 'large glass', 150, 0, 38, 0),
  f('laban', 'drink', 'لبن عيران', 'Ayran', 'كاسة', '1 glass', 110, 6, 9, 5),
  f('sahlab', 'drink', 'سحلب', 'Sahlab', 'كاسة', '1 cup', 280, 8, 40, 10),
  f('karak', 'drink', 'شاي كرك', 'Karak tea', 'كاسة', '1 cup', 150, 3, 22, 5),
  f('latte', 'drink', 'لاتيه', 'Latte', 'وسط', 'medium', 190, 10, 18, 7),
  // fruit & snacks
  f('nuts', 'snack', 'مكسرات مشكلة', 'Mixed nuts', 'حفنة 30 غ', 'handful 30 g', 180, 5, 6, 16),
  f('bizr', 'snack', 'بزر', 'Sunflower seeds', '30 غ', '30 g', 175, 6, 6, 15),
  f('apple', 'snack', 'تفاحة', 'Apple', 'حبة', '1 apple', 95, 0, 25, 0),
  f('banana', 'snack', 'موزة', 'Banana', 'حبة', '1 banana', 105, 1, 27, 0),
  f('orange', 'snack', 'برتقالة', 'Orange', 'حبة', '1 orange', 62, 1, 15, 0),
  f('watermelon', 'snack', 'بطيخ', 'Watermelon', 'صحن 300 غ', 'bowl 300 g', 90, 2, 23, 0),
  f('grapes', 'snack', 'عنب', 'Grapes', 'كاسة', '1 cup', 100, 1, 27, 0),
  f('yogurt', 'snack', 'لبن زبادي', 'Plain yogurt', 'علبة 170 غ', 'cup 170 g', 105, 6, 8, 5),
  f('chips', 'snack', 'شيبس', 'Potato chips', 'كيس صغير', 'small bag', 160, 2, 15, 10),
  f('choc', 'snack', 'لوح شوكولا', 'Chocolate bar', 'لوح', '1 bar', 230, 3, 26, 13),
];

export const GROUPS: { id: FoodGroup | 'all'; icon: 'sparkle' | 'sun' | 'bowl' | 'flame' | 'wheat' | 'cake' | 'cup' | 'cookie'; color: string }[] = [
  { id: 'all', icon: 'sparkle', color: '#39E68C' },
  { id: 'bf', icon: 'sun', color: '#FFC35C' },
  { id: 'main', icon: 'bowl', color: '#39E68C' },
  { id: 'grill', icon: 'flame', color: '#FF9F5C' },
  { id: 'bread', icon: 'wheat', color: '#E8C48A' },
  { id: 'sweet', icon: 'cake', color: '#FF7A8C' },
  { id: 'drink', icon: 'cup', color: '#4FC3FF' },
  { id: 'snack', icon: 'cookie', color: '#9C8CFF' },
];

/** Loose match: ignores case, Arabic hamza/taa-marbuta/ya variants and diacritics. */
export const norm = (s: string) => s.toLowerCase()
  .replace(/[ً-ْـ]/g, '')
  .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').trim();
