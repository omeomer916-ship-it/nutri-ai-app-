import { useApp } from './store';

const en = {
  appName: 'Nutri AI',
  // intro
  s1: 'Snap your meal', d1: 'Point your camera and AI counts the calories for you.',
  s2: 'Track every macro', d2: 'Protein, carbs and fat at a glance, every day.',
  s3: 'Your AI nutrition coach', d3: 'Ask anything and get clear answers about food and goals.',
  next: 'Next', start: 'Get started', skip: 'Skip',
  welcome: 'Welcome to Nutri AI', signS: 'Sign in to keep your progress safe.',
  google: 'Continue with Google', guest: 'Continue as guest',
  terms: 'By continuing you agree to the Terms of Service and Privacy Policy.',
  googleOff: 'Google sign-in is not set up yet. Continuing as guest.',
  // onboarding
  obT: "Let's set your goal", back: 'Back', finish: 'See my plan',
  qSex: 'What is your sex?', male: 'Male', female: 'Female',
  qAge: 'How old are you?', years: 'years',
  qH: 'How tall are you?', qW: 'What is your weight now?', qGW: 'What is your target weight?',
  qGoal: 'What is your goal?', lose: 'Lose weight', keep: 'Maintain', gain: 'Gain muscle',
  qAct: 'How active are you?', a1: 'Mostly sitting', a2: 'Light activity', a3: 'Active', a4: 'Very active',
  planT: 'Your daily plan', planS: 'Based on your answers. You can change it anytime in Profile.',
  // tabs
  tToday: 'Today', tScan: 'Scan', tCoach: 'AI coach', tProgress: 'Progress', tProfile: 'Profile',
  gm: 'Good morning', ga: 'Good afternoon', ge: 'Good evening',
  eaten: 'Calories eaten', ofGoal: 'of goal', left: 'kcal left', over: 'kcal over', goal: 'Daily goal',
  macros: 'Macros', P: 'Protein', Cb: 'Carbs', F: 'Fat',
  meals: 'Meals', addMeal: 'Add a meal to your day',
  bf: 'Breakfast', ln: 'Lunch', dn: 'Dinner', sn: 'Snacks', ds: 'Desserts', dr: 'Drinks',
  water: 'Water', types: 'Meal types',
  // scan
  scanT: 'Camera scanner', scanS: 'Point at your meal. AI counts the calories.',
  mFood: 'Meals', mDrink: 'Drinks', camera: 'Take photo', gallery: 'Gallery',
  analyzing: 'Analyzing your meal…', example: 'EXAMPLE', liveAI: 'AI ready · point at food',
  infoT: 'Smart analysis', infoD: 'We estimate ingredients, portions, calories and macros from your photo. Use good light for best results.',
  save: 'Save to today', retake: 'Retake', saved: 'Saved to today',
  conf: 'Confidence', high: 'high', medium: 'medium', low: 'low', items: 'Ingredients',
  noFood: "I couldn't find food in this photo.", aiErr: 'Analysis failed. Check your connection and try again.',
  noApi: 'AI server is not set. Add EXPO_PUBLIC_API_URL to your .env file.',
  camDenied: 'Camera permission is needed to scan meals.',
  recent: 'Recent scans', noScans: 'Your scanned meals will show here.',
  // coach
  coachS: 'Ask me anything', ask: 'Type your question…', hello: "Hi! I'm your Nutri coach. Ask me anything about food, calories or your goals.",
  q1: 'What should I eat for dinner?', q2: 'Am I hitting my protein?', q3: 'Healthy snack ideas',
  thinking: 'Thinking…',
  // progress
  daily: 'Daily', weight: 'Weight', last7: 'Calories · last 7 days', dashed: 'Dashed line = goal',
  avg: 'Avg kcal', pavg: 'Avg protein', streak: 'Day streak', logged: 'Logged', noLog: 'Nothing logged this day.',
  curW: 'Current weight', startW: 'Start', goalW: 'Goal', toGo: 'to go', logW: 'Log your weight',
  logWS: 'Add your weight to start tracking your progress.', add: 'Add', kg: 'kg',
  // profile
  guestName: 'Guest', member: 'Nutri AI member', goals: 'Daily goals', kcal: 'Calories (kcal)',
  settings: 'Settings', language: 'Language', redo: 'Redo my plan', signOut: 'Sign out', signIn: 'Sign in',
  reset: 'Delete all my data', resetQ: 'This deletes all meals, weights and settings on this phone.',
  cancel: 'Cancel', del: 'Delete', version: 'Version',
};

type Dict = typeof en;

const ar: Dict = {
  appName: 'Nutri AI',
  s1: 'صوّر وجبتك', d1: 'وجّه الكاميرا والذكاء الاصطناعي يحسب السعرات عنك.',
  s2: 'تابع كل العناصر', d2: 'البروتين والكربوهيدرات والدهون بنظرة واحدة كل يوم.',
  s3: 'مدربك الذكي للتغذية', d3: 'اسأل عن أي شيء واحصل على إجابات واضحة عن الأكل وأهدافك.',
  next: 'التالي', start: 'ابدأ', skip: 'تخطَّ',
  welcome: 'أهلاً بك في Nutri AI', signS: 'سجّل الدخول لتحفظ تقدمك.',
  google: 'المتابعة عبر Google', guest: 'المتابعة كضيف',
  terms: 'بالمتابعة أنت توافق على شروط الخدمة وسياسة الخصوصية.',
  googleOff: 'تسجيل الدخول بـ Google غير مفعّل بعد. سنتابع كضيف.',
  obT: 'لنحدد هدفك', back: 'رجوع', finish: 'اعرض خطتي',
  qSex: 'ما جنسك؟', male: 'ذكر', female: 'أنثى',
  qAge: 'كم عمرك؟', years: 'سنة',
  qH: 'كم طولك؟', qW: 'كم وزنك الآن؟', qGW: 'ما الوزن الذي تريد الوصول إليه؟',
  qGoal: 'ما هدفك؟', lose: 'خسارة الوزن', keep: 'الحفاظ على الوزن', gain: 'بناء العضلات',
  qAct: 'ما مستوى نشاطك؟', a1: 'جلوس معظم الوقت', a2: 'نشاط خفيف', a3: 'نشيط', a4: 'نشيط جداً',
  planT: 'خطتك اليومية', planS: 'حسب إجاباتك. تقدر تغيّرها في أي وقت من الملف الشخصي.',
  tToday: 'اليوم', tScan: 'مسح', tCoach: 'المدرب', tProgress: 'التقدّم', tProfile: 'حسابي',
  gm: 'صباح الخير', ga: 'نهارك سعيد', ge: 'مساء الخير',
  eaten: 'السعرات المتناولة', ofGoal: 'من الهدف', left: 'سعرة متبقية', over: 'سعرة زيادة', goal: 'الهدف اليومي',
  macros: 'العناصر الغذائية', P: 'البروتين', Cb: 'الكربوهيدرات', F: 'الدهون',
  meals: 'الوجبات', addMeal: 'أضف وجبة إلى يومك',
  bf: 'الإفطار', ln: 'الغداء', dn: 'العشاء', sn: 'سناكس', ds: 'حلويات', dr: 'مشروبات',
  water: 'الماء', types: 'أنواع الوجبات',
  scanT: 'ماسح الكاميرا', scanS: 'وجّه الكاميرا نحو وجبتك وسنحلل مكوّناتها وسعراتها',
  mFood: 'وجبات', mDrink: 'مشروبات', camera: 'التقط صورة', gallery: 'المعرض',
  analyzing: 'جارٍ تحليل وجبتك…', example: 'مثال', liveAI: 'الذكاء جاهز · وجّه نحو الطعام',
  infoT: 'تحليل ذكي', infoD: 'نقدّر المكوّنات والحصص والسعرات والماكروز من صورتك. استخدم إضاءة جيدة لنتيجة أدق.',
  save: 'احفظ في يومي', retake: 'أعد التصوير', saved: 'تم الحفظ في يومك',
  conf: 'الثقة', high: 'عالية', medium: 'متوسطة', low: 'منخفضة', items: 'المكوّنات',
  noFood: 'لم أجد طعاماً في هذه الصورة.', aiErr: 'تعذّر التحليل. تأكد من الإنترنت وحاول مرة أخرى.',
  noApi: 'خادم الذكاء الاصطناعي غير مضبوط. أضف EXPO_PUBLIC_API_URL في ملف ‎.env',
  camDenied: 'نحتاج إذن الكاميرا لمسح الوجبات.',
  recent: 'آخر عمليات المسح', noScans: 'وجباتك الممسوحة ستظهر هنا.',
  coachS: 'اسألني عن أي شيء', ask: 'اكتب سؤالك…', hello: 'أهلاً! أنا مدربك في Nutri. اسألني عن الأكل أو السعرات أو أهدافك.',
  q1: 'شو آكل على العشاء؟', q2: 'هل أخذت بروتين كافي؟', q3: 'أفكار سناك صحي',
  thinking: 'يفكّر…',
  daily: 'يومي', weight: 'الوزن', last7: 'السعرات · آخر 7 أيام', dashed: 'الخط المنقط = الهدف',
  avg: 'متوسط السعرات', pavg: 'متوسط البروتين', streak: 'أيام متتالية', logged: 'المسجّل', noLog: 'لا شيء مسجّل في هذا اليوم.',
  curW: 'الوزن الحالي', startW: 'البداية', goalW: 'الهدف', toGo: 'متبقٍّ', logW: 'سجّل وزنك',
  logWS: 'أضف وزنك لتبدأ متابعة تقدّمك.', add: 'إضافة', kg: 'كغ',
  guestName: 'ضيف', member: 'عضو Nutri AI', goals: 'الأهداف اليومية', kcal: 'السعرات',
  settings: 'الإعدادات', language: 'اللغة', redo: 'أعد حساب خطتي', signOut: 'تسجيل الخروج', signIn: 'تسجيل الدخول',
  reset: 'احذف كل بياناتي', resetQ: 'هذا يحذف كل الوجبات والأوزان والإعدادات من هذا الجوال.',
  cancel: 'إلغاء', del: 'حذف', version: 'الإصدار',
};

export const DICT = { en, ar };
export type Lang = keyof typeof DICT;
export type TKey = keyof Dict;

export function useT() {
  const lang = useApp((s) => s.lang);
  const d = DICT[lang] ?? en;
  const rtl = lang === 'ar';
  return { t: (k: TKey) => d[k] ?? en[k], lang, rtl };
}
