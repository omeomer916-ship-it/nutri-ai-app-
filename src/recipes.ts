import type { IconName } from './components/Icon';
import type { Cat } from './store';

export type RecipeTag = 'hp' | 'lc' | 'veg' | 'quick';
export type Recipe = {
  id: string; icon: IconName; cat: Cat; min: number; kcal: number; P: number; C: number; F: number; tags: RecipeTag[];
  en: { name: string; ing: string[]; steps: string[] };
  ar: { name: string; ing: string[]; steps: string[] };
};

// Healthy recipes from around the world. Values are per serving.
export const RECIPES: Recipe[] = [
  {
    id: 'oats', icon: 'bowl', cat: 'bf', min: 5, kcal: 420, P: 30, C: 52, F: 10, tags: ['hp', 'quick'],
    en: { name: 'Protein overnight oats', ing: ['50 g oats', '150 g Greek yogurt', '100 ml milk', '1 tbsp chia seeds', '80 g berries', '1 tsp honey'], steps: ['Mix oats, yogurt, milk and chia in a jar.', 'Cover and leave in the fridge overnight.', 'Top with berries and honey before eating.'] },
    ar: { name: 'شوفان بروتين بالبراد', ing: ['50 غ شوفان', '150 غ زبادي يوناني', '100 مل حليب', 'ملعقة كبيرة بذور شيا', '80 غ توت', 'ملعقة صغيرة عسل'], steps: ['اخلط الشوفان والزبادي والحليب والشيا بمرطبان.', 'غطّيه وخليه بالبراد طول الليل.', 'زيّنه بالتوت والعسل قبل الأكل.'] },
  },
  {
    id: 'shak', icon: 'sun', cat: 'bf', min: 20, kcal: 360, P: 21, C: 18, F: 22, tags: ['veg', 'lc'],
    en: { name: 'Shakshuka', ing: ['3 eggs', '2 tomatoes, chopped', '1/2 bell pepper', '1/2 onion', '1 tbsp olive oil', 'Cumin, paprika, salt'], steps: ['Soften onion and pepper in olive oil.', 'Add tomatoes and spices, simmer 8 minutes.', 'Make 3 wells, crack the eggs in, cover and cook 5 minutes.'] },
    ar: { name: 'شكشوكة', ing: ['3 بيضات', '2 بندورة مقطعة', 'نص فليفلة', 'نص بصلة', 'ملعقة كبيرة زيت زيتون', 'كمون، بابريكا، ملح'], steps: ['طرّي البصل والفليفلة بزيت الزيتون.', 'ضيف البندورة والبهارات وخليها تغلي 8 دقايق.', 'اعمل 3 حفر، اكسر البيض، غطّي وخليه 5 دقايق.'] },
  },
  {
    id: 'avotoast', icon: 'avocado', cat: 'bf', min: 10, kcal: 390, P: 18, C: 32, F: 21, tags: ['veg', 'quick'],
    en: { name: 'Avocado egg toast', ing: ['1 slice sourdough', '1/2 avocado', '1 egg', 'Lemon, chili flakes, salt'], steps: ['Toast the bread.', 'Mash avocado with lemon and salt and spread it.', 'Top with a fried or poached egg and chili flakes.'] },
    ar: { name: 'توست أفوكادو وبيض', ing: ['شريحة خبز ساوردو', 'نص حبة أفوكادو', 'بيضة', 'ليمون، شطة مجروشة، ملح'], steps: ['حمّص الخبز.', 'اهرس الأفوكادو مع الليمون والملح وادهنه.', 'حط فوقه بيضة مقلية أو مسلوقة ورش شطة.'] },
  },
  {
    id: 'salmon', icon: 'meat', cat: 'dn', min: 25, kcal: 540, P: 38, C: 42, F: 22, tags: ['hp'],
    en: { name: 'Salmon quinoa bowl', ing: ['150 g salmon fillet', '60 g quinoa (dry)', '1 cup spinach', '1/2 cucumber', '1 tbsp soy sauce', '1 tsp sesame'], steps: ['Cook quinoa in salted water for 12 minutes.', 'Season salmon and bake at 200°C for 12 minutes.', 'Build the bowl with spinach, cucumber, quinoa and salmon, then add soy and sesame.'] },
    ar: { name: 'بول سلمون وكينوا', ing: ['150 غ فيليه سلمون', '60 غ كينوا (ني)', 'كاسة سبانخ', 'نص خيارة', 'ملعقة كبيرة صويا', 'ملعقة صغيرة سمسم'], steps: ['اطبخ الكينوا بمي مملحة 12 دقيقة.', 'تبّل السلمون واخبزه على 200° لمدة 12 دقيقة.', 'رتّب السبانخ والخيار والكينوا والسلمون، وضيف الصويا والسمسم.'] },
  },
  {
    id: 'chickrice', icon: 'meat', cat: 'ln', min: 30, kcal: 560, P: 45, C: 58, F: 14, tags: ['hp'],
    en: { name: 'Lemon herb chicken & rice', ing: ['180 g chicken breast', '70 g basmati rice (dry)', '1 lemon', '1 tsp olive oil', 'Garlic, oregano, salt', 'Steamed broccoli'], steps: ['Marinate chicken with lemon, garlic, oregano and oil for 10 minutes.', 'Cook rice. Grill chicken 6 minutes each side.', 'Slice and serve with rice and broccoli.'] },
    ar: { name: 'دجاج بالليمون والأعشاب مع رز', ing: ['180 غ صدر دجاج', '70 غ رز بسمتي (ني)', 'ليمونة', 'ملعقة صغيرة زيت زيتون', 'ثوم، زعتر بري، ملح', 'بروكلي على البخار'], steps: ['تبّل الدجاج بالليمون والثوم والزعتر والزيت 10 دقايق.', 'اطبخ الرز، واشوي الدجاج 6 دقايق كل جهة.', 'قطّعه وقدّمه مع الرز والبروكلي.'] },
  },
  {
    id: 'stirfry', icon: 'bowl', cat: 'dn', min: 20, kcal: 480, P: 36, C: 44, F: 16, tags: ['hp', 'quick'],
    en: { name: 'Beef & veggie stir-fry', ing: ['150 g lean beef strips', '1 cup mixed vegetables', '60 g rice noodles', '1 tbsp soy sauce', '1 tsp sesame oil', 'Ginger, garlic'], steps: ['Soak noodles in hot water.', 'Sear beef in a hot pan with sesame oil, then remove.', 'Stir-fry vegetables with ginger and garlic, add beef, noodles and soy.'] },
    ar: { name: 'لحمة وخضار ستير فراي', ing: ['150 غ شرائح لحمة قليلة الدهن', 'كاسة خضار مشكلة', '60 غ نودلز رز', 'ملعقة كبيرة صويا', 'ملعقة صغيرة زيت سمسم', 'زنجبيل، ثوم'], steps: ['انقع النودلز بمي سخنة.', 'شوّح اللحمة بمقلاة حامية مع زيت السمسم وطلّعها.', 'شوّح الخضار مع الزنجبيل والثوم، ورجّع اللحمة وضيف النودلز والصويا.'] },
  },
  {
    id: 'tacos', icon: 'flame', cat: 'ln', min: 20, kcal: 470, P: 34, C: 40, F: 18, tags: ['hp'],
    en: { name: 'Chicken fajita tacos', ing: ['150 g chicken', '2 small corn tortillas', '1/2 pepper and onion', '2 tbsp salsa', '2 tbsp Greek yogurt', 'Lime, cumin, paprika'], steps: ['Slice chicken and vegetables, season with spices.', 'Cook in a hot pan for 8 minutes.', 'Fill warm tortillas, add salsa, yogurt and lime.'] },
    ar: { name: 'تاكو فاهيتا دجاج', ing: ['150 غ دجاج', '2 تورتيا ذرة صغار', 'نص فليفلة وبصلة', 'ملعقتين صلصة', 'ملعقتين زبادي يوناني', 'ليمون، كمون، بابريكا'], steps: ['قطّع الدجاج والخضار وتبّلهم.', 'اطبخهم بمقلاة حامية 8 دقايق.', 'عبّي التورتيا وضيف الصلصة والزبادي والليمون.'] },
  },
  {
    id: 'lentil', icon: 'bowl', cat: 'ln', min: 30, kcal: 380, P: 20, C: 56, F: 8, tags: ['veg'],
    en: { name: 'Red lentil soup', ing: ['80 g red lentils', '1 carrot', '1/2 onion', '1 tsp olive oil', 'Cumin, turmeric, lemon', '600 ml water or stock'], steps: ['Soften onion and carrot in oil.', 'Add lentils, spices and water, simmer 20 minutes.', 'Blend smooth and finish with lemon.'] },
    ar: { name: 'شوربة عدس', ing: ['80 غ عدس أحمر', 'جزرة', 'نص بصلة', 'ملعقة صغيرة زيت زيتون', 'كمون، كركم، ليمون', '600 مل مي أو مرق'], steps: ['طرّي البصل والجزر بالزيت.', 'ضيف العدس والبهارات والمي وخليها تغلي 20 دقيقة.', 'اطحنها ناعمة وضيف الليمون.'] },
  },
  {
    id: 'medsalad', icon: 'target', cat: 'ln', min: 10, kcal: 410, P: 24, C: 28, F: 22, tags: ['veg', 'quick'],
    en: { name: 'Greek chickpea salad', ing: ['120 g chickpeas', '50 g feta', 'Cucumber, tomato, red onion', 'Olives', '1 tbsp olive oil', 'Lemon, oregano'], steps: ['Chop the vegetables.', 'Mix with chickpeas, feta and olives.', 'Dress with olive oil, lemon and oregano.'] },
    ar: { name: 'سلطة حمص يونانية', ing: ['120 غ حمص حب', '50 غ جبنة فيتا', 'خيار، بندورة، بصل أحمر', 'زيتون', 'ملعقة كبيرة زيت زيتون', 'ليمون، زعتر بري'], steps: ['قطّع الخضار.', 'اخلطها مع الحمص والفيتا والزيتون.', 'تبّلها بزيت الزيتون والليمون والزعتر.'] },
  },
  {
    id: 'tofu', icon: 'bowl', cat: 'dn', min: 25, kcal: 450, P: 26, C: 48, F: 16, tags: ['veg'],
    en: { name: 'Teriyaki tofu bowl', ing: ['150 g firm tofu', '60 g brown rice (dry)', '1 cup broccoli', '2 tbsp teriyaki sauce', '1 tsp sesame', 'Spring onion'], steps: ['Cook rice. Cube and pan-fry tofu until golden.', 'Add teriyaki sauce and toss.', 'Serve with rice and steamed broccoli, top with sesame.'] },
    ar: { name: 'بول توفو ترياكي', ing: ['150 غ توفو قاسي', '60 غ رز بني (ني)', 'كاسة بروكلي', 'ملعقتين صلصة ترياكي', 'ملعقة صغيرة سمسم', 'بصل أخضر'], steps: ['اطبخ الرز. قطّع التوفو مكعبات وحمّره بالمقلاة.', 'ضيف صلصة الترياكي وقلّبه.', 'قدّمه مع الرز والبروكلي ورش سمسم.'] },
  },
  {
    id: 'zoodle', icon: 'bowl', cat: 'dn', min: 20, kcal: 390, P: 34, C: 14, F: 22, tags: ['lc', 'hp'],
    en: { name: 'Shrimp zucchini noodles', ing: ['150 g shrimp', '2 zucchini, spiralized', '1 tbsp olive oil', 'Garlic, chili, lemon', '20 g parmesan'], steps: ['Sauté garlic and chili in olive oil.', 'Cook shrimp 3 minutes, add zucchini noodles for 2 minutes.', 'Finish with lemon and parmesan.'] },
    ar: { name: 'نودلز كوسا مع قريدس', ing: ['150 غ قريدس', '2 كوسا مبشورة طولياً', 'ملعقة كبيرة زيت زيتون', 'ثوم، شطة، ليمون', '20 غ بارميزان'], steps: ['شوّح الثوم والشطة بزيت الزيتون.', 'اطبخ القريدس 3 دقايق، وضيف الكوسا دقيقتين.', 'ضيف الليمون والبارميزان.'] },
  },
  {
    id: 'shakeb', icon: 'cup', cat: 'sn', min: 3, kcal: 330, P: 32, C: 34, F: 8, tags: ['hp', 'quick'],
    en: { name: 'Banana protein shake', ing: ['1 banana', '1 scoop whey (30 g)', '250 ml milk', '1 tsp peanut butter', 'Ice'], steps: ['Add everything to a blender.', 'Blend 30 seconds until smooth.'] },
    ar: { name: 'شيك بروتين بالموز', ing: ['موزة', 'سكوب واي بروتين (30 غ)', '250 مل حليب', 'ملعقة صغيرة زبدة فول سوداني', 'تلج'], steps: ['حط كل شي بالخلاط.', 'اخلطه 30 ثانية لحد ما يصير ناعم.'] },
  },
  {
    id: 'yparfait', icon: 'cup', cat: 'sn', min: 5, kcal: 280, P: 20, C: 32, F: 8, tags: ['quick', 'veg'],
    en: { name: 'Yogurt berry parfait', ing: ['170 g Greek yogurt', '80 g berries', '25 g granola', '1 tsp honey'], steps: ['Layer yogurt, berries and granola in a glass.', 'Drizzle with honey.'] },
    ar: { name: 'بارفيه زبادي وتوت', ing: ['170 غ زبادي يوناني', '80 غ توت', '25 غ جرانولا', 'ملعقة صغيرة عسل'], steps: ['رتّب الزبادي والتوت والجرانولا طبقات بكاسة.', 'رش العسل فوقها.'] },
  },
  {
    id: 'turkeywrap', icon: 'bread', cat: 'ln', min: 8, kcal: 420, P: 32, C: 38, F: 15, tags: ['hp', 'quick'],
    en: { name: 'Turkey hummus wrap', ing: ['1 whole-wheat wrap', '100 g sliced turkey', '2 tbsp hummus', 'Lettuce, tomato, cucumber'], steps: ['Spread hummus on the wrap.', 'Add turkey and vegetables.', 'Roll tight and cut in half.'] },
    ar: { name: 'راب حبش وحمص', ing: ['خبز راب قمح كامل', '100 غ شرائح حبش', 'ملعقتين حمص', 'خس، بندورة، خيار'], steps: ['ادهن الحمص على الراب.', 'ضيف الحبش والخضار.', 'لفّه منيح وقصّه نصين.'] },
  },
];
